// Regras puras: podem ser verificadas sem navegador ou acesso à rede.
export const TYPE_NAMES = { 1: 'Normal', 2: 'Lutador', 3: 'Voador', 4: 'Veneno', 5: 'Terra', 6: 'Pedra', 7: 'Inseto', 8: 'Fantasma', 9: 'Aço', 10: 'Fogo', 11: 'Água', 12: 'Planta', 13: 'Elétrico', 14: 'Psíquico', 15: 'Gelo', 16: 'Dragão', 17: 'Sombrio', 18: 'Fada' };
export const GENERATIONS = ['Todas as regiões', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar · Hisui', 'Paldea'];
export const STAT_NAMES = ['HP', 'Ataque', 'Defesa', 'At. especial', 'Def. especial', 'Velocidade'];
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const totalStats = pokemon => pokemon.stats.reduce((sum, value) => sum + value, 0);
export const dexNumber = value => `#${String(value).padStart(4, '0')}`;
export function filterCatalog(catalog, filters) {
  const query = normalize(filters.query || '').replace(/^#0*/, '');
  const result = catalog.filter(p =>
    (filters.forms || p.default) &&
    (!filters.generation || p.generation === Number(filters.generation)) &&
    (!filters.type || p.types.includes(Number(filters.type))) &&
    (!filters.kind || (filters.kind === 'legendary' ? p.legendary : filters.kind === 'mythical' ? p.mythical : true)) &&
    (!filters.favoritesOnly || filters.favorites?.includes(p.id)) &&
    (!query || normalize(`${p.name} ${p.form} ${p.slug}`).includes(query) || String(p.species) === query || String(p.species) === query.replace(/^0+/, ''))
  );
  return result.sort((a, b) => filters.sort === 'name' ? a.name.localeCompare(b.name) || a.id - b.id : filters.sort === 'total' ? totalStats(b) - totalStats(a) || a.species - b.species : a.species - b.species || Number(b.default) - Number(a.default) || a.id - b.id);
}
export function defenseMatchups(types, efficacy) {
  return Object.keys(TYPE_NAMES).map(Number).map(type => ({ type, multiplier: types.reduce((product, target) => product * (efficacy[`${type}/${target}`] ?? 1), 1) }));
}
export function offenseMatchups(types, efficacy) {
  // Melhor golpe de um dos tipos próprios contra um alvo de tipo único.
  return Object.keys(TYPE_NAMES).map(Number).map(type => ({ type, multiplier: Math.max(...types.map(attack => efficacy[`${attack}/${type}`] ?? 1)) }));
}
export function readFavorites(storage) {
  try {
    const data = JSON.parse(storage.getItem('pokedex:favorites:v1') || '[]');
    return Array.isArray(data) ? [...new Set(data.filter(Number.isInteger))] : [];
  } catch { return []; }
}
export function writeFavorites(storage, favorites) {
  try { storage.setItem('pokedex:favorites:v1', JSON.stringify(favorites)); return true; }
  catch { return false; }
}
export function shardForSpecies(id) {
  if (!Number.isInteger(id) || id < 1 || id > 1025) throw new RangeError('Espécie fora do catálogo');
  return String(Math.floor((id - 1) / 50)).padStart(2, '0');
}
export function evolutionConditions(rule, reference, catalog) {
  const speciesName = id => catalog.find(p => p.species === id)?.name || `Espécie ${id}`;
  const label = (collection, id) => reference[collection]?.[id]?.name || reference[collection]?.[id] || String(id);
  const conditions = [];
  const trigger = label('evolutionTriggers', rule.evolution_trigger_id);
  const triggers = { 'level-up': 'Subir de nível', trade: 'Troca', 'use-item': 'Usar item', shed: 'Espaço livre no time e Poké Ball', other: 'Condição especial', 'three-critical-hits': 'Três acertos críticos na mesma batalha', 'take-damage': 'Dano recebido', 'spin': 'Girar o personagem', 'tower-of-darkness': 'Torre das Trevas', 'tower-of-waters': 'Torre das Águas', 'agile-style-move': 'Golpes em estilo ágil', 'strong-style-move': 'Golpes em estilo forte', 'recoil-damage': 'Dano de recuo' };
  conditions.push(triggers[trigger] || trigger);
  const fields = {
    minimum_level: v => `nível ${v}`, trigger_item_id: v => label('items', v), held_item_id: v => `segurando ${label('items', v)}`,
    gender_id: v => v === 1 ? 'fêmea' : v === 2 ? 'macho' : 'sem gênero',
    location_id: v => label('locations', v), time_of_day: v => ({ day: 'de dia', night: 'à noite', dusk: 'ao entardecer' }[v] || v),
    known_move_id: v => `conhecendo ${label('moves', v)}`, known_move_type_id: v => `golpe ${TYPE_NAMES[v]}`,
    minimum_happiness: v => `amizade ≥ ${v}`, minimum_beauty: v => `beleza ≥ ${v}`, minimum_affection: v => `afeição ≥ ${v}`,
    relative_physical_stats: v => ({ '-1': 'Ataque < Defesa', '0': 'Ataque = Defesa', '1': 'Ataque > Defesa' }[v]),
    party_species_id: v => `${speciesName(v)} no time`, party_type_id: v => `tipo ${TYPE_NAMES[v]} no time`, trade_species_id: v => `trocar por ${speciesName(v)}`,
    required_pokemon_form_id: v => `forma de origem: ${catalog.find(p => p.id === v)?.label || v}`,
    evolved_pokemon_form_id: v => `forma resultante: ${catalog.find(p => p.id === v)?.label || v}`,
    used_move_id: v => `usar ${label('moves', v)}`, minimum_move_count: v => `${v} usos`, minimum_steps: v => `${v} passos`,
    minimum_damage_taken: v => `${v} de dano recebido`, percentage_chance: v => `${v}% de chance`,
    region_id: v => `região (ID da fonte): ${v}`, nature_bitmask: v => `restrição de natureza (código da fonte): ${v}`,
    condition_expression: v => `condição adicional da fonte: ${v}`
  };
  for (const [key, format] of Object.entries(fields)) if (rule[key] !== undefined) conditions.push(format(rule[key]));
  const flags = { needs_overworld_rain: 'chuva no cenário', turn_upside_down: 'console de cabeça para baixo', needs_multiplayer: 'multijogador', near_special_rock: 'perto de rocha especial' };
  for (const [key, label] of Object.entries(flags)) if (rule[key]) conditions.push(label);
  return conditions.filter(Boolean).join(' · ');
}
