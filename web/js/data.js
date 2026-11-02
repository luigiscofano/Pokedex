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
