# Blueprint agent plugin

Build a machine-level artifact once from the canonical source:

    node plugin/build.mjs --target ../blueprint-foundation-plugin

The output is a self-contained skills plugin using .codex-plugin/plugin.json, plus
a Claude compatibility manifest and the existing commands. All skills, references,
scripts and recipes come from codex/skills; no separate authored copy lives here.
The builder refuses existing output folders and symlinks; use a new versioned output
for upgrades, review diffs, then replace the installation deliberately.

In Codex, add the built folder through a local plugin source in Plugins. In Claude
Code, use claude --plugin-dir /absolute/path/to/blueprint-foundation-plugin for a
session. The legacy toolkit installer’s explicit --install-user-assets option
remains available for users who need standalone skills/agent TOML files rather than
a plugin. It does not silently configure the plugin or an MCP server.

Generated products contain short product instructions and verification commands.
They do not copy the reusable skill library into both .agents and .claude, nor
copy the full playbook library into docs/foundation. Existing-app installation
retains its additive legacy options; --with-demo preserves the old reference mode.

Manifest fields and relative paths follow the [official packaging contract](https://developers.openai.com/plugins/build/plugins).
The installed cloud-environment plugin’s compatibility manifest was inspected as a
local layout example on 2 November 2026. No unpublished schema, hook execution,
Marketplace installation or public publication is claimed. The artifact has no
network dependency or provider credentials. Agent TOML roles remain available
through the explicit user-assets installer because they have no selected plugin
manifest contract.

The detailed methodology remains selected on demand through the skill entrypoints.
The short product instructions retain architectural and evidence requirements;
pruning their words is a delivery decision, not experimental proof of equal quality.
The frozen experiment and separately budgeted ablation own that empirical question.
