# Executable quality checks

The toolkit distributes source-installed scripts, not a published npm quality package. The installer copies the canonical checks into an adopting app's scripts directory; the runnable Expo starter already contains identical copies. The app owns its dependencies, ESLint/Prettier/TypeScript configuration and domain tests. No background service or publication is enabled.

Run npm run check for the normal local/CI gate: typecheck, ESLint, Prettier, structure, architecture/import graph, static accessibility, generated assets when configured, and the app's unit/resilience tests. check-app.mjs prints each stage's elapsed time and preserves the underlying file/line diagnostics. It stops at the first failure. Missing required package scripts fail before execution. A warm starter gate targets thirty seconds; timing is reported rather than hidden behind a timeout.

Run npm run check:shell for that gate followed by the exported-web build and reusable browser shell journeys. CI may run npm run check, npm run build:web and npm run test:e2e:shell as separate jobs/steps without repeating the first stage. The shell suite covers configured navigation, settings/support routes, preference persistence and corrupt-data protection, recovery/404, accessibility and reduced motion. Notes demo journeys remain in their own suite; product tests remain owned by the app. npm run export:native stays an explicit release check.

## One architecture policy

quality-config.mjs supplies the shared policy. verify-architecture.mjs is its sole AST/import-graph implementation. verify-boundaries.mjs remains a compatibility entrypoint to that implementation and is not a second stage in npm run check. verify-blueprint.mjs retains the distinct package/files/route-tree/module structural checks.

Ordinary route files, including layouts, contain re-exports, type-only imports, directives and supported generateStaticParams functions. They have no arbitrary forty-line limit: implementation belongs in modules. Router + special files and +api handlers have different contracts and need their applicable framework/runtime checks.

Cross-module imports use the target module's public index.ts, including relative paths, aliases, re-exports, literal dynamic imports and require calls. The real-project scan resolves the app's TypeScript aliases. Runtime source cycles fail; type-only imports do not create runtime cycle edges. Tests and declarations are excluded from the runtime graph. Foundation/config cannot import application modules/services/state; shared components/theme/services cannot import product modules. Ordinary routes cannot call services directly. Layout adapters may access services but still satisfy the re-export route contract.

Runtime process.env reads, using dot or bracket notation, belong in src/config/env.ts. The Expo EXPO_SERVER compiler constant is the explicit exception. Comments and string contents are not environment reads. Computed imports require an explicit static adapter. These checks inspect supported source syntax; they do not prove dynamic dispatch, eliminate every JavaScript aliasing technique or establish runtime behavior.

## Reused resilience contracts and limits

The starter's ordinary storage adapter contract checks persistence and isolation across instances. Shared preference tests protect against corrupt/future data, failed saves and retry; injected request-failure tests preserve network errors, coalesce pending work and allow retry. Product-specific notes tests still cover durable note writes, recovery and identity validation. Browser journeys supply rendered shell evidence in addition to static JSX checks.

These gates do not establish real native adapter behavior, device accessibility, remote service correctness, signed binaries, OTA delivery, observed load times or live deployment. Run the applicable release/manual checks for the selected product surface. The exported-web verifier checks its configured asset budgets separately from source checks.
