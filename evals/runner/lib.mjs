import { cp, mkdir, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

export const isWin = process.platform === 'win32';

/** Run a command, inheriting stdio unless capture is requested. Returns the spawnSync result. */
export function run(cmd, args, { cwd, env, capture = false, timeoutMs } = {}) {
  return spawnSync(cmd, args, {
    cwd,
    env: env ?? process.env,
    shell: isWin && (cmd.endsWith('.cmd') || ['npm', 'npx'].includes(cmd)),
    stdio: capture ? 'pipe' : 'inherit',
    encoding: capture ? 'utf8' : undefined,
    timeout: timeoutMs,
  });
}

export function npm(args, cwd, opts = {}) {
  return run(isWin ? 'npm.cmd' : 'npm', args, { cwd, ...opts });
}

export function npx(args, cwd, opts = {}) {
  return run(isWin ? 'npx.cmd' : 'npx', args, { cwd, ...opts });
}

const DEFAULT_EXCLUDE = new Set(['node_modules', '.git', '.expo', 'dist', 'dist-native', 'coverage', 'test-results', 'playwright-report', 'output']);

/** Recursively copy a directory, skipping heavy/generated entries by name at any depth. */
export async function copyDir(from, to, extraExclude = []) {
  const exclude = new Set([...DEFAULT_EXCLUDE, ...extraExclude]);
  await mkdir(to, { recursive: true });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDir(src, dst, extraExclude);
    else if (entry.isFile()) await cp(src, dst);
  }
}

export async function* walkFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (DEFAULT_EXCLUDE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(full);
    else if (entry.isFile()) yield full;
  }
}
