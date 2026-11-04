import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { badges } from '../web/js/presentation.js';
import { TYPE_NAMES } from '../web/js/domain.js';

test('cada um dos 18 tipos possui símbolo vetorial decorativo e nome legível', () => {
  const icons = new Set();
  for (const [id, name] of Object.entries(TYPE_NAMES)) {
    const html = badges([Number(id)]);
    assert.ok(html.includes(`class="badge type-${id}"`));
    assert.ok(html.includes(`<span class="type-label">${name}</span>`));
    assert.ok(html.includes('aria-hidden="true" focusable="false"'));
    assert.ok(html.includes('viewBox="0 0 24 24"'));
    assert.ok(!html.includes('<img'));
    icons.add(html.match(/<svg.*?<\/svg>/)[0]);
  }
  assert.equal(icons.size, 18);
});

test('pares de tipos preservam ordem e ficam adjacentes sem espaços inseridos', () => {
  assert.equal(badges([10, 3]), badges([10]) + badges([3]));
  assert.equal(badges([]), '');
});

test('tipos especiais e entradas inválidas não geram HTML arbitrário', () => {
  assert.ok(badges([10001]).includes('???'));
  assert.ok(badges([10002]).includes('Shadow'));
  assert.ok(badges([999]).includes('Especial'));
  const html = badges(['" onclick="alert(1)']);
  assert.ok(html.includes('class="badge type-0"'));
  assert.ok(!html.includes('onclick'));
});

test('destaque usa o mesmo componente e CSS não depende de uma imagem raster', async () => {
  const app = await readFile(new URL('../web/js/app.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  assert.ok(app.includes("$('#featured-types').innerHTML = badges([10, 3])"));
  assert.ok(html.includes('id="featured-types"'));
  assert.ok(!html.includes('class="badge'));
  assert.ok(css.includes('clip-path: polygon(0 0, 100% 0, 76% 100%, 0 100%)'));
});

test('tipografia usa Chakra Petch em títulos e Barlow em textos sem fontes antigas', async () => {
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes("--font-body: 'Barlow', sans-serif"));
  assert.ok(css.includes("--font-heading: 'Chakra Petch', sans-serif"));
  assert.ok(css.includes('family=Barlow:wght@400;500;600;700;800'));
  assert.ok(css.includes('family=Chakra+Petch:wght@400;500;600;700'));
  assert.ok(!/Manrope|DM[ +]Sans|Arial Narrow|Roboto Condensed|Liberation Sans/.test(css));
  assert.match(css, /h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6,\s*\.brand\s*\{\s*font-family: var\(--font-heading\)/);
  assert.match(css, /\.badge\s*\{[^}]*font-family: var\(--font-body\)/);
  assert.match(css, /\.flavor-text\s*\{\s*font: 500 23px\/1\.65 var\(--font-body\)/);
});
