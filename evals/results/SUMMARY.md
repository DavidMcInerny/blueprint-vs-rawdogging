# Phase 1 evaluation summary

Gate 1: **FAIL**. Valid samples: 50; unscored attempts: 0.

Protocol: phase1-749926b-v2. Source: 749926b2c207af7ba3047492f500d2a9fea1dbb2. Model: claude-opus-5-5; effort: high.
Fingerprints: e3b4ef9e51379b30c6d9ecef3c4bdb1f58bac1e6a85cab83dedc2f303b6eccc3. Generated 2026-11-02T09:51:11.141Z.

| Task | A (bare) | B (Blueprint) | B − A |
| --- | --- | --- | --- |
| T1 | 5/5 | 5/5 | +0 |
| T2 | 5/5 | 5/5 | +0 |
| T3 | 5/5 | 2/5 | -3 |
| T4 | 5/5 | 5/5 | +0 |
| T5 | 4/5 | 0/5 | -4 |
| **Total** | **24/25** | **17/25** | **-7** |

Complete: true; each of the ten task/condition cells requires exactly 5 unique replicates. Duplicate/out-of-matrix records: false; input/model/CLI mismatch: false.

| Metric | A | B |
| --- | --- | --- |
| Median tokens (input + output + cache read + cache creation) | 857318 | 1254002 |
| Median agent wall seconds | 244.309 | 214.446 |
| Total list-price equivalent USD | 26.902118400000003 | 26.887425599999993 |

- B passes at least seven more of 25 than A: no (-7).
- B is not worse by at least three on any task: no (worst gap -4).
- B median tokens and time are at most 1.5× A: yes.

Quality uses a shared TypeScript strictness override and a neutral ESLint rule set; app-specific lint rules are not used. Native exports cover iOS and Android bundles, without device/provider qualification.

| Condition | Type errors | Lint errors | Axe violations | Resilience failures |
| --- | --- | --- | --- | --- |
| A | 0 | 0 | 71 | 0 |
| B | 0 | 0 | 25 | 0 |

No-container limitation: sequential Windows-native fresh directories share machine load, network and caches. Costs are reported token list-price equivalents; actual subscription allowance remains the execution constraint.

Human review minutes for five samples per condition and the final findings/decision are recorded separately; this summary does not invent those observations.
