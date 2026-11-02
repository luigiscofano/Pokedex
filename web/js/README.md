# Módulos da aplicação

| Módulo | Responsabilidade |
| --- | --- |
| `domain.js` | Busca, filtros, ordenação, multiplicadores de tipo, favoritos e descrição das condições de evolução |
| `data.js` | Leitura dos dados locais com cache de promessas e recuperação após falha |
| `app.js` | Interface, eventos, navegação, fichas e estados de carregamento |

As funções de domínio não dependem do DOM. A interface consulta dados por espécie; formas e variedades mantêm seus próprios IDs. Todo texto externo é escapado antes de compor HTML. A consulta por URL usa parâmetros validados, e mudanças rápidas de ficha descartam respostas antigas.

Imagens são externas: ilustrações da PokéAPI têm fallback para sprites e estado explícito quando nenhum recurso está disponível. Dados das fichas estão no próprio projeto, sem chave de API ou serviço de backend.
