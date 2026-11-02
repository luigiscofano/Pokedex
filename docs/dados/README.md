# Dados, cobertura e atualização

## Três identidades

| Identidade | Significado | Exemplo |
| --- | --- | --- |
| Espécie (`species`) | Número nacional; agrupa descrições e família | Charizard é a espécie 6 |
| Variedade (`pokemon`) | Atributos, tipos, habilidades, dimensões e aprendizado próprios | Charizard e Mega Charizard X têm variedades diferentes |
| Forma (`id` no catálogo) | Aparência ou estado selecionável | As letras de Unown têm formas distintas |

Nunca use o ID de uma forma como número nacional. A imagem de uma variedade não necessariamente distingue todas as suas formas cosméticas.

## Importação reproduzível

O importador baixa CSVs públicos da revisão fixada em `scripts/import-data.py`, reutilizando `.cache/<revisão>/`. Ele gera arquivos JSON com codificação UTF-8 e um manifesto com SHA-256. Os detalhes são divididos em 21 arquivos, cada um com até 50 espécies. Não é necessário importar dados para executar uma instalação recém-clonada.

```sh
python3 scripts/import-data.py
npm run check
npm test
```

No Windows, se `python3` não existir, use `py -3 scripts/import-data.py`.

Para mudar a revisão, escolha um SHA revisado e defina a variável `POKEAPI_REVISION` ou atualize o valor padrão no script. Se a atualização for aprovada, registre o novo padrão junto dos arquivos gerados, para que a reconstrução continue reproduzível. Preserve os créditos.

## Antes de aceitar uma atualização

Confira o diff do catálogo e as contagens. Verifique que 1–1025 continuam presentes, que todas as formas resolvem suas variedades e que o manifesto corresponde aos arquivos. O importador limita intencionalmente o escopo às 1.025 espécies solicitadas; uma nova geração exige revisão explícita desse limite, dos filtros e dos testes.

Textos são preservados por jogo e idioma. Encontros mantêm condições e slots; golpes mantêm grupos de versões e métodos. Campos sem tradução podem usar o identificador legível da fonte, sem serem descartados.

A especificação das tuplas compactas está em [`web/data/README.md`](../../web/data/README.md). As limitações de interpretação e os créditos estão em [`FONTES.md`](../FONTES.md).
