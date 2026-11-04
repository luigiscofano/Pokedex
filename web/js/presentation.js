import { TYPE_NAMES } from './domain.js';
import { typeIcon } from './type-icons.js';

// Texto e pequenos componentes compartilhados: nenhuma função altera o DOM.
export const escapeHTML = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );

export const humanize = (value) =>
  String(value || '')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const formatNumber = (value) => Number(value).toLocaleString('pt-BR');

export function badges(types) {
  return types
    .map((type) => {
      const id = Number(type);
      const label = TYPE_NAMES[id] || { 10001: '???', 10002: 'Shadow' }[id] || 'Especial';
      return `<span class="badge type-${Number.isInteger(id) ? id : 0}"><span class="type-icon">${typeIcon(id)}</span><span class="type-label">${label}</span></span>`;
    })
    .join('');
}

export function facts(items) {
  return `<dl class="facts">${items.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>`;
}

export function matchupGroup(title, values) {
  return [
    `<div class="match-group">`,
    `<h4>${title}</h4>`,
    `<div class="matchups">${values.length ? values.map((matchup) => `<span class="matchup">${badges([matchup.type])}<strong>${String(matchup.multiplier).replace('.', ',')}×</strong></span>`).join('') : '<span class="note">Nenhum tipo nesta categoria.</span>'}</div>`,
    `</div>`,
  ].join('');
}
