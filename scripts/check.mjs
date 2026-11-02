import { readFile, readdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await files(path));
    else result.push(path);
  }
  return result;
}

for (const path of [...await files('web/js'), ...await files('scripts'), ...await files('tests')]) {
  if (/\.(m?js)$/.test(path)) execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
}
const html = await readFile('web/index.html', 'utf8');
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)/g)) await access(resolve('web', match[1]));
const manifest = JSON.parse(await readFile('web/data/manifest.json'));
if (manifest.speciesCount !== 1025 || manifest.formCount < 1025) throw Error('Catálogo incompleto');
const app = await readFile('web/js/app.js', 'utf8');
if (/\beval\s*\(|new Function\s*\(/.test(app)) throw Error('Execução dinâmica não permitida');
console.log('Sintaxe JavaScript, referências locais e manifesto válidos.');
