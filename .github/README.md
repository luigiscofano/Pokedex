# Automação, branches e revisão

[Início](../README.md) · [Contribuir](../CONTRIBUTING.md) · [Validação](../tests/README.md)

## Workflow atual

[workflows/ci.yml](workflows/ci.yml) executa em `push` e `pull_request`, com permissão `contents: read`.

| Job | Ambiente | Verificações |
| --- | --- | --- |
| `web` | Ubuntu + Node.js 22 | `npm run check`, `npm test`, `npm run build` |
| `java-original` | Ubuntu + Temurin JDK 17 | Compilação UTF-8 e execução de `Main` |

O workflow não publica o site e não realiza testes visuais no navegador. `npm run check` inclui os destinos locais dos links e imagens Markdown; URLs externas, âncoras e links/imagens em HTML embutido nos documentos ficam fora dessa automação. Também não estabelece por si só proteção de `main` ou revisão obrigatória: esses controles são configurações separadas do GitHub.

## Organização das entregas

Use branches `docs/`, `feat/`, `fix/`, `test/`, `build/`, `data/` ou `chore/`, com nomes ligados ao assunto. Um PR deve representar uma mudança que possa ser compreendida e revisada como unidade. A documentação está dividida por uso, arquitetura/dados, Java, qualidade/publicação e apresentação inicial.

O [template de PR](pull_request_template.md) pede problema, resultado, validação e limites. Descreva o estado final para alguém que não participou da conversa de implementação. Abra a entrega como **draft** enquanto houver trabalho ou validação pendente. Merge, auto-merge, exclusão de branches e publicação do site são decisões separadas: um PR de revisão não as autoriza.

## Inventário desta revisão

Na consulta de 09/11/2026, antes da nova revisão, o repositório tinha **25 branches** e **24 PRs, todos integrados**, sem PR aberto. São números de uma consulta pontual, não contagens permanentes. As branches históricas permanecem preservadas; esta revisão reúne documentação, imagens e manutenção relacionada em uma entrega com um único PR, aberto inicialmente como draft. Integração, publicação e eventual remoção de branches são etapas separadas. Consulte o estado vivo em [branches](https://github.com/luigiscofano/Pokedex/branches) e [pull requests](https://github.com/luigiscofano/Pokedex/pulls).

A atualização do README não implica alteração da versão do aplicativo nem deploy. Consulte o [guia de publicação](../docs/publicacao/README.md) para uma entrega do site.
