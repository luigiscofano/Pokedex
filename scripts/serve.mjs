import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

// Servidor de desenvolvimento: arquivos estáticos, sem banco ou API de aplicação.
const WEB_ROOT = resolve('web');
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function configuredPort() {
  const argumentIndex = process.argv.indexOf('--port');
  return Number(
    argumentIndex >= 0
      ? process.argv[argumentIndex + 1]
      : process.env.PORT || 3000,
  );
}

// A comparação inclui o separador para não aceitar uma pasta com o mesmo prefixo.
function isInsideWebRoot(path) {
  return path === WEB_ROOT || path.startsWith(WEB_ROOT + sep);
}

async function serveFile(request, response) {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    );
    let target = resolve(WEB_ROOT, `.${pathname}`);
    if (!isInsideWebRoot(target)) {
      response.writeHead(403).end();
      return;
    }
    if ((await stat(target)).isDirectory()) {
      target = resolve(target, 'index.html');
    }
    response.writeHead(200, {
      'Content-Type': `${MIME_TYPES[extname(target)] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-cache',
    });
    response.end(await readFile(target));
  } catch {
    response.writeHead(404).end('Arquivo não encontrado');
  }
}

const port = configuredPort();
http.createServer(serveFile).listen(port, '0.0.0.0', () => {
  console.log(`Pokédex em http://localhost:${port}`);
});
