import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { isLinuxScript, scriptEndingProblems, checkScriptEndings } from '../scripts/check-script-endings.mjs';

test('rejects CRLF and BOM in shell, Node and extensionless Linux entrypoints', () => {
  for (const name of ['install.sh', 'script.bash', 'script.zsh', 'tool.mjs', 'tool.py', 'entrypoint']) {
    const bad = Buffer.from('\uFEFF#!/usr/bin/env bash\r\necho ready\r\n');
    assert.deepEqual(scriptEndingProblems(name, bad), [`${name}: UTF-8 BOM`, `${name}: CRLF line endings`]);
    assert.deepEqual(scriptEndingProblems(name, Buffer.from('#!/usr/bin/env bash\necho ready\n')), []);
  }
  assert.equal(isLinuxScript('start-server', Buffer.from('#!/usr/bin/env node\n')), true);
  assert.equal(isLinuxScript('README.md', Buffer.from('A document\r\n')), false);
});

test('checks tracked working-tree bytes, including an extensionless entrypoint', async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-endings-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  function git(args) { const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr); }
  git(['init']);
  await writeFile(join(root, '.gitattributes'), '* text=auto eol=lf\n');
  await writeFile(join(root, 'entrypoint'), '#!/bin/sh\necho ready\n');
  git(['add', '.gitattributes', 'entrypoint']);
  assert.deepEqual(await checkScriptEndings(root), { checked: 1, problems: [] });
  await writeFile(join(root, 'entrypoint'), '\uFEFF#!/bin/sh\r\necho ready\r\n');
  assert.deepEqual((await checkScriptEndings(root)).problems, ['entrypoint: UTF-8 BOM', 'entrypoint: CRLF line endings']);
});
