# Registro de validação

[Início](../README.md) · [Suíte e roteiro manual](../tests/README.md) · [Galeria](imagens/README.md)

Este registro distingue resultados observados, verificações automatizadas e limites. A versão declarada do pacote está em [package.json](../package.json); a sequência de publicações do site é independente. Os registros antigos abaixo preservam o contexto de cada entrega, sem substituir a validação do commit atual.

## Revisão 1.3.3 de manutenção e documentação — 2026-11-09

Base revisada: `main` no commit `efe898cda73436b125204e54cc484af0b6a97db6`. O inventário consultado antes desta revisão continha 25 branches e 24 PRs integrados, sem PR aberto. Esse estado é histórico; a lista atual fica no GitHub.

### Comportamentos documentados

- Regiões na Pokédex de bolso com carcaça vermelha discreta e tela LCD, seleção acessível e grade de três colunas em tela estreita.
- Início com título e descrição, sem “Começar a explorar” ou “Um universo de descobertas”.
- Favoritos selecionado somente enquanto a coleção é exibida; Explorar sai desse filtro. Quantidade encontrada em negrito.
- Ícones refinados de Psíquico, Aço, Sombrio em eclipse e Lutador angular.
- Destaque escolhido somente na ficha, persistência local e Normal/Shiny preservados.

### Verificações desta revisão

| Verificação | Resultado registrado |
| --- | --- |
| `npm run check` | Aprovado: sintaxe JavaScript, referências locais de HTML/Markdown e invariantes do manifesto |
| `npm test` | **66 testes aprovados**, sem falhas |
| `npm run build` | Aprovado: saída estática gerada em `dist/` |
| `npm run check:docs` | Aprovado nos 30 arquivos Markdown do repositório; destinos locais de links/imagens encontrados |
| Revisão documental complementar | Caminhos, âncoras locais, tabelas, contagens e legendas conferidos; URLs externas não foram auditadas integralmente; o checker não verifica links/imagens em HTML embutido |
| Java local | **Não executado**: `javac` não está instalado neste ambiente |
| Java e CI remoto | Validação separada nos checks do commit/PR; o job `java-original` usa Temurin JDK 17 |

Resultados locais não antecipam o resultado do CI remoto. Confira os checks do commit integrado antes de considerar a validação Java concluída.

- Comparação diferencial: **6.048 combinações de filtros** equivalentes à implementação anterior e **23.450 saídas HTML de golpes** idênticas. A primeira pode ser repetida com `npm run benchmark`; a comparação de HTML foi pontual.
- Navegador: busca `#0025` encontrou Pikachu e `flabebe` encontrou Flabébé. Enter em Unova retornou 156 espécies, com uma única região selecionada.
- Favoritos: inclusão, remoção, estado vazio com zero resultados, seleção do menu e retorno por Explorar conferidos.
- Golpes de Charizard em Scarlet Violet: ` FLÁME ` retornou três registros; consulta sem correspondência mostrou estado vazio. Escape fechou a ficha e devolveu o foco.
- Layout: desktop e frames de 390/320 pixels, com 375/305 pixels úteis, conferidos sem transbordamento horizontal. São viewports simulados, não aparelhos físicos.
- Quatro capturas reais em JPG: início, regiões, favoritos e comparação dos frames móveis. A otimização não alterou HTML, CSS ou ícones da interface.

### Medição pontual de filtros

Node.js **24.22.1**, Linux x64. Mediana de **nove amostras com 200 chamadas cada**, cache aquecido; referência anterior no commit `efe898cda73436b125204e54cc484af0b6a97db6`.

| Consulta | Antes (ms/chamada) | Depois (ms/chamada) | Razão antes/depois |
| --- | ---: | ---: | ---: |
| Texto | 0,4263 | 0,0886 | 4,81× |
| Texto com acentos | 0,4077 | 0,0890 | 4,58× |
| Número nacional | 0,3984 | 0,0831 | 4,80× |
| 790 favoritos | 0,8382 | 0,0754 | 11,11× |
| Texto e favoritos | 0,9623 | 0,1058 | 9,10× |
| Sem consulta | 0,0466 | 0,0465 | Praticamente igual |

A medição cobre a função de filtro, não DOM, rede, memória, carregamento inicial ou primeira consulta. Ela não permite afirmar que o site inteiro ficou essa quantidade de vezes mais rápido. Os tempos variam entre execuções e não são usados como critério de aprovação do CI.

As capturas atuais estão na [galeria](imagens/README.md#capturas-atuais). Os JPEGs anteriores foram reconciliados com os arquivos do GitHub e mantidos como histórico. Links, contagens, módulos e guias foram revisados em conjunto.

### Limites

Nenhuma contagem de testes demonstra ausência de defeitos. Testes Node, inspeção visual, CI e publicação são verificações distintas. Não há nesta documentação promessa de auditoria integral de acessibilidade, cobertura de todos os aparelhos, disponibilidade contínua das imagens externas ou atualização automática da PokéAPI.

## Registros históricos

As entradas a seguir descrevem verificações registradas nas entregas anteriores. As menções a capturas renovadas pertencem àquelas etapas; a referência da interface atual são as quatro capturas desta revisão.

## Botão grafite 1.3.2 — 2026-11-04

- Opção visual 5: fundo grafite, texto branco e Pokébola monocromática vetorial. Posição preservada dentro da ficha.
- 40 testes, check e build aprovados.
- Chromium: estado Tornar destaque, clique para Em destaque e recarga conferidos; ícone presente nos dois estados e preferência mantida.
- Capturas de botão não selecionado e selecionado atualizadas localmente; onze capturas principais renovadas.
- A linha de ações quebra em telas estreitas, preservando a ordem dos controles. Frames 320/375 conferidos sem corte de botões.

## Destaque somente na ficha 1.3.1 — 2026-11-04

- Controle removido dos cartões; permanece nas ações internas de cada ficha.
- 39 testes, check e build aprovados; regressão confere ausência do botão na função de cartões e presença única na ficha.
- Chromium: 0 controles de destaque nos cartões e 1 na ficha; escolha de Pikachu mantida após recarga.
- Capturas da ficha e catálogo atualizadas. A escolha e o armazenamento local não mudaram.

## Destaque personalizável 1.3.0 — 2026-11-04

- `npm test`: 39 testes aprovados; `npm run check` e `npm run build` aprovados.
- Persistência testada para todas as 1.579 formas, valores inválidos, ID ausente, armazenamento bloqueado, trocas e repetição.
- Chromium: Bulbasaur pelo cartão, Pikachu pela ficha e cliques repetidos; recarga mantém escolha e abertura do destaque aponta para a ficha correta.
- Mega Charizard X: nome, número nacional, tipos Fogo/Dragão, imagem shiny da variedade 10034 e abertura da ficha conferidos.
- Frames reais de 320/375 pixels inspecionados; documento de 320 sem transbordamento horizontal. Não é teste em aparelho físico.
- Três capturas novas: destaque desktop, ficha e responsivo. Fontes Chakra Petch/Barlow preservadas.
- Java não alterado. Publicação e CI remoto são etapas separadas desta verificação local.

## Tipografia 1.2.1 — 2026-11-04

- `npm test`: 34 testes aprovados; `npm run check` e `npm run build` aprovados.
- Chromium: família computada Chakra Petch no título e Barlow no corpo e badges; sem transbordamento horizontal no documento desktop.
- Capturas renovadas de início, catálogo, formas, ficha, shiny, tipos, textos, evoluções, encontros, golpes e frames responsivos de 320/375 pixels.
- Layout responsivo inspecionado visualmente em frames reais, não em aparelho físico.
- O teste de regressão impede o retorno das famílias anteriores e confere os tokens e sua aplicação em títulos, badges e descrições.
- Java não foi alterado; validação de CI remoto deve ser consultada no commit publicado.

## Tipos vetoriais 1.2.0 — 2026-11-04

- `npm run check`, `npm test` (33 casos) e `npm run build`: aprovados no Linux com Node.js 24.
- Chromium: conferidos destaque, catálogo, ficha normal/shiny, Mega Charizard X, eficácia, textos, evoluções, encontros e golpes.
- Charizard mantém Pedra 4×, Terra 0× e Planta 0,25×; Mega X mantém Fogo/Dragão e total 634.
- Teclado: setas nas abas e Escape para fechar; reabertura e navegação Voltar/Avançar conferidas.
- Layouts de 320 e 375 pixels simulados em frames reais da aplicação: nomes e símbolos legíveis, pares contíguos, sem transbordamento horizontal do documento de 320 pixels. Não é um teste em aparelho físico.
- Dez capturas do repositório renovadas e uma responsiva adicionada, sem reconstrução ou ampliação artificial.
- Ícones são SVG e os rótulos são texto; a referência raster não é usada como sprite ampliado.
- Java e CI remoto devem ser consultados separadamente no resultado do commit; não são inferidos destas verificações locais.

## Refatoração 1.1.2 — 2026-11-02

| Verificação | Resultado |
| --- | --- |
| Sintaxe, referências HTML e manifesto | `npm run check` aprovado; execução dinâmica verificada em todos os módulos JS |
| Suíte permanente | 29 testes aprovados, incluindo dez novos casos de carregamento e painéis |
| Filtros | 504 cenários comparados com a versão anterior, com resultados idênticos |
| Apresentação | 11.058 comparações de HTML/imagens, sem diferenças de saída |
| Importador | 24 JSONs reconstruídos com os CSVs da mesma revisão, idênticos em bytes |
| Navegador | Catálogo, formas, shiny, textos, golpes, favoritos, links, teclado e família de Eevee conferidos em Chromium |
| Geometria inicial | Dimensões e posições do hero, título, ilustração, pesquisa e cartões iguais à referência anterior no mesmo viewport |
| Java | Compilação e execução delegadas ao job JDK 17 do CI; compilador indisponível localmente |

As comparações diferenciais e a reconstrução com CSVs em cache são verificações pontuais da entrega. A suíte permanente e os checks de cada PR ficam no GitHub. A conferência visual desta revisão foi em desktop; as regras responsivas foram preservadas, sem uma nova rodada em aparelhos físicos.

## Verificações locais da revisão documental anterior (1.1.1)

| Verificação | Resultado |
| --- | --- |
| `npm run check` | Aprovado: sintaxe JavaScript, referências locais do HTML e manifesto |
| `npm test` | 19 testes aprovados: 8 de domínio, 6 de dados e 5 de imagens |
| `npm run build` | Aprovado: geração estática em `dist/` |
| Links e âncoras Markdown | Caminhos relativos e âncoras conferidos por verificação específica da documentação |
| Imagens da documentação | Nove JPGs legíveis; seis capturas novas e três anteriores identificadas por versão |
| Escopo do diff | Documentação e imagens; arquivos executáveis, JSONs e classes Java preservados |
| Java local | Não executado nesta revisão: `javac` não está disponível no ambiente local |

A conferência de Markdown é separada de `npm run check`; não foi adicionada como etapa permanente do CI. Os resultados de CI de cada entrega ficam associados aos respectivos PRs no GitHub.

## CI

O [workflow](../.github/workflows/ci.yml) executa a verificação web com Node.js 22 e compila/executa o Java original com JDK 17. Consulte os checks do commit ou PR para confirmar seu resultado. O job Java é uma verificação de compilação e execução da demonstração, não uma suíte unitária completa.

## Capturas históricas da revisão documental 1.1.1

As seis novas capturas foram obtidas na aplicação hospedada, em Chromium, na versão 1.1.1:

- Catálogo de Charizard com quatro formas e Shiny selecionado.
- Painel de tipos do Charizard padrão.
- Texto de Charizard em inglês para Shield.
- Trecho da família de Eevee, incluindo Flareon, Espeon e Umbreon.
- Encontros de Pikachu em Red.
- Golpes de Charizard em Scarlet Violet, com busca `flame`.

A [galeria](imagens/README.md) identifica o contexto de cada arquivo. A captura anterior da visão geral sem controles shiny é histórica da versão 1.0.0; não é usada como evidência da apresentação atual desses controles.

## Evidências anteriores preservadas

A revisão da versão 1.0.0 registrou 14 testes aprovados e conferências em Chromium de busca numérica, formas, tipos, textos em idiomas diferentes, família de Eevee, encontros, golpes, forma Original Cap de Pikachu, sprite de Unown B e viewport estreito sem overflow horizontal da página.

A versão 1.1.0 acrescentou cinco testes de imagens para Normal/Shiny, cache, falhas e validação de URLs. A versão 1.1.1 atualizou a chamada e os créditos do site. Essas etapas estão descritas no [histórico](../CHANGELOG.md).

## Alcance e limites

Os testes de imagens simulam respostas; não monitoram disponibilidade externa. Hashes demonstram integridade dos arquivos, não correção factual de cada interpretação. Capturas comprovam os estados mostrados, não todas as combinações possíveis de filtros.

A conferência em Chromium e viewport estreito não equivale a testes físicos em todos os dispositivos ou a uma auditoria completa de acessibilidade. Mudanças futuras devem repetir os cenários afetados do [roteiro manual](../tests/README.md).
