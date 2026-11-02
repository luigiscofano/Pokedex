import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { defenseMatchups } from '../web/js/domain.js';

// A suíte percorre os arquivos versionados; não depende de uma API externa.
const read = async (path) =>
  JSON.parse(await readFile(new URL(`../web/data/${path}`, import.meta.url)));
const catalog = await read('catalog.json');
const reference = await read('reference.json');
const manifest = await read('manifest.json');
const species = Object.assign(
  {},
  ...(await Promise.all(
    Array.from({ length: 21 }, (_, batchIndex) =>
      read(`species/${String(batchIndex).padStart(2, '0')}.json`),
    ),
  )),
);

// Integridade dos bytes e dos vínculos entre espécie, variedade e forma.
test('todos os arquivos de dados correspondem aos hashes do manifesto', async () => {
  for (const [path, expected] of Object.entries(manifest.files)) {
    const bytes = await readFile(
      new URL(`../web/data/${path}`, import.meta.url),
    );
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expected,
      path,
    );
  }
});
test('todas as formas levam a espécies e variedades reais com atributos completos', () => {
  assert.equal(Object.keys(species).length, 1025);
  assert.equal(
    new Set(catalog.map((form) => form.id)).size,
    manifest.formCount,
  );
  for (const form of catalog) {
    const pokemon = species[form.species]?.varieties.find(
      (variety) => variety.id === form.pokemon,
    );
    assert.ok(pokemon, form.label);
    assert.equal(pokemon.stats.length, 6);
    assert.ok(
      pokemon.stats.every(
        (value) => Number.isInteger(value) && value > 0 && value <= 255,
      ),
      form.label,
    );
    assert.ok(form.types.length >= 1 && form.types.length <= 2);
  }
});
test('tabela moderna possui todos os 324 cruzamentos e os tipos especiais não são tratados como neutros', () => {
  for (let attackType = 1; attackType <= 18; attackType++) {
    for (let defenseType = 1; defenseType <= 18; defenseType++) {
      assert.ok(
        [0, 0.5, 1, 2].includes(
          reference.efficacy[`${attackType}/${defenseType}`],
        ),
      );
    }
  }
  assert.throws(() => defenseMatchups([10001], reference.efficacy), RangeError);
});
// As tuplas compactas são resolvidas contra seus dicionários antes de contar registros.
test('todas as referências de golpes, habilidades, descrições e encontros são resolvidas', () => {
  for (const speciesRecord of Object.values(species)) {
    for (const [version, language, text] of speciesRecord.flavor) {
      assert.ok(reference.versions[version], `Versão ${version}`);
      assert.ok(reference.languages[language], `Idioma ${language}`);
      assert.ok(text.trim());
    }
    for (const variety of speciesRecord.varieties) {
      for (const [ability] of variety.abilities) {
        assert.ok(reference.abilities[ability]);
      }
      for (const [group, move, method, level] of variety.moves) {
        assert.ok(reference.versionGroups[group]);
        assert.ok(reference.moves[move]);
        assert.ok(reference.moveMethods[method]);
        assert.ok(level >= 0);
      }
      for (const [
        version,
        area,
        method,
        min,
        max,
        chance,
        conditions,
      ] of variety.encounters) {
        assert.ok(reference.versions[version]);
        assert.ok(reference.areas[area]);
        assert.ok(reference.encounterMethods[method]);
        assert.ok(min <= max);
        assert.ok(chance === null || (chance >= 0 && chance <= 100));
        for (const id of conditions) {
          assert.ok(reference.encounterConditions[id]);
        }
      }
    }
  }
});
test('contagens de auditoria correspondem ao conteúdo efetivo', () => {
  const list = Object.values(species),
    varieties = list.flatMap((speciesRecord) => speciesRecord.varieties);
  assert.equal(varieties.length, manifest.pokemonCount);
  assert.equal(
    list.reduce(
      (total, speciesRecord) => total + speciesRecord.flavor.length,
      0,
    ),
    manifest.descriptionCount,
  );
  assert.equal(
    varieties.reduce((total, variety) => total + variety.moves.length, 0),
    manifest.learnsetCount,
  );
  assert.equal(
    varieties.reduce((total, variety) => total + variety.encounters.length, 0),
    manifest.encounterCount,
  );
});
test('famílias ramificadas e formas alternativas preservam seus vínculos', () => {
  const eevee = species[133];
  assert.equal(
    Object.values(species).filter(
      (speciesRecord) => speciesRecord.chain === eevee.chain,
    ).length,
    9,
  );
  assert.ok(
    catalog.some((form) => form.species === 6 && /mega/i.test(form.form)),
  );
  assert.ok(
    catalog.some((form) => form.species === 26 && /alola/i.test(form.form)),
  );
  assert.ok(catalog.some((form) => form.species === 201 && !form.default));
  assert.equal(species[1025].name, 'Pecharunt');
});
