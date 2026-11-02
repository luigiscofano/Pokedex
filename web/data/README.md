# Base versionada da Pokédex

Esta pasta contém os dados efetivamente utilizados pelo aplicativo. A geração é reproduzível por `python3 scripts/import-data.py`, a partir de CSVs do projeto [PokéAPI](https://github.com/PokeAPI/pokeapi), no commit registrado em `manifest.json`.

| Arquivo | Conteúdo |
| --- | --- |
| `catalog.json` | 1.579 registros de formas, associados a 1.025 espécies e 1.351 variedades com atributos próprios |
| `reference.json` | Tipos, tabela de eficácia, golpes, habilidades, jogos, itens, idiomas e locais |
| `species/00.json` a `species/20.json` | Fichas em lotes de até 50 espécies; descrições, evoluções, golpes e encontros por jogo |
| `manifest.json` | Contagens, revisão da fonte e SHA-256 dos CSVs e arquivos gerados |

São preservados **68.220 textos de Pokédex**, **117.127 registros de encontros** e **638.321 registros de aprendizado de golpes**. Os registros podem se repetir entre jogos, idiomas, condições e slots: essas contagens não representam espécies distintas.

## Estruturas compactas

- Descrição: `[versionId, languageId, text]`.
- Golpe aprendido: `[versionGroupId, moveId, methodId, level, masteryLevelOrNull]`.
- Encontro: `[versionId, areaId, methodId, minLevel, maxLevel, slotRarityOrNull, conditionIds]`.
- Habilidade: `[abilityId, isHidden]`.
- Pokédex regional: `[pokedexId, number]`.
- Atributos/EVs: `[hp, attack, defense, specialAttack, specialDefense, speed]`.

IDs de espécie, variedade (`pokemon`) e forma **não são intercambiáveis**. Uma forma cosmética pode usar os mesmos atributos da variedade. Formas com atributos distintos possuem outra variedade. A ordem nacional sempre vem de `species`.

## Cobertura e limites

A interface é em português; os textos da franquia e as descrições de habilidades/golpes preservam os idiomas da fonte, sem inventar traduções oficiais. Uma ficha sem encontros significa **ausência de registros nesta base**, e não impossibilidade de obtenção no jogo. Evolução, troca, eventos e presentes não estão completamente representados na tabela de encontros selvagens. Participar de uma Pokédex regional não prova uma captura em determinada rota.

A tabela de tipos corresponde às regras modernas. Ela não considera mudanças históricas, habilidades, itens, clima, Terastalização ou condições de batalha. Regras de evolução mantêm o grupo de versões, requisitos de formas e campos especiais da fonte; códigos não traduzidos são identificados como tais.

Os dados e recursos da franquia não são autoria do mantenedor deste aplicativo. Consulte [créditos e fontes](../../docs/FONTES.md).
