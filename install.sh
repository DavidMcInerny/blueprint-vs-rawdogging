#!/usr/bin/env bash
set -euo pipefail

# Preserve curl/remote bootstrap support. All rendering and collision behavior
# live in the same Node implementation used by Windows and create-app.mjs.
repo_url="${BLUEPRINT_VS_RAWDOGGING_REPO:-https://github.com/Simondarcy7/blueprint-vs-rawdogging.git}"
script_path="${BASH_SOURCE[0]:-$0}"
repo_root="$(cd "$(dirname "$script_path")" 2>/dev/null && pwd || pwd)"
tmp_repo=""
cleanup() {
  if [[ -n "$tmp_repo" && -d "$tmp_repo" ]]; then
    rm -rf "$tmp_repo"
  fi
}
trap cleanup EXIT
if ! command -v node >/dev/null 2>&1; then
  echo "This installer needs a supported Node.js version. See package.json engines." >&2
  exit 1
fi
if [[ ! -f "$repo_root/scripts/install.mjs" || ! -d "$repo_root/codex/skills" ]]; then
  if ! command -v git >/dev/null 2>&1; then
    echo "This installer needs git when run from a remote URL." >&2
    exit 1
  fi
  tmp_repo="$(mktemp -d)"
  echo "Fetching toolkit source from $repo_url"
  git clone --depth 1 "$repo_url" "$tmp_repo" >/dev/null
  repo_root="$tmp_repo"
fi
node "$repo_root/scripts/install.mjs" "$@"
