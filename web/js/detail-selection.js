// Ajusta seletores dependentes da ficha antes de renderizar os painéis.
// A escolha válida da pessoa tem prioridade; o fallback só ocorre quando ela deixa de existir.
export function updatePanelSelection(state) {
  if (state.tab === 'entries') {
    updateFlavorSelection(state);
  }
  if (state.tab === 'moves') {
    updateMoveSelection(state);
  }
}

function updateFlavorSelection(state) {
  const entries = state.species.flavor;
  if (!entries.length) {
    return;
  }
  const languages = [
    ...new Set(entries.map(([version, language]) => language)),
  ].sort((first, second) => first - second);
  if (!languages.includes(state.language)) {
    state.language = languages.includes(9) ? 9 : languages[0];
  }
  const localizedEntries = entries.filter(
    ([, language]) => language === state.language,
  );
  if (!localizedEntries.some(([version]) => version === state.entryVersion)) {
    state.entryVersion = localizedEntries[localizedEntries.length - 1][0];
  }
}

function updateMoveSelection(state) {
  const variety = state.species.varieties.find(
    (item) => item.id === state.form.pokemon,
  );
  const groups = [...new Set(variety.moves.map(([group]) => group))].sort(
    (first, second) =>
      (state.reference.versionGroups[second]?.order || second) -
      (state.reference.versionGroups[first]?.order || first),
  );
  if (groups.length && !groups.includes(Number(state.moveGroup))) {
    state.moveGroup = groups[0];
  }
}
