import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  filterCatalog,
  defenseMatchups,
  offenseMatchups,
  readFavorites,
  writeFavorites,
  shardForSpecies,
  evolutionConditions,
} from '../web/js/domain.js';

// As regras são exercitadas com o catálogo real, sem navegador.
const catalog = JSON.parse(
  await readFile(new URL('../web/data/catalog.json', import.meta.url)),
);
const reference = JSON.parse(
  await readFile(new URL('../web/data/reference.json', import.meta.url)),
);
test('catálogo base contém exatamente as 1025 espécies, sem formas duplicadas', () => {
  const base = filterCatalog(catalog, {});
  assert.equal(base.length, 1025);
  assert.deepEqual(
    base.map((form) => form.species),
    Array.from({ length: 1025 }, (_, i) => i + 1),
  );
  assert.equal(filterCatalog(catalog, { forms: true }).length, 1579);
});
test('busca aceita número nacional, nome, acentos e nomes das formas', () => {
  assert.equal(filterCatalog(catalog, { query: '#0025' })[0].name, 'Pikachu');
  assert.equal(filterCatalog(catalog, { query: '025' })[0].species, 25);
  assert.equal(filterCatalog(catalog, { query: 'flabebe' })[0].species, 669);
  assert.ok(
    filterCatalog(catalog, { query: 'charizard', forms: true }).length > 1,
  );
});
test('filtros são combinados, respeitam formas e favoritos', () => {
  const list = filterCatalog(catalog, { generation: 1, type: 10 });
  assert.ok(list.length > 0);
  assert.ok(
    list.every((form) => form.generation === 1 && form.types.includes(10)),
  );
  assert.equal(
    filterCatalog(catalog, { favoritesOnly: true, favorites: [25] }).length,
    1,
  );
  assert.ok(
    filterCatalog(catalog, { kind: 'mythical' }).every((form) => form.mythical),
  );
});

test('buscas repetidas preservam acentos, números e filtros recebidos como texto', () => {
  for (const query of ['#0025', '025', '00025', '  #0025  ']) {
    assert.deepEqual(
      filterCatalog(catalog, { query }).map((form) => form.species),
      [25],
    );
  }
  for (const query of ['flabebe', ' FLABÉBÉ ', 'flabe\u0301be\u0301']) {
    assert.equal(filterCatalog(catalog, { query })[0].species, 669);
  }
  assert.deepEqual(
    filterCatalog(catalog, { generation: '1', type: '10' }),
    filterCatalog(catalog, { generation: 1, type: 10 }),
  );
});

test('busca reflete mudanças nos nomes, na forma, no slug e no número nacional', () => {
  const form = {
    ...catalog[0],
    name: 'NomeAntigo',
    form: 'FormaAntiga',
    slug: 'slug-antigo',
  };
  for (const [field, query, replacement] of [
    ['name', 'nomeantigo', 'NomeNovo'],
    ['form', 'formaantiga', 'FormaNova'],
    ['slug', 'slug-antigo', 'slug-novo'],
  ]) {
    assert.deepEqual(filterCatalog([form], { query }), [form]);
    form[field] = replacement;
    assert.deepEqual(filterCatalog([form], { query }), []);
    assert.deepEqual(filterCatalog([form], { query: replacement }), [form]);
  }
  assert.deepEqual(filterCatalog([form], { query: '#0001' }), [form]);
  form.species = 25;
  assert.deepEqual(filterCatalog([form], { query: '#0001' }), []);
  assert.deepEqual(filterCatalog([form], { query: '#0025' }), [form]);
});

test('catálogos distintos com o mesmo ID não compartilham nomes em cache', () => {
  const first = { ...catalog[0], name: 'NomePrimeiro' };
  const second = { ...catalog[0], name: 'NomeSegundo' };
  assert.deepEqual(filterCatalog([first], { query: 'nomeprimeiro' }), [first]);
  assert.deepEqual(filterCatalog([second], { query: 'nomesegundo' }), [second]);
  assert.deepEqual(filterCatalog([second], { query: 'nomeprimeiro' }), []);
});

test('favoritos são atualizados entre consultas e não confundem IDs numéricos com texto', () => {
  const favorites = [25, 25, '1'];
  const filters = { favoritesOnly: true, favorites };
  assert.deepEqual(filterCatalog(catalog, filters).map((form) => form.id), [25]);
  favorites.splice(0, favorites.length, 1);
  assert.deepEqual(filterCatalog(catalog, filters).map((form) => form.id), [1]);
  favorites.length = 0;
  assert.deepEqual(filterCatalog(catalog, filters), []);
  assert.deepEqual(filterCatalog(catalog, { favoritesOnly: true }), []);
});

test('ordenação mantém desempates e referências sem modificar entradas congeladas', () => {
  const forms = Object.freeze([
    Object.freeze({ ...catalog[0], id: 30, name: 'Mesmo', default: false }),
    Object.freeze({ ...catalog[0], id: 20, name: 'Mesmo', default: true }),
    Object.freeze({ ...catalog[0], id: 10, name: 'Mesmo', default: false }),
  ]);
  const expected = {
    number: [20, 10, 30],
    name: [10, 20, 30],
    total: [30, 20, 10],
  };
  for (const [sort, ids] of Object.entries(expected)) {
    const result = filterCatalog(forms, { query: 'mesmo', forms: true, sort });
    assert.deepEqual(result.map((form) => form.id), ids);
    assert.notEqual(result, forms);
    assert.ok(result.every((form) => forms.includes(form)));
  }
  assert.deepEqual(forms.map((form) => form.id), [30, 20, 10]);
});
// Exemplos conhecidos verificam a composição dos tipos e a preservação de imunidades.
test('Charizard tem fraqueza 4× a Pedra e imunidade a Terra', () => {
  const result = defenseMatchups([10, 3], reference.efficacy);
  assert.equal(result.find((matchup) => matchup.type === 6).multiplier, 4);
  assert.equal(result.find((matchup) => matchup.type === 5).multiplier, 0);
  assert.equal(result.find((matchup) => matchup.type === 12).multiplier, 0.25);
});
test('imunidade de tipo é mantida em combinações e ofensiva usa o melhor tipo', () => {
  assert.equal(
    defenseMatchups([1, 8], reference.efficacy).find(
      (matchup) => matchup.type === 2,
    ).multiplier,
    0,
  );
  assert.equal(
    offenseMatchups([10, 3], reference.efficacy).find(
      (matchup) => matchup.type === 12,
    ).multiplier,
    2,
  );
});
// Falhas locais e valores de fronteira não devem corromper a navegação.
test('armazenamento inválido ou bloqueado não impede a navegação', () => {
  assert.deepEqual(readFavorites({ getItem: () => '{' }), []);
  assert.deepEqual(readFavorites({ getItem: () => '{"id":1}' }), []);
  assert.deepEqual(readFavorites({ getItem: () => '[1,1,"2",null]' }), [1]);
  assert.equal(
    writeFavorites(
      {
        setItem: () => {
          throw Error('Quota');
        },
      },
      [1],
    ),
    false,
  );
});
test('lotes tratam exatamente as fronteiras do catálogo', () => {
  assert.equal(shardForSpecies(1), '00');
  assert.equal(shardForSpecies(50), '00');
  assert.equal(shardForSpecies(51), '01');
  assert.equal(shardForSpecies(1025), '20');
  assert.throws(() => shardForSpecies(1026));
});
test('condições de evolução preservam zero significativo e restrições de forma', () => {
  const value = evolutionConditions(
    {
      evolution_trigger_id: 1,
      minimum_level: 20,
      relative_physical_stats: 0,
      turn_upside_down: 1,
      required_pokemon_form_id: 25,
    },
    reference,
    catalog,
  );
  assert.match(value, /Ataque = Defesa/);
  assert.match(value, /cabeça para baixo/);
  assert.match(value, /Pikachu/);
});
