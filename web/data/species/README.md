# Fichas por espécie

Cada arquivo JSON contém até 50 espécies, indexadas pelo número nacional. O arquivo `00.json` contém 1–50; `01.json`, 51–100; e `20.json`, 1001–1025. A interface carrega somente os lotes necessários e reutiliza cada resposta na sessão.

A espécie reúne informações biológicas, descrições por idioma/jogo, condições de evolução e suas variedades. Cada variedade contém atributos, tipos, habilidades, dimensões, aprendizado de golpes e encontros. Formas cosméticas são selecionadas pelo catálogo, sem duplicação artificial de atributos.

Não edite estes arquivos manualmente: use o importador e confira os hashes em `../manifest.json`.
