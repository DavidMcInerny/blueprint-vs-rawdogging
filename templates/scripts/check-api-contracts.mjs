/*
MIT License

Copyright (c) 2026 Simon Darcy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
// Adapted from Fullstack App Foundation's MIT-licensed route checker; see integration provenance.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const methods = new Set(['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', 'TRACE']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function routeKey(method, path) {
  if (typeof method !== 'string' || !methods.has(method.toUpperCase())) return null;
  if (typeof path !== 'string' || !path.startsWith('/') || /[\s?#`]/.test(path) || path.includes('//')) return null;
  return `${method.toUpperCase()} ${path}`;
}

/** Compares an authoritative route inventory with documented signatures and inline OpenAPI operations.
 * This checks operation coverage, not schema semantics, auth, actual server routes or live behavior.
 */
export function checkApiContracts({ routes, contract, artifact }) {
  const issues = [];
  if (!Array.isArray(routes) || routes.length === 0)
    return ['Route inventory must be a nonempty array; record API checks N/A for an app without an API.'];
  if (typeof contract !== 'string') return ['Contract documentation must be text.'];
  const inventory = new Set();
  for (const [index, route] of routes.entries()) {
    const key = object(route) && routeKey(route.method, route.path);
    if (!key) { issues.push(`Invalid route inventory entry at index ${index}.`); continue; }
    if (inventory.has(key)) issues.push(`Duplicate route inventory operation: ${key}`);
    inventory.add(key);
  }
  // Exact backtick signatures avoid GET being "covered" by a POST with the same URL.
  const documented = new Set();
  for (const match of contract.matchAll(/`([A-Z]+) ([^\s`]+)`/g)) {
    const key = routeKey(match[1], match[2]);
    if (key) documented.add(key);
  }
  const operations = new Set();
  if (!object(artifact) || typeof artifact.openapi !== 'string' || !/^3\./.test(artifact.openapi) || !object(artifact.paths)) {
    issues.push('API artifact must be an OpenAPI 3.x JSON object with inline paths.');
  } else {
    for (const [path, item] of Object.entries(artifact.paths)) {
      if (!routeKey('GET', path) || !object(item)) {
        issues.push(`Invalid OpenAPI path item: ${path}`); continue;
      }
      if ('$ref' in item) issues.push(`Resolve OpenAPI path references before checking: ${path}`);
      for (const [method, operation] of Object.entries(item)) {
        if (!methods.has(method.toUpperCase()) || method !== method.toLowerCase()) continue;
        if (!object(operation) || '$ref' in operation) {
          issues.push(`OpenAPI operation must be inline: ${method.toUpperCase()} ${path}`); continue;
        }
        operations.add(routeKey(method, path));
      }
    }
  }
  for (const key of inventory) {
    if (!documented.has(key)) issues.push(`Contract missing operation: ${key}`);
    if (!operations.has(key)) issues.push(`OpenAPI missing operation: ${key}`);
  }
  for (const key of documented)
    if (!inventory.has(key)) issues.push(`Documented operation absent from inventory: ${key}`);
  for (const key of operations)
    if (!inventory.has(key)) issues.push(`OpenAPI operation absent from inventory: ${key}`);
  return issues;
}

export async function verifyApiContracts(root, env = process.env) {
  const read = path => readFile(resolve(root, path), 'utf8');
  const [contract, routes, artifact] = await Promise.all([
    read(env.API_CONTRACT_PATH ?? 'docs/API_CONTRACTS.md'),
    read(env.API_ROUTE_LIST_PATH ?? 'docs/api-routes.json'),
    read(env.API_ARTIFACT_PATH ?? 'docs/openapi.json'),
  ]);
  return checkApiContracts({ contract, routes: JSON.parse(routes), artifact: JSON.parse(artifact) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: node scripts/check-api-contracts.mjs [app-root]');
    const issues = await verifyApiContracts(resolve(process.argv[2] ?? '.'));
    if (issues.length) {
      console.error('API contract checks failed:\n' + issues.map(issue => `- ${issue}`).join('\n'));
      process.exitCode = 1;
    } else console.log('API operation inventory, contract and OpenAPI coverage agree.');
  } catch (error) {
    console.error(`API contract check could not run: ${error.message}`);
    process.exitCode = 1;
  }
}
