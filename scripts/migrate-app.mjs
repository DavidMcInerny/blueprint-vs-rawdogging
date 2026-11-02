import { lstat, readFile, open, rename, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const repository = fileURLToPath(new URL('../', import.meta.url));
export const legacyCheck = 'npm run typecheck && npm run lint && npm run format:check && node scripts/verify-blueprint.mjs && node scripts/verify-boundaries.mjs && node scripts/verify-architecture.mjs && node scripts/verify-accessibility.mjs && npm run assets:check && npm test';
export const currentCheck = 'node scripts/check-app.mjs';
const requiredFiles = ['check-app', 'quality-config', 'verify-blueprint', 'verify-architecture', 'verify-accessibility'];
const requiredScripts = ['typecheck', 'lint', 'format:check', 'test'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

async function regularPath(file, directory = false) {
  for (let cursor = resolve(file); ; cursor = dirname(cursor)) {
    const info = await lstat(cursor);
    if (info.isSymbolicLink()) throw new Error('Symbolic link refused: ' + cursor);
    if (cursor === resolve(file) ? directory ? !info.isDirectory() : !info.isFile() : !info.isDirectory())
      throw new Error('Unexpected file type: ' + cursor);
    if (dirname(cursor) === cursor) break;
  }
}

/** Locate the one scripts.check value without reserializing unrelated package fields.
 * JSON.parse validates syntax first; this token walk only tracks property paths and duplicates.
 */
function checkSpan(raw) {
  const tokens = [...raw.matchAll(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g)];
  let position = 0;
  let span;
  function visit(path) {
    const token = tokens[position++];
    if (token[0] === '{') {
      const seen = new Set();
      while (tokens[position][0] !== '}') {
        const key = JSON.parse(tokens[position++][0]);
        if (seen.has(key)) throw new Error('Duplicate package.json property refused: ' + [...path, key].join('.'));
        seen.add(key);
        position++; // Colon, validated by JSON.parse.
        visit([...path, key]);
        if (tokens[position][0] !== ',') break;
        position++;
      }
      position++;
    } else if (token[0] === '[') {
      let index = 0;
      while (tokens[position][0] !== ']') {
        visit([...path, index++]);
        if (tokens[position][0] !== ',') break;
        position++;
      }
      position++;
    } else if (path.length === 2 && path[0] === 'scripts' && path[1] === 'check') {
      span = { start: token.index, end: token.index + token[0].length };
    }
  }
  visit([]);
  if (!span) throw new Error('package.json scripts.check must be a string.');
  return span;
}

/** Changes one known generated command only. Checker source integration is a separate reviewed step. */
export async function migrateApp({ root, write = false, sourceRoot = repository } = {}) {
  if (!root) throw new Error('An explicit app root is required.');
  if (typeof write !== 'boolean') throw new Error('write must be boolean.');
  root = resolve(root);
  await regularPath(root, true);
  const file = join(root, 'package.json');
  await regularPath(file);
  const info = await lstat(file);
  if (info.nlink !== 1) throw new Error('Hard-linked package.json refused.');
  const raw = await readFile(file, 'utf8');
  const pkg = JSON.parse(raw);
  if (!object(pkg) || !object(pkg.scripts) || typeof pkg.scripts.check !== 'string')
    throw new Error('package.json scripts.check must be a string.');
  const span = checkSpan(raw);
  if (![legacyCheck, currentCheck].includes(pkg.scripts.check))
    throw new Error('Custom or unrecognized check pipeline preserved; migrate it manually.');
  for (const name of requiredScripts)
    if (typeof pkg.scripts[name] !== 'string' || !pkg.scripts[name].trim())
      throw new Error('Required app quality script is missing: ' + name);
  if (pkg.scripts.check === legacyCheck && (typeof pkg.scripts['assets:check'] !== 'string' || !pkg.scripts['assets:check'].trim()))
    throw new Error('Required legacy quality script is missing: assets:check');
  // Current files must already be integrated, never copied over host customizations here.
  for (const name of requiredFiles) {
    const destination = join(root, 'scripts', name + '.mjs');
    const canonical = join(sourceRoot, 'templates/scripts', name + '.mjs');
    await regularPath(destination);
    await regularPath(canonical);
    if (!(await readFile(destination)).equals(await readFile(canonical)))
      throw new Error('Current coherent checker source is not installed: scripts/' + name + '.mjs');
  }
  if (pkg.scripts.check === currentCheck) return { status: 'up-to-date', from: currentCheck, to: currentCheck };
  const changed = raw.slice(0, span.start) + JSON.stringify(currentCheck) + raw.slice(span.end);
  const planned = { status: 'planned', from: legacyCheck, to: currentCheck };
  if (!write) return planned;
  const temporary = join(root, '.blueprint-migrate-' + randomUUID() + '.tmp');
  try {
    const handle = await open(temporary, 'wx', info.mode & 0o777);
    try { await handle.writeFile(changed, 'utf8'); await handle.chmod(info.mode & 0o777); await handle.sync(); }
    finally { await handle.close(); }
    await regularPath(file);
    const current = await lstat(file);
    if (current.dev !== info.dev || current.ino !== info.ino || current.mode !== info.mode || current.nlink !== 1 || await readFile(file, 'utf8') !== raw)
      throw new Error('package.json changed during migration; preserving current file.');
    await rename(temporary, file);
  } finally { await rm(temporary, { force: true }); }
  return { ...planned, status: 'updated' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    let root;
    let mode;
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (arg === '--root' && !root && args[index + 1] && !args[index + 1].startsWith('--')) root = args[++index];
      else if (['--write', '--dry-run'].includes(arg) && !mode) mode = arg;
      else throw new Error('Usage: node scripts/migrate-app.mjs --root APP [--dry-run|--write]');
    }
    const result = await migrateApp({ root, write: mode === '--write' });
    console.log(result.status + ': package.json scripts.check');
    if (result.status !== 'up-to-date') console.log(result.from + '\n=> ' + result.to);
  } catch (error) {
    console.error('Migration refused: ' + error.message);
    process.exitCode = 1;
  }
}
