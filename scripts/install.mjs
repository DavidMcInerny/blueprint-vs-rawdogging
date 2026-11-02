#!/usr/bin/env node
import { cp, lstat, mkdir, readdir, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));
const usage = `Blueprint vs Rawdogging installer
Usage: node scripts/install.mjs [--target DIR] [--agent codex|claude|both] [--force] [--dry-run] [--no-docs] [--install-user-assets]
Existing files/directories are skipped unless --force is used.
--no-docs skips the optional reference library; required planning files still install.
--install-user-assets also installs Codex skills/agents in your home directory.`;

async function stat(file) {
  try { return await lstat(file); } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null; throw error; }
}
// Check every existing component, including dangling links. Never follow a link
// when writing or when removing a directory explicitly selected by --force.
async function checkPath(file) {
  let cursor = path.resolve(file);
  for (;;) {
    const info = await stat(cursor);
    if (info?.isSymbolicLink()) throw new Error(`Symbolic link refused: ${cursor}`);
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
}
async function checkTree(file) {
  const info = await stat(file);
  if (info?.isSymbolicLink()) throw new Error(`Symbolic link refused: ${file}`);
  if (info?.isDirectory()) for (const entry of await readdir(file)) await checkTree(path.join(file, entry));
}
function contains(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function installToolkit({ target = '.', agent = 'both', force = false, dryRun = false, withDocs = true, installUserAssets = false, installProjectSkills = true, sourceRoot = repository, userHome = homedir(), codexHome = process.env.CODEX_HOME || path.join(userHome, '.codex'), log = console.log } = {}) {
  if (!['codex', 'claude', 'both'].includes(agent)) throw new Error('--agent must be codex, claude, or both');
  sourceRoot = path.resolve(sourceRoot);
  target = path.resolve(target);
  const operations = [];
  const file = (from, to) => operations.push({ source: path.join(sourceRoot, from), destination: path.join(target, to), directory: false });
  const directory = (from, to) => operations.push({ source: path.join(sourceRoot, from), destination: path.join(target, to), directory: true });
  file('BLUEPRINT.md', 'BLUEPRINT.md');
  for (const name of ['project-index', 'app-quality-contract', 'app-baseline']) file(`templates/${name}.md`, `docs/${name}.md`);
  for (const name of ['verify-blueprint', 'verify-architecture', 'verify-accessibility', 'verify-performance', 'release-tools', 'check-api-contracts', 'api-contract-test-kit', 'check-app', 'quality-config', 'verify-boundaries']) file(`templates/scripts/${name}.mjs`, `scripts/${name}.mjs`);
  file('templates/performance-budgets.json', 'config/performance-budgets.json');
  if (withDocs) { directory('docs', 'docs/foundation'); directory('templates', 'docs/foundation-templates'); }
  const skills = (await readdir(path.join(sourceRoot, 'codex/skills'), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const skill of skills) if (!skill.isDirectory() || skill.isSymbolicLink()) throw new Error(`Expected a skill directory without symbolic links: ${skill.name}`);
  for (const flavor of agent === 'both' ? ['codex', 'claude'] : [agent]) {
    const instructions = flavor === 'codex' ? 'AGENTS.md' : 'CLAUDE.md';
    const prefix = flavor === 'codex' ? '.agents' : '.claude';
    file(`templates/${instructions}`, instructions);
    for (const layer of ['modules', 'services']) file(`templates/src-${layer}-AGENTS.md`, `src/${layer}/${instructions}`);
    if (installProjectSkills) for (const skill of skills) directory(`codex/skills/${skill.name}`, `${prefix}/skills/${skill.name}`);
    if (flavor === 'claude' && installProjectSkills) { directory('claude/commands', '.claude/commands'); file('templates/claude/settings.json', '.claude/settings.json'); }
  }
  if (installUserAssets) {
    for (const skill of skills) operations.push({ source: path.join(sourceRoot, 'codex/skills', skill.name), destination: path.join(userHome, '.agents/skills', skill.name), directory: true });
    for (const entry of await readdir(path.join(sourceRoot, 'codex/agents'))) if (entry.endsWith('.toml')) operations.push({ source: path.join(sourceRoot, 'codex/agents', entry), destination: path.join(codexHome, 'agents', entry), directory: false });
  }
  // Preflight the complete plan so a collision/link error cannot leave a partial install.
  await checkPath(target);
  const targetInfo = await stat(target);
  if (targetInfo && !targetInfo.isDirectory()) throw new Error(`Target is not a directory: ${target}`);
  for (const operation of operations) {
    await checkPath(operation.source);
    await checkTree(operation.source);
    const sourceInfo = await stat(operation.source);
    if (!sourceInfo || sourceInfo.isDirectory() !== operation.directory) throw new Error(`Invalid installer source: ${operation.source}`);
    await checkPath(operation.destination);
    const existing = await stat(operation.destination);
    operation.skip = Boolean(existing && !force);
    if (!operation.skip && (contains(operation.source, operation.destination) || contains(operation.destination, operation.source))) throw new Error(`Source and destination overlap: ${operation.destination}`);
    if (!operation.skip && existing?.isDirectory()) await checkTree(operation.destination);
    let ancestor = path.dirname(operation.destination);
    while (!await stat(ancestor)) ancestor = path.dirname(ancestor);
    if (!(await stat(ancestor)).isDirectory()) throw new Error(`Destination parent is not a directory: ${ancestor}`);
  }
  if (!dryRun) await mkdir(target, { recursive: true });
  for (const { source, destination, directory: isDirectory, skip } of operations) {
    if (skip) { log(`skip existing: ${destination}`); continue; }
    if (dryRun) { log(`DRY RUN: copy ${source} -> ${destination}`); continue; }
    await mkdir(path.dirname(destination), { recursive: true });
    if (isDirectory) { if (force) await rm(destination, { recursive: true, force: true }); await cp(source, destination, { recursive: true, force: false, errorOnExist: true }); }
    else await cp(source, destination, { force, errorOnExist: !force });
    log(`installed: ${destination}`);
  }
  log(`Done. Installed Blueprint vs Rawdogging into: ${target}`);
  log(`Agent target: ${agent}`);
  log('Read BLUEPRINT.md, complete the planning records, then implement the Expo foundation.');
  log('Run node scripts/verify-blueprint.mjs after setup; installation alone is not a passing app.');
  log('Existing files/directories are skipped unless --force is used; review skipped files before claiming adoption.');
  if (dryRun) log('Dry-run only; no files were changed.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = {};
    const seen = new Set();
    const args = process.argv.slice(2);
    for (let index = 0; index < args.length; index++) {
      const key = args[index];
      if (key === '--help' || key === '-h') { console.log(usage); process.exit(0); }
      if (seen.has(key)) throw new Error(`Duplicate option: ${key}`);
      seen.add(key);
      if (key === '--target' || key === '--agent') {
        if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${key} requires a value`);
        options[key.slice(2)] = args[++index];
      } else if (key === '--force') options.force = true;
      else if (key === '--dry-run') options.dryRun = true;
      else if (key === '--no-docs') options.withDocs = false;
      else if (key === '--install-user-assets') options.installUserAssets = true;
      else throw new Error(`Unknown option: ${key}`);
    }
    await installToolkit(options);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
