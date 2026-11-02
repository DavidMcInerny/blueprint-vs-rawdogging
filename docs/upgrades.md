# Source upgrades and compatibility

The chosen distribution is pinned source installation and selected source packs. Use the existing installer, capability sync and reviewed application changes; no npm namespace, registry authentication, Changesets or publishing workflow is required for this path. A toolkit source update does not authorize an application deployment or provider activation.

## Identify and protect the existing application

Record the current toolkit revision and adopted file hashes in the existing project index or capability manifest. Keep the app's own source revision, platform/toolchain and selected packs explicit. Before writing, inspect its changes and active processes, retain the app's last known good commit and preserve any unique uncommitted/ignored work using the existing recovery process. Run tools on the checkout's native filesystem. Do not overwrite a customized app with the current starter.

For the tracked capability bundles, follow [shared capability adoption](shared-capability-adoption.md): dry-run, inspect the exact delta, write, then check the selected canonical files and hashes. The sync command refuses changed/colliding source and does not merge customizations or delete removed files. A manifest identifies adopted bytes; it is not proof of runtime compatibility. Existing adapters, branding, schemas, routes and data stay app-owned.

For installed quality scripts, compare the prior and selected canonical revisions, merge only the selected reviewed changes, and preserve local policies. The installer skips existing files by default. Do not use a blanket force install as an upgrade strategy. If a selected file was customized, retain it and perform an explicit host-owned merge instead of asking a source-sync tool to guess.

## Migrate the generated check command

The current gate uses `node scripts/check-app.mjs`; [quality checks](quality-checks.md) defines its stages. This replaces the old generated shell pipeline and its redundant boundary-check invocation. It is a tooling adoption change, not a new runtime API or a data migration.

From the selected Blueprint checkout, run:

```sh
node scripts/migrate-app.mjs --root /absolute/path/to/app
node scripts/migrate-app.mjs --root /absolute/path/to/app --write
```

The first command is a dry-run; `--dry-run` is also accepted. The codemod recognizes only the exact legacy generated command or the current command. The legacy command includes typecheck, lint, formatting, structure, the former boundary wrapper, architecture, accessibility, asset checks and tests. Custom/extended commands are refused and must be reconciled manually so product checks remain in place.

Before changing the command, it requires the current coherent `check-app.mjs`, `quality-config.mjs`, `verify-blueprint.mjs`, `verify-architecture.mjs` and `verify-accessibility.mjs` already installed byte-identically from that checkout, plus the host's required quality scripts. It never copies checker source over existing app files. Missing or divergent files stop migration; complete their reviewed integration first. Apps with intentionally customized checks keep those policies and update their command manually.

Only the `scripts.check` JSON value changes; unrelated whitespace, scripts, product metadata and configuration bytes are preserved. Duplicate JSON keys, symlinks and hard-linked package files are refused. Write uses a temporary file, preserves the original permission mode, rechecks the original package before atomic replacement, and cleans its temporary file. Use a trusted, quiescent checkout; this is not a lock against hostile filesystem writers. A second application is an unchanged no-op. The tool installs no dependencies, runs no app code and touches no persisted product data.

After adoption, run the app's normal check once and its affected workflow tests. Shell/browser or native checks remain conditional on the changed surface. Existing passing evidence remains applicable where the implementation and inputs did not change. Revert the single package command and the selected checker source together to the prior app commit if the tooling migration must be undone.

## Version, release notes and support

The exact source revision and file hashes are authoritative identifiers. App package/version/build numbers are product-owned; changing a toolkit script does not bump them automatically. For any toolkit source release/tag, use semantic change classification in its existing release notes:

| Change | Classification and required note |
| --- | --- |
| Compatible behavior correction with unchanged public contracts | Patch: affected source pack, regression and consumer impact. |
| Additive optional capability or checker | Minor: opt-in integration, dependencies and supported platforms. |
| Changed public behavior, persisted schema or required check/adoption contract | Major: migration, affected consumers, compatibility window and rollback/forward-fix limits. |

A Git SHA alone is not a semantic version, and this policy does not claim a package or tag has been published. Keep one changelog/release entry with old/new revision, selected file/contract changes, known gaps, migration and evidence. Do not introduce a separate acceptance receipt for each source change.

Support is limited to the explicitly tested toolchain and selected source boundary. Use the starter's declared Node range and locked Expo/React/React Native/Router versions for a new app. Existing consumers retain their own supported versions; a matching pure helper hash does not establish native SDK compatibility. Do not promise every SDK combination or silently upgrade a consumer's dependencies. A consumer with a source escape hatch owns its divergence, adapter tests and manual future merges. Record owner, supported revision/window and revisit trigger in its existing index. Retain old source needed for the agreed rollback window; destructive schema retirement requires the product's explicit migration decision.

## Runtime fingerprints, schemas and rollback

This check-command codemod changes no runtime source, dependency, native configuration or persisted schema. That bounded file delta does not establish a production fingerprint result. For any actual app upgrade, record before/after native fingerprints per platform using its installed SDK's supported tooling and the same inputs/configuration; keep the resulting runtime identifiers and source revisions in the existing release record. Do not suppress a fingerprint input merely to preserve equality. Expo's [fingerprint documentation](https://docs.expo.dev/versions/latest/sdk/fingerprint/) describes the dependencies/native configuration it considers; consult the matching SDK reference.

An update must match the installed binary's native runtime. Native code/configuration/dependency changes require a compatible new binary before publishing an update that uses them; follow Expo's [runtime-version guidance](https://docs.expo.dev/eas-update/runtime-versions/) and the existing [build and release workflow](build-and-release-workflow.md). Matching fingerprints alone do not authorize OTA publication. Verify channel/environment, active-work safety, running update identity and recovery on the actual installed build. Web-only consumers record native delivery N/A.

For storage or server contracts, verify supported old/new clients against populated disposable data, including unknown/future fields, stable identity and the intended recovery version. Prefer additive transitions. A source rollback cannot undo remote writes or a destructive schema migration. If the old version cannot read the new state, record a forward fix or new-binary recovery plan. This migration has no storage schema change, so schema conversion is N/A; product upgrade/rollback proof remains product-specific.

The next real adoption needs the exact app revisions, measured elapsed adoption time, selected source change and commands/results, preservation of branding/customization/data, supported schema recovery and runtime/delivery decision. Fixture migrations verify the tool only. An evaluation rerun remains under its separately authorized budget; an upgrade guide or successful codemod does not start it.
