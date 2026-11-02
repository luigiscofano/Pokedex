# Registro de validação

[Início](../README.md) · [Suíte e roteiro manual](../tests/README.md) · [Galeria](imagens/README.md)

Este registro distingue resultados observados, verificações automatizadas e limites. A aplicação permanece na versão **1.1.1**; a ampliação documental de 2 de novembro de 2026 não altera suas regras, dados ou interface.

## Verificações locais da revisão documental

| Verificação | Resultado |
| --- | --- |
| `npm run check` | Aprovado: sintaxe JavaScript, referências locais do HTML e manifesto |
| `npm test` | 19 testes aprovados: 8 de domínio, 6 de dados e 5 de imagens |
| `npm run build` | Aprovado: geração estática em `dist/` |
| Links e âncoras Markdown | Caminhos relativos e âncoras conferidos por verificação específica da documentação |
| Imagens da documentação | Nove JPGs legíveis; seis capturas novas e três anteriores identificadas por versão |
| Escopo do diff | Documentação e imagens; arquivos executáveis, JSONs e classes Java preservados |
| Java local | Não executado nesta revisão: `javac` não está disponível no ambiente local |

A conferência de Markdown é separada de `npm run check`; não foi adicionada como etapa permanente do CI. Os resultados de CI de cada entrega ficam associados aos respectivos PRs no GitHub.

## CI

O [workflow](../.github/workflows/ci.yml) executa a verificação web com Node.js 22 e compila/executa o Java original com JDK 17. Consulte os checks do commit ou PR para confirmar seu resultado. O job Java é uma verificação de compilação e execução da demonstração, não uma suíte unitária completa.

## Capturas e conferência de interface

As seis novas capturas foram obtidas na aplicação hospedada, em Chromium, na versão 1.1.1:

- Catálogo de Charizard com quatro formas e Shiny selecionado.
- Painel de tipos do Charizard padrão.
- Texto de Charizard em inglês para Shield.
- Trecho da família de Eevee, incluindo Flareon, Espeon e Umbreon.
- Encontros de Pikachu em Red.
- Golpes de Charizard em Scarlet Violet, com busca `flame`.

A [galeria](imagens/README.md) identifica o contexto de cada arquivo. A captura anterior da visão geral sem controles shiny é histórica da versão 1.0.0; não é usada como evidência da apresentação atual desses controles.

## Evidências anteriores preservadas

A revisão da versão 1.0.0 registrou 14 testes aprovados e conferências em Chromium de busca numérica, formas, tipos, textos em idiomas diferentes, família de Eevee, encontros, golpes, forma Original Cap de Pikachu, sprite de Unown B e viewport estreito sem overflow horizontal da página.

A versão 1.1.0 acrescentou cinco testes de imagens para Normal/Shiny, cache, falhas e validação de URLs. A versão 1.1.1 atualizou a chamada e os créditos do site. Essas etapas estão descritas no [histórico](../CHANGELOG.md).

## Alcance e limites

Os testes de imagens simulam respostas; não monitoram disponibilidade externa. Hashes demonstram integridade dos arquivos, não correção factual de cada interpretação. Capturas comprovam os estados mostrados, não todas as combinações possíveis de filtros.

A conferência em Chromium e viewport estreito não equivale a testes físicos em todos os dispositivos ou a uma auditoria completa de acessibilidade. Mudanças futuras devem repetir os cenários afetados do [roteiro manual](../tests/README.md).
