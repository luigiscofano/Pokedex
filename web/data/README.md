# Dicionário dos dados da Pokédex

[Início](../../README.md) · [Origem e atualização](../../docs/dados/README.md) · [Lotes de espécies](species/README.md)

Esta pasta é o contrato entre o importador e a interface. Os JSONs são gerados e versionados; não precisam ser baixados novamente para executar o site. O esquema atual é identificado por `schemaVersion: 1` no [manifesto](manifest.json).

## Arquivos e carregamento

| Arquivo | Conteúdo | Quando é usado |
| --- | --- | --- |
| [catalog.json](catalog.json) | 1.579 formas, com campos para busca, filtros e cartões | Abertura da aplicação |
| [reference.json](reference.json) | Dicionários e matriz de tipos | Abertura da aplicação |
| [manifest.json](manifest.json) | Proveniência, contagens e hashes | Abertura e validação |
| `species/00.json` a `species/20.json` | 1.025 fichas divididas em 21 lotes | Abertura de fichas e famílias |

As 1.351 variedades estão dentro das fichas. Os 68.220 textos, 117.127 encontros e 638.321 registros de aprendizado incluem repetições legítimas entre jogos, idiomas, métodos e condições.

## Catálogo: uma entrada por forma

| Campo | Significado |
| --- | --- |
| `id` | ID da **forma**, usado na seleção, nos favoritos e no parâmetro `pokemon` da URL |
| `pokemon` | ID da **variedade**, usado para atributos e imagens de variedade |
| `species` | Número nacional da **espécie** |
| `slug`, `name`, `form`, `label` | Identificadores textuais e apresentação da forma |
| `default`, `battleOnly`, `mega` | Marcadores da fonte para seleção e identificação |
| `generation` | Geração da espécie, usada no filtro |
| `introduced` | ID do grupo de versões em que a forma foi introduzida |
| `types` | IDs dos tipos |
| `stats` | Seis atributos base, na ordem documentada abaixo |
| `legendary`, `mythical`, `baby` | Classificação da espécie |
| `chain` | Família evolutiva |

Exemplo de vínculo real: Mega Charizard X é a forma `10134`, ligada à variedade `10034` e à espécie `6`. Não use o número nacional como substituto universal dos três IDs. Formas cosméticas podem compartilhar a mesma variedade.

## Ficha de espécie

Cada lote é um objeto cujas chaves são números nacionais serializados como strings. A ficha reúne:

| Campos | Responsabilidade |
| --- | --- |
| `id`, `name`, `slug`, `genus` | Identificação e categoria textual |
| `generation`, `parent`, `chain` | Geração, espécie anterior e família |
| `legendary`, `mythical`, `baby` | Classificações |
| `captureRate`, `genderRate`, `hatchCounter`, `baseHappiness` | Parâmetros da fonte para captura, proporção de gênero, eclosão e amizade |
| `eggGroups`, `dexes` | Grupos de ovos e números em Pokédex regionais |
| `flavor` | Textos por versão e idioma |
| `evolutions` | Condições de evolução para esta espécie, incluindo restrições por jogo/forma |
| `varieties` | Registros com atributos próprios |

`captureRate` é um parâmetro do jogo, não uma porcentagem pronta de captura. `evolutions` preserva nomes de campos da fonte, como `minimum_level` e `version_group_id`; condições não reconhecidas pela interface não devem ser silenciosamente descartadas.

## Variedade

| Campo | Conteúdo |
| --- | --- |
| `id`, `species`, `slug`, `default` | Identidade e relação com a espécie |
| `height`, `weight` | Altura em **metros**, peso em **quilogramas** |
| `experience` | Experiência base da fonte |
| `types`, `stats`, `effort` | Tipos, atributos base e EVs concedidos |
| `abilities` | Habilidades, com indicador de habilidade oculta |
| `moves` | Aprendizado de golpes por grupo de versões |
| `encounters` | Encontros por versão, local, método e condições |

## Tuplas compactas e ordem dos valores

| Registro | Estrutura |
| --- | --- |
| Texto | `[versionId, languageId, text]` |
| Aprendizado | `[versionGroupId, moveId, methodId, level, masteryLevelOrNull]` |
| Encontro | `[versionId, areaId, methodId, minLevel, maxLevel, slotRarityOrNull, conditionIds]` |
| Habilidade | `[abilityId, isHidden]`, com `isHidden` numérico: `0` ou `1` |
| Pokédex regional | `[pokedexId, number]` |
| Atributos e EVs | `[hp, attack, defense, specialAttack, specialDefense, speed]` |

Uma lista vazia indica ausência de registros naquele campo. `null` pode representar informação não preenchida; zero pode ter significado próprio. Não use um teste genérico de valor verdadeiro para descartar todas essas situações como equivalentes.

## Dicionários de referência

`abilities` guarda nome e efeito. `moves` guarda nome, tipo, poder, precisão, PP, prioridade, classe e efeito. `versions` relaciona jogos individuais a `versionGroups`; um encontro usa versão e um aprendizado usa grupo de versões.

`areas` reúne local e área. `locations`, `items`, `encounterMethods`, `encounterConditions`, `moveMethods`, `evolutionTriggers`, `eggGroups`, `pokedexes` e `languages` resolvem os demais IDs. As chaves dos objetos JSON são strings, mesmo quando representam identificadores numéricos.

`types` identifica tipos e `efficacy` usa chaves `ataque/defesa`, com fatores numéricos como `0`, `0.5`, `1` e `2`. A composição para dois tipos ocorre no [domínio](../js/domain.js), não por duplicação de todas as combinações no JSON.

## Manifesto e integridade

`source` e `revision` identificam a origem. `speciesCount`, `pokemonCount`, `formCount`, `descriptionCount`, `encounterCount` e `learnsetCount` descrevem o conjunto. `shardSize` é 50. `sourceFiles` registra hashes dos CSVs; `files` registra hashes dos JSONs gerados, sem incluir o próprio manifesto.

Execute `npm test` na raiz para conferir hashes, referências e contagens. Para mudar o snapshot, siga o [procedimento de importação](../../docs/dados/README.md). Não altere só o manifesto para fazer passar um dado inconsistente.

## Cobertura e proveniência

A interface é em português; textos da franquia preservam os idiomas disponíveis. Ausência de encontro não prova impossibilidade de obtenção. A tabela moderna de tipos não inclui habilidades, clima ou regras históricas. Dados e imagens têm origem externa e créditos próprios: [fontes e limites](../../docs/FONTES.md).
