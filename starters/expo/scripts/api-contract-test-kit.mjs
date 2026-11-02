import assert from 'node:assert/strict';

/**
 * Runs the host's actual read consumer with an injected fetch transport. No live requests are made.
 * createConsumer({ fetch, timeoutMs }) returns one reusable async read() function.
 * assertSuccess(result) and assertFailure(result, scenario) must check the host's parsed data,
 * stable error code and retry policy. Results use the foundation ServiceResult { ok, ... } envelope.
 */
export async function runApiRecoveryContract({
  createConsumer,
  validPayload,
  invalidPayload,
  assertSuccess,
  assertFailure,
  timeoutMs = 25,
  caseTimeoutMs = 1000,
}) {
  for (const callback of [createConsumer, assertSuccess, assertFailure])
    assert.equal(
      typeof callback,
      'function',
      'Consumer factory and semantic assertions are required.',
    );
  assert.ok(
    Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 60_000,
    'Invalid request timeout.',
  );
  assert.ok(
    Number.isInteger(caseTimeoutMs) && caseTimeoutMs > timeoutMs && caseTimeoutMs <= 60_000,
    'Invalid case timeout.',
  );
  const reports = [];
  const json = (payload) =>
    new Response(JSON.stringify(payload), {
      headers: { 'content-type': 'application/json' },
    });
  for (const scenario of [
    'network',
    'unavailable',
    'unauthorized',
    'invalid-json',
    'invalid-payload',
    'timeout',
  ]) {
    let recovering = false;
    let requests = 0;
    let timeoutAborted = false;
    const cleanup = new Set();
    const transport = async (input, init = {}) => {
      requests++;
      if (recovering) return json(validPayload);
      switch (scenario) {
        case 'network':
          throw new TypeError('Injected network failure');
        case 'unavailable':
          return new Response('{"message":"Unavailable","code":"UNAVAILABLE"}', { status: 503 });
        case 'unauthorized':
          return new Response('{"message":"Unauthorized","code":"UNAUTHORIZED"}', { status: 401 });
        case 'invalid-json':
          return new Response('{', {
            headers: { 'content-type': 'application/json' },
          });
        case 'invalid-payload':
          return json(invalidPayload);
        case 'timeout': {
          const signal = init.signal ?? input?.signal;
          return new Promise((_, reject) => {
            const abort = () => {
              timeoutAborted = true;
              signal?.removeEventListener('abort', abort);
              cleanup.delete(dispose);
              reject(signal?.reason ?? new DOMException('Aborted', 'AbortError'));
            };
            const dispose = () => {
              signal?.removeEventListener('abort', abort);
              reject(new Error('Contract case finished'));
            };
            cleanup.add(dispose);
            signal?.addEventListener('abort', abort, { once: true });
            if (signal?.aborted) abort();
          });
        }
      }
    };
    async function bounded(action) {
      let timer;
      try {
        return await Promise.race([
          Promise.resolve().then(action),
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error(`${scenario}: consumer did not settle within case timeout`)),
              caseTimeoutMs,
            );
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    }
    try {
      const read = await bounded(() => createConsumer({ fetch: transport, timeoutMs }));
      assert.equal(typeof read, 'function', 'Factory must return an async read function.');
      const result = await bounded(read);
      assert.ok(requests > 0, `${scenario}: consumer did not use the injected transport`);
      assert.equal(result?.ok, false, `${scenario}: failure must not become success`);
      await bounded(() => assertFailure(result, scenario));
      if (scenario === 'timeout')
        assert.ok(timeoutAborted, 'Timeout must abort the underlying request.');
      recovering = true;
      const beforeRecovery = requests;
      const recovered = await bounded(read);
      assert.ok(requests > beforeRecovery, `${scenario}: retry must make a new request`);
      assert.equal(recovered?.ok, true, `${scenario}: retry did not recover`);
      await bounded(() => assertSuccess(recovered));
      reports.push({ scenario, recovered: true });
    } finally {
      for (const dispose of cleanup) dispose();
    }
  }
  return reports;
}
