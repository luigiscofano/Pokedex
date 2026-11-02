import { shardForSpecies } from './domain.js';

const jsonRequests = new Map();
const formSpriteRequests = new Map();
const SPRITES_ROOT =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const FORM_DATA_ROOT =
  'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/pokemon-form';

// Compartilha cargas em andamento. Uma rejeição é removida para permitir nova tentativa.
function cachedRequest(cache, key, load) {
  if (!cache.has(key)) {
    const request = load().catch((error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, request);
  }
  return cache.get(key);
}

// Os JSONs pertencem à instalação; o caminho não depende da URL da ficha aberta.
export async function loadJSON(path) {
  return cachedRequest(jsonRequests, path, async () => {
    const response = await fetch(new URL(`../data/${path}`, import.meta.url));
    if (!response.ok) {
      throw new Error(
        'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
      );
    }
    return response.json();
  });
}

export async function loadSpecies(id) {
  const speciesBatch = await loadJSON(`species/${shardForSpecies(id)}.json`);
  if (!speciesBatch[id]) {
    throw new Error('Espécie não encontrada na cópia local.');
  }
  return speciesBatch[id];
}

// Ilustrações e sprites comuns usam a variedade, nunca o número nacional da espécie.
export const artwork = (form, shiny = false) =>
  `${SPRITES_ROOT}/other/official-artwork/${shiny ? 'shiny/' : ''}${form.pokemon}.png`;

export const sprite = (form, shiny = false) =>
  `${SPRITES_ROOT}/${shiny ? 'shiny/' : ''}${form.pokemon}.png`;

function validSpriteURL(source) {
  try {
    const url = new URL(source);
    return (
      url.protocol === 'https:' && url.hostname === 'raw.githubusercontent.com'
    );
  } catch {
    return false;
  }
}

// Formas cosméticas têm metadados próprios. Normal e shiny reutilizam a mesma consulta.
export async function loadFormSprite(id, shiny = false) {
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  const images = await cachedRequest(formSpriteRequests, id, async () => {
    const response = await fetch(`${FORM_DATA_ROOT}/${id}/index.json`);
    if (!response.ok) {
      throw new Error('Sprite indisponível');
    }
    const data = await response.json();
    return data.sprites ?? {};
  }).catch(() => null);

  // Ausência de shiny deve continuar explícita, sem substituição pela imagem normal.
  const source = images?.[shiny ? 'front_shiny' : 'front_default'];
  return validSpriteURL(source) ? source : null;
}
