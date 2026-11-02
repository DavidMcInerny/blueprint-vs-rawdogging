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

Both conditions use Expo 57, resolved Expo `57.0.30` and React Native `0.86.3` from the frozen B lockfile. The bare creation prompt now states those versions. This corrects creation-time SDK drift before any primary samples exist. Report source and version differences explicitly. Ten unique task/condition cells must each contain five valid replicates before the final verdict; missing cost metrics remain unknown. Native export and neutral quality checks must match their declared scoring scope. Hidden-test isolation limitations of the non-container Windows protocol remain visible in findings.

## Publishing support and repository disposition

Keep the repository name during the pilot. A rename would add consumer/provenance work without evidence of benefit.

Keep source distribution operational. A public npm namespace and publication are deferred until a selected package has a tested version/upgrade contract and the authenticated publishing owner is known. Local package/tarball preparation may proceed; absence of registry access is not permission to report a public release. No private registry is introduced.

Fullstack App Foundation remains unarchived. Its distinct useful contracts can be integrated through Blueprint's existing installer, while actual prior users and retirement authority are investigated. Unknown consumers require a recorded migration decision; pull-only access does not grant archive authority.

The final non-author human trial, real device/provider acceptance and observation period retain their meanings. An agent rehearsal, fixture, web export or elapsed plan date cannot stand in for those results. Complete all feasible implementation and preparation, keep unmet criteria open with exact evidence, and continue other work when an external dependency blocks one package.
