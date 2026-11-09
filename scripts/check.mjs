import { readFile, readdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { checkMarkdownReferences } from './check-docs.mjs';

// Mantém a verificação independente de pacotes de lint e de acesso à rede.
const JAVASCRIPT_DIRECTORIES = ['web/js', 'scripts', 'tests'];
const EXPECTED_SPECIES_COUNT = 1025;

async function listFiles(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      paths.push(...(await listFiles(path)));
    } else {
      paths.push(path);
    }
  }
  return paths;
}

async function checkJavaScript() {
  for (const directory of JAVASCRIPT_DIRECTORIES) {
    for (const path of await listFiles(directory)) {
      if (/\.(m?js)$/.test(path)) {
        execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' });
      }
    }
  }
}

async function checkLocalHTMLReferences() {
  const html = await readFile('web/index.html', 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)/g)) {
    await access(resolve('web', match[1]));
  }
}

async function checkCatalogManifest() {
  const manifest = JSON.parse(await readFile('web/data/manifest.json', 'utf8'));
  if (
    manifest.speciesCount !== EXPECTED_SPECIES_COUNT ||
    manifest.formCount < EXPECTED_SPECIES_COUNT
  ) {
    throw new Error('Catálogo incompleto');
  }
}

// O escopo inclui os novos módulos de apresentação, não apenas o arquivo controlador.
async function checkDynamicExecution() {
  for (const path of await listFiles('web/js')) {
    if (!path.endsWith('.js')) {
      continue;
    }
    const source = await readFile(path, 'utf8');
    if (/\beval\s*\(|new Function\s*\(/.test(source)) {
      throw new Error(`Execução dinâmica não permitida: ${path}`);
    }
  }
}

await checkJavaScript();
await checkLocalHTMLReferences();
await checkCatalogManifest();
await checkDynamicExecution();
const documentation = await checkMarkdownReferences();
console.log(`Sintaxe JavaScript, referências locais e manifesto válidos. ${documentation.references} links locais da documentação conferidos.`);
