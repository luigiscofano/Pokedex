import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const IGNORED_DIRECTORIES = new Set(['.git', '.cache', '.idea', 'node_modules', 'dist', 'build']);

async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name)) {
      files.push(...await markdownFiles(path));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path);
    }
  }
  return files;
}

function proseOnly(markdown) {
  let fence = null;
  return markdown.replace(/<!--[\s\S]*?-->/g, '').split('\n').filter((line) => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (
        marker && marker[1][0] === fence[0] &&
        marker[1].length >= fence.length && !marker[2].trim()
      ) {
        fence = null;
      }
      return false;
    }
    if (marker) {
      fence = marker[1];
      return false;
    }
    return true;
  }).join('\n').replace(/(`+)[\s\S]*?\1/g, '');
}

// Parênteses fazem parte de nomes válidos; somente o fechamento externo encerra
// o destino. Títulos opcionais começam depois do primeiro espaço não escapado.
function inlineTarget(prose, start) {
  let target = '';
  let depth = 0;
  for (let index = start; index < prose.length; index++) {
    const character = prose[index];
    if (!target && /\s/.test(character)) continue;
    if (!target && character === '<') {
      const end = prose.indexOf('>', index + 1);
      return end < 0 ? '' : prose.slice(index + 1, end);
    }
    if (character === '\\' && index + 1 < prose.length) {
      target += prose[++index];
      continue;
    }
    if ((character === ')' && depth === 0) || /\s/.test(character)) break;
    if (character === '(') depth++;
    if (character === ')') depth--;
    target += character;
  }
  return target;
}

// Âncoras, URLs externas e HTML embutido exigem revisão própria. O escopo é a
// sintaxe comum de links e imagens Markdown, não um parser completo da linguagem.
function linkTargets(markdown) {
  const prose = proseOnly(markdown);
  const targets = [];
  for (const match of prose.matchAll(/!?\[[^\]\n]*\]\(/g)) {
    targets.push(inlineTarget(prose, match.index + match[0].length));
  }
  for (const match of prose.matchAll(/^\s*\[[^\]^]+\]:\s*(<[^>]+>|\S+)/gm)) {
    targets.push(match[1]);
  }
  return targets.map((target) => target.replace(/^<|>$/g, ''));
}

export async function checkMarkdownReferences(root = process.cwd()) {
  root = resolve(root);
  const errors = [];
  let checked = 0;
  const files = await markdownFiles(root);
  for (const file of files) {
    for (const target of linkTargets(await readFile(file, 'utf8'))) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
      const rawPath = target.split(/[?#]/, 1)[0];
      if (!rawPath) continue;
      try {
        const path = resolve(dirname(file), decodeURIComponent(rawPath));
        const withinRoot = relative(root, path);
        if (withinRoot === '..' || withinRoot.startsWith(`..${sep}`)) {
          throw new Error('destino fora do repositório');
        }
        await access(path);
        checked++;
      } catch (error) {
        errors.push(`${relative(root, file)} → ${target}: ${error.code || error.message}`);
      }
    }
  }
  if (errors.length) throw new Error(`Referências Markdown inválidas:\n${errors.join('\n')}`);
  return { files: files.length, references: checked };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkMarkdownReferences();
  console.log(`${result.references} referências locais em ${result.files} arquivos Markdown válidas.`);
}
