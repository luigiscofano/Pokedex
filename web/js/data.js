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
export const artwork = pokemon => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.pokemon}.png`;
export const sprite = pokemon => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemon}.png`;

const formSprites = new Map();
export function loadFormSprite(id) {
  if (!Number.isInteger(id) || id < 1) return Promise.resolve(null);
  if (!formSprites.has(id)) {
    const request = fetch(`https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/pokemon-form/${id}/index.json`)
      .then(response => { if (!response.ok) throw Error('Sprite indisponível'); return response.json(); })
      .then(data => {
        const source = data.sprites?.front_default;
        return source && new URL(source).hostname === 'raw.githubusercontent.com' ? source : null;
      }).catch(() => { formSprites.delete(id); return null; });
    formSprites.set(id, request);
  }
  return formSprites.get(id);
}
