import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { filterCatalog, defenseMatchups, offenseMatchups, readFavorites, writeFavorites, shardForSpecies, evolutionConditions } from '../web/js/domain.js';

const catalog = JSON.parse(await readFile(new URL('../web/data/catalog.json', import.meta.url)));
const reference = JSON.parse(await readFile(new URL('../web/data/reference.json', import.meta.url)));
test('catálogo base contém exatamente as 1025 espécies, sem formas duplicadas', () => {
  const base = filterCatalog(catalog, {});
  assert.equal(base.length, 1025);
  assert.deepEqual(base.map(p => p.species), Array.from({ length: 1025 }, (_, i) => i + 1));
  assert.equal(filterCatalog(catalog, { forms: true }).length, 1579);
});
test('busca aceita número nacional, nome, acentos e nomes das formas', () => {
  assert.equal(filterCatalog(catalog, { query: '#0025' })[0].name, 'Pikachu');
  assert.equal(filterCatalog(catalog, { query: '025' })[0].species, 25);
  assert.equal(filterCatalog(catalog, { query: 'flabebe' })[0].species, 669);
  assert.ok(filterCatalog(catalog, { query: 'charizard', forms: true }).length > 1);
});
test('filtros são combinados, respeitam formas e favoritos', () => {
  const list = filterCatalog(catalog, { generation: 1, type: 10 });
  assert.ok(list.length > 0);
  assert.ok(list.every(p => p.generation === 1 && p.types.includes(10)));
  assert.equal(filterCatalog(catalog, { favoritesOnly: true, favorites: [25] }).length, 1);
  assert.ok(filterCatalog(catalog, { kind: 'mythical' }).every(p => p.mythical));
});
test('Charizard tem fraqueza 4× a Pedra e imunidade a Terra', () => {
  const result = defenseMatchups([10, 3], reference.efficacy);
  assert.equal(result.find(r => r.type === 6).multiplier, 4);
  assert.equal(result.find(r => r.type === 5).multiplier, 0);
  assert.equal(result.find(r => r.type === 12).multiplier, .25);
});
test('imunidade de tipo é mantida em combinações e ofensiva usa o melhor tipo', () => {
  assert.equal(defenseMatchups([1, 8], reference.efficacy).find(r => r.type === 2).multiplier, 0);
  assert.equal(offenseMatchups([10, 3], reference.efficacy).find(r => r.type === 12).multiplier, 2);
});
test('armazenamento inválido ou bloqueado não impede a navegação', () => {
  assert.deepEqual(readFavorites({ getItem: () => '{' }), []);
  assert.deepEqual(readFavorites({ getItem: () => '{"id":1}' }), []);
  assert.deepEqual(readFavorites({ getItem: () => '[1,1,"2",null]' }), [1]);
  assert.equal(writeFavorites({ setItem: () => { throw Error('Quota'); } }, [1]), false);
});
test('lotes tratam exatamente as fronteiras do catálogo', () => {
  assert.equal(shardForSpecies(1), '00');
  assert.equal(shardForSpecies(50), '00');
  assert.equal(shardForSpecies(51), '01');
  assert.equal(shardForSpecies(1025), '20');
  assert.throws(() => shardForSpecies(1026));
});
test('condições de evolução preservam zero significativo e restrições de forma', () => {
  const value = evolutionConditions({ evolution_trigger_id: 1, minimum_level: 20, relative_physical_stats: 0, turn_upside_down: 1, required_pokemon_form_id: 25 }, reference, catalog);
  assert.match(value, /Ataque = Defesa/);
  assert.match(value, /cabeça para baixo/);
  assert.match(value, /Pikachu/);
});
