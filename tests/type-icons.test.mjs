import test from 'node:test';
import assert from 'node:assert/strict';
import { typeIcon } from '../web/js/type-icons.js';
import { badges, matchupGroup } from '../web/js/presentation.js';

const refinedTypes = [2, 9, 14, 17];

test('símbolos refinados são vetores locais e herdam as cores do componente', () => {
  for (const type of refinedTypes) {
    const svg = typeIcon(type);
    assert.match(svg, /viewBox="0 0 24 24"/);
    assert.match(svg, /aria-hidden="true" focusable="false"/);
    // Nenhuma fonte, imagem, máscara externa ou cor fixa deve fragmentar o desenho.
    assert.doesNotMatch(svg, /<(?:image|text|use|foreignObject)|(?:href|style|id)=/);
    for (const [, color] of svg.matchAll(/(?:fill|stroke)="([^"]+)"/g)) {
      assert.ok(['none', 'currentColor', 'var(--badge-color)'].includes(color));
    }
  }
});

test('tipos refinados mantêm símbolo e rótulo idênticos nos badges e na eficácia', () => {
  for (const type of refinedTypes) {
    const badge = badges([type]);
    assert.ok(badge.includes(typeIcon(type)));
    const matchup = matchupGroup('Super eficaz', [{ type, multiplier: 2 }]);
    assert.ok(matchup.includes(badge));
    assert.match(matchup, /<strong>2×<\/strong>/);
  }
  assert.equal(new Set(refinedTypes.map(typeIcon)).size, refinedTypes.length);
});
