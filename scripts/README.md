# Ferramentas do projeto

Todos os comandos são executados na raiz do repositório. Node.js 20+ e Python 3.10+ são suficientes; não há pacotes a instalar.

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor HTTP local da pasta `web`, na porta 3000 (`PORT` altera a porta) |
| `npm run build` | Copia a aplicação para `dist/`, sem alterar os fontes |
| `npm test` | Testa domínio, dados e integridade das páginas com o executor nativo do Node |
| `npm run check` | Valida sintaxe, catálogo e caminhos locais |
| `npm run data:refresh` | Reproduz a importação dos CSVs da PokéAPI no commit fixado |

O importador reutiliza `.cache/<commit>/` e publica arquivos completos por substituição atômica. Para atualizar a fonte, defina `POKEAPI_REVISION` com um SHA revisado, execute a importação, os testes e confira o diff. A versão original do Java continua em `src/`.
