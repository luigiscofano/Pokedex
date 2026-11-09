// Regras puras: podem ser verificadas sem navegador ou acesso à rede.
export const TYPE_NAMES = {
  1: 'Normal',
  2: 'Lutador',
  3: 'Voador',
  4: 'Veneno',
  5: 'Terra',
  6: 'Pedra',
  7: 'Inseto',
  8: 'Fantasma',
  9: 'Aço',
  10: 'Fogo',
  11: 'Água',
  12: 'Planta',
  13: 'Elétrico',
  14: 'Psíquico',
  15: 'Gelo',
  16: 'Dragão',
  17: 'Sombrio',
  18: 'Fada',
};
export const GENERATIONS = [
  'Todas as regiões',
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar · Hisui',
  'Paldea',
];
export const STAT_NAMES = [
  'HP',
  'Ataque',
  'Defesa',
  'At. especial',
  'Def. especial',
  'Velocidade',
];
export const normalize = (value) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
export const totalStats = (pokemon) =>
  pokemon.stats.reduce((sum, value) => sum + value, 0);
export const dexNumber = (value) => `#${String(value).padStart(4, '0')}`;
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

// Reutiliza nomes entre teclas sem reter catálogos descartados. Os campos são
// conferidos para que uma alteração no mesmo objeto não deixe a busca desatualizada.
const searchableNames = new WeakMap();

function searchableName(form) {
  const cached = searchableNames.get(form);
  if (
    cached &&
    cached.name === form.name &&
    cached.form === form.form &&
    cached.slug === form.slug
  ) {
    return cached.value;
  }
  const value = normalize(`${form.name} ${form.form} ${form.slug}`);
  searchableNames.set(form, {
    name: form.name,
    form: form.form,
    slug: form.slug,
    value,
  });
  return value;
}

function matchesSearch(form, query, nationalQuery) {
  if (!query) {
    return true;
  }
  const nationalNumber = String(form.species);
  return (
    searchableName(form).includes(query) ||
    nationalNumber === query ||
    nationalNumber === nationalQuery
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

export function filterCatalog(catalog, filters) {
  const query = normalize(filters.query || '').replace(/^#0*/, '');
  const nationalQuery = query.replace(/^0+/, '');
  const generation = Number(filters.generation);
  const type = Number(filters.type);
  // Recria o conjunto por chamada: alterações na lista de favoritos são imediatas,
  // sem percorrer todos os favoritos para cada forma do catálogo.
  const favorites = filters.favoritesOnly
    ? new Set(filters.favorites || [])
    : null;
  const result = catalog.filter((form) => {
    if (!filters.forms && !form.default) {
      return false;
    }
    if (filters.generation && form.generation !== generation) {
      return false;
    }
    if (filters.type && !form.types.includes(type)) {
      return false;
    }
    if (!matchesCategory(form, filters.kind)) {
      return false;
    }
    if (favorites && !favorites.has(form.id)) {
      return false;
    }
    return matchesSearch(form, query, nationalQuery);
  });
  return result.sort((first, second) =>
    compareForms(first, second, filters.sort),
  );
}

// Tipos: defesa multiplica fatores; ataque escolhe o melhor tipo próprio.
function validateModernTypes(types) {
  if (!types.length || types.some((type) => !TYPE_NAMES[type])) {
    throw new RangeError('Tipo especial sem tabela de eficácia moderna');
  }
}

export function defenseMatchups(types, efficacy) {
  validateModernTypes(types);
  return Object.keys(TYPE_NAMES)
    .map(Number)
    .map((attackType) => ({
      type: attackType,
      multiplier: types.reduce(
        (product, defenseType) =>
          product * (efficacy[`${attackType}/${defenseType}`] ?? 1),
        1,
      ),
    }));
}

export function offenseMatchups(types, efficacy) {
  validateModernTypes(types);
  return Object.keys(TYPE_NAMES)
    .map(Number)
    .map((defenseType) => ({
      type: defenseType,
      multiplier: Math.max(
        ...types.map(
          (attackType) => efficacy[`${attackType}/${defenseType}`] ?? 1,
        ),
      ),
    }));
}

// Favoritos: uma falha do armazenamento não deve interromper a navegação.
const FAVORITES_STORAGE_KEY = 'pokedex:favorites:v1';

export function readFavorites(storage) {
  try {
    const data = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return Array.isArray(data)
      ? [...new Set(data.filter(Number.isInteger))]
      : [];
  } catch {
    return [];
  }
}
export function writeFavorites(storage, favorites) {
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch {
    return false;
  }
}
// Lotes: IDs nacionais são distintos dos IDs de variedade e de forma.
export function shardForSpecies(id) {
  if (!Number.isInteger(id) || id < 1 || id > 1025) {
    throw new RangeError('Espécie fora do catálogo');
  }
  return String(Math.floor((id - 1) / 50)).padStart(2, '0');
}
// Evoluções: zero é um requisito válido; somente undefined significa campo ausente.
export function evolutionConditions(rule, reference, catalog) {
  const speciesName = (id) =>
    catalog.find((form) => form.species === id)?.name || `Espécie ${id}`;
  const label = (collection, id) =>
    reference[collection]?.[id]?.name ||
    reference[collection]?.[id] ||
    String(id);
  const conditions = [];
  const trigger = label('evolutionTriggers', rule.evolution_trigger_id);
  const triggers = {
    'level-up': 'Subir de nível',
    trade: 'Troca',
    'use-item': 'Usar item',
    shed: 'Espaço livre no time e Poké Ball',
    other: 'Condição especial',
    'three-critical-hits': 'Três acertos críticos na mesma batalha',
    'take-damage': 'Dano recebido',
    spin: 'Girar o personagem',
    'tower-of-darkness': 'Torre das Trevas',
    'tower-of-waters': 'Torre das Águas',
    'agile-style-move': 'Golpes em estilo ágil',
    'strong-style-move': 'Golpes em estilo forte',
    'recoil-damage': 'Dano de recuo',
  };
  conditions.push(triggers[trigger] || trigger);
  const fields = {
    minimum_level: (value) => `nível ${value}`,
    trigger_item_id: (value) => label('items', value),
    held_item_id: (value) => `segurando ${label('items', value)}`,
    gender_id: (value) =>
      value === 1 ? 'fêmea' : value === 2 ? 'macho' : 'sem gênero',
    location_id: (value) => label('locations', value),
    time_of_day: (value) =>
      ({ day: 'de dia', night: 'à noite', dusk: 'ao entardecer' })[value] ||
      value,
    known_move_id: (value) => `conhecendo ${label('moves', value)}`,
    known_move_type_id: (value) => `golpe ${TYPE_NAMES[value]}`,
    minimum_happiness: (value) => `amizade ≥ ${value}`,
    minimum_beauty: (value) => `beleza ≥ ${value}`,
    minimum_affection: (value) => `afeição ≥ ${value}`,
    relative_physical_stats: (value) =>
      ({ '-1': 'Ataque < Defesa', 0: 'Ataque = Defesa', 1: 'Ataque > Defesa' })[
        value
      ],
    party_species_id: (value) => `${speciesName(value)} no time`,
    party_type_id: (value) => `tipo ${TYPE_NAMES[value]} no time`,
    trade_species_id: (value) => `trocar por ${speciesName(value)}`,
    required_pokemon_form_id: (value) =>
      `forma de origem: ${catalog.find((form) => form.id === value)?.label || value}`,
    evolved_pokemon_form_id: (value) =>
      `forma resultante: ${catalog.find((form) => form.id === value)?.label || value}`,
    used_move_id: (value) => `usar ${label('moves', value)}`,
    minimum_move_count: (value) => `${value} usos`,
    minimum_steps: (value) => `${value} passos`,
    minimum_damage_taken: (value) => `${value} de dano recebido`,
    percentage_chance: (value) => `${value}% de chance`,
    region_id: (value) => `região (ID da fonte): ${value}`,
    nature_bitmask: (value) =>
      `restrição de natureza (código da fonte): ${value}`,
    condition_expression: (value) => `condição adicional da fonte: ${value}`,
  };
  for (const [key, format] of Object.entries(fields)) {
    if (rule[key] !== undefined) {
      conditions.push(format(rule[key]));
    }
  }
  const flags = {
    needs_overworld_rain: 'chuva no cenário',
    turn_upside_down: 'console de cabeça para baixo',
    needs_multiplayer: 'multijogador',
    near_special_rock: 'perto de rocha especial',
  };
  for (const [key, label] of Object.entries(flags)) {
    if (rule[key]) {
      conditions.push(label);
    }
  }
  return conditions.filter(Boolean).join(' · ');
}
