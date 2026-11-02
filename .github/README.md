# Automação, branches e revisão

[Início](../README.md) · [Contribuir](../CONTRIBUTING.md) · [Validação](../tests/README.md)

## Workflow atual

[workflows/ci.yml](workflows/ci.yml) executa em `push` e `pull_request`, com permissão `contents: read`.

| Job | Ambiente | Verificações |
| --- | --- | --- |
| `web` | Ubuntu + Node.js 22 | `npm run check`, `npm test`, `npm run build` |
| `java-original` | Ubuntu + Temurin JDK 17 | Compilação UTF-8 e execução de `Main` |

O workflow não publica o site, não valida automaticamente todos os links Markdown e não realiza testes visuais no navegador. Também não estabelece por si só proteção de `main` ou revisão obrigatória: esses controles são configurações separadas do GitHub.

## Organização das entregas

Use branches `docs/`, `feat/`, `fix/`, `test/`, `build/` ou `data/`, com nomes ligados ao assunto. Um PR deve representar uma mudança que possa ser compreendida e revisada como unidade. A documentação está dividida por uso, arquitetura/dados, Java, qualidade/publicação e apresentação inicial.

O [template de PR](pull_request_template.md) pede problema, resultado, validação e limites. Descreva o estado final para alguém que não participou da conversa de implementação. A integração por merge mantém os commits e o vínculo do PR no histórico; remoção de branches após a integração é uma decisão de manutenção.

A atualização do README não implica alteração da versão do aplicativo nem deploy. Consulte o [guia de publicação](../docs/publicacao/README.md) para uma entrega do site.
