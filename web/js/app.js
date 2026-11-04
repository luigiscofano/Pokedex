import {
  TYPE_NAMES,
  GENERATIONS,
  filterCatalog,
  readFavorites,
  writeFavorites,
  dexNumber,
} from './domain.js';
import { loadJSON, loadSpecies, artwork } from './data.js';
import { escapeHTML, formatNumber, badges, facts } from './presentation.js';
import {
  imageMarkup as renderImage,
  imageCaption,
  resolveFormImage,
  handleImageError,
} from './images.js';
import {
  overviewPanel,
  typesPanel,
  entriesPanel,
  encountersPanel,
  movesPanel,
  evolutionPanel,
} from './detail-panels.js';
import { updatePanelSelection } from './detail-selection.js';

// Paginação e duração dos avisos são centralizadas para evitar valores dispersos.
const CATALOG_PAGE_SIZE = 24;
const DETAIL_PAGE_SIZE = 80;
const DETAIL_PAGE_INCREMENT = 100;
const TOAST_DURATION_MS = 3500;

const $ = (selector) => document.querySelector(selector);

let storage;
try {
  storage = window.localStorage;
} catch {
  storage = {
    getItem: () => null,
    setItem: () => {
      throw Error('Armazenamento indisponível');
    },
  };
}
const state = {
  catalog: [],
  reference: {},
  manifest: {},
  query: '',
  generation: 0,
  type: 0,
  kind: '',
  sort: 'number',
  forms: false,
  shiny: false,
  favoritesOnly: false,
  favorites: readFavorites(storage),
  limit: CATALOG_PAGE_SIZE,
  form: null,
  species: null,
  tab: 'overview',
  detailRequest: 0,
  tabRequest: 0,
  language: 9,
  entryVersion: null,
  encounterVersion: '',
  moveGroup: '',
  moveQuery: '',
  rows: DETAIL_PAGE_SIZE,
};
let toastTimer;

// A preferência global é entregue explicitamente ao módulo responsável pelas imagens.
function imageMarkup(form, className = '', eager = false) {
  return renderImage(form, {
    catalog: state.catalog,
    shiny: state.shiny,
    className,
    eager,
  });
}

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => $('#toast').classList.remove('show'),
    TOAST_DURATION_MS,
  );
}

const imageObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }
      imageObserver.unobserve(entry.target);
      resolveFormImage(entry.target);
    }
  },
  { rootMargin: '100px' },
);

function card(form) {
  const saved = state.favorites.includes(form.id);
  return [
    `<article class="pokemon-card type-${form.types[0]}">`,
    `<button class="favorite-button ${saved ? 'saved' : ''}" data-favorite="${form.id}" aria-label="${saved ? 'Remover' : 'Adicionar'} ${escapeHTML(form.label)} ${saved ? 'dos' : 'aos'} favoritos" aria-pressed="${saved}">${saved ? '♥' : '♡'}</button>`,
    `<button class="card-open" data-open="${form.id}" aria-label="Abrir ficha de ${escapeHTML(form.label)}">`,
    `<div class="card-art">`,
    `<span class="dex-id">${dexNumber(form.species)}</span>${imageMarkup(form)}</div>`,
    `<div class="card-info">`,
    `<h3>${escapeHTML(form.name)}</h3>${state.forms ? `<p class="card-form">${escapeHTML(form.form || 'Forma padrão')}</p>` : ''}<div>${badges(form.types)}</div>`,
    `</div>`,
    `</button>`,
    `</article>`,
  ].join('');
}

// Links compartilham apenas os filtros e a ficha previstos no contrato da URL.
function syncURL() {
  const params = new URLSearchParams();
  if (state.query) {
    params.set('q', state.query);
  }
  if (state.generation) {
    params.set('gen', state.generation);
  }
  if (state.type) {
    params.set('type', state.type);
  }
  if (state.forms) {
    params.set('forms', '1');
  }
  if (state.shiny) {
    params.set('shiny', '1');
  }
  if (state.form && $('#pokemon-dialog').open) {
    params.set('pokemon', state.form.id);
  }
  const query = params.toString();
  history.replaceState(
    null,
    '',
    `${location.pathname}${query ? '?' + query : ''}${location.hash}`,
  );
}

// Catálogo: renderização da página atual, contagens e filtros ativos.
function renderCatalog() {
  const list = filterCatalog(state.catalog, state);
  $('#pokemon-grid').innerHTML = list.length
    ? list.slice(0, state.limit).map(card).join('')
    : '<div class="empty-state"><h3>Nenhum Pokémon por aqui.</h3><p>Tente outro nome ou ajuste os filtros. Para procurar uma forma alternativa, ative “Incluir formas”.</p><button data-reset>Limpar filtros</button></div>';
  imageObserver.disconnect();
  document
    .querySelectorAll('#pokemon-grid [data-form-image]')
    .forEach((image) => imageObserver.observe(image));
  $('#result-count').textContent =
    `${formatNumber(list.length)} ${state.forms ? 'formas' : 'Pokémon'} encontrados`;
  $('#page-count').textContent = list.length
    ? `Mostrando ${Math.min(state.limit, list.length)} de ${formatNumber(list.length)}`
    : '';
  $('#load-more').hidden = list.length <= state.limit;
  $('#favorite-count').textContent = state.favorites.length;
  $('#catalog-title').innerHTML =
    `${state.favoritesOnly ? 'Seus favoritos' : state.generation ? GENERATIONS[state.generation] : 'Pokédex Nacional'}<span>.</span>`;
  document.querySelectorAll('[data-generation]').forEach((button) => {
    button.classList.toggle(
      'active',
      Number(button.dataset.generation) === state.generation,
    );
    button.setAttribute(
      'aria-pressed',
      String(Number(button.dataset.generation) === state.generation),
    );
  });
  const active =
    state.query ||
    state.generation ||
    state.type ||
    state.kind ||
    state.favoritesOnly ||
    state.forms;
  $('#active-filters').innerHTML = active
    ? `<button class="filter-tag" data-reset>Limpar filtros ×</button>${state.favoritesOnly ? '<span class="filter-tag">Somente favoritos ♥</span>' : ''}`
    : '';
  syncURL();
}

function applyFilter(name, value) {
  state[name] = value;
  state.limit = CATALOG_PAGE_SIZE;
  renderCatalog();
}
function resetFilters() {
  Object.assign(state, {
    query: '',
    generation: 0,
    type: 0,
    kind: '',
    sort: 'number',
    forms: false,
    favoritesOnly: false,
    limit: CATALOG_PAGE_SIZE,
  });
  $('#search').value = '';
  $('#type-filter').value = '0';
  $('#kind-filter').value = '';
  $('#sort-filter').value = 'number';
  $('#forms-filter').checked = false;
  renderCatalog();
}

// Aparência: substitui a imagem para invalidar cargas e fallbacks anteriores.
function updateShinyControls() {
  $('#shiny-filter').checked = state.shiny;
  const hero = $('#hero-image');
  const next = hero.cloneNode(false);
  next.dataset.shiny = String(Number(state.shiny));
  delete next.dataset.fallback;
  next.style.opacity = '';
  next.src = artwork({ pokemon: 6 }, state.shiny);
  next.alt = `Ilustração de Charizard${state.shiny ? ' shiny' : ''}`;
  hero.parentElement.querySelector('.image-unavailable')?.remove();
  hero.replaceWith(next);
}

function setShiny(shiny) {
  if (state.shiny === shiny) {
    return;
  }
  state.shiny = shiny;
  updateShinyControls();
  renderCatalog();
  if ($('#pokemon-dialog').open && $('.detail-image')) {
    renderDetail();
    $(`[data-shiny-mode="${Number(shiny)}"]`).focus({ preventScroll: true });
  }
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id)
    ? state.favorites.filter((value) => value !== id)
    : [...state.favorites, id];
  if (!writeFavorites(storage, state.favorites)) {
    toast(
      'Favorito atualizado nesta sessão. O navegador não permitiu salvar para depois.',
    );
  }
  // Atualiza os botões existentes para manter foco e posição do teclado.
  document.querySelectorAll(`[data-favorite="${id}"]`).forEach((button) => {
    const saved = state.favorites.includes(id);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute(
      'aria-label',
      `${saved ? 'Remover dos' : 'Adicionar aos'} favoritos`,
    );
    button.textContent = button.classList.contains('favorite-button')
      ? saved
        ? '♥'
        : '♡'
      : saved
        ? '♥ Favoritado'
        : '♡ Salvar favorito';
  });
  $('#favorite-count').textContent = state.favorites.length;
  if (state.favoritesOnly && !$('#pokemon-dialog').open) {
    renderCatalog();
  }
}

function closeDetail() {
  $('#pokemon-dialog').close();
}

// Ficha: o contador impede que uma resposta antiga substitua a seleção atual.
async function openDetail(id) {
  const form = state.catalog.find((form) => form.id === Number(id));
  if (!form) {
    return;
  }
  const request = ++state.detailRequest;
  state.tabRequest++;
  Object.assign(state, {
    form,
    tab: 'overview',
    entryVersion: null,
    encounterVersion: '',
    moveGroup: '',
    moveQuery: '',
    rows: DETAIL_PAGE_SIZE,
  });
  $('#detail-content').innerHTML =
    `<div class="loading-state"><h2 id="detail-title">${escapeHTML(form.name)}</h2>Carregando ficha…</div>`;
  if (!$('#pokemon-dialog').open) {
    $('#pokemon-dialog').showModal();
  }
  syncURL();
  try {
    const species = await loadSpecies(form.species);
    if (request !== state.detailRequest || !$('#pokemon-dialog').open) {
      return;
    }
    state.species = species;
    renderDetail();
  } catch (error) {
    if (request !== state.detailRequest) {
      return;
    }
    $('#detail-content').innerHTML =
      `<div class="empty-state"><h2 id="detail-title">Falha ao abrir a ficha</h2><p>${escapeHTML(error.message)}</p><button data-open="${form.id}">Tentar novamente</button></div>`;
  }
}

function renderDetail() {
  const form = state.form,
    species = state.species;
  const forms = state.catalog.filter(
    (candidate) => candidate.species === form.species,
  );
  const tabs = [
    ['overview', 'Visão geral'],
    ['types', 'Tipos e vantagens'],
    ['entries', 'Textos dos jogos'],
    ['evolution', 'Evoluções'],
    ['encounters', 'Onde encontrar'],
    ['moves', 'Golpes'],
  ];
  $('#detail-content').innerHTML = [
    `<div class="detail-top type-${form.types[0]}">`,
    `<div class="detail-art">${imageMarkup(form, 'detail-image', true)}<span class="image-caption" id="form-image-caption">`,
    `</span>`,
    `</div>`,
    `<div class="detail-heading">`,
    `<div class="eyebrow">${dexNumber(form.species)} · GERAÇÃO ${form.generation}${form.legendary ? ' · LENDÁRIO' : form.mythical ? ' · MÍTICO' : ''}</div>`,
    `<h2 id="detail-title">${escapeHTML(form.name)}</h2>`,
    `<div>${badges(form.types)}</div>`,
    `<p class="detail-genus">${escapeHTML(species.genus)}${form.battleOnly ? ' · Forma de batalha' : ''}</p>`,
    `<label class="detail-form-select">Forma (${forms.length} disponíveis)<select id="detail-form">${forms.map((candidate) => `<option value="${candidate.id}" ${candidate.id === form.id ? 'selected' : ''}>${escapeHTML(candidate.form || 'Forma padrão')}</option>`).join('')}</select>`,
    `</label>`,
    `<div class="appearance-control" role="group" aria-label="Aparência do Pokémon">`,
    `<button data-shiny-mode="0" aria-pressed="${!state.shiny}">Normal</button>`,
    `<button data-shiny-mode="1" aria-pressed="${state.shiny}">`,
    `<span aria-hidden="true">✦</span> Shiny</button>`,
    `</div>`,
    `<div class="detail-actions">`,
    `<button data-favorite="${form.id}" aria-pressed="${state.favorites.includes(form.id)}">${state.favorites.includes(form.id) ? '♥ Favoritado' : '♡ Salvar favorito'}</button>`,
    `<button id="copy-link">Copiar link ↗</button>`,
    `</div>`,
    `</div>`,
    `</div>`,
    `<div class="detail-tabs" role="tablist" aria-label="Seções da ficha">${tabs.map(([id, label]) => `<button role="tab" aria-controls="detail-panel" id="tab-${id}" data-tab="${id}" aria-selected="${state.tab === id}" tabindex="${state.tab === id ? 0 : -1}" class="${state.tab === id ? 'active' : ''}">${label}</button>`).join('')}</div>`,
    `<div class="detail-body" id="detail-panel" role="tabpanel" aria-labelledby="tab-${state.tab}">`,
    `</div>`,
  ].join('');
  renderPanel();
  const image = $('.detail-image');
  if (image.dataset.formImage) {
    imageCaption(image, 'Buscando sprite específico desta forma…');
    resolveFormImage(image);
  }
}

async function renderPanel() {
  const token = ++state.tabRequest;
  const panel = $('#detail-panel');
  if (!panel) {
    return;
  }
  panel.setAttribute('aria-labelledby', `tab-${state.tab}`);
  try {
    if (state.tab === 'evolution') {
      panel.innerHTML =
        '<div class="loading-state">Carregando família evolutiva…</div>';
      const chain = state.catalog.filter(
        (form) => form.default && form.chain === state.form.chain,
      );
      const details = await Promise.all(
        chain.map((form) => loadSpecies(form.species)),
      );
      // Descarta a família antiga se a pessoa trocar de aba ou de ficha durante a carga.
      if (token !== state.tabRequest || state.tab !== 'evolution') {
        return;
      }
      panel.innerHTML = evolutionPanel(state, chain, details, imageMarkup);
    } else {
      const renderers = {
        overview: overviewPanel,
        types: typesPanel,
        entries: entriesPanel,
        encounters: encountersPanel,
        moves: movesPanel,
      };
      updatePanelSelection(state);
      panel.innerHTML = renderers[state.tab](state);
    }
  } catch (error) {
    if (token === state.tabRequest) {
      panel.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}<button data-retry-panel>Tentar novamente</button></div>`;
    }
  }
}

function selectTab(id) {
  state.tab = id;
  state.rows = DETAIL_PAGE_SIZE;
  document.querySelectorAll('[data-tab]').forEach((button) => {
    const active = button.dataset.tab === id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  renderPanel();
}

// Eventos são agrupados pelo controle que os origina. Os handlers mantêm uma ação por responsabilidade.
function installEvents() {
  installCatalogEvents();
  installNavigationEvents();
  installDialogsEvents();
  installDocumentEvents();
}

function installCatalogEvents() {
  $('#search').addEventListener('input', (event) =>
    applyFilter('query', event.target.value),
  );
  $('#type-filter').addEventListener('change', (event) =>
    applyFilter('type', Number(event.target.value)),
  );
  $('#kind-filter').addEventListener('change', (event) =>
    applyFilter('kind', event.target.value),
  );
  $('#sort-filter').addEventListener('change', (event) =>
    applyFilter('sort', event.target.value),
  );
  $('#forms-filter').addEventListener('change', (event) =>
    applyFilter('forms', event.target.checked),
  );
  $('#shiny-filter').addEventListener('change', (event) =>
    setShiny(event.target.checked),
  );
  $('#load-more').addEventListener('click', () => {
    state.limit += CATALOG_PAGE_SIZE;
    renderCatalog();
  });
}

function installNavigationEvents() {
  $('#featured-open').addEventListener('click', () =>
    openDetail(
      state.catalog.find((form) => form.species === 6 && form.default)?.id,
    ),
  );
  $('#favorites-nav').addEventListener('click', () => {
    applyFilter('favoritesOnly', !state.favoritesOnly);
    $('#catalog').scrollIntoView();
  });
}

function installDialogsEvents() {
  $('#about-open').addEventListener('click', () =>
    $('#about-dialog').showModal(),
  );
  $('#about-close').addEventListener('click', () => $('#about-dialog').close());
  $('#detail-close').addEventListener('click', closeDetail);
  $('#pokemon-dialog').addEventListener('close', () => {
    state.detailRequest++;
    state.tabRequest++;
    syncURL();
    if (state.favoritesOnly) {
      renderCatalog();
    }
  });
  for (const dialog of document.querySelectorAll('dialog')) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        const bounds = dialog.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        ) {
          dialog.close();
        }
      }
    });
  }
}

function installDocumentEvents() {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('change', handleDocumentChange);
  document.addEventListener('input', handleDocumentInput);
  document.addEventListener('keydown', handleDocumentKeydown);
  document.addEventListener('error', handleImageError, true);
}

async function handleDocumentClick(event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }
  if (button.dataset.shinyMode !== undefined) {
    setShiny(button.dataset.shinyMode === '1');
  } else if (button.dataset.open) {
    openDetail(button.dataset.open);
  } else if (button.dataset.favorite) {
    toggleFavorite(Number(button.dataset.favorite));
  } else if (button.dataset.generation !== undefined) {
    applyFilter('generation', Number(button.dataset.generation));
  } else if (button.hasAttribute('data-reset')) {
    resetFilters();
  } else if (button.dataset.tab) {
    selectTab(button.dataset.tab);
  } else if (button.hasAttribute('data-more-rows')) {
    state.rows += DETAIL_PAGE_INCREMENT;
    renderPanel();
  } else if (button.hasAttribute('data-retry-panel')) {
    renderPanel();
  } else if (button.id === 'copy-link') {
    try {
      await navigator.clipboard.writeText(location.href);
      toast('Link da ficha copiado.');
    } catch {
      toast(
        'Copie o endereço da barra do navegador para compartilhar esta ficha.',
      );
    }
  }
}

function handleDocumentChange(event) {
  const target = event.target;
  if (target.id === 'detail-form') {
    openDetail(target.value);
  } else if (target.id === 'entry-language') {
    state.language = Number(target.value);
    state.entryVersion = null;
    renderPanel();
  } else if (target.id === 'entry-version') {
    state.entryVersion = Number(target.value);
    renderPanel();
  } else if (target.id === 'encounter-version') {
    state.encounterVersion = target.value;
    state.rows = DETAIL_PAGE_SIZE;
    renderPanel();
  } else if (target.id === 'move-group') {
    state.moveGroup = Number(target.value);
    state.rows = DETAIL_PAGE_SIZE;
    renderPanel();
  }
}

function handleDocumentInput(event) {
  if (event.target.id !== 'move-search') {
    return;
  }
  const start = event.target.selectionStart;
  state.moveQuery = event.target.value;
  state.rows = DETAIL_PAGE_SIZE;
  renderPanel();
  $('#move-search').focus();
  try {
    $('#move-search').setSelectionRange(start, start);
  } catch {
    /* Alguns navegadores não oferecem seleção em campos search. */
  }
}

function handleDocumentKeydown(event) {
  if (
    event.key === '/' &&
    !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) &&
    !document.querySelector('dialog[open]')
  ) {
    event.preventDefault();
    $('#search').focus();
  }
  const tab = event.target.closest('[role="tab"]');
  if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    let index = tabs.indexOf(tab);
    index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
            tabs.length;
    selectTab(tabs[index].dataset.tab);
    tabs[index].focus();
  }
}

// Inicialização: primeiro os dados, depois os controles, eventos e link direto.
async function init() {
  $('#featured-types').innerHTML = badges([10, 3]);
  try {
    [state.catalog, state.reference, state.manifest] = await Promise.all([
      loadJSON('catalog.json'),
      loadJSON('reference.json'),
      loadJSON('manifest.json'),
    ]);
    const params = new URLSearchParams(location.search);
    state.query = (params.get('q') || '').slice(0, 100);
    state.generation = Math.min(9, Math.max(0, Number(params.get('gen')) || 0));
    state.type = TYPE_NAMES[params.get('type')]
      ? Number(params.get('type'))
      : 0;
    state.forms = params.get('forms') === '1';
    state.shiny = params.get('shiny') === '1';
    $('#search').value = state.query;
    $('#forms-filter').checked = state.forms;
    $('#type-filter').innerHTML += Object.entries(TYPE_NAMES)
      .map(([id, name]) => `<option value="${id}">${name}</option>`)
      .join('');
    $('#type-filter').value = state.type;
    $('#regions').innerHTML = GENERATIONS.slice(1)
      .map(
        (name, i) =>
          `<button class="region" data-generation="${i + 1}"><span>◈</span>${name}<small>${String(i + 1).padStart(2, '0')}</small></button>`,
      )
      .join('');
    $('#form-count').textContent = formatNumber(state.manifest.formCount);
    $('#source-summary').innerHTML =
      facts([
        ['Espécies', formatNumber(state.manifest.speciesCount)],
        ['Formas', formatNumber(state.manifest.formCount)],
        ['Textos dos jogos', formatNumber(state.manifest.descriptionCount)],
      ]) +
      `<p>Revisão da fonte: <a href="https://github.com/PokeAPI/pokeapi/tree/${state.manifest.revision}" target="_blank" rel="noreferrer">${state.manifest.revision.slice(0, 12)} ↗</a>. Encontros e golpes são registros por versão, método e condição.</p>`;
    const deepLink = params.get('pokemon');
    installEvents();
    updateShinyControls();
    renderCatalog();
    if (deepLink) {
      openDetail(deepLink);
    }
  } catch (error) {
    $('#pokemon-grid').innerHTML =
      `<div class="empty-state"><h3>Não foi possível abrir o catálogo.</h3><p>${escapeHTML(error.message)}</p><button id="reload-app">Tentar novamente</button></div>`;
    $('#result-count').textContent = 'Falha no carregamento';
    $('#reload-app').addEventListener('click', () => location.reload());
  }
}

init();
