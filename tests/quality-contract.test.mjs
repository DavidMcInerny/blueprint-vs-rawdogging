import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { auditSources } from '../templates/scripts/verify-architecture.mjs';
import { buildCheckPlan, checkApp } from '../templates/scripts/check-app.mjs';

const valid = {
  'src/app/index.tsx': "export { Screen as default } from '@/modules/home';",
  'src/modules/home/index.ts': "export { Screen } from './Screen';",
  'src/modules/home/Screen.tsx': 'export const Screen = () => null;',
};
const audit = (delta) => auditSources({ ...valid, ...delta }, ts);
test('one route policy ignores line count, comments and ordinary text', () => {
  assert.deepEqual(audit({
    'src/app/index.tsx': '// process.env.KEY\n'.repeat(45) + valid['src/app/index.tsx'],
    'src/services/text.ts': 'export const example = "process.env.SECRET";',
    'src/config/env.ts': 'export const key = process["env"]["KEY"];',
    'src/services/compiler.ts': 'export const server = process["env"]["EXPO_SERVER"];',
  }), []);
  assert.match(audit({ 'src/app/index.tsx': 'export default () => null;' }).join(), /index.tsx:1: Route implementation/);
});
test('environment policy is identical for dot/bracket access and only env.ts owns runtime reads', () => {
  for (const expression of ['process.env.KEY', 'process["env"]["KEY"]', 'process.env']) {
    assert.match(audit({ 'src/config/other.ts': 'export const key = ' + expression + ';' }).join(), /other.ts:1: Environment access/);
  }
  assert.deepEqual(audit({ 'src/services/demo.test.ts': 'export const value = process.env.TEST;' }), []);
});
test('public APIs and layer ownership apply to static, dynamic and require imports', () => {
  for (const code of [
    'export { Screen } from "../modules/home/Screen";',
    'const value = import("@/modules/home/Screen");',
    'const value = require("@/modules/home/Screen");',
  ]) assert.match(audit({ 'src/services/bad.ts': code }).join(), /public index/);
  assert.match(audit({ 'src/services/bad.ts': 'export * from "@/modules/home";' }).join(), /foundation depends/);
  assert.match(audit({ 'src/foundation/bad.ts': 'export * from "@/services/data";', 'src/services/data.ts': 'export const x=1;' }).join(), /Foundation\/config/);
  assert.match(audit({ 'src/services/bad.ts': 'const name="dynamic"; import(name);' }).join(), /Computed imports/);
});
test('runtime cycles fail while type-only cycles and Router special handlers pass', () => {
  const cyclic = {
    'src/services/a.ts': 'export * from "./b";',
    'src/services/b.ts': 'export * from "./a";',
  };
  assert.match(audit(cyclic).join(), /b.ts:1: Import cycle/);
  assert.deepEqual(audit({
    'src/services/a.ts': 'import type { B } from "./b"; export interface A {}',
    'src/services/b.ts': 'import type { A } from "./a"; export interface B {}',
    'src/services/c.ts': 'import { type D } from "./d"; export interface C {}',
    'src/services/d.ts': 'export { type C } from "./c"; export interface D {}',
    'src/app/health+api.ts': 'export function GET() { return Response.json({ok:true}); }',
  }), []);
  assert.match(audit({ 'src/app/index.tsx': 'export * from "./missing";' }).join(), /Unresolved local import/);
});
const scripts = Object.fromEntries(['typecheck', 'lint', 'format:check', 'test', 'build:web', 'test:e2e:shell'].map((name) => [name, 'command']));
test('default gate contains unique checks and shell export is explicit', () => {
  const base = buildCheckPlan(scripts);
  assert.equal(base.filter((stage) => stage.file === 'verify-architecture.mjs').length, 1);
  assert.ok(!base.some((stage) => stage.file === 'verify-boundaries.mjs'));
  assert.ok(!base.some((stage) => stage.script === 'build:web'));
  assert.equal(buildCheckPlan(scripts, true).at(-1).script, 'test:e2e:shell');
  assert.throws(() => buildCheckPlan({ ...scripts, typecheck: undefined }), /required quality script.*typecheck/);
});
test('orchestrator preserves diagnostics and stops immediately on failing stage', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'quality-gate-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'package.json'), JSON.stringify({ scripts }));
  const calls = [], lines = [];
  const result = await checkApp(root, {
    runner(command, args, options) { calls.push({ command, args, options }); return { status: calls.length === 2 ? 2 : 0 }; },
    log: (line) => lines.push(line),
  });
  assert.equal(result, 2);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.stdio, 'inherit');
  assert.equal(calls[0].options.cwd, root);
  assert.ok(lines.some((line) => line.includes('Failed: lint')));
});
