import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { filterCatalog } from '../web/js/domain.js';

// Referência anterior à otimização, preservada do commit efe898cda73436b125204e54cc484af0b6a97db6.
// Fica somente nesta ferramenta: a aplicação nunca carrega duas implementações.
const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
const totalStats = (pokemon) =>
  pokemon.stats.reduce((sum, value) => sum + value, 0);
// Catálogo: os filtros se combinam; a ordenação nunca altera a lista original.
function matchesCategory(form, category) {
  if (category === 'legendary') {
    return form.legendary;
  }
  if (category === 'mythical') {
    return form.mythical;
  }
  return true;
}

function matchesSearch(form, query) {
  if (!query) {
    return true;
  }
  const searchableName = normalize(`${form.name} ${form.form} ${form.slug}`);
  const nationalNumber = String(form.species);
  return (
    searchableName.includes(query) ||
    nationalNumber === query ||
    nationalNumber === query.replace(/^0+/, '')
  );
}

function compareForms(first, second, order) {
  if (order === 'name') {
    return first.name.localeCompare(second.name) || first.id - second.id;
  }
  if (order === 'total') {
    return (
      totalStats(second) - totalStats(first) || first.species - second.species
    );
  }
  // Dentro da mesma espécie, a forma padrão precede as alternativas.
  return (
    first.species - second.species ||
    Number(second.default) - Number(first.default) ||
    first.id - second.id
  );
}

function baselineFilterCatalog(catalog, filters) {
  const query = normalize(filters.query || '').replace(/^#0*/, '');
  const result = catalog.filter((form) => {
    if (!filters.forms && !form.default) {
      return false;
    }
    if (filters.generation && form.generation !== Number(filters.generation)) {
      return false;
    }
    if (filters.type && !form.types.includes(Number(filters.type))) {
      return false;
    }
    if (!matchesCategory(form, filters.kind)) {
      return false;
    }
    if (filters.favoritesOnly && !filters.favorites?.includes(form.id)) {
      return false;
    }
    return matchesSearch(form, query);
  });
  return result.sort((first, second) =>
    compareForms(first, second, filters.sort),
  );
}

// Execute na raiz: node scripts/benchmark-search.mjs
// Não usa rede nem um limite de tempo para aprovar/reprovar: resultados variam por máquina.
const catalog = JSON.parse(
  await readFile(new URL('../web/data/catalog.json', import.meta.url), 'utf8'),
);
const manyFavorites = catalog
  .filter((_, index) => index % 2 === 0)
  .map((form) => form.id);
const queries = [
  '',
  '#0025',
  '025',
  '00025',
  '#0000',
  '0',
  'flabebe',
  ' FLABÉBÉ ',
  'mega',
  'charizard',
  'galar',
  'mr. mime',
  'nidoran',
  'sem-resultado',
];
const filterOptions = [
  ['query', queries],
  ['forms', [false, true]],
  ['generation', [0, 1, 6, 9]],
  ['type', [0, 10, 18]],
  ['kind', ['', 'legendary', 'mythical']],
  ['sort', ['number', 'name', 'total']],
  ['favoritesOnly', [false, true]],
];

// Gera o produto dos critérios sem guardar milhares de cópias do catálogo.
function* filterCombinations(options, filters = {}) {
  const [option, ...remaining] = options;
  if (!option) {
    yield filters;
    return;
  }
  const [name, values] = option;
  for (const value of values) {
    yield* filterCombinations(remaining, { ...filters, [name]: value });
  }
}
let comparisons = 0;
for (const filters of filterCombinations(filterOptions, {
  favorites: manyFavorites,
})) {
  assert.deepEqual(
    filterCatalog(catalog, filters).map((form) => form.id),
    baselineFilterCatalog(catalog, filters).map((form) => form.id),
    JSON.stringify(filters),
  );
  comparisons++;
}

// Alterna a ordem de medição, aquece ambas as funções e apresenta a mediana de
// nove amostras. Cada amostra repete a mesma chamada 200 vezes em memória.
const SAMPLE_COUNT = 9;
const ITERATIONS = 200;
let checksum = 0;
function measure(filter, filters) {
  const start = performance.now();
  for (let iteration = 0; iteration < ITERATIONS; iteration++) {
    checksum += filter(catalog, filters).length;
  }
  return (performance.now() - start) / ITERATIONS;
}
function median(values) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.floor(sorted.length / 2)];
}
const scenarios = [
  ['Catálogo padrão, sem consulta', {}],
  ['Busca textual com todas as formas', { query: 'char', forms: true }],
  ['Busca com acento e todas as formas', { query: ' FLABÉBÉ ', forms: true }],
  ['Número nacional com todas as formas', { query: '#0025', forms: true }],
  [
    'Metade das formas nos favoritos',
    { forms: true, favoritesOnly: true, favorites: manyFavorites },
  ],
  [
    'Texto e favoritos combinados',
    {
      query: 'char',
      forms: true,
      favoritesOnly: true,
      favorites: manyFavorites,
    },
  ],
];
const measurements = scenarios.map(([name, filters]) => {
  for (let warmup = 0; warmup < 100; warmup++) {
    baselineFilterCatalog(catalog, filters);
    filterCatalog(catalog, filters);
  }
  const baseline = [];
  const current = [];
  for (let sample = 0; sample < SAMPLE_COUNT; sample++) {
    if (sample % 2 === 0) {
      baseline.push(measure(baselineFilterCatalog, filters));
      current.push(measure(filterCatalog, filters));
    } else {
      current.push(measure(filterCatalog, filters));
      baseline.push(measure(baselineFilterCatalog, filters));
    }
  }
  const baselineMedian = median(baseline);
  const currentMedian = median(current);
  return {
    scenario: name,
    baselineMs: Number(baselineMedian.toFixed(4)),
    currentMs: Number(currentMedian.toFixed(4)),
    speedup: Number((baselineMedian / currentMedian).toFixed(2)),
  };
});
console.log(
  JSON.stringify(
    {
      node: process.version,
      platform: `${process.platform}/${process.arch}`,
      catalogForms: catalog.length,
      equivalentFilterCombinations: comparisons,
      samples: SAMPLE_COUNT,
      iterationsPerSample: ITERATIONS,
      measurements,
      checksum,
      limitations:
        'Microbenchmark aquecido de filterCatalog no Node. Não mede DOM, rede, memória, primeira consulta ou tempo total da interface.',
    },
    null,
    2,
  ),
);
