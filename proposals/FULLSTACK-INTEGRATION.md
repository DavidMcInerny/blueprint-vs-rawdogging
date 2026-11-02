# Fullstack App Foundation integration

Scope: fork issue [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13). This record covers selected source integration. It does not close the real remote-consumer or repository-retirement criteria.

## Current source and consumers

On 2 November 2026, the GitHub connector resolved `Simondarcy7/fullstack-app-foundation` main to `742ca725ff82ba84903c0c711ee0641676b34619` (Package skill references and tighten triggers). Repository metadata showed public, unarchived, default branch main; the connected account had pull access without push, maintain or admin access. The pinned README describes a portable playbook rather than a runnable application and names no deployed consumer. The reviewed source contains no verified consumer adoption register. These observations do **not** establish that the old toolkit has no users.

No existing Fullstack consumer is verified in this change. Golf/Odds extraction evidence elsewhere in this repository is not evidence that those consumers adopted these Fullstack assets. Obtain the source owner's actual consumer list and migration contacts before claiming migration coverage. Do not mutate consumer repositories from this task.

## Selected assets and adaptation

All source links below are pinned to the verified revision:

| Source | Disposition |
| --- | --- |
| [check-api-contracts.mjs](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/templates/scripts/check-api-contracts.mjs) | Adapted to `templates/scripts/check-api-contracts.mjs`: replace path-only text inclusion with method+path inventory/document/OpenAPI coverage and fail on malformed/empty inputs. |
| [API drift guide](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/docs/api-contracts-and-drift-checks.md) | Adapted into `docs/api-contracts.md`: runtime parsing, auth/cache/error/compatibility notes, one authoritative inventory, and explicit coverage limits. |
| [localhost/recovery guide](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/docs/localhost-and-smoke-testing.md), [preflight template](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/templates/scripts/localhost-preflight.mjs), [smoke template](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/templates/scripts/prod-smoke.mjs) | Reuse guidance through existing app entrypoints; do not copy hardcoded port assumptions or smoke checks accepting any object as healthy. Require bounded requests, actual critical-response parsing and owned-process recovery. |
| [release readiness guide](https://github.com/Simondarcy7/fullstack-app-foundation/blob/742ca725ff82ba84903c0c711ee0641676b34619/docs/release-and-operations-readiness.md) | Reconcile with existing build/release and quality-gate guides and `release-tools.mjs`; no duplicate release controller. |
| Fullstack architecture, installer and overlapping skills | Do not import. Retain Expo Router `src/app`, product `src/modules`, shared adapters `src/services` and the existing toolkit distribution. |

The new `api-contract-test-kit.mjs` exercises a host-provided real consumer with injected network/status/parser/timeout failures and successful subsequent reads. Its repository tests deliberately use a small fixture consumer, labelled tool verification. They are not a remote product integration or evidence of auth recovery.

Upstream license: MIT, copyright (c) 2026 Simon Darcy; the repository LICENSE has the same notice. The adapted checker embeds the notice so its installed standalone copy retains it.

## Distribution and migration decision

Use the existing Blueprint installer and runnable starter only. Canonical scripts live under `templates/scripts/`, with starter mirrors maintained by `scripts/sync-references.mjs`; the API guide is mirrored into the existing mature-app-starter skill. Existing installations adopt the two selected scripts through the normal preserve-existing/update process and wire the API command only when the app has an API. No npm namespace, publication, competing installer, new application tree or automatic provider activation is introduced.

For a real adopter: identify the current installed revision and owned changes; merge the selected scripts and guide; generate/check the actual method/path inventory; retain existing response parsers and module/service boundaries; run focused host failure/recovery and real read smoke; record revision, endpoint environment and rollback in the existing project index. A successful source copy is not delivery of the consuming workflow.

Keep the old repository unarchived. Its owner must confirm actual users, communicate any migration note and choose archival under their own authority. This fork's backlog coordinator and a pull-only connector cannot supply that owner decision.

## Evidence and remaining delta

Tool verification: `node --test tests/api-contracts.test.mjs` covers method/path drift, stale operations, malformed inventory/artifacts, CLI input errors, injected failures, actual abort, successful retry and canonical mirrors. Reference checks and installer coverage remain part of the existing repository suite; no new qualification programme is required.

Source integration is delivered when those files pass their relevant checks and enter the coherent reviewed backlog package. Keep issue #13 open for its unmet real remote-consumer requirement. The next concrete evidence needed is one named owner-authorized consumer revision using the selected checker and actual service/parser, a successful real remote read in its intended environment, and the same consumer's injected failure/recovery results. Actual user discovery and any migration/archival decision remain with the source owner. No live API, consumer modification, publication or archival was performed by this integration.
