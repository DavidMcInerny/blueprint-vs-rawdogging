#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function isLinuxScript(name, bytes) {
  // Inspect shebangs as well as extensions: extensionless entrypoints must not
  // disappear from this check, including a shebang hidden behind a UTF-8 BOM.
  const prefix = bytes.subarray(0, 256).toString('utf8').replace(/^\uFEFF/, '');
  return /\.(?:sh|bash|zsh|mjs|cjs|js|py)$/.test(name) || /^#![^\r\n]*(?:\b(?:ba|z|da|k)?sh\b|\bnode\b|\bpython[0-9.]*)/.test(prefix);
}
export function scriptEndingProblems(name, bytes) {
  if (!isLinuxScript(name, bytes)) return [];
  const problems = [];
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) problems.push(`${name}: UTF-8 BOM`);
  if (bytes.includes(Buffer.from('\r\n'))) problems.push(`${name}: CRLF line endings`);
  return problems;
}
export async function checkScriptEndings(root) {
  const result = spawnSync('git', ['ls-files', '--stage', '-z'], { cwd: root, encoding: 'utf8' });
  if (result.error || result.status !== 0) throw new Error(result.stderr || 'Unable to list tracked scripts');
  const problems = [];
  let checked = 0;
  for (const entry of result.stdout.split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t');
    if (entry.startsWith('120000 ') || entry.startsWith('160000 ')) continue;
    const name = entry.slice(tab + 1);
    const bytes = await readFile(path.join(root, name));
    if (isLinuxScript(name, bytes)) { checked++; problems.push(...scriptEndingProblems(name, bytes)); }
  }
  return { checked, problems };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { checked, problems } = await checkScriptEndings(path.resolve(process.argv[2] || fileURLToPath(new URL('../', import.meta.url))));
    if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
    else console.log(`Script line endings: ${checked} tracked scripts use LF without BOM.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
