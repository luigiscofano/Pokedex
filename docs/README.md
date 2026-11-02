# Central de documentação

[Apresentação do projeto](../README.md) · [Contribuir](../CONTRIBUTING.md) · [Histórico](../CHANGELOG.md)

Os guias são organizados por objetivo. O README inicial apresenta o projeto; os guias abaixo aprofundam os assuntos sem exigir a leitura de toda a documentação para começar.

## Escolha seu caminho

| Quero… | Caminho sugerido |
| --- | --- |
| Abrir e explorar a Pokédex | [Executar](../README.md#como-executar) → [Primeira exploração](usuario/README.md) → [Fichas](usuario/fichas/README.md) |
| Entender formas e shiny | [Catálogo](usuario/catalogo/README.md) → [Formas e shiny](usuario/formas-e-shiny/README.md) |
| Guardar e compartilhar uma seleção | [Favoritos e links](usuario/favoritos-e-links/README.md) |
| Alterar a interface ou uma regra | [Arquitetura](desenvolvimento/README.md) → [Módulos JS](../web/js/README.md) → [Testes](../tests/README.md) |
| Atualizar ou auditar os dados | [Origem e importação](dados/README.md) → [Esquema](../web/data/README.md) → [Fontes](FONTES.md) |
| Estudar o exercício original | [Java](../src/README.md) → [Modelo](../src/model/README.md) → [Enumeração](../src/model/enums/README.md) |
| Revisar e publicar uma entrega | [Contribuição](../CONTRIBUTING.md) → [CI](../.github/README.md) → [Publicação](publicacao/README.md) |
| Resolver um erro | [Solução de problemas](solucao-de-problemas/README.md) |

## Guias de uso

| Documento | Profundidade | Conteúdo |
| --- | --- | --- |
| [Primeira exploração](usuario/README.md) | Curto | Roteiro inicial e conceitos básicos |
| [Catálogo](usuario/catalogo/README.md) | Intermediário | Busca, filtros, ordenação e paginação |
| [Fichas](usuario/fichas/README.md) | Detalhado | Seis abas, exemplos visuais e limites dos registros |
| [Formas e shiny](usuario/formas-e-shiny/README.md) | Detalhado | Identidades, imagens, fallback e preferência global |
| [Favoritos e links](usuario/favoritos-e-links/README.md) | Intermediário | Persistência, parâmetros compartilhados e teclado |
| [Galeria](imagens/README.md) | Visual | Nove capturas, versões e contexto |

## Guias técnicos

| Documento | Profundidade | Conteúdo |
| --- | --- | --- |
| [Arquitetura](desenvolvimento/README.md) | Detalhado | Camadas, fluxo, concorrência, estados e decisões |
| [Eficácia de tipos](desenvolvimento/tipos/README.md) | Focado | Fórmulas, exemplos e limites |
| [Dados e atualização](dados/README.md) | Detalhado | Snapshot, IDs, importação e auditoria |
| [Dicionário dos JSONs](../web/data/README.md) | Referência detalhada | Campos, tuplas, unidades, dicionários e manifesto |
| [Lotes de espécies](../web/data/species/README.md) | Curto | Fórmula, exemplos de fronteira e carregamento |
| [Aplicação web](../web/README.md) | Curto | Mapa de arquivos e dependências externas |
| [Módulos JavaScript](../web/js/README.md) | Intermediário | Responsabilidades e funções principais |
| [Ferramentas](../scripts/README.md) | Intermediário | Comandos, servidor, build e importador |

## Java original

| Documento | Profundidade | Conteúdo |
| --- | --- | --- |
| [Exercício Java](../src/README.md) | Detalhado | Compilação, saída prevista, leitura guiada e POO |
| [Modelo Pokemon](../src/model/README.md) | Focado | Estado, construtores, cópia, dano e contratos |
| [Enum Tipo](../src/model/enums/README.md) | Curto | 18 constantes e diferença para IDs da base web |

## Qualidade e manutenção

| Documento | Conteúdo |
| --- | --- |
| [Testes](../tests/README.md) | Suíte automatizada e cenários manuais por mudança |
| [Registro de validação](VALIDACAO.md) | Evidências, versões e alcance das verificações |
| [CI e revisão](../.github/README.md) | Jobs, limites e organização de branches/PRs |
| [Publicação](publicacao/README.md) | Build, hospedagem, conferência e recuperação |
| [Solução de problemas](solucao-de-problemas/README.md) | Ambiente, imagens, favoritos, links e deploy |
| [Contribuição](../CONTRIBUTING.md) | Preparação, escopo de branch, revisão e créditos |
| [Fontes](FONTES.md) | Autoria, proveniência e interpretação dos dados |
| [Histórico](../CHANGELOG.md) | Mudanças implementadas por versão |

## Manter estes guias coerentes

Ao mudar um comportamento, atualize o guia do assunto e os exemplos afetados. Use o manifesto como referência de contagens e revisão dos dados. Atualize a versão das capturas quando necessário; uma imagem antiga pode permanecer como histórico, desde que identificada.

A documentação distingue recursos implementados de ideias futuras, testes automáticos de conferências manuais e a versão do código da publicação hospedada. Isso permite revisar cada entrega sem depender do contexto de uma conversa.
