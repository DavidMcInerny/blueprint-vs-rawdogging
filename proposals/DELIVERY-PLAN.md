# Blueprint consolidated delivery plan

Updated 2 November 2026. Backlog owner: David McInerny. Live tracker: [#1](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/1).

Execution update: the user has authorised autonomous work through the entire backlog. [Execution decisions](EXECUTION-DECISIONS.md) record the resulting scope, pilot choices, bounded run budget and parallel implementation policy. The initial status table below is a dated snapshot; linked issues hold live execution status. Later execution decisions supersede earlier phase-only and manual-checkpoint wording.

This is the entry point for the fork's outstanding work. It combines the Rev 3 delivery proposal, its authorised Phase 1 experiment, and the implemented upstream capability/adoption work. GitHub issues hold live status, dependencies and completion evidence; this file holds scope, sequence and decision rules. Older proposals remain design references, not additional mandatory backlogs.

## Current commitment and boundaries

Phase 1 remains the current authorised experiment under [the decision record](../evals/DECISIONS.md). Ten smoke runs precede the existing budget decision for the remaining forty. Doc ablation and the later condition C evaluation need their separately recorded budgets.

Existing extraction work is already built. Complete its normal source review, consumer CI and delivery without making it depend on a new benchmark, package release or unrelated qualification programme. New platform investment still needs the recorded Gate 1 go decision and two committed consumers unless the owner explicitly changes that rule.

The open scope decision is [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2): Dave's [Rev 3 proposal](2026-10-29-blueprint-delivery-plan.md) is benchmark-first; Simon's [capability proposal](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/2026-10-29-product-capability-foundation.md) favours extraction/adoption first and packages only when useful. This consolidation preserves the current authority and makes that disagreement explicit. It does not claim either proposal has been accepted by the other owner.

Creating backlog issues does not start their implementation. Deferred candidates and publication/release decisions require their stated scope and owners.

## What already exists

| Work | Current position | Outstanding action |
| --- | --- | --- |
| Fork plan and evaluation harness | Branch `proposals/blueprint-delivery-plan-rev3`, committed at `1a20795` before consolidation; [upstream PR #3](https://github.com/Simondarcy7/blueprint-vs-rawdogging/pull/3) open | Bounded harness corrections and scored runs, [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) and [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) |
| Evaluation data | A/B bases exist; one T3-A validation workspace passes 7/7 with production scoring; no `results/results.jsonl` or summary at consolidation | Preserve validation as harness evidence, not a scored sample |
| Shared capabilities and UI | [Upstream draft PR #4](https://github.com/Simondarcy7/blueprint-vs-rawdogging/pull/4), head `635ac6b`; toolkit/generated-app hosted checks pass | Acceptance and integration, [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3) |
| Real consumer adoption | Golf [draft PR #45](https://github.com/Simondarcy7/golf-scoring-app/pull/45) is open at `a678c509`; OddsBasket [PR #51](https://github.com/Simondarcy7/oddsbasket-app/pull/51) is linked by the extraction report | Consumer CI and owner delivery, [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4); OddsBasket current metadata could not be read by this connector (404) |
| Source distribution and compatible fix | Checked source bundles, parity manifests and draft-counter fix adopted in both consumers are documented | Reuse that proof; npm publication, Renovate and breaking package upgrades remain unproven |
| Line-ending policy | Root `.gitattributes` already exists with LF defaults and shell/binary rules | Preserve it; Windows CI, pure-Node creation and entrypoint checks remain, [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7) |
| Earlier guidance work | Upstream PRs #1 and #2 are merged | Do not reopen them because historical branch names remain |

PR #4's latest report records 300 toolkit tests, 15 starter tests, successful starter browser/native bundle CI, and 5,048 physical production lines across 41 canonical capability files. Those counts establish the reported scope, not production/native-provider readiness. Reuse [the final phase report](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/implementation-notes/phase-5-summary.md) and its linked evidence.

The extraction programme's phases 1–5 are separate from Rev 3's phases 1–5. An extraction phase 5 report does not mean the Rev 3 pilot has finished.

## Order of completion

1. **Settle the combined scope and owners** in [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2). Confirm whether Golf and OddsBasket are the two committed pilot products; existing adoption makes them candidates, but the Phase 1 record currently names none. Record maintainer backup, support budget, surfaces/matrix and explicit publication/name/Fullstack decisions or deferrals.
2. **Complete the existing work in two lanes.** Finish the bounded harness corrections in [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5). In parallel, complete the existing extraction acceptance [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3), unblock consumer hosted CI and finish consumer delivery [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4). Reuse passing Blueprint checks and focused consumer evidence. Do not rebuild the extracted code.
3. **Complete the current experiment** in [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6): ten smoke runs, budget decision, remaining forty, findings and Gate 1 decision. Freeze inputs before scored runs. Changes from PR #4 must not silently alter a condition halfway through the experiment.
4. **Address creation and release quality.** After the applicable go decision, complete pure-Node creation, version alignment and declared Windows/Linux CI in [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7). Dependency remediation [#8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8) can be scoped in parallel against the accepted source. With one committed consumer, finish the allowed creation fixes and stop platform expansion.
5. **Qualify only the integrations being enabled** in [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9). Native/provider acceptance uses the exact selected consumer revisions and preview environments. It can proceed when those revisions/environments are ready; external native beta must wait for its required device/OTA evidence.
6. **Restructure only after the investment decision.** Choose the smallest justified package/source/recipe boundaries in [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11); then complete the lean template/reference/plugin [#10](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/10) and coherent checks/journeys [#12](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/12). Complete Fullstack contract integration [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13) where the committed remote workflow needs it. These form one coherent distribution change, not eleven mandatory package projects.
7. **Prove the selected upgrade path** in [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14): compatible and breaking changes, both consumers, migration/data/branding/fingerprint outcomes and measured adoption effort. Use existing source-fix evidence where applicable.
8. **Finish the non-author trial and decision** in [#17](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/17). Record applicable gates and economics once, observe normal maintenance for 4–6 weeks, and review the first real upgrade and six-month outcome.
9. **Keep additional extraction conditional.** [#15](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/15) and [#16](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/16) are ranked discovery queues. They are not prerequisites for finishing the committed pilot or reasons to keep the programme open indefinitely.

## Tracked work packages

Status is a snapshot at consolidation; follow each linked issue for the current state. David coordinates the fork backlog. Simon and the consumer maintainers retain their existing source, account, merge and release authority; technical executors are selected when a package starts.

| Ticket | Work package | Initial status | Dependency or next decision |
| --- | --- | --- | --- |
| [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2) | Confirm the combined delivery scope and pilot owners | ready | Ready for scoped action |
| [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3) | Accept and integrate the existing Blueprint capability extraction | in-progress | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2) |
| [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4) | Complete Golf and OddsBasket adoption delivery | blocked | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2), [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3) |
| [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) | Finish the Phase 1 evaluation harness before scored runs | ready | Ready for scoped action |
| [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) | Run Phase 1 and record the go or stop decision | blocked | [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) |
| [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7) | Make app creation portable across Windows and Linux | blocked | [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) |
| [#8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8) | Resolve dependency risks and release readiness gaps | ready | Ready for scoped action |
| [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) | Qualify native and provider integrations that products will enable | blocked | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2), [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4) |
| [#10](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/10) | Separate the lean app template from the reference app and agent plugin | deferred | [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7), [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2), [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) |
| [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11) | Package only the shared boundaries supported by real adoption | deferred | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2), [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6), [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3), [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4) |
| [#12](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/12) | Unify the executable checks and shared shell journeys | deferred | [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7), [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11) |
| [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13) | Integrate the useful Fullstack App Foundation contracts | deferred | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2), [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6), [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11) |
| [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14) | Prove releases and upgrades in both pilot consumers | deferred | [#10](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/10), [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11), [#12](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/12), [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13) |
| [#15](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/15) | Triage the remaining product and interaction capability candidates | deferred | [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4), [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) |
| [#16](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/16) | Triage identity ownership collaboration and sync candidates | deferred | [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4), [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) |
| [#17](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/17) | Complete the self service trial and maintenance decision | deferred | [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4), [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9), [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14) |

A dependency means the relevant accepted result, not merely closing a ticket. A stop decision in [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) never unlocks platform work. For conditional distributions, mark an unnecessary package or Fullstack dependency explicitly inapplicable rather than build it to satisfy the table. Required provider/device proof may run against an agreed preview revision before consumer merge; it need not wait for production rollout.

## Bounded evaluation corrections

The harness is implemented, but the following gaps must be resolved together in [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) before scored runs:

- The prepared B manifest identifies `59cfc15-modified`, while the original plan names `0d770675`; A and B also use different Expo 57 patches. Freeze exact inputs, account for differences and record any deliberate protocol change before results exist.
- The CLI currently requests the alias `opus` and records `opus (config)`. Pin `claude-opus-5-5` under the standing Claude policy, record the effort, and capture input identities, actual model/CLI metadata and relevant usage.
- `--full` currently constructs all fifty cells again rather than resuming the missing forty after smoke. Resume by unique task/condition/replicate and require five valid samples in every cell.
- The summary checks aggregate counts and treats absent token metrics as a cost-gate pass. Require complete cells and report missing cost evidence as unknown.
- The scorer exports web, while the decision record promises native export; neutral quality measures also need implementation or an explicit pre-results scope correction.

Keep the existing production-export scorer and its validation evidence. Do not expand this into another controller, qualification system or repeated review loop.

Gate 1 remains: B passes at least seven more of twenty-five runs than A; B is not worse by three or more on any task; B median tokens and wall time are at most 1.5 times A. Smaller gains remain inconclusive. The no-container Windows execution limitation stays visible with the results. Use native Windows tools/files for that Windows experiment; any later Linux execution uses a Linux-native checkout and environment.

## Distribution and capability coverage

| Source-plan work | Consolidated destination |
| --- | --- |
| Rev 3 owner decisions and pilot selection | [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2) |
| Five task prompts, hidden tests, runner, baseline comparison, findings, budgeted ablation | [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5), [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6); ablation stays conditional |
| Windows creation, LF policy, version alignment, OS/native CI names | [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7); LF groundwork already done |
| Notes isolation, thin template, reference app, registry and plugin, shorter agent instructions | [#10](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/10), [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11) |
| Storage/core/navigation/device/notifications/diagnostics/flags candidates | [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11); reuse extracted equivalents and validate each actual boundary |
| Unified check/eslint-config/journeys and resilience contract kits | [#12](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/12) |
| Fullstack API contracts and archive/migration decision | [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13) |
| Changesets, namespace, publish workflow, Renovate, codemods and support/compatibility | [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14); implementation follows the chosen distribution |
| Two product slices and real shared-fix adoption | Built source evidence under [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3), [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4); release/upgrade proof under [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14) |
| Condition C rerun, non-author trial, six gates, economics and observation | [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14), [#17](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/17); rerun budget is separate |
| OTA, telemetry/Sentry, outbox, drafts, import-review, overlays and engagement | Implemented in PR #4; accept through [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3), qualify enabled providers/platforms through [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) |
| Account recovery/cleanup, preference transactions, merge-safe undo, shell/settings/inbox UI | Implemented by extraction phases 4/5; do not rely on earlier inventory rows that still call them future work |
| Remaining interaction, device, discovery, import, content-trust, performance and QA candidates | [#15](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/15) |
| Identity, cross-tab ownership, guest migration, collaboration, sync and planning candidates | [#16](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/16); actual backend/account semantics remain required |
| Starter advisories/patches and Golf's soft performance target | [#8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8); native/provider/release evidence in [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) |

Provider-neutral controllers do not replace a product's authentication, notification scheduler or server authorisation. Golf's existing scheduler and OddsBasket's email-link identity remain host-owned until an explicitly scoped adoption changes them.

Golf's initial JavaScript is reported at 746,515 gzip bytes, below its 750,000 hard limit and above its 620,000 target. Consumer hosted CI was reported blocked by account payment/spending restrictions. These are specific follow-ups; local tests are not hosted CI and source installation is not deployment.

## How to keep the plan current

- Use [tracker #1](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/1) as the single checklist. Every package has acceptance criteria, dependencies and a next action. Use one status label: `status:ready`, `status:in-progress`, `status:blocked` or `status:deferred`; closed issues record completed work.
- Update the owning issue when starting work, reaching a material blocker or finishing. Record the exact PR/source revision, applicable test/evidence links, remaining limitation and next action in that issue or its existing PR.
- Complete one coherent change and relevant verification, then use one independent review when required. Reopen only for an actionable unresolved finding or material change. Do not create tickets for reviews of reviews, receipts or unchanged evidence.
- Do not retest accepted source merely because it moved or gained another commit hash. Run relevant verification once for actual changes; preserve necessary target/current-source/rollback/running-work safeguards.
- Distinguish source installed, service running and feature enabled/qualified. A code merge does not close an outstanding provider/device qualification.
- Close packages when their stated acceptance is met. At the final decision, explicitly defer or retire unselected candidates; they do not require implementation to finish this pilot. No automatic publishing, provider activation, destructive cleanup or recurring AI progress review is part of this plan.

## Design references

- [Rev 3 decision memo and detailed package/gate design](2026-10-29-blueprint-delivery-plan.md).
- [Phase 1 decisions and existing authorisation](../evals/DECISIONS.md), [harness usage](../evals/README.md).
- [Upstream extraction proposal](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/2026-10-29-product-capability-foundation.md).
- [Capability inventory](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/golf-capability-inventory.md), interpreted with [the latest phase 5 report](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/implementation-notes/phase-5-summary.md).
