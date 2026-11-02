# API contracts, drift and recovery

Use this guide when a selected workflow consumes a remote API or owns public server routes. An app without an API records these checks N/A. Keep the Expo blueprint: product behavior and its public `index.ts` belong in `src/modules/<module>/`; shared HTTP/vendor adapters belong in `src/services/api/`, and validated endpoint configuration in `src/config/`. Domain-specific response parsers can stay inside their owning module. Routes use module public APIs. API adoption does not require another app framework, installer, monorepo or shared package.

## Define the boundary

Record method, versioned path where needed, request/response schema, success/status codes, authentication, cache/freshness, stable error codes and compatibility policy in the app's API contract. Parse untrusted payloads at the service boundary with the authoritative runtime parser; TypeScript assertions are not validation. Distinguish network failure, deadline expiry, rejected authentication/authorization, unsuccessful HTTP status and invalid response shape. Preserve the last confirmed data where safe, release pending state, and expose an intentional recovery action. Do not blindly retry writes whose outcome is unknown.

Prefer additive fields compatible with older clients. For breaking changes, document the supported consumer versions, migration window, rollout order, owner and rollback. Keep credentials and sensitive payloads out of contract evidence.

## Check operation coverage

The existing toolkit installer and runnable starter supply `scripts/check-api-contracts.mjs` and `scripts/api-contract-test-kit.mjs`. No second installation is needed.

Maintain an app-owned, authoritative inventory generated from server routes or checked against the provider's current contract. Use canonical OpenAPI paths such as `/v1/items/{id}`, including any version prefix. An inventory copied by hand from the same documentation does not establish agreement with running routes.

Default inputs:

- `docs/api-routes.json`: nonempty array, for example `[{ "method": "GET", "path": "/v1/items/{id}" }]`.
- `docs/API_CONTRACTS.md`: exact backtick operation signatures, for example `GET /v1/items/{id}`, with the boundary notes above.
- `docs/openapi.json`: OpenAPI 3.x JSON with inline operations, for example `{ "openapi": "3.1.0", "paths": { "/v1/items/{id}": { "get": {} } } }`. This minimal coverage example is not a complete OpenAPI specification.

Run from the app root:

```sh
node scripts/check-api-contracts.mjs
```

The optional first positional argument selects another app root. `API_CONTRACT_PATH`, `API_ROUTE_LIST_PATH` and `API_ARTIFACT_PATH` override input paths relative to that root; absolute paths are accepted. Add this command to the app's normal check and CI when the API exists.

The checker compares method **and** path across all three inputs and rejects missing/stale operations, duplicate/invalid inventory entries and empty inventories. Lowercase inventory methods normalize to uppercase; Markdown signatures use uppercase and OpenAPI operations use lowercase. Resolve path/operation references and convert YAML to JSON using the app's existing OpenAPI tool before checking. It does not generate routes, validate complete OpenAPI schemas, inspect prose quality, prove authentication or compare deployed behavior. Backtick signatures in examples also count: keep runnable operation examples consistent with the current API inventory. Run the app's schema validator and focused parser/handler tests separately where applicable.

## Inject failures through the actual consumer

Import `runApiRecoveryContract` from `scripts/api-contract-test-kit.mjs` in the app's existing Node test suite. Supply:

```js
await runApiRecoveryContract({
  validPayload: validItemResponse,       // Real contract fixture.
  invalidPayload: malformedItemResponse,
  createConsumer: ({ fetch, timeoutMs }) => {
    const service = createItemService({ fetch, timeoutMs });
    return () => service.readItem('one');
  },
  assertSuccess(result) {
    assert.deepEqual(result.data, expectedParsedItem);
  },
  assertFailure(result, scenario) {
    assert.equal(result.code, expectedCodeByScenario[scenario]);
    assert.equal(result.retryable, expectedRetryPolicyByScenario[scenario]);
  },
});
```

This is a host wiring example; `createItemService`, fixtures and assertions are app-owned. Adapt the host result at the test boundary to the foundation `ServiceResult` envelope (`{ ok: true, data }` or `{ ok: false, code, retryable }`) if necessary; do not replace its parser or HTTP implementation with a test-only consumer.

The kit injects network rejection, HTTP 503, HTTP 401, malformed JSON, invalid payload and a hanging request. Each failure must settle as a failed result; then a fresh read on the **same consumer instance** must succeed after transport restoration. The timeout case requires aborting the underlying request. The factory receives a request timeout of 25 ms by default; the harness separately bounds each action at 1000 ms. Raise these explicitly within the 60-second limit if needed for the existing consumer. Automatic retries must remain observable as failure for these deterministic cases. Test write idempotency, stale-request ordering, persistence and account changes with the relevant host tests.

The callbacks must assert actual parsed data and each scenario's stable error/retry policy. Merely accepting an object proves nothing. Transport restoration after 401 does not verify login, token refresh or permission changes. The kit makes no live network requests and does not prove browser CORS, production credentials, device connectivity, provider uptime or a delivered remote integration.

## Local smoke, recovery and release

Reuse the app's existing startup and smoke entrypoints. Before starting services, check required configuration/files and intended ports; preserve active processes owned by others. For a real API-backed workflow, smoke the configured web/app entrypoint, liveness, readiness where available and one actual critical read with its runtime parser. Use bounded requests and verify expected status/schema. A JSON object alone is not health evidence. Use the real browser/device for connectivity and CORS checks.

On local failure, identify the failing owned process or occupied port, stop only processes you own, correct configuration or the failing service, restart the affected service and rerun its focused smoke. Preserve drafts/pending work. Record repeated causes in the existing runbook rather than killing unrelated listeners or rebuilding everything.

For a release, reuse [build and release workflow](build-and-release-workflow.md) and [release quality gates](release-quality-gates.md): verify the exact project/environment/artifact, current contract and consumer compatibility, relevant checks, intended credentials, staging smoke, monitoring ownership and recovery path. `release-tools.mjs` can assert the intended target and observe terminal remote status; it does not publish. Configured, submitted, service running and workflow verified are different outcomes. Keep live release authority with its owner.

A real remote-consumer adoption record needs the consumer repository/revision, integrated service/parser, selected endpoint/environment, actual read result and injected failure/recovery test evidence. Toolkit fixture tests establish tool behavior only. Track unresolved remote or native evidence in the existing project index/issue; do not mark it complete from local fixtures.
