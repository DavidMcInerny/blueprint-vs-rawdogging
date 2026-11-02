#!/usr/bin/env node
// Minimal static server for an `expo export --platform web` dist directory,
// with SPA fallback so /saved, /items etc. resolve to index.html.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const [distDir, portArg] = process.argv.slice(2);
const port = Number(portArg ?? 19097);
const root = path.resolve(distDir);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
    const filePath = path.resolve(root, rel);
    if (filePath !== root && !filePath.startsWith(root + path.sep)) throw new Error('path escape');
    let body;
    let served = filePath;
    try {
      body = await readFile(filePath);
    } catch {
      body = await readFile(path.join(root, 'index.html'));
      served = path.join(root, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(served)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(500).end('serve error');
  }
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
