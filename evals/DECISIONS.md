# Phase 1 decision record

Current delivery sequence and tickets: [consolidated plan](../proposals/DELIVERY-PLAN.md), [harness corrections #5](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/5) and [scored evaluation #6](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/6). The authorisation and budget boundaries below remain in force.

Date: 2 November 2026. Status: **Phase 1 authorised as a standalone commitment.**
This record settles the eight "Decisions required before Phase 1" in the
[Rev 3 delivery plan](../proposals/2026-10-29-blueprint-delivery-plan.md) and
confirms the Gate 1 thresholds before any results exist (plan Appendix D).

## Decisions

| # | Decision | Settled as |
| --- | --- | --- |
| 1 | Product family and surfaces | **Expo apps, native + web.** Phase 1 is scored on web behaviour plus `expo export` for native platforms; no device runs in Phase 1. |
| 2 | Two pilot consumers | **None named.** Commitment is Phase 1 only (4–6 days + tokens). Per the plan's stop rules, no Phase 2 package work starts until two real consumers are named; with one, the programme caps at Phase 2 creation fixes. |
| 3 | Maintainer and backup | Maintainer: David McInerny (fork owner). Backup: **unassigned** — acceptable for a Phase-1-only commitment; must be named before Phase 2. Support budget: Phase 1 effort only. |
| 4 | Evaluation budget | **Muse headless (`claude -p`), model `opus`, one agent for both conditions.** Smoke first: 10 runs (5 tasks × 1 run × conditions A+B). Record actual token cost and confirm the budget before the remaining 40 runs (plan B4). Doc ablation (~50 runs) and Phase 3 rerun (25) are not authorised by this record. |
| 5 | Publishing / npm scope | **Deferred to Phase 2.** No packages are published in Phase 1. |
| 6 | OS and platform matrix | Phase 1 runs on the maintainer's Windows 11 machine (Node 22.18). The declared matrix for Gate 2 is a Phase 2 decision. Known deviation: no Docker on this machine, so runs use a fresh temp directory per attempt instead of a fresh container (plan B3). Machine image is therefore "this machine"; hidden tests are still copied in only after the agent finishes. |
| 7 | Existing Fullstack App Foundation users | **Deferred.** Nothing is archived in Phase 1. No local checkout exists on this machine. |
| 8 | Repository name | **Deferred.** Rename decision is due before the first package release (Phase 2), not Phase 1. |

## Conditions (plan B3, as implemented here)

- **A, bare agent:** app created by `create-expo-app`. Snapshot prepared once
  by `runner/prepare-bases.mjs`; its actual Expo SDK is recorded in the run
  metadata. No Blueprint files.
- **B, Blueprint today:** app created from this repository at the commit under
  test (recorded per run) with its full toolkit, via `scripts/create-app.mjs`.
  - Harness workaround (not a fix): snapshot preparation puts Git Bash
    (`C:\Program Files\Git\bin`) first on `PATH`, because `create-app.mjs`
    spawns a bare `bash`, which from PowerShell resolves to the WSL launcher
    and fails (plan Appendix C, reproduced 29 Oct 2026). The bug itself is
    Phase 2 work; T1 measures creation *inside* the agent run without this
    workaround, so the failure remains visible where the plan intends it.
- Held constant: model and version, effort, tools, turn/time limits, prompt
  wording apart from the starting repository. Dependencies are installed by
  the runner before the agent starts (`npm ci` where a lockfile exists);
  setup time is recorded separately from agent wall time in both conditions.

## Gate 1 thresholds (confirmed verbatim from plan Appendix D)

Pass requires all of: B passes at least 7 more of 25 runs than A on hidden
acceptance tests; B is not worse than A by 3 or more runs on any single task;
B's median tokens and wall time are no more than 1.5× A's. Smaller
differences than ~30 percentage points at n=25 are inconclusive, not wins
(plan B4). A stop at Gate 1 ends platform work per the plan's stop rules.

## Run plan

1. `node evals/runner/prepare-bases.mjs` — build condition snapshots once.
2. `node evals/runner/run-eval.mjs --smoke` — 10 runs; validate harness,
   flags and hidden tests; report actual token cost.
3. Maintainer confirms budget → `node evals/runner/run-eval.mjs --full`
   (remaining runs to reach 5 per task per condition, 50 total).
4. `node evals/runner/summarize.mjs` — counts, ranges, costs, Gate 1 verdict.
5. If B wins: doc ablation (plan B5) needs a separate budget decision.

Issues were disabled when this record was written. They are now enabled; issues #5 and #6 track Phase 1 implementation and execution, while this record preserves the decisions and authorisation.

## Validation note (2 November 2026, pre-smoke)

One harness-validation run (T3 × condition A, not a Phase 1 sample) exposed
three harness bugs, all fixed before smoke: condition A was created on
Expo SDK 58 (now pinned to `default@sdk-57`, hard-failing otherwise); the
Git-Bash `PATH` prefix was lost to Windows env-key casing; and scoring
against the Metro dev server intermittently lost Playwright interactions
before hydration, failing a correct implementation — the scorer now serves
a production `expo export` like the starter's own e2e, on which that same
workspace scores 7/7. The validation run's result record was discarded;
`results/results.jsonl` starts empty for smoke. Cost datapoint from that
run: 186s agent time, 12 turns, $0.59 in API list-price equivalent tokens.
Actual billing is the maintainer's claude.ai Max subscription (no API key),
so marginal cash cost is $0; the budget that binds is subscription usage
allowance plus wall time (a 50-run Phase 1 is several sequential hours).
List-price equivalents are still recorded per run, because Gate 1 compares
relative token use between conditions, not cash.
