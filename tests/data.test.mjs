import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { defenseMatchups } from '../web/js/domain.js';

const read = async path => JSON.parse(await readFile(new URL(`../web/data/${path}`, import.meta.url)));
const catalog = await read('catalog.json');
const reference = await read('reference.json');
const manifest = await read('manifest.json');
const species = Object.assign({}, ...await Promise.all(Array.from({ length: 21 }, (_, i) => read(`species/${String(i).padStart(2, '0')}.json`))));

test('todos os arquivos de dados correspondem aos hashes do manifesto', async () => {
  for (const [path, expected] of Object.entries(manifest.files)) {
    const bytes = await readFile(new URL(`../web/data/${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, path);
  }
});
test('todas as formas levam a espécies e variedades reais com atributos completos', () => {
  assert.equal(Object.keys(species).length, 1025);
  assert.equal(new Set(catalog.map(f => f.id)).size, manifest.formCount);
  for (const form of catalog) {
    const pokemon = species[form.species]?.varieties.find(p => p.id === form.pokemon);
    assert.ok(pokemon, form.label);
    assert.equal(pokemon.stats.length, 6);
    assert.ok(pokemon.stats.every(v => Number.isInteger(v) && v > 0 && v <= 255), form.label);
    assert.ok(form.types.length >= 1 && form.types.length <= 2);
  }
});
test('tabela moderna possui todos os 324 cruzamentos e os tipos especiais não são tratados como neutros', () => {
  for (let a = 1; a <= 18; a++) for (let d = 1; d <= 18; d++) assert.ok([0, .5, 1, 2].includes(reference.efficacy[`${a}/${d}`]));
  assert.throws(() => defenseMatchups([10001], reference.efficacy), RangeError);
});
test('todas as referências de golpes, habilidades, descrições e encontros são resolvidas', () => {
  for (const s of Object.values(species)) {
    for (const [version, language, text] of s.flavor) {
      assert.ok(reference.versions[version], `Versão ${version}`);
      assert.ok(reference.languages[language], `Idioma ${language}`);
      assert.ok(text.trim());
    }
    for (const p of s.varieties) {
      for (const [ability] of p.abilities) assert.ok(reference.abilities[ability]);
      for (const [group, move, method, level] of p.moves) {
        assert.ok(reference.versionGroups[group]); assert.ok(reference.moves[move]); assert.ok(reference.moveMethods[method]); assert.ok(level >= 0);
      }
      for (const [version, area, method, min, max, chance, conditions] of p.encounters) {
        assert.ok(reference.versions[version]); assert.ok(reference.areas[area]); assert.ok(reference.encounterMethods[method]);
        assert.ok(min <= max); assert.ok(chance === null || (chance >= 0 && chance <= 100));
        for (const id of conditions) assert.ok(reference.encounterConditions[id]);
      }
    }
  }
});
test('contagens de auditoria correspondem ao conteúdo efetivo', () => {
  const list = Object.values(species), varieties = list.flatMap(s => s.varieties);
  assert.equal(varieties.length, manifest.pokemonCount);
  assert.equal(list.reduce((n, s) => n + s.flavor.length, 0), manifest.descriptionCount);
  assert.equal(varieties.reduce((n, p) => n + p.moves.length, 0), manifest.learnsetCount);
  assert.equal(varieties.reduce((n, p) => n + p.encounters.length, 0), manifest.encounterCount);
});
test('famílias ramificadas e formas alternativas preservam seus vínculos', () => {
  const eevee = species[133];
  assert.equal(Object.values(species).filter(s => s.chain === eevee.chain).length, 9);
  assert.ok(catalog.some(f => f.species === 6 && /mega/i.test(f.form)));
  assert.ok(catalog.some(f => f.species === 26 && /alola/i.test(f.form)));
  assert.ok(catalog.some(f => f.species === 201 && !f.default));
  assert.equal(species[1025].name, 'Pecharunt');
});
