#!/usr/bin/env node
import { cp, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repository = fileURLToPath(new URL('../', import.meta.url));
const identity = { name: 'blueprint-foundation', version: '1.0.0', description: 'Blueprint product foundation skills, source recipes and delivery playbooks.' };

async function validateTree(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if ((await lstat(source)).isSymbolicLink()) throw new Error(`Plugin source symlink refused: ${source}`);
    if (entry.isDirectory()) await validateTree(source);
  }
}
export async function buildPlugin(target) {
  target = path.resolve(target);
  await mkdir(path.dirname(target), { recursive: true });
  const parent = await realpath(path.dirname(target));
  target = path.join(parent, path.basename(target));
  const root = await realpath(repository);
  if (target === root || target.startsWith(root + path.sep)) throw new Error('Build the plugin outside the source checkout.');
  for (const source of ['codex/skills', 'claude/commands']) await validateTree(path.join(root, source));
  await mkdir(target);
  await cp(path.join(root, 'codex/skills'), path.join(target, 'skills'), { recursive: true, errorOnExist: true, force: false });
  await cp(path.join(root, 'claude/commands'), path.join(target, 'commands'), { recursive: true, errorOnExist: true, force: false });
  // Legacy commands referenced per-project docs. Point their reading step at
  // bundled skill resources so one plugin remains sufficient.
  const kickoff = path.join(target, 'commands/kickoff.md');
  const command = await readFile(kickoff, 'utf8');
  await writeFile(kickoff, command.replace(/Read:\n[\s\S]*?\nReturn:/, 'Read the bundled skills and their references; read the product BLUEPRINT.md first.\n\nReturn:').replace(/Read `BLUEPRINT.md` first\.[\s\S]*$/, 'Use the bundled mature-app-starter references/required-blueprint.md, expo-project-structure.md and kickoff-checklist.md. Complete product records and run applicable checks; instructions alone are not a completed app.\n'));
  for (const format of ['codex', 'claude']) {
    const directory = path.join(target, '.' + format + '-plugin');
    await mkdir(directory);
    await writeFile(path.join(directory, 'plugin.json'), JSON.stringify({ ...identity, ...(format === 'codex' ? { skills: './skills/' } : {}) }, null, 2) + '\n');
  }
  await writeFile(path.join(target, 'README.md'), 'Blueprint agent plugin. Canonical skills and recipes are built from the toolkit codex/skills tree; review upgrades as source diffs. No MCP server, hook, provider or credentials are configured.\n');
  return target;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--target') throw new Error('Usage: node plugin/build.mjs --target <new-folder-outside-checkout>');
    console.log(await buildPlugin(process.argv[3]));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
