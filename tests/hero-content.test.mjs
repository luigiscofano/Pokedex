import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');

test('apresentação mantém título e descrição sem o texto introdutório removido', () => {
  assert.doesNotMatch(html, /um universo de descobertas/i);
  assert.match(html, /id="hero-title">Temos que<br \/><em>pegar!<\/em><\/h1/);
  assert.match(html, /Explore espécies, descubra formas e conheça cada detalhe da sua/);
  assert.match(html, /<div class="eyebrow">SOBRE ESTE GUIA<\/div/);
});
