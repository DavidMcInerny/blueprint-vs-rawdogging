#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { installToolkit } from './install.mjs';
import { renderLeanTemplate } from './render-lean-template.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const options = { agent: 'both', install: true, withDemo: false };
for (let i = 0; i < args.length; i++) {
  const key = args[i];
  if (key === '--skip-install') options.install = false;
  else if (key === '--with-demo') options.withDemo = true;
  else if (['--target', '--name', '--agent'].includes(key) && args[i + 1] && !args[i + 1].startsWith('--')) options[key.slice(2)] = args[++i];
  else throw new Error('Usage: node scripts/create-app.mjs --target ../my-app --name my-app [--agent codex|claude|both] [--skip-install] [--with-demo]');
}
if (!options.target || !options.name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(options.name) || options.name.length > 50) throw new Error('Supply a target and a kebab-case app name (maximum 50 characters).');
if (!['codex', 'claude', 'both'].includes(options.agent)) throw new Error('Unknown agent.');
const target = path.resolve(options.target);
await mkdir(path.dirname(target), { recursive: true });
const parent = await realpath(path.dirname(target));
const actualTarget = path.join(parent, path.basename(target));
const starterRelative = path.relative(path.join(repo, 'starters'), actualTarget);
if (path.relative(repo, actualTarget) === '' || starterRelative === '' || (!starterRelative.startsWith(`..${path.sep}`) && starterRelative !== '..' && !path.isAbsolute(starterRelative))) throw new Error('Choose a destination outside the starter source.');
// Exclusive creation: even an existing empty directory must be chosen deliberately elsewhere.
await mkdir(actualTarget);
const ignored = new Set(['node_modules', '.expo', 'dist', 'dist-native', 'coverage', 'test-results', 'playwright-report', 'output', 'android', 'ios']);
const source = path.join(repo, 'starters/expo');
async function copy(from, to) {
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (ignored.has(entry.name) || (entry.name.startsWith('.env') && entry.name !== '.env.example')) continue;
    if (entry.isSymbolicLink()) throw new Error('Starter must not contain symbolic links.');
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) { await mkdir(destination); await copy(path.join(from, entry.name), destination); }
    else await cp(path.join(from, entry.name), destination, { errorOnExist: true, force: false });
  }
}
await copy(source, actualTarget);
await cp(path.join(repo, '.gitattributes'), path.join(actualTarget, '.gitattributes'), { errorOnExist: true, force: false });
await renderLeanTemplate(actualTarget, { withDemo: options.withDemo, agent: options.agent });
const brandFile = path.join(actualTarget, 'brand.json');
const brand = JSON.parse(await readFile(brandFile, 'utf8'));
brand.name = options.name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
brand.slug = options.name; brand.scheme = options.name;
brand.bundleIdentifier = `com.example.${options.name.replaceAll('-', '')}`;
await writeFile(brandFile, JSON.stringify(brand, null, 2) + '\n');
for (const name of ['package.json', 'package-lock.json']) {
  const file = path.join(actualTarget, name); const value = JSON.parse(await readFile(file, 'utf8'));
  value.name = options.name; if (value.packages?.['']) value.packages[''].name = options.name;
  await writeFile(file, JSON.stringify(value, null, 2) + '\n');
}
let revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).stdout?.trim() || 'unknown';
if (spawnSync('git', ['status', '--porcelain'], { cwd: repo, encoding: 'utf8' }).stdout?.trim()) revision += '-modified';
await writeFile(path.join(actualTarget, 'blueprint-version.json'), JSON.stringify({ starterVersion: '1.0.0', toolkitRevision: revision }, null, 2) + '\n');
function run(command, args, cwd) { const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' && command.endsWith('.cmd') }); if (result.error || result.status !== 0) throw new Error(`${command} failed. Files remain at ${actualTarget}; fix the reported error and resume there.`); }
await installToolkit({ target: actualTarget, agent: options.agent, withDocs: options.withDemo, installProjectSkills: options.withDemo });
if (options.install) { run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci'], actualTarget); run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'assets'], actualTarget); }
// Keep the generated project independent of a containing repository and usable
// without configuring a global Git author. Dependencies and secrets stay ignored.
run('git', ['init', '--initial-branch=main'], actualTarget);
run('git', ['add', '--all'], actualTarget);
const configuredName = spawnSync('git', ['config', 'user.name'], { cwd: actualTarget, encoding: 'utf8' }).stdout?.trim();
const configuredEmail = spawnSync('git', ['config', 'user.email'], { cwd: actualTarget, encoding: 'utf8' }).stdout?.trim();
const identity = [...(!configuredName ? ['-c', 'user.name=Blueprint Generator'] : []), ...(!configuredEmail ? ['-c', 'user.email=blueprint-generator@example.invalid'] : [])];
run('git', [...identity, '-c', 'commit.gpgsign=false', 'commit', '-m', `Create ${options.name} from Blueprint`], actualTarget);
console.log(`\nCreated ${brand.name} at ${actualTarget}.\n${options.install ? '' : 'Run npm ci first.\n'}Run npm run web, or npm start for native development.\nEdit brand.json, src/config/fonts.ts and src/modules for your product.\nStore identity, service accounts and signed-device/OTA verification remain app-specific. See README.md.`);
