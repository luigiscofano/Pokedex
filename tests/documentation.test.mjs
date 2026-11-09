import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkMarkdownReferences } from '../scripts/check-docs.mjs';

async function fixture(t, markdown) {
  const root = await mkdtemp(join(tmpdir(), 'pokedex-docs-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'README.md'), markdown);
  return root;
}

test('documentação valida links, imagens, referências e caminhos codificados', async (t) => {
  const root = await fixture(t, '[Guia](guia.md#uso) ![Tela](tela.jpg)\n[Outro][guia]\n[guia]: arquivo%20local.md');
  for (const name of ['guia.md', 'tela.jpg', 'arquivo local.md']) await writeFile(join(root, name), '');
  assert.deepEqual(await checkMarkdownReferences(root), { files: 3, references: 3 });
});

test('documentação resolve destinos a partir do arquivo que contém o link', async (t) => {
  const root = await fixture(t, '[Pasta](docs)');
  await mkdir(join(root, 'docs'));
  await writeFile(join(root, 'docs', 'README.md'), '[Início](../README.md)');
  assert.equal((await checkMarkdownReferences(root)).references, 2);
});

test('documentação denuncia imagem local ausente com arquivo e destino', async (t) => {
  const root = await fixture(t, '![Tela](ausente.jpg)');
  await assert.rejects(checkMarkdownReferences(root), /README\.md → ausente\.jpg: ENOENT/);
});

test('documentação ignora URLs externas, âncoras e exemplos de código', async (t) => {
  const root = await fixture(t, '[Web](https://example.com) [E-mail](mailto:a@example.com) [Seção](#uso)\n```md\n[Exemplo](ausente.md)\n```\n`[Inline](ausente.md)`');
  assert.equal((await checkMarkdownReferences(root)).references, 0);
});

test('documentação não inclui saídas de build e dependências', async (t) => {
  const root = await fixture(t, '# Guia');
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'dist', 'README.md'), '[Inexistente](ausente.md)');
  assert.deepEqual(await checkMarkdownReferences(root), { files: 1, references: 0 });
});

test('documentação rejeita caminhos fora do repositório e escapes inválidos', async (t) => {
  const root = await fixture(t, '[Fora](../README.md) [Inválido](arquivo%ZZ.md)');
  await assert.rejects(checkMarkdownReferences(root), /destino fora do repositório[\s\S]*URI malformed/);
});

test('documentação aceita parênteses e títulos opcionais nos destinos', async (t) => {
  const root = await fixture(t, '[Guia](guia(v2).md "Título") ![Tela](<tela local.jpg>)');
  await writeFile(join(root, 'guia(v2).md'), '');
  await writeFile(join(root, 'tela local.jpg'), '');
  assert.equal((await checkMarkdownReferences(root)).references, 2);
});

test('documentação aceita fechamento de bloco maior que a abertura', async (t) => {
  const root = await fixture(t, '```md\n[Exemplo](ausente.md)\n````\n[Guia](README.md)');
  assert.equal((await checkMarkdownReferences(root)).references, 1);
});

test('documentação ignora comentários HTML', async (t) => {
  const root = await fixture(t, '<!-- [Rascunho](ausente.md) -->\n[Guia](README.md)');
  assert.equal((await checkMarkdownReferences(root)).references, 1);
});
