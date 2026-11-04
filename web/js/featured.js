// A preferência usa o ID da forma, para preservar também variedades alternativas.
export const FEATURED_KEY = 'pokedex-featured-v1';

export function findFeatured(catalog, id) {
  return catalog.find((form) => form.id === id) ||
    catalog.find((form) => form.species === 6 && form.default) || catalog[0];
}

export function readFeatured(storage, catalog) {
  let id;
  try {
    id = JSON.parse(storage.getItem(FEATURED_KEY));
  } catch {
    // Armazenamento bloqueado ou valor corrompido: usa o destaque padrão.
  }
  return findFeatured(catalog, Number.isInteger(id) ? id : null)?.id ?? null;
}

export function writeFeatured(storage, id) {
  try {
    storage.setItem(FEATURED_KEY, JSON.stringify(id));
    return true;
  } catch {
    return false;
  }
}
