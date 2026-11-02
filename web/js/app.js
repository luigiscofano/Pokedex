import { TYPE_NAMES, GENERATIONS, STAT_NAMES, normalize, dexNumber, totalStats, filterCatalog, defenseMatchups, offenseMatchups, readFavorites, writeFavorites, evolutionConditions } from './domain.js';
import { loadJSON, loadSpecies, artwork, sprite } from './data.js';

const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const humanize = value => String(value || '').replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
const formatNumber = value => Number(value).toLocaleString('pt-BR');
const languages = { 1: 'Japonês (kana)', 2: 'Japonês romanizado', 3: 'Coreano', 4: 'Chinês tradicional', 5: 'Francês', 6: 'Alemão', 7: 'Espanhol', 8: 'Italiano', 9: 'Inglês', 11: 'Japonês', 12: 'Chinês simplificado', 14: 'Espanhol latino-americano' };
let storage;
try { storage = window.localStorage; } catch { storage = { getItem: () => null, setItem: () => { throw Error('Armazenamento indisponível'); } }; }
const state = { catalog: [], reference: {}, manifest: {}, query: '', generation: 0, type: 0, kind: '', sort: 'number', forms: false, favoritesOnly: false, favorites: readFavorites(storage), limit: 24, form: null, species: null, tab: 'overview', detailRequest: 0, tabRequest: 0, language: 9, entryVersion: null, encounterVersion: '', moveGroup: '', moveQuery: '', rows: 80 };
let toastTimer;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}

function badges(types) { return types.map(type => `<span class="badge type-${type}">${TYPE_NAMES[type] || ({ 10001: '???', 10002: 'Shadow' })[type] || 'Especial'}</span>`).join(''); }
function imageMarkup(form, className = '', eager = false) {
  return `<img class="${className}" src="${artwork(form)}" data-pokemon="${form.pokemon}" alt="${escapeHTML(form.label)}" width="280" height="280" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function card(form) {
  const saved = state.favorites.includes(form.id);
  return `<article class="pokemon-card type-${form.types[0]}"><button class="favorite-button ${saved ? 'saved' : ''}" data-favorite="${form.id}" aria-label="${saved ? 'Remover' : 'Adicionar'} ${escapeHTML(form.label)} ${saved ? 'dos' : 'aos'} favoritos" aria-pressed="${saved}">${saved ? '♥' : '♡'}</button><button class="card-open" data-open="${form.id}" aria-label="Abrir ficha de ${escapeHTML(form.label)}"><div class="card-art"><span class="dex-id">${dexNumber(form.species)}</span>${imageMarkup(form)}</div><div class="card-info"><h3>${escapeHTML(form.name)}</h3>${state.forms ? `<p class="card-form">${escapeHTML(form.form || 'Forma padrão')}</p>` : ''}<div>${badges(form.types)}</div></div></button></article>`;
}

function syncURL() {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.generation) params.set('gen', state.generation);
  if (state.type) params.set('type', state.type);
  if (state.forms) params.set('forms', '1');
  if (state.form && $('#pokemon-dialog').open) params.set('pokemon', state.form.id);
  const query = params.toString();
  history.replaceState(null, '', `${location.pathname}${query ? '?' + query : ''}${location.hash}`);
}

function renderCatalog() {
  const list = filterCatalog(state.catalog, state);
  $('#pokemon-grid').innerHTML = list.length ? list.slice(0, state.limit).map(card).join('') : '<div class="empty-state"><h3>Nenhum Pokémon por aqui.</h3><p>Tente outro nome ou ajuste os filtros. Para procurar uma forma alternativa, ative “Incluir formas”.</p><button data-reset>Limpar filtros</button></div>';
  $('#result-count').textContent = `${formatNumber(list.length)} ${state.forms ? 'formas' : 'Pokémon'} encontrados`;
  $('#page-count').textContent = list.length ? `Mostrando ${Math.min(state.limit, list.length)} de ${formatNumber(list.length)}` : '';
  $('#load-more').hidden = list.length <= state.limit;
  $('#favorite-count').textContent = state.favorites.length;
  $('#catalog-title').innerHTML = `${state.favoritesOnly ? 'Seus favoritos' : state.generation ? GENERATIONS[state.generation] : 'Pokédex Nacional'}<span>.</span>`;
  document.querySelectorAll('[data-generation]').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.generation) === state.generation);
    button.setAttribute('aria-pressed', String(Number(button.dataset.generation) === state.generation));
  });
  const active = state.query || state.generation || state.type || state.kind || state.favoritesOnly || state.forms;
  $('#active-filters').innerHTML = active ? `<button class="filter-tag" data-reset>Limpar filtros ×</button>${state.favoritesOnly ? '<span class="filter-tag">Somente favoritos ♥</span>' : ''}` : '';
  syncURL();
}

function applyFilter(name, value) { state[name] = value; state.limit = 24; renderCatalog(); }
function resetFilters() {
  Object.assign(state, { query: '', generation: 0, type: 0, kind: '', sort: 'number', forms: false, favoritesOnly: false, limit: 24 });
  $('#search').value = ''; $('#type-filter').value = '0'; $('#kind-filter').value = ''; $('#sort-filter').value = 'number'; $('#forms-filter').checked = false;
  renderCatalog();
}

function toggleFavorite(id) {
  state.favorites = state.favorites.includes(id) ? state.favorites.filter(value => value !== id) : [...state.favorites, id];
  if (!writeFavorites(storage, state.favorites)) toast('Favorito atualizado nesta sessão. O navegador não permitiu salvar para depois.');
  // Atualiza os botões existentes para manter foco e posição do teclado.
  document.querySelectorAll(`[data-favorite="${id}"]`).forEach(button => {
    const saved = state.favorites.includes(id);
    button.classList.toggle('saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remover dos' : 'Adicionar aos'} favoritos`);
    button.textContent = button.classList.contains('favorite-button') ? (saved ? '♥' : '♡') : (saved ? '♥ Favoritado' : '♡ Salvar favorito');
  });
  $('#favorite-count').textContent = state.favorites.length;
  if (state.favoritesOnly && !$('#pokemon-dialog').open) renderCatalog();
}

function currentPokemon() { return state.species.varieties.find(p => p.id === state.form.pokemon); }
function closeDetail() {
  $('#pokemon-dialog').close();
}

async function openDetail(id) {
  const form = state.catalog.find(p => p.id === Number(id));
  if (!form) return;
  const request = ++state.detailRequest;
  state.tabRequest++;
  Object.assign(state, { form, tab: 'overview', entryVersion: null, encounterVersion: '', moveGroup: '', moveQuery: '', rows: 80 });
  $('#detail-content').innerHTML = `<div class="loading-state"><h2 id="detail-title">${escapeHTML(form.name)}</h2>Carregando ficha…</div>`;
  if (!$('#pokemon-dialog').open) $('#pokemon-dialog').showModal();
  syncURL();
  try {
    const species = await loadSpecies(form.species);
    if (request !== state.detailRequest || !$('#pokemon-dialog').open) return;
    state.species = species;
    renderDetail();
  } catch (error) {
    if (request !== state.detailRequest) return;
    $('#detail-content').innerHTML = `<div class="empty-state"><h2 id="detail-title">Falha ao abrir a ficha</h2><p>${escapeHTML(error.message)}</p><button data-open="${form.id}">Tentar novamente</button></div>`;
  }
}

function renderDetail() {
  const f = state.form, s = state.species;
  const forms = state.catalog.filter(p => p.species === f.species);
  const tabs = [['overview', 'Visão geral'], ['types', 'Tipos e vantagens'], ['entries', 'Textos dos jogos'], ['evolution', 'Evoluções'], ['encounters', 'Onde encontrar'], ['moves', 'Golpes']];
  $('#detail-content').innerHTML = `<div class="detail-top type-${f.types[0]}"><div class="detail-art">${imageMarkup(f, 'detail-image', true)}<span class="image-caption" id="form-image-caption"></span></div><div class="detail-heading"><div class="eyebrow">${dexNumber(f.species)} · GERAÇÃO ${f.generation}${f.legendary ? ' · LENDÁRIO' : f.mythical ? ' · MÍTICO' : ''}</div><h2 id="detail-title">${escapeHTML(f.name)}</h2><div>${badges(f.types)}</div><p class="detail-genus">${escapeHTML(s.genus)}${f.battleOnly ? ' · Forma de batalha' : ''}</p><label class="detail-form-select">Forma (${forms.length} disponíveis)<select id="detail-form">${forms.map(p => `<option value="${p.id}" ${p.id === f.id ? 'selected' : ''}>${escapeHTML(p.form || 'Forma padrão')}</option>`).join('')}</select></label><div class="detail-actions"><button data-favorite="${f.id}" aria-pressed="${state.favorites.includes(f.id)}">${state.favorites.includes(f.id) ? '♥ Favoritado' : '♡ Salvar favorito'}</button><button id="copy-link">Copiar link ↗</button></div></div></div><div class="detail-tabs" role="tablist" aria-label="Seções da ficha">${tabs.map(([id, label]) => `<button role="tab" aria-controls="detail-panel" id="tab-${id}" data-tab="${id}" aria-selected="${state.tab === id}" tabindex="${state.tab === id ? 0 : -1}" class="${state.tab === id ? 'active' : ''}">${label}</button>`).join('')}</div><div class="detail-body" id="detail-panel" role="tabpanel" aria-labelledby="tab-${state.tab}"></div>`;
  renderPanel();
  resolveCosmeticImage(f);
}

async function resolveCosmeticImage(form) {
  const shared = state.catalog.filter(p => p.pokemon === form.pokemon);
  if (form.default || shared.length < 2) return;
  $('#form-image-caption').textContent = 'Buscando sprite específico desta forma…';
  try {
    const response = await fetch(`https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2/pokemon-form/${form.id}/index.json`);
    if (!response.ok) throw Error('Sprite indisponível');
    const data = await response.json();
    if (state.form?.id !== form.id || !$('#pokemon-dialog').open) return;
    const source = data.sprites?.front_default;
    if (source && new URL(source).hostname === 'raw.githubusercontent.com') {
      $('.detail-image').src = source;
      $('#form-image-caption').textContent = 'Sprite da forma selecionada';
    } else $('#form-image-caption').textContent = 'Ilustração de referência da variedade; sprite desta forma indisponível.';
  } catch {
    if (state.form?.id === form.id && $('#form-image-caption')) $('#form-image-caption').textContent = 'Ilustração de referência da variedade; sprite desta forma indisponível.';
  }
}

function facts(items) { return `<dl class="facts">${items.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>`; }

function overviewPanel() {
  const p = currentPokemon(), s = state.species;
  const gender = s.genderRate === -1 ? 'Sem gênero' : `${s.genderRate / 8 * 100}% ♀`;
  return `<div class="two-column"><div><section class="panel"><h3>Conheça ${escapeHTML(s.name)}</h3>${facts([['Altura', `${p.height.toLocaleString('pt-BR')} m`], ['Peso', `${p.weight.toLocaleString('pt-BR')} kg`], ['Experiência base', p.experience ?? 'Sem dado'], ['Taxa de captura', s.captureRate], ['Amizade base', s.baseHappiness ?? 'Sem dado'], ['Gênero', gender]])}<p class="note">Taxa de captura é um parâmetro de 0 a 255, não uma porcentagem. Gênero e reprodução são informações da espécie.</p></section><section class="panel"><h3>Habilidades</h3>${p.abilities.map(([id, hidden]) => { const a = state.reference.abilities[id]; return `<div class="ability"><strong>${escapeHTML(a?.name || id)}${hidden ? ' <span class="badge">Oculta</span>' : ''}</strong><p>${escapeHTML(a?.effect || 'Descrição não disponível na fonte.')}</p></div>`; }).join('')}<p class="note">Descrições de habilidades no idioma da fonte (inglês).</p></section></div><div><section class="panel"><h3>Atributos base</h3>${p.stats.map((value, i) => `<div class="stat-row"><span>${STAT_NAMES[i]}</span><strong>${value}</strong><div class="stat-track"><div class="stat-fill" style="width:${Math.min(100, value / 255 * 100)}%"></div></div></div>`).join('')}<div class="stat-total"><span>Total</span><strong>${totalStats(p)}</strong></div><p class="note">Valores base da variedade selecionada; não são os atributos finais de um Pokémon treinado.</p></section><section class="panel"><h3>Criação e treinamento</h3>${facts([['Grupos de ovos', s.eggGroups.map(id => humanize(state.reference.eggGroups[id])).join(' / ') || 'Sem dado'], ['Ciclos de eclosão', s.hatchCounter ?? 'Sem dado'], ['EVs concedidos', p.effort.map((n, i) => n ? `${n} ${STAT_NAMES[i]}` : '').filter(Boolean).join(', ') || '0']])}</section></div></div>`;
}

function matchupGroup(title, values) { return `<div class="match-group"><h4>${title}</h4><div class="matchups">${values.length ? values.map(v => `<span class="matchup">${badges([v.type])}<strong>${String(v.multiplier).replace('.', ',')}×</strong></span>`).join('') : '<span class="note">Nenhum tipo nesta categoria.</span>'}</div></div>`; }
function typesPanel() {
  if (state.form.types.some(type => !TYPE_NAMES[type])) return '<div class="empty-state"><h3>Forma com tipo especial histórico.</h3><p>A fonte registra esta forma com tipo “???”. Ela não participa da tabela moderna de 18 tipos, por isso não são calculadas vantagens ou fraquezas para ela.</p></div>';
  const defensive = defenseMatchups(state.form.types, state.reference.efficacy);
  const offensive = offenseMatchups(state.form.types, state.reference.efficacy);
  return `<div class="two-column"><section class="panel"><h3>Quando recebe um golpe</h3>${matchupGroup('Fraquezas', defensive.filter(v => v.multiplier > 1))}${matchupGroup('Resistências', defensive.filter(v => v.multiplier > 0 && v.multiplier < 1))}${matchupGroup('Imunidades', defensive.filter(v => v.multiplier === 0))}${matchupGroup('Dano neutro', defensive.filter(v => v.multiplier === 1))}</section><section class="panel"><h3>Vantagens ao atacar</h3>${matchupGroup('Super eficaz contra', offensive.filter(v => v.multiplier > 1))}${matchupGroup('Melhor opção neutra', offensive.filter(v => v.multiplier === 1))}${matchupGroup('Ambos os tipos têm dificuldade contra', offensive.filter(v => v.multiplier < 1))}<p class="note">Mostra a melhor eficácia entre os tipos próprios de ${escapeHTML(state.form.name)} contra um alvo de tipo único. Não inclui todos os golpes que ele pode aprender, STAB ou alvos com dois tipos.</p></section></div><p class="note">Regras modernas (a partir da geração VI). Os fatores dos dois tipos defensivos são multiplicados: 2 × 2 = 4×; 2 × 0,5 = 1×. Habilidades como Levitate, itens, clima e Terastalização não entram neste cálculo.</p>`;
}

function entriesPanel() {
  const entries = state.species.flavor;
  if (!entries.length) return '<div class="empty-state">A fonte não tem textos de Pokédex para esta espécie.</div>';
  const availableLanguages = [...new Set(entries.map(e => e[1]))].sort((a, b) => a - b);
  if (!availableLanguages.includes(state.language)) state.language = availableLanguages.includes(9) ? 9 : availableLanguages[0];
  const list = entries.filter(e => e[1] === state.language);
  if (!list.some(e => e[0] === state.entryVersion)) state.entryVersion = list[list.length - 1][0];
  const entry = list.find(e => e[0] === state.entryVersion);
  return `<h3>Uma história em cada versão</h3><p class="note">Textos originais da Pokédex dos jogos. Estas entradas descrevem a espécie; a fonte nem sempre separa o texto de cada forma.</p><div class="entry-selectors"><label>Idioma<select id="entry-language">${availableLanguages.map(id => `<option value="${id}" ${id === state.language ? 'selected' : ''}>${escapeHTML(languages[id] || state.reference.languages[id])}</option>`).join('')}</select></label><label>Jogo<select id="entry-version">${list.map(e => `<option value="${e[0]}" ${e[0] === state.entryVersion ? 'selected' : ''}>${escapeHTML(state.reference.versions[e[0]]?.name || e[0])}</option>`).join('')}</select></label></div><blockquote class="flavor-text">${escapeHTML(entry[2])}</blockquote><p class="entry-meta">Pokémon ${escapeHTML(state.reference.versions[entry[0]]?.name)} · ${escapeHTML(languages[state.language] || state.reference.languages[state.language])}<br>${list.length} entradas neste idioma · ${entries.length} entradas nesta espécie</p><p class="note">Português não está disponível para estas entradas na fonte. A interface não apresenta traduções automáticas como texto oficial.</p>`;
}

async function evolutionPanel(token) {
  const chain = state.catalog.filter(p => p.default && p.chain === state.form.chain);
  const details = await Promise.all(chain.map(p => loadSpecies(p.species)));
  if (token !== state.tabRequest || state.tab !== 'evolution') return;
  const parentName = id => details.find(s => s.id === id)?.name || `#${id}`;
  $('#detail-panel').innerHTML = `<h3>Família evolutiva</h3><p class="note">Condições preservadas por grupo de versões. Ramos diferentes são alternativas; regras específicas de forma aparecem nos requisitos. Formas Mega e outras transformações de batalha ficam no seletor de formas, pois não são evoluções permanentes.</p><div class="evolution-tree">${details.map(s => {
    const form = chain.find(p => p.species === s.id);
    const rules = s.evolutions;
    const grouped = new Map();
    for (const rule of rules) {
      const text = evolutionConditions(rule, state.reference, state.catalog);
      if (!grouped.has(text)) grouped.set(text, []);
      const group = state.reference.versionGroups[rule.version_group_id]?.name;
      if (group && !grouped.get(text).includes(group)) grouped.get(text).push(group);
    }
    return `<div class="evolution-node"><button class="evolution-pokemon" data-open="${form.id}">${imageMarkup(form)}<small>${dexNumber(s.id)}</small><strong>${escapeHTML(s.name)}</strong></button><div>${s.parent ? `<p class="note">Evolui de <strong>${escapeHTML(parentName(s.parent))}</strong></p>` : '<p class="note">Início desta família evolutiva</p>'}${grouped.size ? [...grouped.entries()].map(([condition, games]) => `<div class="evolution-rule"><strong>${escapeHTML(games.join(' · ') || 'Condição registrada na fonte')}</strong>${escapeHTML(condition)}</div>`).join('') : `<p class="note">${s.parent ? 'Condições não detalhadas na base.' : details.length === 1 ? 'Nenhuma evolução permanente registrada para esta espécie.' : 'Consulte os próximos membros para ver os requisitos.'}</p>`}</div></div>`;
  }).join('')}</div>`;
}

function encountersPanel() {
  const p = currentPokemon(), s = state.species;
  const versions = [...new Set(p.encounters.map(e => e[0]))].sort((a, b) => a - b);
  const selected = state.encounterVersion ? p.encounters.filter(e => e[0] === Number(state.encounterVersion)) : p.encounters;
  const title = '<h3>Onde encontrar</h3><p class="note">Registros de encontros por versão, área, método e condições. As chances pertencem a slots e não devem ser somadas sem considerar suas condições.</p>';
  const dexes = `<section class="panel" style="margin-top:24px"><h3>Pokédex regionais e especiais</h3><div class="dex-list">${s.dexes.map(([id, num]) => `<span class="dex-item">${escapeHTML(humanize(state.reference.pokedexes[id]))} · #${num}</span>`).join('') || '<span class="note">Sem registro.</span>'}</div><p class="note">Número em uma Pokédex não equivale a uma localização de captura.</p></section>`;
  if (!p.encounters.length) return title + '<div class="empty-state"><h3>Sem encontros registrados para esta variedade.</h3><p>Isso não significa que ela seja impossível de obter. Evoluções, trocas, eventos, presentes e jogos recentes podem não estar cobertos pela tabela de encontros.</p></div>' + dexes;
  return title + `<div class="table-filters"><label>Jogo<select id="encounter-version"><option value="">Todos os jogos com registros</option>${versions.map(id => `<option value="${id}" ${Number(state.encounterVersion) === id ? 'selected' : ''}>${escapeHTML(state.reference.versions[id]?.name || id)}</option>`).join('')}</select></label></div><div class="table-wrap"><table><thead><tr><th>Jogo e localização</th><th>Método e condições</th><th>Níveis</th><th>Slot</th></tr></thead><tbody>${selected.slice(0, state.rows).map(e => { const area = state.reference.areas[e[1]]; return `<tr><td><strong>${escapeHTML(area?.location || e[1])}</strong><p>${escapeHTML(area?.area || '')}<br>Pokémon ${escapeHTML(state.reference.versions[e[0]]?.name || e[0])}</p></td><td>${escapeHTML(state.reference.encounterMethods[e[2]] || e[2])}<p>${escapeHTML(e[6].map(id => state.reference.encounterConditions[id] || id).join(' · ') || 'Sem condição adicional registrada')}</p></td><td>${e[3]}–${e[4]}</td><td>${e[5] === null ? '—' : e[5] + '%'}</td></tr>`; }).join('')}</tbody></table></div><p class="note">Mostrando ${Math.min(state.rows, selected.length)} de ${formatNumber(selected.length)} registros. Nomes de áreas e condições preservados em inglês.</p>${selected.length > state.rows ? '<button class="secondary" data-more-rows>Mostrar mais registros ↓</button>' : ''}` + dexes;
}

const moveMethodNames = { 'level-up': 'Nível', egg: 'Ovo', tutor: 'Tutor', machine: 'Máquina', 'stadium-surfing-pikachu': 'Evento Stadium', 'light-ball-egg': 'Ovo com Light Ball', 'colosseum-purification': 'Purificação', 'xd-shadow': 'Shadow (XD)', 'xd-purification': 'Purificação (XD)', 'form-change': 'Mudança de forma', 'zygarde-cube': 'Zygarde Cube' };
function movesPanel() {
  const p = currentPokemon();
  const groups = [...new Set(p.moves.map(m => m[0]))].sort((a, b) => (state.reference.versionGroups[b]?.order || b) - (state.reference.versionGroups[a]?.order || a));
  if (!groups.length) return '<div class="empty-state">Nenhum aprendizado de golpe registrado para esta variedade.</div>';
  if (!groups.includes(Number(state.moveGroup))) state.moveGroup = groups[0];
  const list = p.moves.filter(m => m[0] === Number(state.moveGroup) && (!state.moveQuery || normalize(state.reference.moves[m[1]]?.name).includes(normalize(state.moveQuery)))).sort((a, b) => a[2] - b[2] || a[3] - b[3] || a[1] - b[1]);
  return `<h3>Golpes e aprendizado</h3><p class="note">Escolha a versão para consultar o repertório daquela variedade. Um golpe aprendido em outro jogo não é automaticamente válido na versão selecionada.</p><div class="table-filters"><label>Versão<select id="move-group">${groups.map(id => `<option value="${id}" ${Number(state.moveGroup) === id ? 'selected' : ''}>${escapeHTML(state.reference.versionGroups[id]?.name || id)}</option>`).join('')}</select></label><label>Nome<input id="move-search" type="search" value="${escapeHTML(state.moveQuery)}" placeholder="Buscar golpe em inglês" style="padding:9px;border:1px solid var(--line);border-radius:6px;max-width:200px"></label></div><div class="table-wrap"><table><thead><tr><th>Golpe</th><th>Tipo / classe</th><th>Aprendizado</th><th>Poder</th><th>Precisão</th><th>PP</th></tr></thead><tbody>${list.slice(0, state.rows).map(m => { const move = state.reference.moves[m[1]]; if (!move) return ''; const method = state.reference.moveMethods[m[2]]; return `<tr><td><strong>${escapeHTML(move.name)}</strong><p>${escapeHTML(move.effect || 'Efeito não descrito na fonte.')}</p></td><td>${badges([move.type])}<p>${({ 1: 'Status', 2: 'Físico', 3: 'Especial' })[move.class] || '—'}</p></td><td>${escapeHTML(moveMethodNames[method] || humanize(method))}${m[2] === 1 ? ' · ' + m[3] : ''}${m[4] ? `<p>Maestria: ${m[4]}</p>` : ''}</td><td>${move.power ?? '—'}</td><td>${move.accuracy === null ? '—' : move.accuracy + '%'}</td><td>${move.pp ?? '—'}</td></tr>`; }).join('') || '<tr><td colspan="6">Nenhum golpe corresponde à busca.</td></tr>'}</tbody></table></div><p class="note">${Math.min(state.rows, list.length)} de ${formatNumber(list.length)} registros. Efeitos e atributos dos golpes usam a definição atual da fonte; alterações históricas de poder, precisão e efeitos não são reconstruídas.</p>${list.length > state.rows ? '<button class="secondary" data-more-rows>Mostrar mais golpes ↓</button>' : ''}`;
}

async function renderPanel() {
  const token = ++state.tabRequest;
  const panel = $('#detail-panel');
  if (!panel) return;
  panel.setAttribute('aria-labelledby', `tab-${state.tab}`);
  try {
    if (state.tab === 'evolution') {
      panel.innerHTML = '<div class="loading-state">Carregando família evolutiva…</div>';
      await evolutionPanel(token);
    } else {
      const renderers = { overview: overviewPanel, types: typesPanel, entries: entriesPanel, encounters: encountersPanel, moves: movesPanel };
      panel.innerHTML = renderers[state.tab]();
    }
  } catch (error) {
    if (token === state.tabRequest) panel.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}<button data-retry-panel>Tentar novamente</button></div>`;
  }
}

function selectTab(id) {
  state.tab = id; state.rows = 80;
  document.querySelectorAll('[data-tab]').forEach(button => {
    const active = button.dataset.tab === id;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  renderPanel();
}

function installEvents() {
  $('#search').addEventListener('input', event => applyFilter('query', event.target.value));
  $('#type-filter').addEventListener('change', event => applyFilter('type', Number(event.target.value)));
  $('#kind-filter').addEventListener('change', event => applyFilter('kind', event.target.value));
  $('#sort-filter').addEventListener('change', event => applyFilter('sort', event.target.value));
  $('#forms-filter').addEventListener('change', event => applyFilter('forms', event.target.checked));
  $('#load-more').addEventListener('click', () => {
    state.limit += 24;
    renderCatalog();
  });
  $('#featured-open').addEventListener('click', () => openDetail(state.catalog.find(p => p.species === 6 && p.default)?.id));
  $('#favorites-nav').addEventListener('click', () => { applyFilter('favoritesOnly', !state.favoritesOnly); $('#catalog').scrollIntoView(); });
  $('#about-open').addEventListener('click', () => $('#about-dialog').showModal());
  $('#about-close').addEventListener('click', () => $('#about-dialog').close());
  $('#detail-close').addEventListener('click', closeDetail);
  $('#pokemon-dialog').addEventListener('close', () => { state.detailRequest++; state.tabRequest++; syncURL(); if (state.favoritesOnly) renderCatalog(); });
  for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  document.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.open) openDetail(button.dataset.open);
    else if (button.dataset.favorite) toggleFavorite(Number(button.dataset.favorite));
    else if (button.dataset.generation !== undefined) applyFilter('generation', Number(button.dataset.generation));
    else if (button.hasAttribute('data-reset')) resetFilters();
    else if (button.dataset.tab) selectTab(button.dataset.tab);
    else if (button.hasAttribute('data-more-rows')) { state.rows += 100; renderPanel(); }
    else if (button.hasAttribute('data-retry-panel')) renderPanel();
    else if (button.id === 'copy-link') {
      try { await navigator.clipboard.writeText(location.href); toast('Link da ficha copiado.'); }
      catch { toast('Copie o endereço da barra do navegador para compartilhar esta ficha.'); }
    }
  });
  document.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'detail-form') openDetail(target.value);
    else if (target.id === 'entry-language') { state.language = Number(target.value); state.entryVersion = null; renderPanel(); }
    else if (target.id === 'entry-version') { state.entryVersion = Number(target.value); renderPanel(); }
    else if (target.id === 'encounter-version') { state.encounterVersion = target.value; state.rows = 80; renderPanel(); }
    else if (target.id === 'move-group') { state.moveGroup = Number(target.value); state.rows = 80; renderPanel(); }
  });
  document.addEventListener('input', event => {
    if (event.target.id !== 'move-search') return;
    const start = event.target.selectionStart;
    state.moveQuery = event.target.value; state.rows = 80;
    renderPanel();
    $('#move-search').focus();
    try { $('#move-search').setSelectionRange(start, start); } catch { /* Alguns navegadores não oferecem seleção em campos search. */ }
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !document.querySelector('dialog[open]')) { event.preventDefault(); $('#search').focus(); }
    const tab = event.target.closest('[role="tab"]');
    if (tab && ['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = [...document.querySelectorAll('[role="tab"]')];
      let index = tabs.indexOf(tab);
      index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[index].dataset.tab); tabs[index].focus();
    }
  });
  // O fallback é explícito e não pode entrar em loop.
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.pokemon) return;
    if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = sprite({ pokemon: img.dataset.pokemon }); }
    else if (img.dataset.fallback === '1') { img.dataset.fallback = '2'; img.src = new URL('../icon.svg', import.meta.url).href; img.alt = 'Imagem indisponível'; img.style.opacity = '.25'; }
  }, true);
}

async function init() {
  try {
    [state.catalog, state.reference, state.manifest] = await Promise.all([loadJSON('catalog.json'), loadJSON('reference.json'), loadJSON('manifest.json')]);
    const params = new URLSearchParams(location.search);
    state.query = (params.get('q') || '').slice(0, 100);
    state.generation = Math.min(9, Math.max(0, Number(params.get('gen')) || 0));
    state.type = TYPE_NAMES[params.get('type')] ? Number(params.get('type')) : 0;
    state.forms = params.get('forms') === '1';
    $('#search').value = state.query;
    $('#forms-filter').checked = state.forms;
    $('#type-filter').innerHTML += Object.entries(TYPE_NAMES).map(([id, name]) => `<option value="${id}">${name}</option>`).join('');
    $('#type-filter').value = state.type;
    $('#regions').innerHTML = GENERATIONS.slice(1).map((name, i) => `<button class="region" data-generation="${i + 1}"><span>◈</span>${name}<small>${String(i + 1).padStart(2, '0')}</small></button>`).join('');
    $('#form-count').textContent = formatNumber(state.manifest.formCount);
    $('#source-summary').innerHTML = facts([['Espécies', formatNumber(state.manifest.speciesCount)], ['Formas', formatNumber(state.manifest.formCount)], ['Textos dos jogos', formatNumber(state.manifest.descriptionCount)]]) + `<p>Revisão da fonte: <a href="https://github.com/PokeAPI/pokeapi/tree/${state.manifest.revision}" target="_blank" rel="noreferrer">${state.manifest.revision.slice(0, 12)} ↗</a>. Encontros e golpes são registros por versão, método e condição.</p>`;
    const deepLink = params.get('pokemon');
    installEvents();
    renderCatalog();
    if (deepLink) openDetail(deepLink);
  } catch (error) {
    $('#pokemon-grid').innerHTML = `<div class="empty-state"><h3>Não foi possível abrir o catálogo.</h3><p>${escapeHTML(error.message)}</p><button id="reload-app">Tentar novamente</button></div>`;
    $('#result-count').textContent = 'Falha no carregamento';
    $('#reload-app').addEventListener('click', () => location.reload());
  }
}

init();
