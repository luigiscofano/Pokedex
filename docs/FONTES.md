# Fontes, créditos e cobertura

## Aplicativo

A interface, organização, importador, regras de consulta e testes desta versão foram desenvolvidos para o projeto de **Luigi Scofano de Araujo**. O exercício Java original de 2023 está preservado em `src/` e no histórico Git.

## Tipografia

- [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch): títulos, marca e números de destaque.
- [Barlow](https://fonts.google.com/specimen/Barlow): textos, controles e rótulos.

As famílias são carregadas pelo Google Fonts; sem rede, o navegador usa a alternativa sans-serif.

## Base e imagens

- [PokéAPI](https://pokeapi.co/docs/v2/): modelo de dados e documentação.
- [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi): CSVs, revisão fixa e hashes em `web/data/manifest.json`.
- [PokeAPI/sprites](https://github.com/PokeAPI/sprites): sprites e ilustrações disponibilizados pela comunidade. As imagens são carregadas remotamente e têm alternativa de sprite quando a ilustração não existe.
- [PokeAPI/api-data](https://github.com/PokeAPI/api-data): metadados públicos de sprites de formas cosméticas, quando consultados.

Pokémon e os respectivos nomes, personagens, ilustrações e textos pertencem aos seus titulares. Este é um projeto independente de estudo e portfólio, sem afiliação oficial. O código do aplicativo e os recursos de terceiros têm proveniências distintas; não se aplica uma licença autoral geral aos recursos da franquia. Nenhuma nova licença de redistribuição foi adicionada ao projeto.

## Interpretação correta

A fonte cobre as 1.025 espécies e 1.579 formas cadastradas no snapshot. Isso não implica cobertura integral de todo jogo, evento ou forma introduzida depois da revisão. Descrições são mostradas no idioma original selecionado. Dados ausentes permanecem ausentes, com aviso na interface.

Encontros são registros por slot, método, versão e condições. Não some as chances sem considerar as condições. A interface não transforma falta de registros em uma afirmação de que o Pokémon não aparece no jogo.

Fraquezas multiplicam os fatores dos tipos defensivos. Vantagens ofensivas indicam a melhor eficácia de um golpe de um tipo próprio contra um alvo de tipo único; não são uma previsão de vitória ou dano final.
