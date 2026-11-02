import { shardForSpecies } from './domain.js';

const requests = new Map();
export async function loadJSON(path) {
  if (!requests.has(path)) {
    const request = fetch(new URL(`../data/${path}`, import.meta.url)).then(response => {
      if (!response.ok) throw new Error('Não foi possível carregar os dados. Verifique sua conexão e tente novamente.');
      return response.json();
    }).catch(error => { requests.delete(path); throw error; });
    requests.set(path, request);
  }
  return requests.get(path);
}
export async function loadSpecies(id) {
  const data = await loadJSON(`species/${shardForSpecies(id)}.json`);
  if (!data[id]) throw new Error('Espécie não encontrada na cópia local.');
  return data[id];
}
export const artwork = (pokemon, shiny = false) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${pokemon.pokemon}.png`;
export const sprite = (pokemon, shiny = false) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${pokemon.pokemon}.png`;

const formSprites = new Map();
export async function loadFormSprite(id, shiny = false) {
  if (!Number.isInteger(id) || id < 1) return null;
  if (!formSprites.has(id)) {
    const request = fetch(`https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/pokemon-form/${id}/index.json`)
      .then(response => { if (!response.ok) throw Error('Sprite indisponível'); return response.json(); })
      .then(data => data.sprites ?? {})
      .catch(() => { formSprites.delete(id); return null; });
    formSprites.set(id, request);
  }
  const images = await formSprites.get(id);
  const source = images?.[shiny ? 'front_shiny' : 'front_default'];
  try {
    const url = new URL(source);
    return url.protocol === 'https:' && url.hostname === 'raw.githubusercontent.com' ? source : null;
  } catch { return null; }
}
