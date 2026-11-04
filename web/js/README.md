# Módulos JavaScript

[Início](../../README.md) · [Arquitetura](../../docs/desenvolvimento/README.md) · [Convenções de código](../../docs/desenvolvimento/clean-code/README.md)

A versão 1.1.2 separa regras, apresentação e efeitos no navegador. Os módulos continuam nativos, sem framework ou dependências de execução.

| Módulo | Responsabilidade |
| --- | --- |
| [featured.js](featured.js) | Escolha da forma em destaque, persistência local e retorno seguro ao padrão |
| [domain.js](domain.js) | Busca, filtros, ordenação, tipos, favoritos, loteamento e condições de evolução |
| [data.js](data.js) | JSONs, caches de promessas, recuperação após erro e URLs normal/shiny |
| [type-icons.js](type-icons.js) | Símbolos SVG locais dos 18 tipos e ícone seguro para tipos especiais |
| [presentation.js](presentation.js) | Escape de texto, formatação e pequenos componentes HTML reutilizáveis |
| [detail-selection.js](detail-selection.js) | Ajuste explícito de jogo/idioma quando a seleção não existe na ficha |
| [detail-panels.js](detail-panels.js) | HTML das seis abas, sem acessar o DOM ou realizar fetch |
| [images.js](images.js) | Marcação das imagens, formas cosméticas, legendas e etapas de fallback |
| [app.js](app.js) | Estado da página, eventos, URL, catálogo e coordenação assíncrona das fichas |

## Fluxo de uma ficha

`openDetail()` resolve a forma, carrega a espécie e descarta respostas antigas pelo contador de requisição. `renderDetail()` monta o diálogo; `renderPanel()` ajusta a seleção e delega o HTML ao painel correspondente. A família evolutiva é carregada pelo controlador antes de ser entregue a `evolutionPanel()`.

`updatePanelSelection()` altera explicitamente apenas os seletores dependentes dos registros disponíveis. Os renderizadores recebem o estado já preparado e não o modificam. As linhas de habilidades, atributos, encontros e golpes possuem funções próprias para reduzir o aninhamento dos painéis.

## Regras e identidades

`filterCatalog()` combina os critérios e ordena uma nova lista. Categoria, pesquisa e critérios de desempate têm funções próprias. `defenseMatchups()` multiplica fatores; `offenseMatchups()` escolhe a melhor eficácia dos tipos próprios. Valores zero em condições de evolução continuam significativos.

O catálogo usa `id` para forma, `pokemon` para variedade e `species` para número nacional. `artwork()` e `sprite()` recebem um registro do catálogo e usam o campo `pokemon`. `loadFormSprite()` recebe o ID da forma.

## Cache, erros e imagens

`cachedRequest()` compartilha promessas e remove rejeições, permitindo nova tentativa. JSONs e metadados de sprites usam caches separados. Normal e shiny compartilham uma consulta de metadados, mas selecionam campos de imagem diferentes.

`images.js` preserva a sequência ilustração → sprite → indisponível. Uma forma cosmética shiny não é substituída silenciosamente pela aparência normal. Respostas só atualizam elementos ainda conectados ao documento.

## Eventos e apresentação

O controlador instala eventos de catálogo, navegação, diálogos e documento em funções separadas. Handlers nomeados cuidam de cliques, seletores, busca de golpes e teclado. Tamanho das páginas e duração dos avisos têm constantes próprias.

Comentários em português explicam seções, contratos e decisões. Os fragmentos de HTML são concatenados sem introduzir novos espaços na saída; o escape permanece centralizado em `presentation.js`.

[Testes](../../tests/README.md) · [Contrato dos links](../../docs/usuario/favoritos-e-links/README.md) · [Tipos](../../docs/desenvolvimento/tipos/README.md).
