# Aplicação web

[Início](../README.md) · [Arquitetura](../docs/desenvolvimento/README.md) · [Guia de uso](../docs/usuario/README.md)

Esta pasta contém o código-fonte da Pokédex que roda no navegador. Execute `npm run dev` na **raiz do repositório** e abra `http://localhost:3000`; os módulos e os JSONs precisam de uma origem HTTP.

| Caminho | Papel |
| --- | --- |
| [index.html](index.html) | Cabeçalho, chamada “Temos que pegar!”, controles, rodapé e diálogos |
| [styles.css](styles.css) | Layout, responsividade, tipos com símbolos vetoriais e faixas coloridas, foco e movimento reduzido |
| [icon.svg](icon.svg) | Ícone vetorial da interface e placeholder de imagens |
| [js/](js/README.md) | Regras, dados e coordenação da interface |
| [data/](data/README.md) | Snapshot local, manifesto e fichas por espécie |

O build copia `web/` para `dist/`. Edite aqui; a próxima geração substitui a saída em `dist/`. Markdown dentro de `web/` serve à documentação no GitHub e não é necessário à lógica de navegação.

## Recursos e dependências de rede

O catálogo inicia com 24 cartões. As fichas usam seis abas e carregamento por lote. Busca, tipos, formas, shiny e favoritos são coordenados no navegador. Imagens, metadados de sprites cosméticos e fontes tipográficas são externos; os JSONs principais estão no projeto. O CSS dispõe de fontes alternativas locais se o serviço tipográfico falhar.

Favoritos e a forma escolhida como destaque ficam no `localStorage` da origem. Não há backend de contas, chave de API, banco remoto, service worker ou garantia de funcionamento offline. O servidor de desenvolvimento apenas fornece os arquivos.

Antes de enviar mudanças visuais, confira cartões, forma alternativa, shiny, ficha com dados ausentes, foco de teclado e tela estreita. [Validação](../tests/README.md).

## Regiões, navegação e símbolos

A página começa com “Temos que pegar!” e a descrição, sem o antigo botão de partida nem o texto introdutório removido. O painel de regiões usa carcaça vermelha discreta e tela LCD; os botões filtram pela geração da espécie e ficam em três colunas em telas estreitas. `navigation.js` mantém Explorar/Favoritos coerentes com o catálogo, e o total encontrado aparece em negrito.

Os tipos usam SVGs locais em `type-icons.js`, compartilhados por cartões, fichas e eficácia. Psíquico, Aço, Sombrio em eclipse e Lutador angular têm desenhos refinados sem dependência de imagens externas.

## Tipografia

`styles.css` centraliza as famílias em `--font-heading` (Chakra Petch) e `--font-body` (Barlow). Títulos, marca e números de destaque usam a primeira; parágrafos, formulários, abas, tabelas e faixas de tipos usam a segunda. O carregamento via Google Fonts usa `display=swap`, com fallback sans-serif.
