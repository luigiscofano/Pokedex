# Automação e revisão

`workflows/ci.yml` verifica a aplicação web e compila/executa o exercício Java em jobs independentes. O workflow usa somente permissão de leitura; não publica nem altera o repositório.

`pull_request_template.md` organiza problema, resultado, validação e limites. As branches seguem o escopo do trabalho: `build/`, `feat/`, `test/`, `docs/` e `fix/`. PRs representam entregas coerentes e são integrados preservando os commits.
