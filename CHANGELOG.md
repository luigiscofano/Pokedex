# Histórico de mudanças

## 1.3.3 — 2026-11-09

Esta revisão reúne a manutenção atual e os recursos implementados após os registros abaixo. A versão do pacote e a versão publicada em Sites são identificadores independentes; publicação e integração devem ser verificadas no commit correspondente.

- Seletor de regiões em Pokédex de bolso com carcaça vermelha discreta, tela LCD, seleção acessível e grade móvel de três colunas.
- Remoção do botão “Começar a explorar” e do texto “Um universo de descobertas”; título e descrição preservados.
- Navegação Explorar/Favoritos sincronizada com o catálogo e quantidade encontrada em negrito.
- Ícones refinados de Psíquico, Aço, Sombrio em eclipse e Lutador em silhueta angular, compartilhados pelos componentes de tipos.
- README, guias técnicos/de uso e distribuição da suíte alinhados ao código; correção da tabela de navegação da documentação.
- Quatro capturas atuais e separação explícita das imagens históricas, sem remover seu arquivo.
- Organização da revisão em uma entrega coerente, preservando o histórico de branches e PRs.

- Busca do catálogo com cache de nomes normalizados e invalidação por alteração de campos; favoritos consultados por `Set`, sem mutar as entradas.
- Consulta de golpes preparada uma vez por renderização, mantendo normalização de acentos/espaços e o grupo de versões.
- Verificação dos destinos locais de links/imagens Markdown integrada a `check`, com comando `check:docs` e nove regressões próprias, incluindo parênteses em destinos, fechamento de blocos de código e comentários HTML.
- Benchmark reproduzível de 6.048 combinações de filtros e consultas isoladas, sem limite de tempo usado como critério do CI.
- Quinze regressões acrescentadas: suíte ampliada de 51 para 66 testes. Resultados da execução e limites estão no [registro de validação](docs/VALIDACAO.md).

## 1.3.2 — 2026-11-04

- Botão de destaque grafite, texto branco e Pokébola vetorial monocromática, nos estados Tornar destaque e Em destaque.
- Controle mantido somente nas ações internas da ficha.
- Registro daquela entrega: 40 testes, check e build aprovados; veja [validação histórica](docs/VALIDACAO.md).

## 1.3.1 — 2026-11-04

- Remoção do controle de destaque dos cartões; escolha mantida dentro da ficha, sem alterar o armazenamento local.
- Regressão para presença na ficha e ausência nos cartões.

## 1.3.0 — 2026-11-04

- Forma em destaque personalizável, com número nacional, tipos, imagem e abertura da ficha correspondentes.
- Persistência local independente dos favoritos, retorno seguro a Charizard e aviso quando a preferência não pode ser salva.
- Modo shiny global preservado; cobertura de seleção, repetição, IDs inválidos e armazenamento bloqueado.

## 1.2.1 — 2026-11-04

- Chakra Petch aplicada a títulos, marca e números de destaque; Barlow a textos, controles, descrições e rótulos de tipos.
- Tokens CSS centralizados e remoção de todas as famílias tipográficas anteriores.
- Onze capturas reais renovadas, incluindo os layouts responsivos de 320 e 375 pixels.
- Teste de regressão tipográfica adicionado; 34 testes aprovados.

## 1.2.0 — 2026-11-04

- Tipos redesenhados com faixas retangulares, corte diagonal, símbolos brancos próprios de cada tipo e cores vivas, seguindo a referência visual.
- Dezoito ícones SVG locais, nítidos em telas de alta densidade e zoom, com texto acessível independente de cor.
- Componente compartilhado no destaque, catálogo, fichas, eficácia e golpes; pares de tipos adjacentes.
- Grade móvel ajustada para preservar pares legíveis sem cortar símbolos ou nomes.
- Dez capturas reais substituídas e uma captura responsiva adicionada; README e guias alinhados com o novo visual.
- Quatro testes de apresentação adicionados; total de 33 testes.

## 1.1.2 — 2026-11-02

- Refatoração de JavaScript, HTML/CSS, ferramentas Node/Python, testes e exercício Java, com comentários explicativos em português.
- Separação dos painéis, seleção, apresentação e tratamento de imagens em módulos próprios; handlers de eventos nomeados.
- Filtros, ordenação e cache organizados em funções com responsabilidades definidas.
- Importador dividido em etapas, preservando os 24 JSONs byte por byte; base e regras mantidas.
- Dez novos testes de carregamento, seleção e apresentação; total de 29 testes.
- Convenções de edição e formatação, documentação técnica revisada e demonstração Java sem a coleção não utilizada.

## Documentação ampliada — 2026-11-02

- README inicial com apresentação, oito capturas, exemplos de uso, execução, decisões técnicas e mapa de guias.
- Documentação por público: catálogo, fichas, formas/shiny, favoritos/links, arquitetura, tipos, dados, Java, testes, contribuição e publicação.
- Seis novas capturas reais e galeria com contexto e versão das nove imagens.
- Dicionário de dados, limites de validação e instruções de solução de problemas revisados.
- Organização em cinco entregas temáticas por branch e PR; versão do aplicativo mantida em 1.1.1.

## 1.1.1 — 2026-11-02

- Chamada principal “Temos que pegar!”, mantendo a descrição sobre explorar espécies e formas.
- Apresentação como uma Pokédex de fã, feita por Luigi Scofano de Araujo para outros fãs de Pokémon, no rodapé e em Sobre.
- Remoção de “De Bulbasaur a Pecharunt.” e “EXPLORE O EXTRAORDINÁRIO”.

## 1.1.0 — 2026-11-02

- Alternância Normal/Shiny no catálogo e nas fichas, aplicada também ao destaque e às evoluções.
- Preferência shiny preservada nos links, sprites específicos de formas cosméticas e aviso explícito quando a imagem está ausente.
- Contornos na cor de cada tipo e texto mais contrastante nos badges.
- Cinco testes de seleção, cache e recuperação de imagens; documentação de uso atualizada.

## 1.0.0 — 2026-11-02

- Aplicação web com catálogo de 1.025 espécies e 1.579 formas da base versionada.
- Busca, filtros, ordenação, favoritos locais e links diretos para fichas.
- Seis seções de ficha: visão geral, tipos, textos dos jogos, evoluções, encontros e golpes.
- Importador reproduzível, hashes de auditoria e referências preservadas por versão/idioma.
- 14 testes automatizados, verificação estática, build sem dependências e CI.
- Interface responsiva, navegação por teclado e recuperação de erros.
- Guias por área e capturas reais da aplicação.
- Preservação das classes Java e do histórico original de 2023.

## 2026-10-31

- Padronização da documentação do exercício Java e instruções de execução.

## 2023-09-21

- Projeto inicial em Java: modelo Pokémon, enumeração de tipos, cópia, dano e demonstração no terminal.
