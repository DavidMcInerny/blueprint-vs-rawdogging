import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkApiContracts, verifyApiContracts } from '../templates/scripts/check-api-contracts.mjs';
import { runApiRecoveryContract } from '../templates/scripts/api-contract-test-kit.mjs';

const valid = () => ({
  routes: [{ method: 'get', path: '/v1/items/{id}' }, { method: 'POST', path: '/v1/items' }],
  contract: '# API\n\n`GET /v1/items/{id}`\n\n`POST /v1/items`',
  artifact: { openapi: '3.1.0', paths: { '/v1/items/{id}': { get: {} }, '/v1/items': { post: {} } } },
});
test('method and canonical path must agree across inventory, documentation and OpenAPI', () => {
  assert.deepEqual(checkApiContracts(valid()), []);
  const input = valid(); input.contract = '`POST /v1/items/{id}`\n`POST /v1/items`';
  const issues = checkApiContracts(input).join('\n');
  assert.match(issues, /Contract missing operation: GET \/v1\/items\/\{id\}/);
  assert.match(issues, /Documented operation absent from inventory: POST/);
});
test('removed, undocumented and ungenerated routes fail in both directions', () => {
  const input = valid();
  input.artifact.paths['/v1/extra'] = { delete: {} };
  delete input.artifact.paths['/v1/items'].post;
  input.contract += '\n`PATCH /v1/extra`';
  const issues = checkApiContracts(input).join('\n');
  assert.match(issues, /OpenAPI missing operation: POST \/v1\/items/);
  assert.match(issues, /OpenAPI operation absent from inventory: DELETE \/v1\/extra/);
  assert.match(issues, /Documented operation absent from inventory: PATCH \/v1\/extra/);
});
test('invalid inventories and unsupported artifacts cannot pass vacuously', () => {
  for (const routes of [null, {}, []]) assert.ok(checkApiContracts({ ...valid(), routes }).length);
  for (const route of [null, {}, { method: 'CONNECT', path: '/x' }, { method: 'GET', path: '/x?secret=1' }, { method: 'GET', path: 'https://example.com/x' }, { method: 'GET', path: '//x' }])
    assert.match(checkApiContracts({ ...valid(), routes: [route] }).join('\n'), /Invalid route inventory/);
  const input = valid(); input.routes.push(input.routes[0]);
  assert.match(checkApiContracts(input).join('\n'), /Duplicate route/);
  for (const artifact of [null, {}, { openapi: '2.0', paths: {} }, { openapi: '3.0.3', paths: [] }])
    assert.match(checkApiContracts({ ...valid(), artifact }).join('\n'), /OpenAPI 3.x/);
  for (const item of [{ $ref: './other.json' }, { get: null }, { get: { $ref: './operation.json' } }]) {
    const input = valid(); input.artifact.paths['/v1/items/{id}'] = item;
    assert.ok(checkApiContracts(input).length);
  }
});
test('CLI reads explicit app root and fails on missing, malformed or drifting evidence', async t => {
  const root = await mkdtemp(join(tmpdir(), 'api-contracts-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'docs'));
  const input = valid();
  await writeFile(join(root, 'docs/API_CONTRACTS.md'), input.contract);
  await writeFile(join(root, 'docs/api-routes.json'), JSON.stringify(input.routes));
  await writeFile(join(root, 'docs/openapi.json'), JSON.stringify(input.artifact));
  assert.deepEqual(await verifyApiContracts(root, {}), []);
  const script = fileURLToPath(new URL('../templates/scripts/check-api-contracts.mjs', import.meta.url));
  const env = { ...process.env }; for (const key of ['API_CONTRACT_PATH', 'API_ROUTE_LIST_PATH', 'API_ARTIFACT_PATH']) delete env[key];
  const run = () => spawnSync(process.execPath, [script, root], { encoding: 'utf8', env });
  assert.equal(run().status, 0);
  await writeFile(join(root, 'docs/api-routes.json'), '[');
  assert.match(run().stderr, /could not run/);
  await writeFile(join(root, 'docs/api-routes.json'), JSON.stringify(input.routes));
  await writeFile(join(root, 'docs/API_CONTRACTS.md'), '');
  assert.equal(run().status, 1);
  await rm(join(root, 'docs/openapi.json'));
  assert.equal(run().status, 1);
});

// Tool verification only: this intentionally small consumer is not a shipped product or remote proof.
function fixtureConsumer({ fetch, timeoutMs }, { wrongSuccess = false, wrongFailure = false, noAbort = false } = {}) {
  return async () => {
    try {
      const response = await fetch('https://api.invalid/v1/items/one', noAbort ? {} : { signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) return { ok: false, code: response.status === 401 ? 'UNAUTHORIZED' : 'UNAVAILABLE', retryable: response.status !== 401 };
      let payload; try { payload = await response.json(); } catch { return { ok: false, code: 'INVALID_RESPONSE', retryable: false }; }
      if (!payload || typeof payload.id !== 'string') return { ok: false, code: 'INVALID_RESPONSE', retryable: false };
      return wrongSuccess ? { ok: true, data: {} } : { ok: true, data: { id: payload.id } };
    } catch (error) {
      return { ok: false, code: wrongFailure ? 'UNKNOWN' : ['AbortError', 'TimeoutError'].includes(error.name) ? 'TIMEOUT' : 'NETWORK', retryable: true };
    }
  };
}
const contractOptions = {
  validPayload: { id: 'one', futureField: 'kept upstream' }, invalidPayload: { id: 7 },
  createConsumer: fixtureConsumer,
  assertSuccess: result => assert.deepEqual(result.data, { id: 'one' }),
  assertFailure: (result, scenario) => {
    const expected = { network: 'NETWORK', unavailable: 'UNAVAILABLE', unauthorized: 'UNAUTHORIZED', 'invalid-json': 'INVALID_RESPONSE', 'invalid-payload': 'INVALID_RESPONSE', timeout: 'TIMEOUT' };
    assert.equal(result.code, expected[scenario]);
    assert.equal(result.retryable, ['network', 'unavailable', 'timeout'].includes(scenario));
  },
};
test('actual consumer factory receives injected failure and same instance recovers after restoration', async () => {
  const reports = await runApiRecoveryContract(contractOptions);
  assert.deepEqual(reports.map(row => row.scenario), ['network', 'unavailable', 'unauthorized', 'invalid-json', 'invalid-payload', 'timeout']);
  assert.ok(reports.every(row => row.recovered));
});
test('kit rejects wrong parsing/error semantics, hidden retries, and consumers ignoring transport', async () => {
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, createConsumer: options => fixtureConsumer(options, { wrongSuccess: true }) }), /Expected values to be strictly deep-equal/);
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, createConsumer: options => fixtureConsumer(options, { wrongFailure: true }) }), /UNKNOWN/);
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, createConsumer: () => async () => ({ ok: true, data: { id: 'one' } }) }), /injected transport/);
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, createConsumer: options => async () => { try { await options.fetch('https://api.invalid'); } catch {} return { ok: true, data: { id: 'one' } }; } }), /failure must not become success/);
});
test('kit bounds a hung consumer and requires timeout to abort the actual request', async () => {
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, caseTimeoutMs: 60, createConsumer: options => fixtureConsumer(options, { noAbort: true }) }), /consumer did not settle/);
  const consumer = options => {
    const read = fixtureConsumer(options);
    return async () => Promise.race([read(), new Promise(resolve => setTimeout(() => resolve({ ok: false, code: 'TIMEOUT', retryable: true }), 1))]);
  };
  await assert.rejects(runApiRecoveryContract({ ...contractOptions, createConsumer: consumer }), /abort the underlying request/);
});
test('installed source mirrors contain exactly the canonical tools and API guide', async () => {
  for (const name of ['check-api-contracts', 'api-contract-test-kit'])
    assert.equal(await readFile(new URL(`../templates/scripts/${name}.mjs`, import.meta.url), 'utf8'), await readFile(new URL(`../starters/expo/scripts/${name}.mjs`, import.meta.url), 'utf8'));
  assert.equal(await readFile(new URL('../docs/api-contracts.md', import.meta.url), 'utf8'), await readFile(new URL('../codex/skills/mature-app-starter/references/api-contracts.md', import.meta.url), 'utf8'));
});
