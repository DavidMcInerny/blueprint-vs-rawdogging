# Phase 1 findings and decision

Recorded 2 November 2026. Protocol `phase1-749926b-v2`; 50 primary attempts completed.

**Gate 1: FAIL. Decision: stop benchmark-led platform expansion; retain the already delivered source under its documented scope.** Bare Expo passed 24/25; frozen Blueprint passed 17/25. The predeclared requirement was at least seven *more* Blueprint passes, with no task deficit of three or more. The observed difference is seven fewer, with deficits of three on T3 and four on T5. Token/time ratios pass; they do not override the acceptance requirements.

This is the result for frozen Blueprint `749926b2c207af7ba3047492f500d2a9fea1dbb2`, not a comparison of the later portable, lean, dependency, API or native fixes delivered into fork main. It does not establish that every foundation capability is harmful or that the later source wins.

## Results

| Task | Bare Expo A | Frozen Blueprint B | B - A |
| --- | --- | --- | --- |
| T1 | 5/5 | 5/5 | +0 |
| T2 | 5/5 | 5/5 | +0 |
| T3 | 5/5 | 2/5 | -3 |
| T4 | 5/5 | 5/5 | +0 |
| T5 | 4/5 | 0/5 | -4 |
| **Total** | **24/25** | **17/25** | **-7** |

The primary pass rates are 96% and 68%, a descriptive difference of -28 percentage points. The binary gate is unchanged. At this sample size and with shared tasks/templates, these counts are not a universal effect estimate or proof about every future app.

## What failed

- **T3 B, replicates 2/3/4:** the static composition contract found a direct AsyncStorage import remaining in `src/services/storage/index.ts`, outside the supplied adapter. Their functional browser checks passed. This is a global source-boundary failure, not evidence that the memory-adapter workflow lost data.
- **T5 B, all five replicates:** axe reported the same moderate `region` landmark violation. Search/filter/empty-state, category keyboard operation and reduced-motion checks passed. The separate search-keyboard assertions were after the failing axe assertion and were not reached in that combined test; do not report them as verified or failed independently.
- **T5 A, replicate 4:** axe reported the serious `scrollable-region-focusable` violation. All other A primary samples passed.

Every run passed the shared TypeScript check and iOS/Android plus web bundle exports. Neutral totals were type/lint errors 0/0 in both conditions, axe rule-violation counts A71/B25, and measured resilience failures 0/0. These aggregate counts sum rule violations across runs; they are not counts of unique defects, qualified accessibility or real device/provider acceptance. B has fewer measured axe violations overall while failing the strict zero-violation T5 requirement.

## Cost and time

| Metric | A | B |
| --- | --- | --- |
| Tokens, median | 857,318 | 1,254,002 |
| Tokens, range | 83,917-3,993,153 | 169,977-1,995,946 |
| Agent seconds, median | 244.309 | 214.446 |
| Agent seconds, range | 138.551-573.703 | 163.773-513.077 |
| Agent turns, median | 17 | 21 |
| Agent turns, range | 1-64 | 2-36 |
| Total list-price-equivalent USD | $26.9021184 | $26.8874256 |

B/A median token ratio is 1.462703; wall-time ratio is 0.877765, both at most 1.5. Total CLI list-price equivalence is $53.789544. Existing claude.ai Max subscription authentication was used; these figures are not invoices, new API spend or measured human labour. Actual subscription allocation/cash accounting and human review minutes remain unknown. Setup and scoring are excluded from the gate's agent wall time. Setup totals are A498.381/B573.010 seconds. The corpus ran sequentially from 05:12:08 to 09:50:29 UTC.

## Provenance and completion audit

- Exactly 50 distinct invoked primary attempts and 50 valid scored records. Every T1-T5/A-B cell has replicates 1-5 exactly once. No replacement samples, duplicates, out-of-matrix records, unscored attempts or identity mismatches. The process exited 0 and removed its lock.
- Exact model `claude-opus-5-5`, high effort, CLI `2.1.311 (Claude Code)`, Windows-native Node `v22.18.0`. All records identify that actual model.
- Shared runtime: Expo 57.0.30 and React Native 0.86.3. Bare scaffold: `create-expo-app@5.0.0`, `expo-template-default@57.0.33`; overlapping dependencies align to B's committed lock.
- Frozen input fingerprint: `e3b4ef9e51379b30c6d9ecef3c4bdb1f58bac1e6a85cab83dedc2f303b6eccc3`. Snapshot/tree/archive/prompt/config hashes are recorded per attempt.
- Raw JSONL SHA-256: `b17b79aa7da2da5006c19efa4536915e816a9a60926eff9ab8f96c1c50dad849`. [Raw records](results.jsonl), [generated table](SUMMARY.md), [generated machine summary](summary.json). Raw agent outputs, browser reports and workspaces remain preserved in the ignored local `evals/runs/<runId>/` corpus; legacy bases/runs are retained separately.

## Limits and disposition

The planned human-review minutes for five samples per condition have **not** been collected. No human participant or labour/quality judgment is fabricated. Issue #6 therefore retains that outstanding criterion even though the automatic fifty-run comparison and gate decision are complete. An agent review of arithmetic/provenance is not the human sample.

Windows fresh directories shared machine load, network and caches rather than containers. Hidden tests were kept out of each agent workspace, but this is not a security boundary against access to the parent checkout. T3 uses a global static boundary rule rather than a before/after domain diff. The T5 strict axe condition includes moderate best-practice violations and can fail on inherited page chrome even when requested list interactions work. Correlated template/landmark failures, five tasks and n=25 per condition limit generalisation. None of these observations causes a post-results rescore.

The positive-win condition for doc ablation was not met, so no ablation is started. Condition C has no new allocation or actual two-consumer breaking-upgrade evidence; it is not run. Do not use this failed Gate 1 result to authorise further speculative packaging/platform expansion. Keep useful already-built source, its accepted tests/reviews and explicit source-distribution decision. Upstream/consumer delivery, real API/breaking-upgrade adoption, exact device/provider qualification and the non-author trial/observation retain their actual owners and open criteria in [tracker #1](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/1).
