// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

// Fonction pour servir des fichiers statiques
function serveStaticFile(res, filePath, contentType, responseCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Error');
    } else {
      res.writeHead(responseCode, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

http.createServer((req, res) => {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';
  serveStaticFile(res, path.join(__dirname, 'public', filePath), contentType);
}).listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
