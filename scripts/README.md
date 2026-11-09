# Ferramentas de desenvolvimento e dados

[Início](../README.md) · [Dados](../docs/dados/README.md) · [Publicação](../docs/publicacao/README.md)

Execute os comandos na raiz do repositório. Node.js 20+ atende ao aplicativo e às verificações. Python 3.10+ só é necessário para importar os dados; não há pacotes npm ou Python a instalar.

| Comando | Arquivo | Resultado |
| --- | --- | --- |
| `npm run dev` | [serve.mjs](serve.mjs) | Serve `web/` por HTTP, porta 3000 por padrão |
| `npm run dev -- --port 3001` | `serve.mjs` | Usa outra porta; acesse `http://localhost:3001` |
| `npm run build` | [build.mjs](build.mjs) | Recria `dist/` como cópia de `web/` |
| `npm run check` | [check.mjs](check.mjs) | Verifica sintaxe JS, referências locais do HTML/Markdown e invariantes básicos |
| `npm run check:docs` | [check-docs.mjs](check-docs.mjs) | Confere destinos locais dos links e imagens Markdown |
| `npm run benchmark` | [benchmark-search.mjs](benchmark-search.mjs) | Compara filtros e mede consultas isoladas com cache aquecido |
| `npm test` | Executor nativo do Node | Executa `tests/*.test.mjs` |
| `npm run data:refresh` | [import-data.py](import-data.py) | Gera JSONs a partir da revisão fixa da PokéAPI |

## Servidor

`--port` tem prioridade sobre a variável `PORT`, que tem prioridade sobre 3000. O servidor serve arquivos e devolve 404 para caminhos ausentes. Escuta em `0.0.0.0`; o acesso a partir de outro dispositivo depende da rede e do firewall. É uma ferramenta de desenvolvimento, não uma infraestrutura de publicação autenticada.

## Build e verificação

O build apaga e recria **somente a saída `dist/`**. Não há minificação ou instalação de dependências. `npm run check` usa `node --check`, confere referências `./` no HTML, a contagem de espécies e o uso de execução dinâmica em todos os módulos JavaScript da interface. Ele também executa `check-docs.mjs`, que confere a existência dos destinos locais dos links/imagens Markdown, inclusive referências, caminhos codificados e parênteses em destinos. O verificador ignora exemplos de código e comentários HTML; URLs externas, âncoras e links/imagens em HTML embutido não são verificados. Ele não é um parser Markdown completo. Nenhuma dessas verificações valida pixels, CSS, acessibilidade integral ou comportamento no navegador.

## Medir consultas de busca

`npm run benchmark` primeiro compara **6.048 combinações de filtros** com a referência anterior à otimização. Em seguida, informa medianas de nove amostras com 200 chamadas por amostra, usando cache aquecido. Os resultados variam com hardware e runtime e não estabelecem um limite de aprovação do CI. A ferramenta não mede DOM, rede, uso de memória ou a primeira consulta.

A implementação de referência existe somente no benchmark, com o commit de origem identificado; ela não entra no aplicativo. O [registro de validação](../docs/VALIDACAO.md) apresenta a medição desta revisão.

## Importador

A primeira execução baixa CSVs públicos; as seguintes reutilizam `.cache/<SHA>/`. O importador tenta cada download até quatro vezes e grava arquivos por substituição a partir de temporários. `POKEAPI_REVISION` seleciona outra revisão; seu uso exige revisar e versionar o resultado de forma coerente.

Não execute `data:refresh` só para abrir o site. Para uma atualização real, siga o [procedimento de dados](../docs/dados/README.md) e não publique uma geração interrompida.

## Organização do importador

`import_data()` coordena etapas nomeadas: `build_species`, `build_varieties`, preenchimento de descrições/aprendizados/encontros, `build_catalog`, `build_reference`, `validate_snapshot` e `write_snapshot`. Docstrings em português registram os contratos. A revisão, o tamanho dos lotes e os parâmetros de download têm constantes próprias.

A refatoração foi comparada ao snapshot existente: os 24 JSONs gerados, inclusive o manifesto, permaneceram idênticos em bytes. Não é necessário baixar a base novamente para usar o site.
