# Como contribuir

[Apresentação](README.md) · [Arquitetura](docs/desenvolvimento/README.md) · [Testes](tests/README.md) · [Documentação](docs/README.md)

A Pokédex é um projeto independente de fã e de estudo. Contribuições devem manter a navegação clara, a origem dos dados rastreável e os limites explícitos. Antes de alterar uma área, leia seu README e reproduza o comportamento atual.

## Preparar o ambiente

Use Node.js 20+ e execute `npm run dev` na raiz. Não há dependências npm a instalar. Python 3.10+ é necessário somente para importar dados; JDK 17, somente para o exercício Java. Os guias de [execução](README.md#como-executar), [dados](docs/dados/README.md) e [Java](src/README.md) detalham cada caminho.

## Branches com escopo claro

Comece de uma `main` atualizada e crie uma branch por entrega coerente. Exemplos:

```sh
git switch main
git pull --ff-only
git switch -c docs/guia-de-favoritos
```

| Prefixo | Quando usar | Exemplo |
| --- | --- | --- |
| `docs/` | Guias, imagens e instruções | `docs/guia-de-favoritos` |
| `feat/` | Nova capacidade do produto | `feat/filtro-adicional` |
| `fix/` | Correção de comportamento | `fix/link-de-forma` |
| `test/` | Cobertura de um caso relevante | `test/limites-dos-lotes` |
| `build/` | Ferramentas e automação | `build/verificacao-estatica` |
| `data/` | Atualização reproduzível do snapshot | `data/revisao-pokeapi` |

Esses nomes são convenções de organização, não uma configuração de proteção de branch. Separe mudanças independentes; mantenha juntos código, teste e documentação necessários para entender uma mesma alteração.

## Validação conforme o escopo

| Mudança | Conferência esperada |
| --- | --- |
| Texto e documentação | Caminhos, âncoras, imagens, exemplos e correspondência com o código |
| Interface | `check`, `test`, `build`; navegador, teclado, tela estreita e estados de erro/vazio |
| Regras ou carregamento | Comandos acima e testes dos casos reais afetados |
| Dados/importador | Regeneração completa, hashes, contagens, referências, amostras e tamanho do diff |
| Java | Compilar/executar com JDK 17; demonstrar o comportamento alterado |

O CI roda as verificações web e Java em pushes e PRs, inclusive quando a mudança é documental. Não declare validação visual, teste físico ou cobertura que não tenha sido realizada.

## Cuidados por área

Para dados, altere a transformação ou a revisão da fonte e regenere o snapshot. Não edite isoladamente um JSON gerado. Preserve a diferença entre espécie, variedade e forma; mantenha versão e idioma dos registros.

Para interface, conserve foco visível, teclado, carregamento, recuperação de erro e ausência explícita de dados. Não apresente uma imagem normal como shiny nem uma estimativa como regra oficial.

Para documentação, use português claro e links relativos dentro do repositório. Dê instruções executáveis na raiz ou declare outro diretório. Capturas devem ser reais, com legenda e versão; atualize o [catálogo de imagens](docs/imagens/README.md). Guias pequenos são adequados a pastas com responsabilidade simples: evite repetir todo o README inicial.

Para Java, preserve a independência em relação ao site. Mudanças didáticas devem explicar os contratos anteriores e os novos, incluindo cópia, vida e dano.

## Abrir e revisar um PR

Descreva o problema, o resultado final, arquivos/áreas relevantes, validação e limites. Siga o [template](.github/pull_request_template.md). Para interface, inclua capturas antes/depois quando forem úteis; para dados, informe revisão e variação das contagens.

Confira o diff antes de enviar. Exclua caches, saídas de build, credenciais, tokens e dados pessoais. Mantenha autoria e créditos de recursos externos. O repositório não concede uma nova licença geral sobre materiais da franquia.

Após o CI e a revisão, integre pelo PR. Não é necessário multiplicar branches para mudanças inseparáveis; use a divisão para tornar cada entrega compreensível e rastreável.

## Legibilidade e comentários

Siga o [guia de código limpo](docs/desenvolvimento/clean-code/README.md). Preserve funções com responsabilidade definida, nomes que indiquem a entidade correta e blocos explícitos. Use comentários em português para explicar decisões, contratos, seções e limites; evite repetir literalmente a linha seguinte.

`.editorconfig` padroniza a edição. `.prettierrc.json` e `.prettierignore` orientam a formatação opcional e protegem os JSONs gerados. Formatar não substitui revisão de comportamento nem os testes.
