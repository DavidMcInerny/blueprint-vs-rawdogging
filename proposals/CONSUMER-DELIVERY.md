# Consumer delivery and native/provider evidence

Verified 2 November 2026, 04:51 UTC, for fork issues [#4](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/4) and [#9](https://github.com/DavidMcInerny/blueprint-vs-rawdogging/issues/9). This records delivery state and reuses existing evidence; it adds no qualification programme. Neither issue is complete.

## Access and source delivery

The GitHub connector and local GitHub CLI authenticate as `DavidMcInerny`. The connector can read Golf, whose repository reports `pull`, `triage` and `push` permission, with `admin` and `maintain` false. Repository permission is not a decision to bypass the consumer's normal release process.

| Consumer | Source installed | Running/released service | Adoption enabled/qualified |
| --- | --- | --- | --- |
| Golf / Par Pocket | [PR #45](https://github.com/Simondarcy7/golf-scoring-app/pull/45) remains draft, open and unmerged at `a678c5094e0fe5eaa16030068e38644df147c42d`. Both source bundles exist in that branch; production adoption is not established. | Exact-head Vercel Preview deployment succeeds; its app is behind Vercel authentication. Public website responds and Apple lists version 1.0.17. Neither identifies the adoption revision as released. | Focused tests/export/browser evidence in the PR and adoption document remains applicable to its source. Hosted checks cannot start; native adoption workflows have no claimed acceptance. |
| OddsBasket | Repository and PR #51 return 404 through the connector. The CLI also returns 404 for the repository. No current source snapshot or installed revision was established. | Not independently established. | Not independently established. The 404 does not distinguish missing repository from insufficient access. |

The existing Windows Golf checkout at `C:/Workspaces/golf/golf-scoring-app` is clean, has only its primary registered tree, and remains on `main` at `874206dfc32377d48f6806737daffdff29bc66a0`. Its `mobile/src/foundation` contains `contracts`, not the two adoption bundles. It was read only and left unchanged. No Linux consumer clone, build, dependency install or worktree was needed or created.

### Golf merge state and hosted evidence

Fresh raw GitHub REST reads, through both connector and CLI, return `mergeable: true`, `mergeable_state: unstable`, `draft: true`. The connector's normalized PR metadata returned `mergeable: false`; that contradictory normalized field is not evidence of conflicts. The PR's reported base SHA is `f36d47ea24d524aff126b30f18e56b96cff76796`; the current `main` branch is `f8028a82449dbc9d653993a0f4ff6d3d6e11e391`.

The [current-main comparison](https://github.com/Simondarcy7/golf-scoring-app/compare/a678c5094e0fe5eaa16030068e38644df147c42d...f8028a82449dbc9d653993a0f4ff6d3d6e11e391) reports 20 main commits and two adoption commits since the common base. Its 49 main-side changed paths have no intersection with the PR's 54 changed paths. No conflict fix or speculative rebase is justified by this evidence.

[CI run 41049439338](https://github.com/Simondarcy7/golf-scoring-app/actions/runs/41049439338), attempt 1, remains failed at the adoption head. All six jobs (`mobile`, `web`, `web-validation`, `native`, `database`, `web-browser`) independently have this failure annotation:

> The job was not started because recent account payments have failed or your spending limit needs to be increased.

The run has zero artifacts. This establishes an account restriction, not executed failing code tests. No billing setting, spending limit, runner policy or check requirement was changed, and no redundant rerun was requested.

The same head's Vercel commit status is now `success`, updated 30 October 2026 at 12:22 UTC, replacing the PR body's older pending observation. Deployment `7438122517` is `Preview`, bound to the exact head, and its deployment status is `success`, description `Deployment has completed`. The [deployment dashboard](https://vercel.com/simondarcy7-2183s-projects/par-pocket/63zoVijQz6C5bTwFnsyvWmorAteq) identifies it. Its [preview URL](https://par-pocket-lf7auecy7-simondarcy7-2183s-projects.vercel.app) redirects an anonymous request to Vercel Login; the resulting HTTP 200 is a login page, not an app smoke result. `Vercel Preview Comments` also passes and has no unresolved feedback.

The GitHub connector does not support deployment or check-annotation endpoints; the existing authenticated CLI supplied those read-only records. Both tools agree about OddsBasket's unavailable repository. No attempt was made to route around an account or preview protection.

## Installed shared source and selected capabilities

At the Golf PR head, [the adoption document](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/docs/architecture/blueprint-adoption.md) records the existing workflow tests and boundaries. Reuse those results rather than rerun an unrelated suite.

- [Product capability manifest](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/mobile/src/foundation/blueprint/.blueprint-product-capabilities.json): five files for drafts, import review, interactions and engagement. It honestly records `kind: working-tree`, Git revision `65b7ec6a952e28900f2ae806eb71f15a5e084a50`, content digest `95a6ffa5f97d96b660abd1db8afe238ac1df13c511a343e0cce3c44505512e65`. A revision alone is not a committed-source parity claim.
- [App-shell manifest](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/mobile/src/foundation/blueprint-shell/.blueprint-app-shell.json): 17 files, `kind: git-commit`, revision `17121c1b0b9d18aa0a3c5b39bef59cae2924ba24`, digest `1160ba4a4d04b5ae6e2f2dca91d697166bd0a6478099357e7eca55703334e80d`; existing report records byte parity and sync checks.
- Golf integrates overlay focus, review eligibility, explicit backup import review, feedback draft revisions, shared Inbox and local transactional undo. Unsent feedback and undo remain session-only. Account recovery and notification-preferences compositions are bundled but not evidence that Golf changed its account providers or device-reminder scheduling. Preserve those existing product boundaries.

## Native/provider evidence: distinguish adoption head from current main

The adoption head uses Expo `~58.0.19` and RN `0.88.0`. Its [EAS configuration](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/mobile/eas.json) defines Android/iOS internal preview profiles and preview channels; configuration is not a built/tested artifact. Its [OTA compatibility record](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/mobile/config/ota-compatibility.json) has empty Android, iOS and legacy Android allowlists and requires new native builds at runtime 1.0.17. No Expo 57 compatibility or old-runtime OTA approval follows from the source bundle.

Current main subsequently fixed a real iOS startup crash. Reuse [the diagnostic record](https://github.com/Simondarcy7/golf-scoring-app/blob/f8028a82449dbc9d653993a0f4ff6d3d6e11e391/docs/release/2026-10-30-ios-startup-diagnostic.md) and [startup safeguards record](https://github.com/Simondarcy7/golf-scoring-app/blob/f8028a82449dbc9d653993a0f4ff6d3d6e11e391/docs/release/2026-10-30-startup-safeguards.md), with their bounds:

| Existing evidence | Bound and remaining gap |
| --- | --- |
| Production candidate 1.0.17 (24), EAS `71e6cbe1-faba-4baf-9496-b8c31a227f86`, source `b37cea667a193424d3d09401815bd6d42ed2dded`, IPA SHA-256 `21cdbc8fdf654757ad9eee873151b0bdf5b3c1c75c4e9e7e18a7018ffea1e1cb` | Source-recorded finished build and IPA inspection. This source does not contain PR #45 adoption. |
| Real iPhone 13 / iOS 17.5 and iPhone 15 Pro Max / iOS 17.2: fresh install, two cold launches and offline launch | Existing bounded startup evidence. No interrupted OTA/recovery or new adoption workflow acceptance implied. |
| Saved six-stroke round survived cold launch and install of candidate 24 over diagnostic 23 | Bounded saved-score/upgrade evidence, not upgrade from the crashing public build 20, complete native recovery matrix or real-file backup import acceptance. |
| Separate native probe 26 delivered a symbolicated Sentry crash and an email alert | Source-recorded real provider delivery; private diagnostic build must never ship. It does not establish analytics consent/revocation or payload inspection for enabled adoption flows. |
| Main OTA record approves iOS runtime 1.0.18 only against candidate 24, production channel | Android and older iOS remain unapproved. No new OTA payload was published by that approval. A merged adoption candidate needs its actual source/runtime assessed within the existing release process. |
| Real TestFlight-installed acceptance remains unperformed in the record | BrowserStack re-signs IPAs, so its installation does not satisfy this separate check. The prior one-build incident exception is not permission for another release exception. |

Live readback on 2 November updates two stale handoff observations: [Apple's official lookup](https://itunes.apple.com/lookup?id=6813851839&country=au) reports public app 1.0.17, released `2026-10-30T19:26:06Z`; [the public privacy page](https://parpocket.com/privacy) now discloses native session status/duration and SDK-generated session/install identifiers. Those are observed delivery updates. Public version metadata does not expose a source SHA or establish PR #45 deployment, device qualification or a TestFlight installation.

Golf's [native recovery issue #18](https://github.com/Simondarcy7/golf-scoring-app/issues/18) remains open. The [recovery evidence record](https://github.com/Simondarcy7/golf-scoring-app/blob/a678c5094e0fe5eaa16030068e38644df147c42d/docs/release/native-recovery-evidence.md) leaves previous-beta upgrade, interrupted write, corrupt-current recovery and fresh-install backup restore pending for both platforms. Its September Android build pair is not evidence for the October adoption revision. No native screen-reader, keyboard, reduced-motion, device permission/scheduling, authenticated account-change or real-provider import acceptance was found for PR #45. Do not close those gates using component/jsdom/browser results.

## Smallest remaining actions and stop condition

1. Golf account owner resolves the actual hosted-CI billing/spending restriction. Obtain relevant checks for the revision being merged and use the normal coherent review/merge process. Current raw merge metadata supplies no conflict repair work. Preserve the later main startup safeguards when integrating adoption.
2. Restore authorised read access to the exact OddsBasket repository/PR, or establish its new canonical location. Until then its source, hosted checks, preview and installed capability selection are unverified; no source/release operation is safe to infer.
3. For the selected merged consumer revision, reuse the existing native release gate and accepted evidence where applicable. Supply exact signed preview artifacts, devices and real provider test environments only for capabilities actually being enabled. Complete the remaining native/OTA, consent/payload, permission/scheduling, durable-write/import and accessibility outcomes in the existing consumer records. Do not enable optional services to make a checklist larger.

No consumer source, accounts, production data, CI policy or release was changed by this investigation. No issue was closed. Delivery is complete only when the existing issue criteria have real evidence and source installed, service running and feature enabled/qualified are recorded separately. Until then these are explicit external blockers with the bounded existing evidence retained above.

## Bounded environment-access check — 2 November, 05:09 UTC

Checked the existing Windows consumer checkout for an immediately usable native/provider acceptance path. Read its actual `mobile/AGENTS.md` first; it requires versioned Expo documentation before writing code. No consumer code was written. This check inspected credential names/presence and authentication-state booleans only; no secret values were printed or copied.

| Existing ability checked | Observed result and practical implication |
| --- | --- |
| Connected provider tools | The available connector/tool inventory has no Expo/EAS, BrowserStack or Sentry service integration. Computer-use inventory exposes no enabled browsers/tabs, so no authenticated provider browser session is available through that surface. No browser was opened and no sign-in was attempted. |
| Windows process, user and machine environment | No variable names matching Expo/EAS, BrowserStack, Sentry, Android or `JAVA_HOME` were present. In particular there is no available `EXPO_TOKEN`, `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY`, `BROWSERSTACK_CREDENTIALS_FILE` or `SENTRY_AUTH_TOKEN` in those environment scopes. |
| Local Expo authentication | `C:/Users/dmcin/.expo/state.json` exists but has only `uuid` and `analyticsDeviceId` keys; its authentication object and session secret are absent. Its existence is not a logged-in Expo session. |
| Existing CLIs/configuration | The consumer's existing Expo and Sentry CLI launchers are present. EAS is absent from PATH, the consumer package/bin directories, the standard global npm location and the inspected existing npx cache. No SDK/CLI was installed. Standard home EAS/Sentry authentication locations and consumer `.sentryclirc`/native `sentry.properties` are absent. Root/mobile have `.env.example` files, with no actual `.env` file found in those directories. Example public configuration key names are configuration guidance, not provider credentials. |
| Native device tools | Android SDK `adb.exe` and `emulator.exe` are installed in the Windows-local SDK. `adb devices -l` succeeds with zero connected, unauthorized or offline devices. One configured virtual device exists: `Medium_Phone_API_37.0`. No emulator or device test was launched. iOS/Xcode tools are unavailable on this Windows host. |
| Exact local release artifact | `C:/Workspaces/golf/application-681fd8ef-28d7-4321-a01c-92bcf83d47c6.apk` exists, 176,924,175 bytes, last written 5 September 2026. Its embedded `assets/app.manifest` has update ID `5889ca81-e9a6-48df-910d-d78ac55a07ec`, with only `id`, `commitTime` and `assets` keys; it supplies no source revision/runtime identity. This older artifact cannot qualify the October adoption revision. No existing `output/startup-safeguards`, `output/browserstack-ios-startup` or `output/eas` evidence/artifact directory was found in this Windows consumer checkout. |

The EAS build IDs and provider evidence handles already recorded above remain useful references, but this host has no authenticated provider access to retrieve/operate on them and none identifies a build containing the adoption branch. The upstream record's historical BrowserStack trial minutes do not establish a remaining allocation for this chat. No paid session, cloud build, provider event, OTA publication or new qualification machinery was started.

The concrete next environment action is an authorised authenticated EAS/build-provider connection for the actual merged consumer revision, plus exact signed preview artifact identity. Android automation can then use the existing Windows SDK/emulator for applicable checks; real-device requirements still need a connected device or an authenticated device provider with a recorded bounded allocation. Sentry payload/consent inspection similarly needs authorised provider access. Existing GitHub repository access does not expose CI secret values or supply these service sessions. The consumer checkout remains unchanged, and this access check creates no additional completion criterion.
