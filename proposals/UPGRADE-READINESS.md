# Source release and upgrade readiness

Scope: [ticket #14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14). Distribution uses the [source decision](DISTRIBUTION-DECISION.md), existing additive installer and hash-checked source sync. No npm package publication, namespace ownership, new registry credentials or automated publication is selected by this work.

## Accepted compatible-fix evidence reused

Reuse [phase-3-reuse-proof.json](implementation-notes/phase-3-reuse-proof.json) and [the phase-3 report](implementation-notes/phase-3-summary.md), rather than repeating an accepted experiment.

The actual shared correction prevents persisted draft revision counters at `Number.MAX_SAFE_INTEGER` from exhausting current-session editing/discard. The accepted record identifies canonical source commit `65b7ec6a952e28900f2ae806eb71f15a5e084a50`, before SHA-256 `1a6646e81747beb13b8c1ee67704e56bb770e6a28825d31b8cef3c77e9734d82`, and corrected SHA-256 `24fa5424808b80fd96dcc808b5f5234c528d1ec1a97897f3239389fdfdc73167`. Two targeted regressions failed before the correction and passed afterwards.

| Actual consumer | Pinned adopted revision and source path | Accepted evidence and limits |
| --- | --- | --- |
| Golf App | `dcb19e99fa589fed82afd736c80bc0e5f5595e85`; `mobile/src/foundation/blueprint/services/drafts/draftController.ts` | [PR #45](https://github.com/Simondarcy7/golf-scoring-app/pull/45); feedback draft workflow, source parity, 93 targeted app tests, typecheck/lint, web export and recorded browser QA. Native/provider delivery not established. |
| OddsBasket | `46b0cb9893adb4c935dc6b0c6dd1b10b3bf2344b`; `src/foundation/blueprint/services/drafts/draftController.ts` | [PR #51](https://github.com/Simondarcy7/oddsbasket-app/pull/51); actual builder draft workflow, same source hash, full local gate (259 tests) and recorded browser QA. Native/provider delivery not established. |

This is genuine compatible source-fix adoption in two actual applications at those revisions. The original report recorded draft PR/review status and hosted consumer checks that did not start due to account payment/spending restrictions; it did not claim production rollout or native verification. This record reuses those historical facts without asserting current PR, CI or deployment state. No new real maintenance cycle, elapsed upgrade-time measurement or later source version adoption is inferred from it.

## New bounded migration deliverable

`scripts/migrate-app.mjs` migrates the actual legacy generated `package.json` check pipeline to `node scripts/check-app.mjs`. The old pipeline is verified in the accepted starter baseline `fc56329517d57b5934220b65feda370c11def435`; it included the compatibility boundary wrapper plus the three principal structure/architecture/accessibility checks. The new coherent checker retains the distinct core stages while removing redundant invocation.

The codemod is dry-run by default, requires explicit `--write`, refuses unknown/custom pipelines or missing/divergent coherent checker files, and replaces only the check-command string. It preserves all unrelated package bytes, scripts, branding and product data. It neither installs source over custom files nor changes runtime APIs/dependencies/schemas. A second application is idempotent. Relevant tool tests cover supported and unchanged inputs, refusal, exact byte preservation, CLI defaults and filesystem write protections.

The new required tooling adoption contract is accompanied by a migration; no artificial breaking runtime API was created for a demonstration. These fixture tests do not prove either real consumer has adopted the checker. Existing real apps have product-owned check pipelines and must reconcile them manually, preserving their product checks.

## Release policy and remaining evidence

[Upgrade guidance](../docs/upgrades.md) defines patch/minor/major classification for source release notes, exact revision/hash identity, supported-toolchain limits, source escape hatches, native fingerprints, schema/rollback compatibility and the minimal actual adoption steps. No tag or package is claimed to have been published.

Native runtime and schema compatibility are separate from source parity. This command-only codemod changes no dependency/native configuration/runtime code or persisted schema; it supplies no before/after product fingerprint or device evidence. Keep each real upgrade's fingerprint, installed runtime, store-versus-OTA decision and populated-data rollback result in its existing release record.

Ticket #14 remains open. Missing evidence is a real breaking/tooling adoption in both named consumers, measured adoption time and demonstrated preservation of customization/data/branding, current supported-schema recovery, and actual per-platform runtime/delivery qualification. The accepted compatible fix satisfies its historical source-adoption subset; it is not substituted for those missing criteria. Do not run condition C without its separately authorized budget, bypass consumer CI/release protections, publish an npm package, or activate a provider from this package.

Next action: with each consumer owner's authority, inspect its exact current revision and custom check pipeline, integrate the selected coherent checker without overwriting custom source, migrate or manually reconcile its check entry, run only affected host verification, record elapsed time and the required preservation/runtime/recovery evidence, and deliver through its normal review/release authority.
