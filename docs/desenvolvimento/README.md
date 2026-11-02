# Arquitetura e desenvolvimento

## Separação de responsabilidades

| Camada | Arquivos | Contrato |
| --- | --- | --- |
| Apresentação | `web/index.html`, `web/styles.css`, `web/js/app.js` | Renderiza estado e traduz eventos do usuário em consultas |
| Domínio | `web/js/domain.js` | Funções puras de filtro, tipos, identificação, favoritos e condições de evolução |
| Acesso a dados | `web/js/data.js` | Carrega JSONs locais, reutiliza promessas e resolve imagens externas |
| Importação | `scripts/import-data.py` | Normaliza CSVs de revisão fixa e gera manifesto verificável |
| Qualidade | `tests/`, `scripts/check.mjs` | Verifica regras, referências, contagens, hashes e sintaxe |

A aplicação é estática. Não existem servidor de API, banco externo, login próprio ou segredo necessário para executar. O servidor Node de desenvolvimento apenas fornece arquivos HTTP.

## Estado e navegação

`state` concentra filtros, paginação, favorito, forma e aba selecionados. A busca utiliza normalização Unicode NFD. O estado principal de busca e a ficha selecionada são refletidos na URL. Os detalhes são buscados pelo ID da espécie; a variedade correta é escolhida pelo `pokemon` da forma.

Ao mudar rapidamente de ficha, um contador de requisição impede que uma resposta antiga substitua o conteúdo novo. Há outro contador para a aba de evoluções, que pode consultar várias espécies. Promessas rejeitadas são retiradas do cache para permitir nova tentativa.

## Segurança e acessibilidade

Textos externos passam por escape de HTML. URLs de sprites específicos são aceitas apenas do domínio `raw.githubusercontent.com`. O importador fixa a revisão da fonte. Nenhuma chave ou credencial é necessária no frontend.

Diálogos usam o elemento nativo `dialog`; abas têm roles, estado selecionado e navegação por setas. Controles têm rótulos, foco visível e áreas responsivas. Movimento reduzido é respeitado pelo CSS.

## Fluxo recomendado

```sh
git switch -c feat/nome-do-recurso
npm run dev
npm run check
npm test
npm run build
```

Abra um PR com problema, resultado e validação. Use `fix/` para correções, `docs/` para documentação, `test/` para verificação e `build/` para infraestrutura. Não fragmente mudanças dependentes em PRs que não possam ser compreendidos ou revisados.

## Java original

`src/Main.java`, `src/model/Pokemon.java` e `src/model/enums/Tipo.java` permanecem independentes. O catálogo web não importa essas classes. O histórico anterior foi preservado para mostrar a evolução do projeto desde 2023.
