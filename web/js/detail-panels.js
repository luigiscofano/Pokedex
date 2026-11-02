import {
  TYPE_NAMES,
  STAT_NAMES,
  normalize,
  dexNumber,
  totalStats,
  defenseMatchups,
  offenseMatchups,
  evolutionConditions,
} from './domain.js';
import {
  escapeHTML,
  humanize,
  formatNumber,
  badges,
  facts,
  matchupGroup,
} from './presentation.js';

// Painéis geram HTML a partir da seleção recebida; eventos e requisições ficam no controlador.
const languages = {
  1: 'Japonês (kana)',
  2: 'Japonês romanizado',
  3: 'Coreano',
  4: 'Chinês tradicional',
  5: 'Francês',
  6: 'Alemão',
  7: 'Espanhol',
  8: 'Italiano',
  9: 'Inglês',
  11: 'Japonês',
  12: 'Chinês simplificado',
  14: 'Espanhol latino-americano',
};
const moveMethodNames = {
  'level-up': 'Nível',
  egg: 'Ovo',
  tutor: 'Tutor',
  machine: 'Máquina',
  'stadium-surfing-pikachu': 'Evento Stadium',
  'light-ball-egg': 'Ovo com Light Ball',
  'colosseum-purification': 'Purificação',
  'xd-shadow': 'Shadow (XD)',
  'xd-purification': 'Purificação (XD)',
  'form-change': 'Mudança de forma',
  'zygarde-cube': 'Zygarde Cube',
  train: 'Treinamento',
};

function currentPokemon(state) {
  return state.species.varieties.find(
    (variety) => variety.id === state.form.pokemon,
  );
}

// Visão geral: valores da variedade e parâmetros da espécie.
export function overviewPanel(state) {
  const variety = currentPokemon(state),
    species = state.species;
  const gender =
    species.genderRate === -1
      ? 'Sem gênero'
      : `${((species.genderRate / 8) * 100).toLocaleString('pt-BR')}% ♀`;
  return [
    `<div class="two-column">`,
    `<div>`,
    `<section class="panel">`,
    `<h3>Conheça ${escapeHTML(species.name)}</h3>${facts([
      ['Altura', `${variety.height.toLocaleString('pt-BR')} m`],
      ['Peso', `${variety.weight.toLocaleString('pt-BR')} kg`],
      ['Experiência base', variety.experience ?? 'Sem dado'],
      ['Taxa de captura', species.captureRate],
      ['Amizade base', species.baseHappiness ?? 'Sem dado'],
      ['Gênero', gender],
    ])}<p class="note">Taxa de captura é um parâmetro de 0 a 255, não uma porcentagem. Gênero e reprodução são informações da espécie.</p>`,
    `</section>`,
    `<section class="panel">`,
    `<h3>Habilidades</h3>${variety.abilities
      .map((record) => abilityMarkup(record, state.reference.abilities))
      .join(
        '',
      )}<p class="note">Descrições de habilidades no idioma da fonte (inglês).</p>`,
    `</section>`,
    `</div>`,
    `<div>`,
    `<section class="panel">`,
    `<h3>Atributos base</h3>${variety.stats
      .map(statMarkup)
      .join('')}<div class="stat-total">`,
    `<span>Total</span>`,
    `<strong>${totalStats(variety)}</strong>`,
    `</div>`,
    `<p class="note">Valores base da variedade selecionada; não são os atributos finais de um Pokémon treinado.</p>`,
    `</section>`,
    `<section class="panel">`,
    `<h3>Criação e treinamento</h3>${facts([
      [
        'Grupos de ovos',
        species.eggGroups
          .map((id) => humanize(state.reference.eggGroups[id]))
          .join(' / ') || 'Sem dado',
      ],
      ['Ciclos de eclosão', species.hatchCounter ?? 'Sem dado'],
      [
        'EVs concedidos',
        variety.effort
          .map((n, statIndex) => (n ? `${n} ${STAT_NAMES[statIndex]}` : ''))
          .filter(Boolean)
          .join(', ') || '0',
      ],
    ])}</section>`,
    `</div>`,
    `</div>`,
  ].join('');
}

// Tipos: regras modernas, com ausência explícita de tipos especiais.
export function typesPanel(state) {
  if (state.form.types.some((type) => !TYPE_NAMES[type])) {
    return '<div class="empty-state"><h3>Forma com tipo especial histórico.</h3><p>A fonte registra esta forma com tipo “???”. Ela não participa da tabela moderna de 18 tipos, por isso não são calculadas vantagens ou fraquezas para ela.</p></div>';
  }
  const defensive = defenseMatchups(state.form.types, state.reference.efficacy);
  const offensive = offenseMatchups(state.form.types, state.reference.efficacy);
  return [
    `<div class="two-column">`,
    `<section class="panel">`,
    `<h3>Quando recebe um golpe</h3>${matchupGroup(
      'Fraquezas',
      defensive.filter((matchup) => matchup.multiplier > 1),
    )}${matchupGroup(
      'Resistências',
      defensive.filter(
        (matchup) => matchup.multiplier > 0 && matchup.multiplier < 1,
      ),
    )}${matchupGroup(
      'Imunidades',
      defensive.filter((matchup) => matchup.multiplier === 0),
    )}${matchupGroup(
      'Dano neutro',
      defensive.filter((matchup) => matchup.multiplier === 1),
    )}</section>`,
    `<section class="panel">`,
    `<h3>Vantagens ao atacar</h3>${matchupGroup(
      'Super eficaz contra',
      offensive.filter((matchup) => matchup.multiplier > 1),
    )}${matchupGroup(
      'Melhor opção neutra',
      offensive.filter((matchup) => matchup.multiplier === 1),
    )}${matchupGroup(
      'Ambos os tipos têm dificuldade contra',
      offensive.filter((matchup) => matchup.multiplier < 1),
    )}<p class="note">Mostra a melhor eficácia entre os tipos próprios de ${escapeHTML(state.form.name)} contra um alvo de tipo único. Não inclui todos os golpes que ele pode aprender, STAB ou alvos com dois tipos.</p>`,
    `</section>`,
    `</div>`,
    `<p class="note">Regras modernas (a partir da geração VI). Os fatores dos dois tipos defensivos são multiplicados: 2 × 2 = 4×; 2 × 0,5 = 1×. Habilidades como Levitate, itens, clima e Terastalização não entram neste cálculo.</p>`,
  ].join('');
}

// Textos: a seleção já foi validada antes da renderização.
export function entriesPanel(state) {
  const entries = state.species.flavor;
  if (!entries.length) {
    return '<div class="empty-state">A fonte não tem textos de Pokédex para esta espécie.</div>';
  }
  const availableLanguages = [
    ...new Set(entries.map((entry) => entry[1])),
  ].sort((ability, b) => ability - b);
  const list = entries.filter((entry) => entry[1] === state.language);
  const entry = list.find((entry) => entry[0] === state.entryVersion);
  return [
    `<h3>Uma história em cada versão</h3>`,
    `<p class="note">Textos originais da Pokédex dos jogos. Estas entradas descrevem a espécie; a fonte nem sempre separa o texto de cada forma.</p>`,
    `<div class="entry-selectors">`,
    `<label>Idioma<select id="entry-language">${availableLanguages.map((id) => `<option value="${id}" ${id === state.language ? 'selected' : ''}>${escapeHTML(languages[id] || state.reference.languages[id])}</option>`).join('')}</select>`,
    `</label>`,
    `<label>Jogo<select id="entry-version">${list.map((entry) => `<option value="${entry[0]}" ${entry[0] === state.entryVersion ? 'selected' : ''}>${escapeHTML(state.reference.versions[entry[0]]?.name || entry[0])}</option>`).join('')}</select>`,
    `</label>`,
    `</div>`,
    `<blockquote class="flavor-text">${escapeHTML(entry[2])}</blockquote>`,
    `<p class="entry-meta">Pokémon ${escapeHTML(state.reference.versions[entry[0]]?.name)} · ${escapeHTML(languages[state.language] || state.reference.languages[state.language])}<br>${list.length} entradas neste idioma · ${entries.length} entradas nesta espécie</p>`,
    `<p class="note">Português não está disponível para estas entradas na fonte. A interface não apresenta traduções automáticas como texto oficial.</p>`,
  ].join('');
}

// Encontros: cada linha mantém seu jogo, slot e condições.
export function encountersPanel(state) {
  const variety = currentPokemon(state),
    species = state.species;
  const versions = [
    ...new Set(variety.encounters.map((entry) => entry[0])),
  ].sort((ability, b) => ability - b);
  const selected = state.encounterVersion
    ? variety.encounters.filter(
        (entry) => entry[0] === Number(state.encounterVersion),
      )
    : variety.encounters;
  const title =
    '<h3>Onde encontrar</h3><p class="note">Registros de encontros por versão, área, método e condições. As chances pertencem a slots e não devem ser somadas sem considerar suas condições.</p>';
  const dexes = [
    `<section class="panel" style="margin-top:24px">`,
    `<h3>Pokédex regionais e especiais</h3>`,
    `<div class="dex-list">${species.dexes.map(([id, num]) => `<span class="dex-item">${escapeHTML(humanize(state.reference.pokedexes[id]))} · #${num}</span>`).join('') || '<span class="note">Sem registro.</span>'}</div>`,
    `<p class="note">Número em uma Pokédex não equivale a uma localização de captura.</p>`,
    `</section>`,
  ].join('');
  if (!variety.encounters.length) {
    return (
      title +
      '<div class="empty-state"><h3>Sem encontros registrados para esta variedade.</h3><p>Isso não significa que ela seja impossível de obter. Evoluções, trocas, eventos, presentes e jogos recentes podem não estar cobertos pela tabela de encontros.</p></div>' +
      dexes
    );
  }
  return (
    title +
    [
      `<div class="table-filters">`,
      `<label>Jogo<select id="encounter-version">`,
      `<option value="">Todos os jogos com registros</option>${versions.map((id) => `<option value="${id}" ${Number(state.encounterVersion) === id ? 'selected' : ''}>${escapeHTML(state.reference.versions[id]?.name || id)}</option>`).join('')}</select>`,
      `</label>`,
      `</div>`,
      `<div class="table-wrap">`,
      `<table>`,
      `<thead>`,
      `<tr>`,
      `<th>Jogo e localização</th>`,
      `<th>Método e condições</th>`,
      `<th>Níveis</th>`,
      `<th>Slot</th>`,
      `</tr>`,
      `</thead>`,
      `<tbody>${selected
        .slice(0, state.rows)
        .map((entry) => encounterRow(entry, state.reference))
        .join('')}</tbody>`,
      `</table>`,
      `</div>`,
      `<p class="note">Mostrando ${Math.min(state.rows, selected.length)} de ${formatNumber(selected.length)} registros. Nomes de áreas e condições preservados em inglês.</p>${selected.length > state.rows ? '<button class="secondary" data-more-rows>Mostrar mais registros ↓</button>' : ''}`,
    ].join('') +
    dexes
  );
}

// Golpes: a consulta mantém o grupo de versões e o método de aprendizado.
export function movesPanel(state) {
  const variety = currentPokemon(state);
  const groups = [
    ...new Set(variety.moves.map((learnedMove) => learnedMove[0])),
  ].sort(
    (ability, b) =>
      (state.reference.versionGroups[b]?.order || b) -
      (state.reference.versionGroups[ability]?.order || ability),
  );
  if (!groups.length) {
    return '<div class="empty-state">Nenhum aprendizado de golpe registrado para esta variedade.</div>';
  }
  const list = variety.moves
    .filter(
      (learnedMove) =>
        learnedMove[0] === Number(state.moveGroup) &&
        (!state.moveQuery ||
          normalize(state.reference.moves[learnedMove[1]]?.name).includes(
            normalize(state.moveQuery),
          )),
    )
    .sort(
      (first, second) =>
        first[2] - second[2] || first[3] - second[3] || first[1] - second[1],
    );
  return [
    `<h3>Golpes e aprendizado</h3>`,
    `<p class="note">Escolha a versão para consultar o repertório daquela variedade. Um golpe aprendido em outro jogo não é automaticamente válido na versão selecionada.</p>`,
    `<div class="table-filters">`,
    `<label>Versão<select id="move-group">${groups.map((id) => `<option value="${id}" ${Number(state.moveGroup) === id ? 'selected' : ''}>${escapeHTML(state.reference.versionGroups[id]?.name || id)}</option>`).join('')}</select>`,
    `</label>`,
    `<label>Nome<input id="move-search" type="search" value="${escapeHTML(state.moveQuery)}" placeholder="Buscar golpe em inglês" style="padding:9px;border:1px solid var(--line);border-radius:6px;max-width:200px">`,
    `</label>`,
    `</div>`,
    `<div class="table-wrap">`,
    `<table>`,
    `<thead>`,
    `<tr>`,
    `<th>Golpe</th>`,
    `<th>Tipo / classe</th>`,
    `<th>Aprendizado</th>`,
    `<th>Poder</th>`,
    `<th>Precisão</th>`,
    `<th>PP</th>`,
    `</tr>`,
    `</thead>`,
    `<tbody>${
      list
        .slice(0, state.rows)
        .map((learnedMove) => moveRow(learnedMove, state.reference))
        .join('') ||
      '<tr><td colspan="6">Nenhum golpe corresponde à busca.</td></tr>'
    }</tbody>`,
    `</table>`,
    `</div>`,
    `<p class="note">${Math.min(state.rows, list.length)} de ${formatNumber(list.length)} registros. Efeitos e atributos dos golpes usam a definição atual da fonte; alterações históricas de poder, precisão e efeitos não são reconstruídas.</p>${list.length > state.rows ? '<button class="secondary" data-more-rows>Mostrar mais golpes ↓</button>' : ''}`,
  ].join('');
}

// Evoluções: o controlador resolve a família antes de entregar os dados ao painel.
export function evolutionPanel(state, chain, details, imageMarkup) {
  const parentName = (id) =>
    details.find((species) => species.id === id)?.name || `#${id}`;
  return [
    `<h3>Família evolutiva</h3>`,
    `<p class="note">Os jogos indicados identificam os registros da fonte, não uma lista exaustiva de versões compatíveis. Ramos diferentes são alternativas; regras específicas de forma aparecem nos requisitos. Formas Mega e outras transformações de batalha ficam no seletor de formas, pois não são evoluções permanentes.</p>`,
    `<div class="evolution-tree">${details
      .map((species) => {
        const form = chain.find((variety) => variety.species === species.id);
        const rules = species.evolutions;
        const grouped = new Map();
        for (const rule of rules) {
          const text = evolutionConditions(
            rule,
            state.reference,
            state.catalog,
          );
          if (!grouped.has(text)) {
            grouped.set(text, []);
          }
          const group =
            state.reference.versionGroups[rule.version_group_id]?.name;
          if (group && !grouped.get(text).includes(group)) {
            grouped.get(text).push(group);
          }
        }
        return [
          `<div class="evolution-node">`,
          `<button class="evolution-pokemon" data-open="${form.id}">${imageMarkup(form)}<small>${dexNumber(species.id)}</small>`,
          `<strong>${escapeHTML(species.name)}</strong>`,
          `</button>`,
          `<div>${species.parent ? `<p class="note">Evolui de <strong>${escapeHTML(parentName(species.parent))}</strong></p>` : '<p class="note">Início desta família evolutiva</p>'}${grouped.size ? [...grouped.entries()].map(([condition, games]) => `<div class="evolution-rule"><strong>${escapeHTML(games.join(' · ') || 'Condição registrada na fonte')}</strong>${escapeHTML(condition)}</div>`).join('') : `<p class="note">${species.parent ? 'Condições não detalhadas na base.' : details.length === 1 ? 'Nenhuma evolução permanente registrada para esta espécie.' : 'Consulte os próximos membros para ver os requisitos.'}</p>`}</div>`,
          `</div>`,
        ].join('');
      })
      .join('')}</div>`,
  ].join('');
}

// Habilidades mantêm o indicador de habilidade oculta e o efeito da fonte.
function abilityMarkup([id, hidden], abilities) {
  const ability = abilities[id];
  return [
    `<div class="ability">`,
    `<strong>${escapeHTML(ability?.name || id)}${hidden ? ' <span class="badge">Oculta</span>' : ''}</strong>`,
    `<p>${escapeHTML(ability?.effect || 'Descrição não disponível na fonte.')}</p>`,
    `</div>`,
  ].join('');
}

// A barra é somente uma representação visual do atributo base.
function statMarkup(value, statIndex) {
  return [
    `<div class="stat-row">`,
    `<span>${STAT_NAMES[statIndex]}</span>`,
    `<strong>${value}</strong>`,
    `<div class="stat-track">`,
    `<div class="stat-fill" style="width:${Math.min(100, (value / 255) * 100)}%">`,
    `</div>`,
    `</div>`,
    `</div>`,
  ].join('');
}

// Um encontro representa um slot; a linha preserva suas condições.
function encounterRow(entry, reference) {
  const [
    versionId,
    areaId,
    methodId,
    minLevel,
    maxLevel,
    slotRarity,
    conditionIds,
  ] = entry;
  const area = reference.areas[areaId];
  return [
    `<tr>`,
    `<td>`,
    `<strong>${escapeHTML(area?.location || areaId)}</strong>`,
    `<p>${escapeHTML(area?.area || '')}<br>Pokémon ${escapeHTML(reference.versions[versionId]?.name || versionId)}</p>`,
    `</td>`,
    `<td>${escapeHTML(reference.encounterMethods[methodId] || methodId)}<p>${escapeHTML(conditionIds.map((id) => reference.encounterConditions[id] || id).join(' · ') || 'Sem condição adicional registrada')}</p>`,
    `</td>`,
    `<td>${minLevel}–${maxLevel}</td>`,
    `<td>${slotRarity === null ? '—' : slotRarity + '%'}</td>`,
    `</tr>`,
  ].join('');
}

// Um mesmo golpe pode aparecer em métodos diferentes de aprendizado.
function moveRow(learnedMove, reference) {
  const [, moveId, methodId, level, masteryLevel] = learnedMove;
  const move = reference.moves[moveId];
  if (!move) {
    return '';
  }
  const method = reference.moveMethods[methodId];
  return [
    `<tr>`,
    `<td>`,
    `<strong>${escapeHTML(move.name)}</strong>`,
    `<p>${escapeHTML(move.effect || 'Efeito não descrito na fonte.')}</p>`,
    `</td>`,
    `<td>${badges([move.type])}<p>${{ 1: 'Status', 2: 'Físico', 3: 'Especial' }[move.class] || '—'}</p>`,
    `</td>`,
    `<td>${escapeHTML(moveMethodNames[method] || humanize(method))}${methodId === 1 ? ' · ' + level : ''}${masteryLevel ? `<p>Maestria: ${masteryLevel}</p>` : ''}</td>`,
    `<td>${move.power > 0 ? move.power : '—'}</td>`,
    `<td>${move.accuracy > 0 ? move.accuracy + '%' : '—'}</td>`,
    `<td>${move.pp ?? '—'}</td>`,
    `</tr>`,
  ].join('');
}
