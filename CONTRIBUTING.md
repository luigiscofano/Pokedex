# Como contribuir

Leia o [README principal](README.md) e o [guia de desenvolvimento](docs/desenvolvimento/README.md). Crie uma branch com escopo claro, faça a alteração e execute `npm run check`, `npm test` e `npm run build`.

Para dados, altere o importador ou a revisão da fonte e regenere o snapshot. Não corrija apenas um JSON gerado sem garantir que a alteração seja reproduzível. Inclua fonte e justificativa para qualquer mudança de interpretação.

Para interface, mantenha uso por teclado, foco, tratamento de erro e responsividade. Reproduza o problema antes de criar testes. Preserve o Java original e o histórico; mudanças nele devem ser independentes da aplicação web.

O PR deve explicar o problema, o comportamento final, a validação e os limites. Não inclua tokens, dados pessoais, caches, arquivos de build ou credenciais de hospedagem.
