# Portable app creation

Use a native checkout, Node.js and Git on the same operating-system filesystem as the generated app. From PowerShell on Windows or a Linux terminal:

```text
node scripts/create-app.mjs --target ../my-app --name my-app --agent both
```

Creation needs no Bash. It renders a lean app with Home, Settings and Support from the runnable Expo reference, omits the reference notes workflow and duplicated skill/reference libraries, and renders the display name, package/lockfile names, slug, URL scheme and native bundle/package identifier from `--name`, installs short instructions for the selected agent, runs `npm ci` and generates assets. `--skip-install` renders the same source without dependency installation; run `npm ci` and `npm run assets` in that app before starting it. Add `--with-demo` to retain the reference workflow and full local instruction libraries instead.

The destination must not already exist. Existing files and symbolic links in starter source are rejected. The generator creates an independent Git repository and one initial commit, with dependencies, generated build output and secret environment files ignored. It uses the configured Git author when available; missing author fields use command-local `Blueprint Generator <blueprint-generator@example.invalid>` values. It does not change global or project author configuration. If a command fails, the error names the retained app directory for recovery.

For an existing app, use the additive installer:

```text
node scripts/install.mjs --target ../existing-app --agent both
```

The installer supports `--force`, `--dry-run`, `--no-docs` and explicit `--install-user-assets`, with the same file and whole-directory skip/replace behavior as the original installer. It preflights source and destination symbolic links before copying. `--no-docs` still installs required contracts, planning files and verification scripts. `install.sh` remains a Bash bootstrap for existing Linux/macOS and remote-install commands; it delegates rendering to this Node installer and therefore needs Node.

## Platform matrix

| Surface | Windows | Linux | macOS |
| --- | --- | --- | --- |
| Node creation, additive install and initial Git commit | Native PowerShell CI, Node 22 | Native CI, Node 22 | Portable Node path; no dedicated creation job |
| Generated app checks, doctor, browser build/test and native JS export | CI, Node 24 | CI, Node 24 | Not a dedicated starter job |
| Android native compilation | Not claimed by creation checks | Separate manual native workflow | Not a dedicated job |
| iOS simulator compilation/smoke | Requires macOS | Requires macOS | Separate manual native workflow |
| Signed device, provider, OTA or store delivery | App-owned qualification | App-owned qualification | App-owned qualification |

Supported Node ranges are declared in the root and starter `package.json` (`^22.18.0 || ^24.3.0`). Generated native identifiers remain example identifiers until changed for a real product. The native workflow derives the iOS workspace, scheme, built app and bundle identifier from generated native output rather than a fixed Gather name. Passing creation or web/native JavaScript export does not prove native-device, provider or release readiness.

Native creation/installer tests were also run from PowerShell on Windows (Node 22.18.0) and Ubuntu on ext4 (Node 22.23.2). Directory/junction rejection ran on both. The Windows account lacked file-symlink privilege, so the dangling-file-symlink test explicitly skipped there; Linux covered it. The Bash-wrapper comparison runs only on Linux.

CI runs `node scripts/check-script-endings.mjs` before builds. It checks tracked working-tree script bytes for CRLF and UTF-8 BOM, including extensionless shell/Node/Python entrypoints detected by their shebang. The root LF `.gitattributes` policy is copied into each new app; extensionless shell entrypoints added later must receive an explicit Git attribute when needed.
