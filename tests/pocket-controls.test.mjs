import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GENERATIONS, filterCatalog } from '../web/js/domain.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [html, css, app, catalogJSON] = await Promise.all([
  read('web/index.html'), read('web/styles.css'), read('web/js/app.js'), read('web/data/catalog.json'),
]);
const catalog = JSON.parse(catalogJSON);

test('Pokédex de bolso mantém o grupo de regiões acessível sem o botão de partida', () => {
  assert.doesNotMatch(html, /Começar a explorar|pocket-start/);
  assert.doesNotMatch(css, /pocket-start/);
  assert.match(html, /href="#catalog" id="explore-nav"/);
  assert.match(html, /id="catalog"/);
  assert.match(html, /class="pocket-dex" role="group" aria-labelledby="region-label"/);
  assert.match(html, /data-generation="0" aria-pressed="true"/);
  assert.match(app, /data-generation="\$\{i \+ 1\}" aria-pressed="false"/);
  assert.match(app, /button\.setAttribute\(\s*'aria-pressed'/);
  assert.match(html, /class="region-cursor" aria-hidden="true"/);
  assert.match(app, /applyFilter\('generation', Number\(button\.dataset\.generation\)\)/);
});

test('nove gerações continuam cobrindo as 1025 espécies sem sobreposição', () => {
  const species = new Set();
  const state = { query: '', generation: 0, type: 0, kind: '', sort: 'number', forms: false, favoritesOnly: false, favorites: [] };
  const counts = [151, 100, 135, 107, 156, 72, 88, 96, 120];
  assert.equal(GENERATIONS.length, 10);
  for (let generation = 1; generation < GENERATIONS.length; generation++) {
    const results = filterCatalog(catalog, { ...state, generation });
    assert.equal(results.length, counts[generation - 1]);
    for (const form of results) {
      assert.ok(!species.has(form.species));
      species.add(form.species);
    }
  }
  assert.equal(species.size, 1025);
  assert.equal(filterCatalog(catalog, state).length, 1025);
});

test('controles de bolso incluem foco, alvo de toque e grade estreita sem rolagem horizontal', () => {
  assert.match(css, /\.pocket-dex \.region:focus-visible/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /\.pocket-screen #regions\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('regiões ficam integradas à tela e o painel mantém um estilo próprio', () => {
  const shell = css.match(/\.pocket-dex\s*\{([^}]+)\}/)[1];
  const screen = css.match(/\.pocket-screen\s*\{([^}]+)\}/)[1];
  const region = css.match(/\.pocket-dex \.region\s*\{([^}]+)\}/)[1];
  assert.match(shell, /--dex-shell:/);
  assert.match(shell, /--dex-screen:/);
  assert.match(screen, /background: var\(--dex-screen\)/);
  assert.doesNotMatch(screen, /box-shadow:/);
  assert.match(region, /background: transparent/);
  assert.match(css, /\.pocket-dex \.region\.active\s*\{[^}]*background: var\(--dex-active\)/);
  assert.match(css, /\.pocket-dex #regions \.region\s*\{[^}]*justify-content: center/);
});
