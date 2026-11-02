# Phase 1 agent evaluation

Implements Appendix B of the [Rev 3 delivery plan](../proposals/2026-10-29-blueprint-delivery-plan.md).
Decisions, conditions and Gate 1 thresholds: [DECISIONS.md](DECISIONS.md).

The fifty-attempt comparison is complete: **Gate 1 FAIL**, bare Expo 24/25 and frozen Blueprint 17/25. Read the [findings and decision](results/FINDINGS.md), [generated summary](results/SUMMARY.md) and [raw records](results/results.jsonl). The planned human-review minutes remain unavailable in [execution ticket #6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6); the [harness ticket #5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) is complete. Current delivery scope/order is in the [consolidated plan](../proposals/DELIVERY-PLAN.md). This result concerns frozen `749926b`, not later source delivered on main.

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

## Recorded execution commands

```powershell
node evals/runner/prepare-bases.mjs        # once; also npm install in evals/hidden
node evals/runner/run-eval.mjs --dry-run   # validate, invoke nothing
node evals/runner/run-eval.mjs --smoke     # 10 runs; record usage/time
node evals/runner/run-eval.mjs --full      # resume missing cells up to 50 primary attempts
node evals/runner/summarize.mjs            # counts, costs, Gate 1 verdict
```

These commands document the completed protocol; do not start another comparison or alter its inputs to improve results. The autonomous execution decisions authorised the full fifty-attempt allocation after smoke usage was recorded. No ablation or condition C run was started.

`--full` resumes missing task/condition/replicate identities, including smoke records, and enforces a fifty-primary-invocation cap. Invoked terminal failures consume their replicate; they are not replaced. Missing model/input/cost evidence remains unknown. Existing results and attempt ledgers are retained.
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
- The final versioned protocol pins `create-expo-app@5.0.0` and
  `expo-template-default@57.0.33`, aligning runtime Expo 57.0.30/RN 0.86.3
  and overlapping dependencies to frozen B's resolved lock. Earlier prepared
  bases are preserved; they were not used as scored samples.
- Human-review minutes for five samples per condition remain uncollected.
  T3 is a global source-boundary contract; T5 requires zero axe violations,
  including moderate best-practice findings. See the findings for exact
  failure causes and the assertions that were not reached.
