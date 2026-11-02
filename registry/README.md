# Editable source registry

This registry is an index of supported source bundles, not a server or a package
resolver. Canonical code remains in codex/skills/mature-app-starter/assets.

For the tested shared bundles, preview and install with the existing command:

    node scripts/sync-product-capabilities.mjs --bundle app-shell --target ../my-app/src/foundation/blueprint-shell --dry-run
    node scripts/sync-product-capabilities.mjs --bundle app-shell --target ../my-app/src/foundation/blueprint-shell --write
    node scripts/sync-product-capabilities.mjs --bundle app-shell --target ../my-app/src/foundation/blueprint-shell --check

Inspect node scripts/sync-product-capabilities.mjs --help for exact supported bundle
names (product and app-shell) and options. Individual optional packs and baseline primitives are selected
with the canonical skill’s scripts/scaffold-baseline.mjs; preview with --root EXISTING_APP --with drafts --only-packs --dry-run
before writing. Do not introduce unused providers to satisfy a catalogue.

The sync manifest records file hashes and origin revision/digest. Upgrades compare
the installed copy to that manifest and refuse local edits, unexpected files,
missing files and symlinks. Product adapters, routes, theme and business rules stay
outside the managed bundle. Review upstream changes and adapt through public APIs;
do not force-overwrite a modified product UI. Collision protections are the upgrade
mechanism, not a custom merge engine.

See [distribution decisions](../proposals/DISTRIBUTION-DECISION.md) for each candidate,
consumer evidence and compatibility bounds. No npm package, registry hosting,
automatic merge or remote publication is selected or claimed.
