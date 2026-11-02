# Módulos JavaScript

[Início](../../README.md) · [Aplicação web](../README.md) · [Arquitetura](../../docs/desenvolvimento/README.md)

| Módulo | Entrada / saída principal | Responsabilidade |
| --- | --- | --- |
| [domain.js](domain.js) | Dados e filtros → registros ou multiplicadores | Funções puras e utilitários de domínio |
| [data.js](data.js) | Caminho/ID → promessa de JSON ou URL de imagem | Fetch, cache e recuperação após falha |
| [app.js](app.js) | Eventos + estado → DOM e URL | Coordenação da experiência |

## Domínio

`filterCatalog()` combina pesquisa, geração, tipo, categoria, formas e favoritos; ordena por número, nome ou soma dos atributos. `normalize()` aplica NFD, remove marcas de acento, converte para minúsculas e retira espaços nas extremidades.

`defenseMatchups()` multiplica fatores; `offenseMatchups()` escolhe o melhor fator entre os tipos próprios. `shardForSpecies()` valida o número nacional e calcula o lote. `evolutionConditions()` produz descrições a partir dos campos conhecidos, preservando valores significativos como zero.

`readFavorites()` e `writeFavorites()` recebem um objeto de armazenamento, o que permite testar dados inválidos e bloqueios sem depender do navegador.

## Acesso a dados e imagens

`loadJSON()` resolve caminhos em relação ao módulo e guarda promessas por caminho. `loadSpecies()` usa o lote calculado e valida a presença da espécie. Uma falha de rede remove a promessa do cache para permitir nova tentativa.

`artwork()` e `sprite()` recebem um registro do catálogo e a preferência shiny; usam seu campo `pokemon`, o ID da **variedade**. `loadFormSprite()` recebe o **ID da forma** e compartilha a consulta de metadados entre aparência normal e shiny. URLs externas de formas são validadas por protocolo HTTPS e domínio. A ausência de `front_shiny` não autoriza usar `front_default`.

## Coordenação da interface

| Função ou grupo | O que faz |
| --- | --- |
| `init`, `installEvents` | Carregamento inicial, URL e registro dos eventos |
| `renderCatalog`, `applyFilter`, `resetFilters` | Seleção, paginação e cartões |
| `openDetail`, `renderDetail`, `renderPanel` | Ficha, seletor e conteúdo das abas |
| `setShiny`, `resolveFormImage` | Aparência global, sprite exato e proteção contra respostas antigas |
| `toggleFavorite`, `syncURL` | Persistência local e links compartilháveis |

Textos são escapados antes de compor HTML. IDs de navegação são resolvidos no catálogo. Fichas e painéis usam contadores de requisição; imagens verificam se o elemento ainda está conectado antes de aplicar uma resposta.

## Como estender

Coloque regras que independem do DOM em `domain.js`; mantenha acesso a arquivos e imagens em `data.js`. A interface deve tratar carregamento, erro e vazio como estados distintos. Ao acrescentar um campo ou uma forma de seleção, revise o contrato dos JSONs, o link compartilhável e os exemplos dos guias.

[Testes](../../tests/README.md) · [Contrato da URL](../../docs/usuario/favoritos-e-links/README.md) · [Matemática dos tipos](../../docs/desenvolvimento/tipos/README.md).
