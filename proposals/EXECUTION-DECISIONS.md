# Blueprint autonomous execution decisions

Recorded 2 November 2026 under the user's instruction to work through the entire ticket backlog autonomously, make judgment calls when input is unavailable, and use parallel `gpt-6.1-sol` agents with high reasoning effort.

## Scope and sequence

The fork will complete the existing capability source delivery while running the frozen Phase 1 comparison. The user's full-backlog instruction expands the earlier Phase-1-only implementation commitment and removes intermediate human progress and budget checkpoints. It does not create evidence of a successful experiment, authorise changing its scoring after results, or grant access to another owner's accounts.

Use the implemented source packs and actual two-product adoption to choose distribution boundaries. Build a package or registry only where the supported contracts and upgrade needs justify it. The original eleven-package map remains a set of candidates rather than eleven mandatory releases. Preserve the go, narrow or stop result as an empirical decision; do not manufacture a passing gate to justify work already built.

The existing source extraction at upstream `635ac6b` is integrated into the fork's Linux execution branch. The Phase 1 experiment remains frozen at `749926b2c207af7ba3047492f500d2a9fea1dbb2`; later integration and fixes cannot enter its baseline silently. Existing accepted extraction tests/reviews are reused. New coherent changes receive relevant tests and one focused independent review.

## Pilot ownership and surfaces

Golf and OddsBasket are the working pilot consumers because the existing adoption PRs already exercise distinct real workflows. Golf supplies inbox/undo, backup review, feedback and lifecycle integration; OddsBasket supplies builder drafts, import review and durable settings. This selects existing adoption work for the fork pilot; it does not claim its owners have agreed to a new support SLA or that either product is deployed at the adoption revision.

David McInerny owns the fork backlog and implementation decisions. Simon and each consumer maintainer retain their existing upstream source, billing, merge and release authority. A named human backup is deferred: no person is conscripted into that role. Until one is agreed, support is best effort with no production SLA; the pilot records support time against the existing one-hour-per-app-per-month target.

Declared source/creation matrix: Windows and Linux, Node 22 and 24 within the supported package ranges. Linux builds/tests run in WSL on its ext4 filesystem with native caches, dependencies and temporary files. The existing Windows evaluation runs with Windows-native Node/Claude and Windows-local workspaces. Android/iOS bundle exports are portable checks; device, signed binary, OTA/provider and assistive-technology claims require their actual environments. Native iOS evidence on newer Golf main is reusable only for the source and paths it actually covers.

## Evaluation budget and protocol

Authorise up to fifty primary scored attempts: five tasks, five replicates and two conditions, including the first ten smoke attempts. Run sequentially on the existing Windows machine. After smoke, record actual usage/time and continue within this authorisation without waiting for unavailable user input. Use the existing Claude subscription; do not create API keys, change a subscription, bypass usage limits or activate paid API billing. Stop a run cleanly on a real allowance/access failure and continue unrelated backlog work. Doc ablation and condition C use a later explicit recorded bounded allocation under this same overall goal before starting them.

The exact Claude model is `claude-opus-5-5`. Capture actual CLI/model metadata and effort, complete applicable input/output/cache token usage, exact frozen source/tree and prompt/snapshot identities. Legacy prepared bases and the validation workspace remain preserved as historical harness evidence. The revised protocol uses a separate versioned base directory.

Both conditions use Expo 57, resolved Expo `57.0.30` and React Native `0.86.3` from the frozen B lockfile. The bare creation prompt pins `create-expo-app@5.0.0` and `expo-template-default@57.0.33` as well as those runtime versions. This corrects creation-time SDK and scaffold drift before any primary samples exist. Report source and version differences explicitly. Ten unique task/condition cells must each contain five valid replicates before the final verdict; missing cost metrics remain unknown. Native export and neutral quality checks must match their declared scoring scope. Hidden-test isolation limitations of the non-container Windows protocol remain visible in findings.

## Publishing support and repository disposition

Keep the repository name during the pilot. A rename would add consumer/provenance work without evidence of benefit.

Keep source distribution operational. A public npm namespace and publication are deferred until a selected package has a tested version/upgrade contract and the authenticated publishing owner is known. Local package/tarball preparation may proceed; absence of registry access is not permission to report a public release. No private registry is introduced.

Fullstack App Foundation remains unarchived. Its distinct useful contracts can be integrated through Blueprint's existing installer, while actual prior users and retirement authority are investigated. Unknown consumers require a recorded migration decision; pull-only access does not grant archive authority.

The final non-author human trial, real device/provider acceptance and observation period retain their meanings. An agent rehearsal, fixture, web export or elapsed plan date cannot stand in for those results. Complete all feasible implementation and preparation, keep unmet criteria open with exact evidence, and continue other work when an external dependency blocks one package.

## Source delivery on 2 November 2026

[Source PR 18](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/pull/18) integrates the accepted extraction and the completed new portable/lean/quality/API/upgrade work. One independent source review accepted `78753f9` without actionable findings. Subsequent `c25c6b0` changes only a protocol unit test that incorrectly required historical Git objects in a shallow CI checkout; three affected tests pass, while actual immutable snapshot/lock verification remains in evaluation preparation. The consumer performance follow-up is now [Golf issue 48](https://github.com/Simondarcy7/golf-scoring-app/issues/48).

Validation retained with the package:

- Toolkit: 340 tests pass. Native Windows/Linux creation and installer safety tests pass with explicit Windows privilege/platform skips; Linux covers the skipped file-link case.
- Fresh lean app: a clean locked install and initial Git commit; all eight check stages, 12 unit/resilience tests in 11.52 seconds; web metadata/budgets and iOS/Android exports pass.
- Canonical reference: all eight check stages, 18 unit/resilience tests in 15.21 seconds; web metadata/budgets and iOS/Android exports pass.
- Final browser suites: lean 15/15 and reference 30/30 pass across desktop, mobile and 320px. The corrected shared baseline includes persisted appearance/theme, preference corruption/retry and motion, keyboard, current routes/axe/overflow/404 and responsive labels. Notes retain their own five journeys in the reference.
- Hosted [toolkit checks](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/actions/runs/41394932179) and [fresh generated-app checks](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/actions/runs/41394932182) pass on both Windows and Linux at `c25c6b0`. The fork's initially dormant workflows were activated through the existing Actions API without changing its already-all action policy. No billing, runner protection or provider settings were changed.

The final source-only disposition is explicit: no npm package or public registry publication is selected for this pilot. Skills are packaged once, generated apps omit the duplicate guides/demo, existing checked source bundles remain canonical, and optional UI/recipe selection uses the existing collision-safe registry/scaffold. The per-candidate decisions are in [the distribution record](DISTRIBUTION-DECISION.md); future package investment needs actual upgrade value.

The accepted source package completes the implementation/decision/triage scope of fork issues 7, 10, 11, 12, 15 and 16. It does not close missing outcomes: upstream Blueprint access is pull-only, so issue 3 retains the actual upstream acceptance/merge gate; consumer CI/access and real device/provider gates remain in issues 4/9; real API-consumer/retirement and breaking-upgrade adoption remain in issues 13/14; the human trial and observation remain in issue 17. Issue 6 runs independently against the immutable prior source and must retain its actual scientific result. Fixture tests, source merge and successful unrelated newer consumer builds do not satisfy those outcomes.

Detailed immutable local logs are retained under `/home/dmcin/evidence/blueprint-backlog-20261102` and `/home/dmcin/evidence/blueprint-dependency-20261102`; durable hosted checks are linked above. The native Linux execution checkout is retained for this active goal with owner `01a19a86-dd95-7d83-b05a-896d6f394302`, PR 18 as checkpoint, and review due 9 November 2026. The Windows primary, legacy evaluation data, new live evaluation workspaces and native generated-app validation fixtures remain preserved. Automatic approval review rejected removal of the isolated Windows proof folder and two source-export archives as “blocked by policy”; those artifacts remain and no cleanup was executed.


## Native correction delivered; qualification remains open

[PR19](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/pull/19) is merged into main at `5deca07a9b0155d676802c67c779c503addc7afd`. Six actual-Screen render regressions, TypeScript/ESLint, workflow syntax/LF checks and a focused independent review accepted the runtime/build correction at `8ed5e27/42f42b1`. Standard hosted toolkit/generated-app checks passed.

[Native run41402474150](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/actions/runs/41402474150) proves the Android full-ABI release build. iOS compiled, installed and launched. The first attempt's XCTest focused-app query timed out before app assertions; one unchanged iOS-only retry then passed home, note navigation, title typing and body focus without the prior Expo Head alert. XCTest failed keyboard snapshot/main-loop queries during body input. [Exact retry artifact](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/actions/runs/41402474150/artifacts/13124163138) retains commands, driver logs, screenshot and hierarchy.

Full body entry/save/relaunch persistence is not qualified, and the manual smoke retains its failure. After two XCTest/tooling failures, no new package, driver, controller, review stage or retry is introduced. Accepted source, passing builds and the observed corrected startup/form path support normal source delivery; issue9 stays blocked for the actual remaining keyboard/persistence and consumer signed-candidate/device/provider outcomes. This follows the standing instruction to stop expanding failed validation tooling and distinguish source delivered from qualification.

The fifty-attempt frozen Windows evaluation continues independently. Its source/model/scoring and existing workspaces remain unchanged. The native Linux checkout remains retained for this active goal with the updated main head, PR19 checkpoint and review due9November; no worktree was removed.
