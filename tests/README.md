# Validação

Execute `npm test` com Node.js 20+. Os testes não precisam de rede, de navegador nem de pacotes externos.

`domain.test.mjs` cobre busca, composição de filtros, ordenação base, favoritos, armazenamento bloqueado, fronteiras dos lotes, fraqueza 4×, resistência ¼×, imunidades e condições de evolução.

`data.test.mjs` verifica os hashes SHA-256 dos arquivos, as 1.025 espécies, a resolução de todas as formas, atributos, a matriz completa de 324 combinações de tipos, todas as referências de descrições/golpes/encontros e as contagens do manifesto. Eevee, formas Mega, Alola, Unown e Pecharunt cobrem relações importantes.

`images.test.mjs` verifica URLs normais/shiny por variedade, cache compartilhado de formas, ausência de shiny sem substituição normal, validação de URLs e nova tentativa após falha.

`npm run check` valida sintaxe JavaScript e caminhos locais. A execução do Java original é verificada separadamente pelo CI.

## Roteiro manual de navegador

1. Pesquisar `#0025`, limpar e pesquisar `flabebe`.
2. Ativar formas e abrir Charizard Mega X; conferir os tipos e atributos.
3. Abrir Charizard padrão: Pedra deve ser 4×, Terra 0× e Planta ¼×.
4. Alternar jogo e idioma em Textos dos jogos.
5. Abrir Eevee e conferir seus oito ramos evolutivos.
6. Filtrar encontros por jogo e golpes por grupo de versões.
7. Abrir Pecharunt e conferir o aviso de ausência de encontros, quando aplicável.
8. Salvar favorito, recarregar e abrir pelo link da ficha.
9. Usar Tab, setas nas abas e Escape; conferir celular sem rolagem horizontal da página.
10. Interromper uma carga e tentar novamente; dados ausentes não devem aparecer como fatos inventados.

11. Alternar Shiny no catálogo e na ficha, mantendo filtros, forma, aba e favoritos; recarregar um link com `shiny=1`.
12. Conferir Charizard, Mega Charizard X, Unown B e evoluções em shiny. Alternar rapidamente Normal/Shiny e verificar que uma resposta antiga não troca a imagem atual.
13. Conferir o aviso de imagem shiny indisponível e contornos dos tipos em cartões, fichas e tabela de vantagens, no desktop e celular.
