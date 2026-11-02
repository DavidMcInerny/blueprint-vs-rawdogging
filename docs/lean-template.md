# Lean product creation and runnable reference

Default creation produces a product-owned application with Home, Settings and Support,
brand/config/theme, persistent appearance/motion preferences, shared shell controls,
quality checks and initial Git commit. It contains no notes routes, notes provider,
notes model/store, notes-specific journeys or inherited note-storage/privacy claims.

    node scripts/create-app.mjs --target ../my-app --name my-app
    node scripts/create-app.mjs --target ../notes-reference --name notes-reference --with-demo

The canonical runnable reference remains starters/expo. Its complete durable notes
workflow and capability-backed shell remain available with --with-demo. Default
creation applies scripts/render-lean-template.mjs to a fresh exclusive copy, then
brands it; it does not create a second baseline tree. Exact source substitutions
fail on drift, and the canonical reference cannot be rendered in place.

Shell browser tests live in e2e/shell.spec.ts: appearance/motion persistence, corrupt
preference recovery, keyboard, axe, overflow and real 404. They read navigation from
the app's plain configuration. Product journeys live in e2e/notes.spec.ts and are
removed with the notes module. Native smoke is rendered for Settings in the lean
product; the reference retains the notes persistence smoke. No generated verification
record reports historical reference checks as checks run on the new product.

Shared app-shell behavior remains canonical in the skill assets and hash-checked
through scripts/sync-product-capabilities.mjs. Existing mirrored presence, motion,
async coordination, preference store and adapter contracts retain their explicit
sync-references map and regression tests. Generic baseline recipes remain optional;
different UI controls with different public contracts are not falsely declared
byte-identical. The runnable reference uses shared product-ui as its layout and
settings/choice implementation; product wrappers own metadata and theme policy.

Reusable instructions/playbooks ship once through plugin/build.mjs, built from the
canonical codex/skills tree. Default apps skip both per-agent skill trees and the
copied docs/foundation library. Product AGENTS.md/CLAUDE.md and BLUEPRINT.md retain
short instructions; the selected agent receives matching short module/service
layers. The legacy additive installer and --with-demo preserve explicit existing
installation modes.

## Instruction disposition

| Retained product instruction | Enforcement / disposition |
| --- | --- |
| TypeScript, Expo Router, thin routes and explicit module APIs | Typecheck, verify-blueprint, verify-architecture |
| Typed adapters and centralized configuration | Architecture/import-boundary checks cover structural parts; selecting the right authority is judgment |
| Accessible controls, narrow layout, preferences and recovery | Unit contracts and shell journeys; actual screen-reader/native acceptance remains a device judgment |
| Preserve user changes and useful work | Installer collision checks, durable preferences and resilience tests cover known paths; business workflow scope is judgment |
| Optional services follow the product brief | Product scope decision; catalogue presence does not enable a service |
| Run applicable checks; record only executed evidence | Executable check policy and commands; evidence interpretation/release authority is judgment |

Pruning duplicate prose does not establish experimental equivalence. The frozen
benchmark and separately budgeted documentation ablation retain that empirical task.
No new provider, release, Git worktree or registry account is required by lean creation.
See plugin/README.md, registry/README.md and proposals/DISTRIBUTION-DECISION.md in the
toolkit checkout. Generated product docs/verification.md explains its own commands.
