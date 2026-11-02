# Distribution decision — editable source pilot

Decision: retain the accepted source bundles/recipes, deliver a lean product template,
a canonical runnable reference and a machine-level agent plugin. Select no npm
packages or new Expo config plugins in this iteration. This is an explicit decision
for each candidate below, not an assertion that all eleven package candidates shipped.

The original package-first plan is superseded for this pilot by EXECUTION-DECISIONS.md.
Two distinct adoption branches establish useful contracts, but do not yet establish
a maintained package upgrade relationship: Golf PR45 is draft/unmerged and its hosted
CI is account-blocked; OddsBasket PR51 is currently inaccessible. Source-distribution
delivery is implemented; production enablement, an observed two-consumer upgrade
cycle, non-author creation trial and public publication remain separate gates.
CONSUMER-DELIVERY.md records exact revisions and current access rather than inferring
deployment from source or a successful unrelated newer release.

## Evidence and compatibility

Canonical accepted extraction: upstream 635ac6b8a3128d42e4c8f2f98fc4dd81e91dd484.
Phase3 reuse proof and phase5 source-size/provenance records enumerate canonical
files and hashes; phase5-summary.md and product-ui.md describe the actual consumers.
Golf supplies draft/import, focus/eligibility and Inbox/undo paths; OddsBasket supplies
builder/import and preference/settings paths. The Expo reference is a third concrete
consumer of shell layout/controls and persistent appearance/motion. Existing source
reports are reused; this decision adds no unperformed device/provider acceptance.

The reference declares Expo57 / React19.2 / RN0.86; current Golf adoption declares
Expo58 / RN0.88. OddsBasket's accepted source report remains bounded to its recorded
head; current repository access fails. These are tested-source compatibility bounds,
not a promise of every Expo SDK, React renderer or native provider combination.
Framework-neutral controllers expose injected ports; the host supplies durable
storage, writer/identity leases, scheduling, codecs, transport, routing and theme.
No source pack initializes an analytics/account/provider service merely by existing.

## Candidate decisions

| Original candidate | Selected delivery / public contract | Actual consumer evidence and reason |
| --- | --- | --- |
| storage | Source pack: typed ports, adapter contract kit, bounded reads, recovery journal, backup and save acknowledgement | Reference preferences/notes, Golf backup and OddsBasket local drafts/settings. Host transaction/lease/codec semantics differ; source and contract kit preserve visible authority while the pilot proves upgrades. |
| core | Baseline source recipes: async work, lifecycle, motion and preference contracts | Reference, Golf/OddsBasket lifecycle and draft consumers. Splitting a package containing theme/React/lifecycle would combine framework-neutral and app-owned policy; keep narrow existing ports and source parity. |
| navigation | Baseline/product-UI source recipes with injected routes/insets | Reference and Golf navigation/Inbox; OddsBasket workflow composition. Router policies and actual native Back/focus are host contracts, not a shared router/version guarantee. |
| device | Optional source adapters/recipe | Golf import and OddsBasket upload are distinct use cases; native permission/device acceptance remains #9. No two verified same-adapter native consumers support a new config-plugin contract. |
| notifications | Optional source controller and workflow recipe | Golf scheduling stays host-owned; shared preferences panel is supplied/tested, not adopted provider replacement. No second real provider integration; package/config-plugin extraction deferred. |
| diagnostics | Optional source facade/allowlist/timeout recipes | Golf and OddsBasket source integration examples; consent and SDK-enriched payloads remain provider-owned. Actual provider acceptance cannot be inferred from facade tests. |
| flags | Optional source pack with explicit persistence/snapshot contract | Existing feature-store source; no accepted repeated provider/upgrade requirement. Keep recipe rather than create a release stream with hypothetical consumers. |
| api-contracts | Source-installed Node check and operation recovery test kit | Fullstack foundation donor plus Blueprint reference are actual source contexts, not two independently maintained service consumers. Existing migration preserves custom check pipelines; no npm/API-runtime dependency is selected. |
| check | Canonical source scripts mirrored into products; one executable check policy | Reference plus generated products; consumer-specific budgets, release identities and custom commands stay app-owned. Versioned-source upgrades are reviewable; a new package would not remove the host contracts. |
| eslint-config | Existing ESLint config + tested architecture/import checks | Reference and generated products; no new competing implementation of rules. A package becomes useful only when a stable shared ESLint compatibility/upgrade contract is adopted by two maintained consumers. |
| journeys | Shared source fixture e2e/shell.spec.ts with plain navigation configuration | Runnable reference and generated lean app share the same shell assertions; notes journeys are isolated. Fixtures execute against each host's built routes/CSP, not a package's hidden app assumptions. |
| editable UI and settings | Source registry/index plus canonical product-ui bundle; product wrappers/brand/theme owned locally | Reference, Golf Inbox and OddsBasket settings. Upstream helpers retain explicit APIs and hash provenance; product-specific edits belong outside managed source or require manual migration. |
| drafts/import/interactions/engagement/undo/account recovery | Existing product/app-shell source bundles | Preserve accepted two-domain controller adoption and specific Golf undo/OddsBasket preference paths; bundled account/prefs panels do not imply provider enablement. No second implementation or domain flags. |
| native configuration | Product-owned Expo configuration + capability recipes | Project IDs, permission strings, auth routing and native runtimes belong to actual enabled providers. No new config plugin until repeated tested native changes justify it. |
| skills/commands/playbooks | One built agent plugin from canonical skills, short product instructions | Codex and Claude compatibility artifacts reuse the same skills. No duplicated authored guide tree or automatic machine install. Agent TOML roles retain the explicit existing user-assets route. |

## Upgrade and maintenance tradeoff

Source distribution makes every consumer upgrade explicit and permits adaptation;
it costs a reviewed diff and can leave apps behind. A package would automate retrieval
and centralize semantic releases, but still needs compatible host contracts, native
runtime review, an authenticated publisher/support owner and actual two-product
upgrade evidence. Existing manifests provide a bounded upgrade mechanism now:
canonical revision/digest/file hashes, full preflight and refusal of local edits,
unexpected/missing files or symlinks. This avoids an invented merger, registry server
or force overwrite. Editable UI changes are deliberate product work.

Canonical code lives once under codex/skills/mature-app-starter/assets. The runnable
reference's selected mirrors are verified, not independently maintained forks.
plugin/build.mjs likewise derives its entire skill tree; registry/README.md indexes
existing scaffold/sync commands rather than maintaining another source implementation.
The lean renderer transforms a fresh canonical reference copy and refuses in-place
reference rendering. Accepted contract tests are reused alongside focused delta tests.

No npm workspace/package, peer dependency manifest, compiled declaration output,
tarball consumer test or public npm publication is claimed, because no npm boundary
is selected. Selecting one later requires a named consumer/public API, explicit
React/RN/Expo/SDK peer range if used, compiled public types, two clean tarball consumer
checks and one relevant upgrade exercise before publication. No product flags or
provider credentials belong in that artifact. The public scope/publishing owner
remains undecided; it is not a blocker to operational source/plugin delivery.

See docs/upgrades.md for the actual source upgrade/migration procedure and
UPGRADE-READINESS.md for pending real consumer-cycle evidence. This record does not
close the external observation, device/provider, public-publication or access gates.
