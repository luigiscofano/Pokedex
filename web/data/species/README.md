# Lotes de fichas por espécie

[Dados](../README.md) · [Importação](../../../docs/dados/README.md) · [Carregador](../../js/data.js)

Cada JSON reúne até 50 espécies, indexadas pelo número nacional. A fórmula de lote é `floor((id - 1) / 50)`, com dois dígitos no nome do arquivo.

| Espécie | Lote | Chave no objeto |
| --- | --- | --- |
| Bulbasaur, 1 | `00.json` | `"1"` |
| Diglett, 50 | `00.json` | `"50"` |
| Dugtrio, 51 | `01.json` | `"51"` |
| Pecharunt, 1025 | `20.json` | `"1025"` |

A espécie guarda descrições, família, reprodução e uma lista `varieties`. Cada variedade guarda tipos, atributos, habilidades, dimensões, golpes e encontros. Formas são selecionadas pelo catálogo, sem duplicar artificialmente atributos de variedades compartilhadas.

`loadSpecies()` baixa e reutiliza o lote na memória da página. Uma família evolutiva pode exigir mais de um lote. Uma falha de carga permite nova tentativa; a base não depende de um backend de consultas.

Estes arquivos são gerados. Não os edite manualmente: use o importador, confira o [manifesto](../manifest.json) e execute os testes na raiz. O [dicionário de dados](../README.md) explica cada campo e a ordem das tuplas.
