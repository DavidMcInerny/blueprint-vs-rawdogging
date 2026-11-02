import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = fileURLToPath(new URL('../', import.meta.url));

test('remote bootstrap clones the maintained fork and installs its Node helper without network', { skip: process.platform === 'win32' }, async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-remote-bootstrap-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const isolated = join(root, 'outside-checkout');
  await mkdir(isolated);
  const shim = join(isolated, 'install.sh');
  await cp(join(repo, 'install.sh'), shim);
  const target = join(root, 'installed-app');
  const expectedSource = 'https://github.com/DavidMcInerny/blueprint-vs-rawdogging.git';
  const env = {
    ...process.env,
    // Only the intended fork URL can resolve. An old upstream default fails
    // protocol admission instead of reaching GitHub, even on a connected host.
    GIT_ALLOW_PROTOCOL: 'file',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: join(root, 'absent-global-gitconfig'),
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: `url.${pathToFileURL(repo).href}.insteadOf`,
    GIT_CONFIG_VALUE_0: expectedSource,
  };
  delete env.BLUEPRINT_VS_RAWDOGGING_REPO;
  delete env.GIT_CONFIG_PARAMETERS;
  const result = spawnSync('bash', [shim, '--target', target, '--agent', 'both', '--no-docs'], { cwd: isolated, env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  for (const name of ['BLUEPRINT.md', 'scripts/verify-blueprint.mjs', 'scripts/check-app.mjs', '.agents/skills/mature-app-starter/SKILL.md', '.claude/skills/mature-app-starter/SKILL.md']) {
    const source = name === 'BLUEPRINT.md' ? name : name.startsWith('scripts/') ? `templates/${name}` : 'codex/skills/mature-app-starter/SKILL.md';
    assert.equal(await readFile(join(target, name), 'utf8'), await readFile(join(repo, source), 'utf8'));
  }
});
