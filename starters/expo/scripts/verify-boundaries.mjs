// Compatibility entrypoint. All graph/layer/environment/route rules live in verify-architecture.
import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import { auditSources as audit, verifyArchitecture } from './verify-architecture.mjs';
const ts = createRequire(import.meta.url)('typescript');
export const auditSources = (files) => audit(files, ts);
export async function collect(directory = 'src') {
  const files = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = posix.join(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(name + ':1: source symlink requires explicit review');
    if (entry.isDirectory()) Object.assign(files, await collect(name));
    else if (/\.[cm]?[jt]sx?$/.test(name)) files[name] = await readFile(name, 'utf8');
  }
  return files;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const issues = await verifyArchitecture(resolve(process.argv[2] ?? '.'), ts);
    if (issues.length) throw new Error(issues.join('\n'));
    console.log('Boundary compatibility check passed (canonical architecture policy).');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
