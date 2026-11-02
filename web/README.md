# Aplicação web

Este é o produto navegável da Pokédex. Abra por HTTP usando `npm run dev` na raiz; não use `file://`.

| Arquivo/pasta | Função |
| --- | --- |
| `index.html` | Estrutura semântica, catálogo, diálogos e conteúdo inicial |
| `styles.css` | Layout responsivo, cores de tipos, foco e preferência de movimento reduzido |
| `icon.svg` | Ícone vetorial da interface |
| `js/` | Módulos ES de interface, dados e domínio |
| `data/` | Snapshot local da base, dividido por responsabilidade |

A página inicial renderiza 24 cartões; o botão de paginação acrescenta mais resultados. Filtros podem ser combinados. O seletor **Incluir formas** distingue o catálogo nacional das formas adicionais. Fichas abrem em diálogo e mantêm um link direto por forma.

Apenas imagens, metadados de sprites cosméticos e fontes tipográficas usam serviços externos. Caso uma fonte tipográfica não carregue, o sistema usa uma fonte local. Os dados principais estão no repositório. Favoritos usam `localStorage` com tratamento de erros.

O arquivo `app.js` escapa texto da fonte antes de formar HTML. IDs de navegação são resolvidos contra o catálogo. Respostas antigas de uma ficha não substituem outra aberta posteriormente.
