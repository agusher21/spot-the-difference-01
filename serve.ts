// serve.ts — tiny static server for play-testing
// Run with: node serve.ts
// Serves game/ at http://localhost:8080

import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const PORT = 8080;
const ROOT = resolve('game');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((req, res) => {
  let url = req.url || '/';
  if (url === '/') url = '/index.html';

  // Prevent directory traversal
  const filepath = resolve(ROOT, '.' + url);
  if (!filepath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!existsSync(filepath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = extname(filepath).toLowerCase();
  const mime = MIME_TYPES[ext as keyof typeof MIME_TYPES] || 'application/octet-stream';

  try {
    const content = readFileSync(filepath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(content);
  } catch (err) {
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});