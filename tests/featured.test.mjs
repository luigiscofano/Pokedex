import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FEATURED_KEY, findFeatured, readFeatured, writeFeatured } from '../web/js/featured.js';
const catalog = JSON.parse(await readFile(new URL('../web/data/catalog.json', import.meta.url)));
const defaultId = catalog.find((form) => form.species === 6 && form.default).id;
const memory = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
test('destaque inicial permanece Charizard sem preferência', () => {
  assert.equal(readFeatured(memory(), catalog), defaultId);
});
test('todas as formas podem ser destaque e sobrevivem à releitura', () => {
  const storage = memory();
  for (const form of catalog) {
    assert.equal(writeFeatured(storage, form.id), true);
    assert.equal(readFeatured(storage, catalog), form.id);
    assert.equal(findFeatured(catalog, form.id), form);
  }
});
test('valor inválido, removido ou armazenamento bloqueado retorna ao padrão', () => {
  const storage = memory();
  for (const value of ['null', 'false', '"6"', '{}', '[]', '-1', '99999999', '6.5', '{invalid']) {
    storage.setItem(FEATURED_KEY, value);
    assert.equal(readFeatured(storage, catalog), defaultId);
  }
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.equal(readFeatured(blocked, catalog), defaultId);
  assert.equal(writeFeatured(blocked, defaultId), false);
});
test('seleções repetidas e troca de forma substituem apenas o destaque', () => {
  const storage = memory();
  storage.setItem('pokedex-favorites', '[25]');
  const form = catalog.find((item) => !item.default);
  writeFeatured(storage, form.id);
  writeFeatured(storage, form.id);
  assert.equal(readFeatured(storage, catalog), form.id);
  writeFeatured(storage, defaultId);
  assert.equal(readFeatured(storage, catalog), defaultId);
  assert.equal(storage.getItem('pokedex-favorites'), '[25]');
  assert.equal(readFeatured(storage, []), null);
});
test('somente fichas oferecem destaque acessível e abertura usa seleção atual', async () => {
  const source = await readFile(new URL('../web/js/app.js', import.meta.url), 'utf8');
  const cardSource = source.slice(source.indexOf('function card('), source.indexOf('function syncURL('));
  assert.ok(!cardSource.includes('featuredButton'));
  assert.ok(!cardSource.includes('data-featured'));
  assert.equal((source.match(/featuredButton\(form\),/g) || []).length, 1);
  assert.ok(source.includes('featuredButton(form),'));
  assert.ok(source.includes('aria-pressed="${selected}"'));
  assert.ok(source.includes('state.featured = readFeatured(storage, state.catalog)'));
  assert.ok(source.includes("$('#featured-types').innerHTML = badges(form.types)"));
  assert.ok(source.includes('imageMarkup(form, \'hero-image\', true)'));
});

test('destaque usa botão grafite com Pokébola vetorial nos dois estados', async () => {
  const source = await readFile(new URL('../web/js/app.js', import.meta.url), 'utf8');
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  assert.ok(source.includes('class="featured-button"'));
  assert.ok(source.includes('class="featured-icon"'));
  assert.ok(source.includes('aria-hidden="true" focusable="false"'));
  assert.ok(source.includes('button.innerHTML = featuredButtonContent(selected)'));
  assert.ok(!source.includes('★ Em destaque'));
  assert.ok(css.includes('--featured-background: #30302f'));
  assert.ok(css.includes('--featured-background: #454544'));
});
