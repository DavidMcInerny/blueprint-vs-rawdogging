# Phase 1 agent evaluation

Implements Appendix B of the [Rev 3 delivery plan](../proposals/2026-10-29-blueprint-delivery-plan.md).
Decisions, conditions and Gate 1 thresholds: [DECISIONS.md](DECISIONS.md).

Delivery status and open harness gaps: [consolidated plan](../proposals/DELIVERY-PLAN.md), [harness ticket #5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) and [execution ticket #6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6). Complete the recorded corrections before scored runs; the commands below describe the current harness, not a completed evaluation.

## Layout

- `tasks/` — the five fixed tasks. Text after `## Prompt` is sent to the
  agent verbatim. `T1.A.md` / `T1.B.md` differ only in the creation command,
  because the starting repository differs (plan B3).
- `fixtures/<task>/` — files supplied to the agent, copied into the workspace
  before the run.
- `hidden/` — acceptance specs. **Never copied into the workspace.** The
  scorer runs them from here after the agent finishes.
- `runner/` — `prepare-bases.mjs`, `run-eval.mjs`, `score.mjs`, `summarize.mjs`.
- `bases/` — prepared condition snapshots (gitignored, built once).
- `runs/` — one directory per attempt (gitignored).
- `results/results.jsonl` — one record per attempt; `SUMMARY.md` is generated.

## Run it

```powershell
node evals/runner/prepare-bases.mjs        # once; also npm install in evals/hidden
node evals/runner/run-eval.mjs --dry-run   # validate, invoke nothing
node evals/runner/run-eval.mjs --smoke     # 10 runs; then confirm token budget
node evals/runner/run-eval.mjs --full      # 5 per task per condition (50 total)
node evals/runner/summarize.mjs            # counts, costs, Gate 1 verdict
```

`--full` runs every cell 5 times including any smoke runs already recorded;
check `results.jsonl` before launching so cells are not over-sampled.
Runs are sequential on one machine. Each uses a fresh directory under
`runs/`; the agent runs there with permissions skipped (`config.json`), so
never point a run at a workspace you care about.

## Known limitations (record with results)

- No container isolation on this machine (no Docker): shared network, caches
  and machine load are held "constant" only in the loose sense.
- Condition B snapshot preparation uses a Git-Bash-first `PATH` workaround
  for the known Windows `create-app` bug; T1 runs the agent without it.
- T3's "domain modules unchanged" is scored as a static boundary check
  (single composition importer, no direct AsyncStorage imports) plus the
  human-review sample, not a two-snapshot diff.
- T4's breaking change is a supplied storage-schema upgrade, per plan B2 for
  Phase 1; the foundation-release variant arrives in Phase 3.
- Token/cost capture depends on the agent CLI's JSON output shape; raw
  output is kept per run in `runs/<id>/agent-output.txt`.
- Condition A is pinned to the starter's SDK (`default@sdk-57`);
  `prepare-bases` fails if the created app is on any other Expo SDK.
