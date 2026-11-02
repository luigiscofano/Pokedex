import test from 'node:test';
import assert from 'node:assert/strict';
import { artwork, sprite, loadFormSprite } from '../web/js/data.js';

const root = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

test('normal e shiny usam o ID da variedade, inclusive em Megas', () => {
  const mega = { id: 10134, pokemon: 10034, species: 6 };
  assert.equal(artwork(mega), `${root}other/official-artwork/10034.png`);
  assert.equal(artwork(mega, true), `${root}other/official-artwork/shiny/10034.png`);
  assert.equal(sprite(mega), `${root}10034.png`);
  assert.equal(sprite(mega, true), `${root}shiny/10034.png`);
});

test('forma cosmética compartilha a consulta entre normal e shiny', async t => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async url => {
    requests++;
    assert.match(url, /pokemon-form\/10001\/index\.json$/);
    return { ok: true, json: async () => ({ sprites: { front_default: `${root}201-b.png`, front_shiny: `${root}shiny/201-b.png` } }) };
  });
  const [normal, shiny] = await Promise.all([loadFormSprite(10001), loadFormSprite(10001, true)]);
  assert.equal(normal, `${root}201-b.png`);
  assert.equal(shiny, `${root}shiny/201-b.png`);
  assert.equal(await loadFormSprite(10001, true), shiny);
  assert.equal(requests, 1);
});

test('shiny ausente nunca é substituído pelo sprite normal', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ sprites: { front_default: `${root}25.png`, front_shiny: null } }) }));
  assert.equal(await loadFormSprite(20001, true), null);
  assert.equal(await loadFormSprite(20001), `${root}25.png`);
});

test('falha de carga da forma permite nova tentativa', async t => {
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    if (++requests === 1) throw Error('offline');
    return { ok: true, json: async () => ({ sprites: { front_shiny: `${root}shiny/25.png` } }) };
  });
  assert.equal(await loadFormSprite(20002, true), null);
  assert.equal(await loadFormSprite(20002, true), `${root}shiny/25.png`);
  assert.equal(requests, 2);
});

test('IDs e URLs inválidos não são usados como imagens', async t => {
  const sources = ['https://example.com/shiny.png', 'http://raw.githubusercontent.com/shiny.png', 'not-a-url'];
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ sprites: { front_shiny: sources[requests++] } }) }));
  for (const id of [-1, 0, 1.5, '25']) assert.equal(await loadFormSprite(id, true), null);
  assert.equal(requests, 0);
  for (const id of [20003, 20004, 20005]) assert.equal(await loadFormSprite(id, true), null);
});
