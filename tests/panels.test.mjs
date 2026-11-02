import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  overviewPanel,
  typesPanel,
  entriesPanel,
  encountersPanel,
  movesPanel,
  evolutionPanel,
} from '../web/js/detail-panels.js';
import { updatePanelSelection } from '../web/js/detail-selection.js';
import { escapeHTML } from '../web/js/presentation.js';

// Fixtures reais preservam relações entre IDs e permitem verificar o conteúdo sem navegador.
const read = async (path) =>
  JSON.parse(
    await readFile(new URL(`../web/data/${path}`, import.meta.url), 'utf8'),
  );
const catalog = await read('catalog.json');
const reference = await read('reference.json');
const species = Object.assign(
  {},
  ...(await Promise.all(
    ['00', '02', '03', '09', '13', '20'].map((batch) =>
      read(`species/${batch}.json`),
    ),
  )),
);
function selection(formId, tab = 'overview') {
  const form = catalog.find((item) => item.id === formId);
  return {
    catalog,
    reference,
    form,
    species: species[form.species],
    tab,
    language: 9,
    entryVersion: null,
    encounterVersion: '',
    moveGroup: '',
    moveQuery: '',
    rows: 80,
  };
}

test('visão geral consulta a variedade selecionada e não modifica seus dados', () => {
  const state = selection(10134);
  const before = JSON.stringify(state.species);
  const html = overviewPanel(state);
  assert.match(html, /Tough Claws/);
  assert.match(html, /<strong>634<\/strong>/);
  assert.equal(JSON.stringify(state.species), before);
});

test('tipos especiais recebem aviso em vez de um painel neutro inventado', () => {
  const state = selection(6, 'types');
  state.form = { ...state.form, types: [10001] };
  assert.match(typesPanel(state), /tipo especial histórico/);
  assert.doesNotMatch(typesPanel(state), /Dano neutro/);
});

test('texto mantém seleção válida e escolhe idioma disponível quando necessário', () => {
  const state = selection(6, 'entries');
  state.species = {
    ...state.species,
    flavor: [
      [1, 7, 'Primera'],
      [2, 7, 'Segunda'],
      [3, 9, 'English'],
    ],
  };
  state.language = 7;
  state.entryVersion = 1;
  updatePanelSelection(state);
  assert.equal(state.entryVersion, 1);
  assert.match(entriesPanel(state), /Primera/);
  state.language = 999;
  updatePanelSelection(state);
  assert.equal(state.language, 9);
  assert.equal(state.entryVersion, 3);
  assert.match(entriesPanel(state), /English/);
});

test('seleção de golpes preserva o jogo escolhido e pesquisa apenas esse repertório', () => {
  const state = selection(6, 'moves');
  updatePanelSelection(state);
  const initialGroup = state.moveGroup;
  state.moveQuery = 'flame';
  const html = movesPanel(state);
  assert.match(html, /Flamethrower/);
  assert.doesNotMatch(html, /<strong>Tackle<\/strong>/);
  updatePanelSelection(state);
  assert.equal(state.moveGroup, initialGroup);
  state.moveQuery = 'golpe-inexistente';
  assert.match(movesPanel(state), /Nenhum golpe corresponde/);
});

test('ausência de encontros não é apresentada como impossibilidade de obtenção', () => {
  const html = encountersPanel(selection(1025, 'encounters'));
  assert.match(html, /Sem encontros registrados/);
  assert.match(html, /Isso não significa que ela seja impossível de obter/);
  assert.match(html, /Pokédex regionais e especiais/);
});

test('textos interpolados são escapados antes de entrar no HTML', () => {
  assert.equal(
    escapeHTML('<a title="x">&\''),
    '&lt;a title=&quot;x&quot;&gt;&amp;&#39;',
  );
  const state = selection(6);
  state.species = { ...state.species, name: '<script>alert(1)</script>' };
  const html = overviewPanel(state);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('família de Eevee apresenta nove membros sem transformar os ramos em sequência', () => {
  const state = selection(133, 'evolution');
  const chain = catalog.filter(
    (form) => form.default && form.chain === state.form.chain,
  );
  const details = chain.map((form) => species[form.species]);
  const html = evolutionPanel(state, chain, details, () => '');
  assert.equal((html.match(/class="evolution-node"/g) || []).length, 9);
  assert.match(html, /Ramos diferentes são alternativas/);
  for (const name of [
    'Eevee',
    'Vaporeon',
    'Jolteon',
    'Flareon',
    'Espeon',
    'Umbreon',
    'Leafeon',
    'Glaceon',
    'Sylveon',
  ]) {
    assert.ok(html.includes(name), name);
  }
});
