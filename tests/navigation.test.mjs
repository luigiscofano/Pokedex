import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { updateCatalogNavigation } from '../web/js/navigation.js';

function control() {
  const attributes = new Map();
  const classes = new Set();
  return {
    attributes, classes,
    classList: { toggle(name, selected) { selected ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { attributes.set(name, value); },
    removeAttribute(name) { attributes.delete(name); },
  };
}

test('Favoritos fica selecionado e Explorar perde a seleção ao entrar na coleção', () => {
  const explore = control();
  const favorites = control();
  updateCatalogNavigation(explore, favorites, false);
  assert.ok(explore.classes.has('nav-active'));
  assert.equal(explore.attributes.get('aria-current'), 'true');
  assert.equal(favorites.attributes.get('aria-pressed'), 'false');
  updateCatalogNavigation(explore, favorites, true);
  assert.ok(favorites.classes.has('nav-active'));
  assert.ok(!explore.classes.has('nav-active'));
  assert.equal(favorites.attributes.get('aria-current'), 'true');
  assert.equal(favorites.attributes.get('aria-pressed'), 'true');
  assert.ok(!explore.attributes.has('aria-current'));
});

test('seleção persiste ao atualizar favoritos e volta para Explorar ao sair', () => {
  const explore = control();
  const favorites = control();
  for (const selected of [true, true, false, true, false]) {
    updateCatalogNavigation(explore, favorites, selected);
    assert.equal(favorites.classes.has('nav-active'), selected);
    assert.equal(explore.classes.has('nav-active'), !selected);
    assert.equal(favorites.attributes.get('aria-pressed'), String(selected));
    assert.equal(favorites.attributes.has('aria-current'), selected);
    assert.equal(explore.attributes.has('aria-current'), !selected);
  }
});

test('catálogo sincroniza a navegação, Explorar sai dos favoritos e quantidade usa negrito', async () => {
  const app = await readFile(new URL('../web/js/app.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const css = await readFile(new URL('../web/styles.css', import.meta.url), 'utf8');
  assert.match(app, /updateCatalogNavigation\(\$\('#explore-nav'\), \$\('#favorites-nav'\), state\.favoritesOnly\)/);
  assert.match(app, /\$\('#explore-nav'\)\.addEventListener\('click', \(\) => \{\s*applyFilter\('favoritesOnly', false\)/);
  assert.match(app, /<strong>\$\{formatNumber\(list\.length\)\}<\/strong>/);
  assert.match(html, /id="result-count" role="status" aria-live="polite"/);
  assert.match(css, /\.topbar nav \.nav-active\s*\{[^}]*border-bottom: 2px solid var\(--red\)/);
  assert.match(css, /#result-count strong\s*\{\s*font-weight: 700/);
});
