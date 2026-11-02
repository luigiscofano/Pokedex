# Ferramentas de desenvolvimento e dados

[Início](../README.md) · [Dados](../docs/dados/README.md) · [Publicação](../docs/publicacao/README.md)

Execute os comandos na raiz do repositório. Node.js 20+ atende ao aplicativo e às verificações. Python 3.10+ só é necessário para importar os dados; não há pacotes npm ou Python a instalar.

| Comando | Arquivo | Resultado |
| --- | --- | --- |
| `npm run dev` | [serve.mjs](serve.mjs) | Serve `web/` por HTTP, porta 3000 por padrão |
| `npm run dev -- --port 3001` | `serve.mjs` | Usa outra porta; acesse `http://localhost:3001` |
| `npm run build` | [build.mjs](build.mjs) | Recria `dist/` como cópia de `web/` |
| `npm run check` | [check.mjs](check.mjs) | Verifica sintaxe JS, referências locais do HTML e invariantes básicos |
| `npm test` | Executor nativo do Node | Executa `tests/*.test.mjs` |
| `npm run data:refresh` | [import-data.py](import-data.py) | Gera JSONs a partir da revisão fixa da PokéAPI |

## Servidor

`--port` tem prioridade sobre a variável `PORT`, que tem prioridade sobre 3000. O servidor serve arquivos e devolve 404 para caminhos ausentes. Escuta em `0.0.0.0`; o acesso a partir de outro dispositivo depende da rede e do firewall. É uma ferramenta de desenvolvimento, não uma infraestrutura de publicação autenticada.

## Build e verificação

O build apaga e recria **somente a saída `dist/`**. Não há minificação ou instalação de dependências. `npm run check` usa `node --check`, confere referências `./` no HTML, a contagem de espécies e o uso de execução dinâmica na interface. Ele não é um validador geral de Markdown, CSS, acessibilidade ou comportamento no navegador.

## Importador

A primeira execução baixa CSVs públicos; as seguintes reutilizam `.cache/<SHA>/`. O importador tenta cada download até quatro vezes e grava arquivos por substituição a partir de temporários. `POKEAPI_REVISION` seleciona outra revisão; seu uso exige revisar e versionar o resultado de forma coerente.

Não execute `data:refresh` só para abrir o site. Para uma atualização real, siga o [procedimento de dados](../docs/dados/README.md) e não publique uma geração interrompida.
