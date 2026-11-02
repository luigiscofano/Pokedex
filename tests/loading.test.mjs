import test from 'node:test';
import assert from 'node:assert/strict';
import { loadJSON, loadSpecies } from '../web/js/data.js';

// O cache precisa compartilhar cargas concorrentes sem tornar falhas permanentes.
test('requisições concorrentes do mesmo JSON compartilham uma única carga', async (context) => {
  let requests = 0;
  const payload = { value: 42 };
  context.mock.method(globalThis, 'fetch', async () => {
    requests++;
    return { ok: true, json: async () => payload };
  });
  const results = await Promise.all([
    loadJSON('cache-test.json'),
    loadJSON('cache-test.json'),
  ]);
  assert.equal(results[0], payload);
  assert.equal(results[1], payload);
  assert.equal(requests, 1);
});

test('falhas HTTP e de leitura JSON permitem tentar novamente', async (context) => {
  for (const failure of ['http', 'json']) {
    let requests = 0;
    context.mock.method(globalThis, 'fetch', async () => {
      requests++;
      if (requests === 1) {
        return {
          ok: failure !== 'http',
          json: async () => {
            throw new SyntaxError('JSON interrompido');
          },
        };
      }
      return { ok: true, json: async () => ({ recovered: true }) };
    });
    const path = `retry-${failure}.json`;
    await assert.rejects(loadJSON(path));
    assert.deepEqual(await loadJSON(path), { recovered: true });
    assert.equal(requests, 2);
    context.mock.restoreAll();
  }
});

test('fichas usam o lote correto e uma espécie ausente recebe erro explícito', async (context) => {
  const paths = [];
  context.mock.method(globalThis, 'fetch', async (url) => {
    paths.push(url.pathname);
    return {
      ok: true,
      json: async () =>
        url.pathname.endsWith('/00.json')
          ? { 50: { id: 50 } }
          : { 51: { id: 51 } },
    };
  });
  assert.deepEqual(await loadSpecies(50), { id: 50 });
  assert.deepEqual(await loadSpecies(51), { id: 51 });
  await assert.rejects(loadSpecies(49), /Espécie não encontrada/);
  await assert.rejects(loadSpecies(0), RangeError);
  assert.equal(paths.length, 2);
  assert.ok(paths[0].endsWith('/species/00.json'));
  assert.ok(paths[1].endsWith('/species/01.json'));
});
