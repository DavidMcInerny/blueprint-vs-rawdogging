# Blueprint consolidated delivery plan

Updated 2 November 2026. Coordinator: David McInerny. Live checklist: [tracker #1](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/1).

This is the fork's single delivery plan. It consolidates Rev 3, the evaluation, the capability extraction and current consumer WIP. The linked issues contain acceptance criteria and live evidence. Older proposals are design references, not additional mandatory backlogs.

## Current position

**Nine of sixteen work packages are complete. Seven remain open.** Source delivery [PR18](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/pull/18) is merged into fork main at `9f29f46`. Optional agent profiles were subsequently aligned with the authorised model policy at `cdfac2e`.

Two execution lanes are active:

- **Evaluation, #6:** the ten smoke samples are complete and the remaining forty are running within the recorded fifty-primary-attempt allocation. The frozen source is `749926b`, not current main. Results remain provisional until the complete matrix and unchanged Gate 1 rules are evaluated.
- **Reference native execution, #9:** [PR19](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/pull/19) fixes a reproduced native Expo Head alert and Android build metaspace exhaustion. Its source review and focused checks passed; the existing native workflow is running at `42f42b1`. Actual consumer signed-candidate/device/provider gates remain separate and open.

All other open packages have concrete external dependencies: upstream merge authority, consumer CI/access, real consumer adoption, or human participation and elapsed observation. Their source preparation is delivered; these missing outcomes are not satisfied by fixtures or documentation.

The user's [execution decisions](EXECUTION-DECISIONS.md) authorise autonomous work through the backlog, parallel `gpt-6.1-sol` agents at high effort, and continuation after recording smoke cost without an intermediate checkpoint. They supersede earlier Phase-1-only and conditional implementation wording. They do not grant access to other owners' accounts or permit invented results.

## Order for the remaining work

| Order | Work | Dependency and next action | Responsible party |
| --- | --- | --- | --- |
| 1, parallel | #6: finish the frozen comparison and publish the decision | Continue the existing run; audit all fifty primary attempts, publish results/findings and apply unchanged thresholds. Record the planned human-review sample as missing until actually performed. | Fork coordinator; non-author human for human review |
| 1, parallel | #9: finish the current reference native run | Inspect the existing Android/iOS run at the exact PR19 head, resolve only concrete failures, then merge the accepted correction when its relevant checks pass. This does not close product qualification. | Fork coordinator |
| 2, parallel | #3: upstream acceptance; #4: actual consumer delivery | Upstream maintainer decides PR4. Golf account owner resolves hosted CI billing restrictions for PR45; OddsBasket owner supplies the accessible PR51/repository. Reuse accepted extraction and consumer evidence. | Upstream/consumer maintainers and account owners; David coordinates |
| 3 | #9: qualify enabled product integrations | Use the exact selected consumer candidates and actual provider/device environments. Reuse bounded newer Golf startup evidence only for the source and paths it covers. Keep unused optional integrations deferred. | Consumer release/provider owners |
| 4 | #13: prove real API adoption and donor disposition | Identify actual Fullstack users; apply the delivered contract/recovery kit to a real remote-consuming product. Obtain the donor owner's migration/retirement decision. | Consumer and Fullstack maintainers |
| 5 | #14: prove the actual maintenance cycle | With consumer access and selected contracts, adopt a breaking change in both products using the delivered guarded migration; record time, data/branding preservation and runtime/rollback outcomes. Condition C requires its recorded bounded allocation before execution. | Consumer maintainers; David coordinates |
| 6 | #17: complete the human trial and maintenance decision | A non-author performs the recorded trial. Collect actual costs/support and 4-6 weeks of normal work; review the first real upgrade and six-month outcome. Record go/narrow/archive and ownership. | Non-author participant and fork/consumer owners |

Independent work proceeds when another lane is blocked. Account, merge, provider, human and calendar dependencies retain their actual meanings. There is no automatic paid service activation, publishing, production release or destructive cleanup in this plan.

## Complete ticket inventory

Status below is the 2 November execution snapshot; issues are live. David coordinates all packages. Upstream and consumer maintainers retain their existing merge, account and release authority.

| Ticket | Work package | Status | Evidence or exact remaining outcome |
| --- | --- | --- | --- |
| [#2](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/2) | Combined scope and pilot owners | complete | Execution decisions record the combined scope, working Golf/OddsBasket pilots, authority and explicit deferrals. |
| [#3](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/3) | Accept/integrate existing extraction | blocked | Integrated into fork main; upstream PR4 acceptance/merge remains with the maintainer; this session has pull-only upstream access. |
| [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4) | Golf and OddsBasket adoption delivery | blocked | Golf PR45 hosted jobs fail before start on account billing; OddsBasket PR51 returns 404. Neither is reported deployed. |
| [#5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) | Phase 1 harness readiness | complete | Immutable identities, exact model, balanced cells, terminal-attempt cap, neutral checks and native exports; focused scientific review accepted. |
| [#6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6) | Phase 1 results and decision | in progress | Ten valid smoke samples retained; remaining forty running. Final findings, unchanged Gate 1 decision and real human-review sample remain. |
| [#7](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/7) | Portable Windows/Linux app creation | complete | Pure-Node installation, maintained-fork bootstrap, collision/link safety and hosted Windows/Linux proof delivered in PR18. |
| [#8](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/8) | Dependency risks and release readiness | complete | Compatible remediation delivered; residual advisories explicitly recorded. Golf soft-budget follow-up is owning issue48, not a new release gate. |
| [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9) | Native/provider qualification | in progress | PR19 reference runtime/build corrections under native execution; actual signed-consumer, device, OTA, payload/consent and provider outcomes remain. |
| [#10](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/10) | Lean template, reference app and plugin | complete | Lean creation default, opt-in demo, canonical reference, machine-level plugin and shorter app instructions delivered. |
| [#11](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/11) | Choose justified shared distribution boundaries | complete | Source packs/recipes, existing registry and plugin selected; all eleven package candidates dispositioned. No npm release selected or claimed. |
| [#12](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/12) | Unify checks and shared journeys | complete | Canonical AST policy, timed static/unit check, separate browser shell gate and reusable failure/recovery contracts delivered. |
| [#13](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/13) | Fullstack API contracts and migration | blocked | Checker/recovery kit and one installer delivered; actual remote-consumer adoption/users and owner-controlled donor disposition remain. |
| [#14](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/14) | Real releases/upgrades in both pilots | blocked | Compatible source-fix evidence reused; guarded breaking migration delivered. Real two-product breaking adoption, measured cost/data/runtime proof remain. |
| [#15](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/15) | Triage product/interaction candidates | complete | Seventeen candidates ranked with implemented equivalents and explicit conditional/deferred dispositions. |
| [#16](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/16) | Triage identity/ownership/sync candidates | complete | Ten candidates ranked; host identity/backend ownership and real adoption acceptance remain explicit. |
| [#17](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/17) | Self-service trial and maintenance decision | blocked | Protocol is in issue17. A non-author, actual adoption economics and elapsed observation are unavailable; none are fabricated. |

Closed triage means the candidate queue has been assessed, not that every candidate must be built. A source merge, an app launch and a qualified product release are separate outcomes.

## Decisions and reusable evidence

- **Distribution:** [source packs/recipes and the existing installer/registry](DISTRIBUTION-DECISION.md), a lean app, canonical reference and machine-level plugin. Eleven npm packages, a private registry and namespace publication are not selected. Future packaging needs actual upgrade value and publishing authority.
- **Pilot source:** upstream extraction `635ac6b` is integrated into the fork. Its accepted source, tests and reviews are reused. Golf PR45 and inaccessible OddsBasket PR51 remain actual consumer WIP; newer Golf releases do not prove those adoption revisions.
- **Implementation evidence:** PR18 records the coherent source acceptance, toolkit 340/340, fresh/reference static/unit and export checks, browser 15/15 lean and 30/30 reference, actual Windows/Linux creation and hosted checks. Later focused regressions are linked in their owning PRs; successful tests are not repeated because a hash changes.
- **Release/API preparation:** [Fullstack integration](FULLSTACK-INTEGRATION.md), [upgrade readiness](UPGRADE-READINESS.md) and [consumer delivery](CONSUMER-DELIVERY.md) identify what is delivered and what still needs actual product access/outcomes.
- **Additional capabilities:** [candidate disposition](CAPABILITY-DISPOSITION.md) ranks the remaining UX and identity work without turning all discovered ideas into commitments.

## Frozen evaluation and stop rules

The authorised experiment is fifty primary attempts: T1-T5, A/B, five replicates per cell, including smoke. Invoked timeouts/crashes consume their replicate; failed model outcomes are retained. Missing identity or cost evidence remains unknown. No source, prompt, model or scorer changes enter a live comparison.

The experiment uses frozen source `749926b2c207af7ba3047492f500d2a9fea1dbb2`, exact `claude-opus-5-5` at high effort, sequential Windows-native execution and subscription authentication. Current main's source changes are outside this experiment. The ten-sample smoke cost/time is recorded in #6, with continuation already authorised; no new budget checkpoint is pending within the fifty-attempt cap. Doc ablation and condition C require a separately recorded bounded allocation before running.

Gate 1 remains: B passes at least seven more of twenty-five runs than A; B is not worse by three or more on any task; B median tokens and wall time are at most 1.5 times A. Smaller gains are inconclusive. Publish the actual go/narrow/stop outcome even though useful source work has already been delivered. Human review and non-container Windows/cache limitations remain visible; token list-price equivalents are not subscription invoices.

The earlier plan's gated platform ordering is superseded for the implementation explicitly authorised in the execution decisions. This does not turn a failed scientific result into permission for unlimited future platform investment. Existing source remains usable under its documented scope and residual risks.

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

## Tracking rules

- Tracker #1 is the single checklist. Every work package links its acceptance criteria, dependency, coordinator and next action. Use one live status label per open issue: ready, in-progress, blocked or deferred; closed issues hold completion evidence.
- Update the owning issue at meaningful transitions with exact source/PR, applicable evidence, remaining blocker, responsible party and next action. Use main's plan as the canonical scope/order reference; historical proposals remain linked design inputs.
- Finish a coherent change and relevant checks once, then one independent review when required. Reopen only for an unresolved actionable finding or material change. No review-of-review chain, trivial receipt tickets or recurring AI progress reviews.
- Preserve the live evaluation, primary/active/dirty work and unique ignored evidence. Native Linux work remains on ext4; Windows work remains Windows-native. Worktree retention and any cleanup follow the standing lifecycle policy.
- Close an issue only when its actual criteria are met or its explicitly authorised scope is dispositioned. Keep human/provider/account/calendar outcomes open when unavailable. Close tracker #1 only after delivery, the actual experiment decision and every remaining disposition are settled.

## Design references

- [Rev 3 decision memo and detailed package/gate design](2026-10-29-blueprint-delivery-plan.md).
- [Phase 1 decisions and existing authorisation](../evals/DECISIONS.md), [harness usage](../evals/README.md).
- [Upstream extraction proposal](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/2026-10-29-product-capability-foundation.md).
- [Capability inventory](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/golf-capability-inventory.md), interpreted with [the latest phase 5 report](https://github.com/Simondarcy7/blueprint-vs-rawdogging/blob/635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484/proposals/implementation-notes/phase-5-summary.md).
