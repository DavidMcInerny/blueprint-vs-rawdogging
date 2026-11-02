# Dependency decisions and current audit

Reviewed 2026-11-02 for fork [issue #8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8), starting from accepted source `fc56329`. This is dependency triage against the actual lockfile, not a claim that an advisory is exploitable in this app or that the starter is security-cleared. Revisit on SDK/Router updates and before external distribution.

## Compatible remediation

Expo stays on SDK 57 (`expo@57.0.31`, Router `57.0.29`, React Native `0.86.3`), matching the installed Expo `bundledNativeModules.json`. Follow the [official SDK upgrade procedure](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) for a future major migration rather than accepting npm's proposed Expo/Updates downgrades.

- Updated `node-forge` from 1.4.0 to 1.4.2 within its parents' existing ranges. Expo CLI and Expo Updates code-signing certificates resolve to the fixed version. The [upstream changelog](https://github.com/digitalbazaar/forge/blob/main/CHANGELOG.md) records the 1.4.1 security fixes and 1.4.2 PEM Buffer compatibility repair.
- Updated Vitest 5.0.0 to 5.0.5 and its compatible Vite dependency from 8.2.2 to 8.3.5, removing the reported mock-registration, path traversal and development-server/editor findings. No Vite app framework is introduced; this remains test tooling.
- Updated the narrow `decode-uri-component` override from 0.5.0 to 0.5.1 for [GHSA-qr28-fpjm-wq7f](https://github.com/advisories/GHSA-qr28-fpjm-wq7f). The [upstream 0.5.1 release](https://github.com/SamVerschueren/decode-uri-component/releases/tag/v0.5.1) decodes percent-encoded runs in one pass.
- Removed the obsolete `xcode -> uuid` override. Installed `xcode@4.0.0` uses Node's `crypto` for identifier generation and has no `uuid` dependency. The existing identifier API test remains applicable.
- Aligned root and starter TypeScript to `~6.0.3`, and Node engines to `^22.18.0 || ^24.3.0`. This excludes unsupported odd Node lines and avoids claiming future major support. Strict application types and `noUncheckedIndexedAccess` stay enabled. The isolated capability contract compile uses TypeScript 6's `--ignoreConfig` because that test explicitly supplies its complete compiler options and selected files; application typecheck still loads `tsconfig.json`.

## Temporary Router compatibility patch

Router 57 still depends on `query-string@7.1.3`, which requests the old CommonJS decoder. The fixed decoder is ESM. The existing postinstall script changes exactly that decoder import to `.default` and refuses unfamiliar query-string versions/source. Node 22.18+/24.3+ and Metro support the installed interop path. Retain this patch and the `decode-uri-component@0.5.1` override until a compatible Router release directly uses a fixed decoder with the correct module API. Do not replace query-string with its incompatible latest major to remove one patch.

Removal check: clean installation, existing deep-link/query/malformed-input and Xcode identifier tests, web/native exports, and native project generation when that consumer next prepares a native release. A JavaScript export does not qualify an installed native binary or OTA delivery.

## Audit snapshot

Counts below are affected package entries, including propagation to parent packages, not distinct underlying vulnerabilities. `--omit=dev` still includes Expo CLI/build packages declared under production dependencies; it is not a measurement of code shipped in the mobile bundle.

| Lockfile audit | Before | After |
| --- | --- | --- |
| Root, all dependencies | 0 | 0 |
| Starter, all dependencies | 35: 7 high, 26 moderate, 2 low | 28: 2 high, 24 moderate, 2 low |
| Starter, `--omit=dev` | 19: 6 high, 11 moderate, 2 low | 15: 2 high, 11 moderate, 2 low |

Reproduce with `npm audit --json` at the root and starter, and `npm audit --omit=dev --json` in the starter. These snapshots are not permanent acceptance baselines. No findings were hidden with audit configuration, and no automatic force-fix or broad override was applied.

## Residual exceptions and revisit triggers

Fork backlog owner: David McInerny, tracked in [issue #8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8). Under the bounded SDK 57 remediation scope, retain the following upstream findings for toolkit delivery. This disposition does not grant a consumer permission to distribute a product; its release owner must reassess actual exposure before external beta/distribution.

| Underlying advisory family | Installed path and current exposure | Reason retained; removal/revisit trigger |
| --- | --- | --- |
| [Zod constrained-collection memory use](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), high | `zod@3.25.76` through Expo CLI dev-tool schemas; also development ESLint React hooks tooling. This starter has no direct application Zod integration. | The fix is Zod 4.6.6+, outside the parents' Zod 3 API contract. Do not force a cross-major override into CLI/schema tooling. Revisit when SDK 57 receives a compatible backport or the owning packages migrate to fixed Zod; assess separately before exposing development tools to untrusted input. |
| [Glob cancellation bypass](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), moderate | `glob@13.0.6` through Expo configuration, Metro, fingerprinting and Updates build tooling. | Fixed upstream versions are 14.0.2+, outside these declared major ranges. Revisit an upstream compatible update or a separately qualified SDK migration. Keep patterns/project filesystem inputs trusted; do not assume AbortSignal alone bounds untrusted traversal. |
| [Minimatch globparts amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249), moderate | `minimatch@10.2.6` via Glob/fingerprinting/TypeScript ESLint and `3.1.5` via ESLint/import/React plugins. | Fixed versions are 11.0.1+, outside the installed callers' version contracts. Revisit fixed caller releases/backports; do not globally override several incompatible majors. Do not accept untrusted build/lint patterns. |
| [Deepmerge prototype poisoning](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), low | `deepmerge@4.3.1` via Expo app configuration. This starter uses local source-controlled configuration. | No newer fixed deepmerge version was published at refresh. Revisit a fixed upstream release or Expo configuration change; review separately before merging untrusted remote configuration. |

The earlier `braces` finding is absent from this refreshed lockfile audit; `braces@3.0.3` is installed. Previous reports of 19 high affected packages are historical evidence and have been superseded by the snapshot above.

## Golf performance follow-up

Golf's reported initial JavaScript is **746,515 gzip bytes**: it passes its **750,000 hard limit** and exceeds its **620,000 target** by 126,515 bytes. Passing the hard ceiling does not meet the target. The consumer owns optimisation and its intended-release decision; this toolkit dependency change does not alter or remeasure Golf. Keep the gap in Golf's owning backlog and fork issue #8. An intended external release still needs its owner to decide whether that target is required or to record an explicit performance exception; no release approval is inferred here.

The existing Golf initial-web-JavaScript target is tracked in the owning product backlog at https://github.com/Simondarcy7/golf-scoring-app/issues/48. The recorded adoption export passes its 750,000-byte hard limit while exceeding the 620,000-byte target; target optimisation remains follow-up under that existing policy, without adding a new Blueprint source-release gate. The next actual consumer release keeps its own CI, device/provider and performance decisions.
