import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = join(__dirname, url);
  if (existsSync(filePath)) {
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
    res.end(readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(3000, () => console.log('Server → http://localhost:3000'));
