import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, lstat, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderLeanTemplate } from '../scripts/render-lean-template.mjs';
import { buildPlugin } from '../plugin/build.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const reference = path.join(root, 'starters/expo');
const sharedJourneys = [
  'appearance persists and explicit choice wins over system',
  'accessible pages, no horizontal overflow and real 404',
  'navigation labels fit inside their controls at narrow widths',
  'motion preference persists, and corrupt preferences remain intact until a successful retry',
  'keyboard appearance selection',
];
const noteJourneys = [
  'create, persist, search, edit and delete a note',
  'unsaved navigation requires a decision and Escape restores focus',
  'corrupt storage is preserved and public help remains available',
  'save failure keeps the draft and does not claim success',
  'loaded-page offline note saving',
];
function journeyNames(source) {
  return [...source.matchAll(/test[(]'([^']+)'/g)].map((match) => match[1]);
}
function assertSharedBaseline(source) {
  assert.deepEqual(journeyNames(source), sharedJourneys);
  for (const assertion of ['shell.preferences.v1', 'brand.dark.background', 'new AxeBuilder', 'scrollWidth', 'Object.keys(navigation)', 'Retry loading preferences', 'toBeDisabled()', 'toBeEnabled()', 'toBe(404)', 'ArrowRight']) assert.ok(source.includes(assertion), 'Missing shared shell assertion: ' + assertion);
  assert.match(source, /import brand from ['"]\.\.\/brand\.json['"]/);
  assert.match(source, /import AxeBuilder from ['"]@axe-core\/playwright['"]/);
  assert.match(source, /import \{ navigation \}/);
  assert.doesNotMatch(source, /shell\.notes|Capture a thought|\/note\/new|\/notes/);
}

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'blueprint-lean-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const target = path.join(directory, 'app');
  await cp(reference, target, { recursive: true, filter: (source) => !['node_modules', '.expo', 'dist', 'dist-native', 'output', 'test-results', 'playwright-report'].includes(path.basename(source)) });
  return { target, directory };
}
test('lean rendering removes the complete notes state, routes and journeys without changing the shell', async (t) => {
  const { target } = await fixture(t);
  const shell = 'src/foundation/blueprint-shell/components/product-ui/layout.tsx';
  const before = await readFile(path.join(target, shell));
  const originalJourneys = await readFile(path.join(target, 'e2e/shell.spec.ts'), 'utf8');
  assertSharedBaseline(originalJourneys);
  await renderLeanTemplate(target);
  for (const name of ['src/modules/notes', 'src/app/note', 'src/app/(tabs)/notes.tsx', 'e2e/notes.spec.ts']) await assert.rejects(lstat(path.join(target, name)), { code: 'ENOENT' });
  assert.deepEqual(await readFile(path.join(target, shell)), before);
  const retainedJourneys = await readFile(path.join(target, 'e2e/shell.spec.ts'), 'utf8');
  assert.equal(retainedJourneys, originalJourneys);
  assertSharedBaseline(retainedJourneys);
  for (const name of ['src/modules/app-shell/RootLayout.tsx', 'src/modules/navigation/screens.tsx', 'src/modules/settings/screens.tsx', 'src/modules/home/screens.tsx', 'src/modules/support/screens.tsx', 'e2e/shell.spec.ts']) assert.doesNotMatch(await readFile(path.join(target, name), 'utf8'), /NotesProvider|modules\/notes|\/notes|\/note\/new|shell\.notes/);
  assert.match(await readFile(path.join(target, 'src/config/navigation.ts'), 'utf8'), /home: 'Home', settings: 'Settings'/);
  assert.ok((await readFile(path.join(target, 'AGENTS.md'), 'utf8')).length < 800);
  assert.match(await readFile(path.join(target, 'docs/verification.md'), 'utf8'), /not a claim that those checks have run here/);
});
test('demo opt-in preserves the canonical runnable reference', async (t) => {
  const { target } = await fixture(t);
  const before = await readFile(path.join(target, 'src/modules/app-shell/RootLayout.tsx'));
  await renderLeanTemplate(target, { withDemo: true });
  assert.deepEqual(await readFile(path.join(target, 'src/modules/app-shell/RootLayout.tsx')), before);
  assert.ok((await lstat(path.join(target, 'src/modules/notes'))).isDirectory());
  assertSharedBaseline(await readFile(path.join(target, 'e2e/shell.spec.ts'), 'utf8'));
  const demoJourneys = await readFile(path.join(target, 'e2e/notes.spec.ts'), 'utf8');
  assert.deepEqual(journeyNames(demoJourneys), noteJourneys);
  assert.match(demoJourneys, /import AxeBuilder from ['"]@axe-core\/playwright['"]/);
  assert.doesNotMatch(demoJourneys, /brand\.|shell\.preferences|keyboard appearance selection/);
  assert.match(demoJourneys, /editorAccessibility\.violations/);
});
test('canonical reference cannot be rendered in place', async () => {
  await assert.rejects(renderLeanTemplate(reference), /canonical reference/);
});
test('plugin builds self-contained canonical skills once and preserves existing outputs', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'blueprint-plugin-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const target = path.join(directory, 'plugin');
  await buildPlugin(target);
  const manifest = JSON.parse(await readFile(path.join(target, '.codex-plugin/plugin.json')));
  assert.equal(manifest.skills, './skills/');
  for (const skill of await readdir(path.join(root, 'codex/skills'))) assert.deepEqual(await readFile(path.join(target, 'skills', skill, 'SKILL.md')), await readFile(path.join(root, 'codex/skills', skill, 'SKILL.md')));
  await assert.rejects(buildPlugin(target), { code: 'EEXIST' });
});
