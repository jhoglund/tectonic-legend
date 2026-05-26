import http from 'http';
import fs from 'fs';
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'POST') {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => { fs.writeFileSync('/tmp/figma-spec.json', b); res.writeHead(200); res.end('ok ' + b.length); });
    return;
  }
  // GET → return the stored spec (for the Figma builder to fetch)
  try { const data = fs.readFileSync('/tmp/figma-spec.json'); res.setHeader('content-type', 'application/json'); res.writeHead(200); res.end(data); }
  catch { res.writeHead(404); res.end('no spec'); }
}).listen(7599, '127.0.0.1', () => console.log('figma receiver on http://127.0.0.1:7599'));
