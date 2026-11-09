// A seleção acompanha o catálogo exibido, inclusive ao limpar os filtros.
export function updateCatalogNavigation(exploreLink, favoritesButton, favoritesOnly) {
  for (const [control, selected] of [
    [exploreLink, !favoritesOnly],
    [favoritesButton, favoritesOnly],
  ]) {
    control.classList.toggle('nav-active', selected);
    if (selected) {
      control.setAttribute('aria-current', 'true');
    } else {
      control.removeAttribute('aria-current');
    }
  }
  favoritesButton.setAttribute('aria-pressed', String(favoritesOnly));
}
