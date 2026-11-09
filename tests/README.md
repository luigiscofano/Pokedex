# Testes e revisão da Pokédex

[Início](../README.md) · [Evidências da versão](../docs/VALIDACAO.md) · [Contribuir](../CONTRIBUTING.md)

A suíte usa o executor nativo do Node.js, sem dependências npm. Execute na raiz com Node.js 20+:

```sh
npm run check
npm test
npm run build
```

## O que está automatizado

| Arquivo | Testes | Cobertura |
| --- | ---: | --- |
| [featured.test.mjs](featured.test.mjs) | 6 | Todas as formas, persistência, dados inválidos, armazenamento bloqueado, repetição e controles acessíveis |
| [domain.test.mjs](domain.test.mjs) | 13 | Busca e cache, filtros, favoritos, ordenação sem mutação, armazenamento bloqueado, lotes, eficácia e evolução |
| [data.test.mjs](data.test.mjs) | 6 | Hashes, vínculos de todas as formas, atributos, 324 relações de tipos, referências, contagens e famílias |
| [images.test.mjs](images.test.mjs) | 5 | URLs normal/shiny, IDs de variedade, cache de formas, ausência de shiny, rejeição de URLs inválidas e nova tentativa |
| [loading.test.mjs](loading.test.mjs) | 3 | Cargas concorrentes, recuperação de erros HTTP/JSON e fichas por lote |
| [panels.test.mjs](panels.test.mjs) | 8 | Seleção, conteúdo das fichas, busca normalizada de golpes, ausência de registros, escape HTML e família de Eevee |
| [presentation.test.mjs](presentation.test.mjs) | 5 | Dezoito símbolos distintos, nomes acessíveis, pares ordenados, entradas especiais, destaque e tipografia |
| [navigation.test.mjs](navigation.test.mjs) | 3 | Seleção Explorar/Favoritos, atributos acessíveis e quantidade em negrito |
| [pocket-controls.test.mjs](pocket-controls.test.mjs) | 4 | Regiões acessíveis, nove gerações, grade móvel, foco e remoção do CTA |
| [hero-content.test.mjs](hero-content.test.mjs) | 1 | Título e descrição preservados, sem o texto introdutório removido |
| [type-icons.test.mjs](type-icons.test.mjs) | 3 | Símbolos refinados, componente compartilhado e silhueta angular de Lutador |
| [documentation.test.mjs](documentation.test.mjs) | 9 | Links/imagens locais, caminhos relativos/codificados, parênteses, referências, blocos de código, comentários e erros do verificador |

**Total: 66 testes.** Eles rodam sem navegador e sem depender da rede. Os testes de imagens simulam respostas; não garantem que um servidor externo esteja disponível no momento de uso. A suíte de dados percorre a base versionada, incluindo referências de golpes, habilidades, descrições e encontros.

Para executar apenas uma área:

```sh
node --test tests/domain.test.mjs
node --test tests/data.test.mjs
node --test tests/images.test.mjs
```

`npm run check` valida sintaxe JavaScript, referências locais do HTML e dos links/imagens Markdown e invariantes básicos. `npm run check:docs` executa somente a conferência dos destinos locais da documentação. `npm run build` verifica a geração da saída. Algumas regressões de apresentação verificam a estrutura dos arquivos, não os pixels renderizados. Nenhum desses comandos é uma auditoria completa de acessibilidade ou um teste visual de navegador. O verificador Markdown não é um parser completo: ignora exemplos de código e comentários HTML, e não verifica URLs externas, âncoras ou links/imagens em HTML embutido. Esses casos e a correspondência entre legenda e imagem precisam de revisão própria.

## Roteiro manual por mudança

| Área alterada | Cenário | Resultado esperado |
| --- | --- | --- |
| Início | Abrir a página | Título e descrição presentes, sem CTA ou texto introdutório removidos |
| Regiões | Todas as regiões, Kanto e Paldea, com teclado e toque | Seleção visual/acessível coerente; filtros combinados; nove regiões em grade estreita |
| Pesquisa e filtros | Buscar `#0025`, `flabebe` e combinar tipo/geração | IDs e acentos resolvidos; filtros se combinam |
| Formas | Ativar formas, abrir Mega Charizard X | Fogo/Dragão, Tough Claws e total base 634 |
| Tipos | Abrir Charizard padrão | Pedra 4×, Terra 0× e Planta ¼× |
| Textos | Trocar jogo e idioma | Texto corresponde às duas seleções, com ausência explícita quando aplicável |
| Evoluções | Abrir Eevee | Oito ramificações e condições disponíveis na fonte |
| Encontros | Pikachu, jogo Red | Áreas, níveis, chances de slots e condições distinguíveis |
| Golpes | Charizard, Scarlet Violet, busca `flame` | Apenas registros correspondentes ao grupo e ao nome |
| Destaque | Selecionar somente pela ficha; confirmar ausência nos cartões; recarregar e abrir destaque | Forma preservada, tipos/imagem/link atualizados e favoritos independentes |
| Favoritos | Salvar uma forma, recarregar, entrar na coleção e sair por Explorar | Persistência na mesma origem; seleção do menu acompanha o catálogo; outros filtros são preservados |
| Links | Copiar ficha shiny e abrir em outra aba | Mesma forma e aparência; filtros não serializados voltam ao padrão |
| Concorrência | Trocar de forma/aba/aparência durante a carga | Resposta antiga não substitui a seleção atual |
| Erros e vazios | Falhar uma carga; abrir ficha sem encontros | Mensagem adequada e opção de tentar novamente quando aplicável |

### Shiny e apresentação

Confira Charizard, Mega Charizard X, uma forma cosmética como Unown B e cartões de evoluções. Uma imagem shiny ausente deve ser identificada, sem substituição silenciosa por imagem normal. Verifique símbolos e faixas dos tipos em cartões, fichas e agrupamentos de eficácia, incluindo Psíquico, Aço, Sombrio (eclipse) e Lutador (silhueta angular).

### Teclado e telas estreitas

Use Tab, atalho `/`, setas/Home/End nas abas e Escape no diálogo. Confirme foco visível, retorno ao catálogo, leitura dos controles e ausência de rolagem horizontal da página. As regiões devem caber em três colunas em tela estreita; tabelas podem rolar dentro dos próprios painéis. Repita em desktop e viewport estreito; em uma entrega de acessibilidade, inclua tecnologias assistivas reais.

## Java e CI

O [workflow](../.github/workflows/ci.yml) usa Node.js 22 e um job separado com JDK 17 para compilar e executar o [Java original](../src/README.md). A execução de `Main` é um teste básico de compilação e funcionamento; não é uma suíte unitária completa da classe `Pokemon`.

Ao mudar comportamento, prefira uma asserção que detecte o problema real. Não acrescente testes que apenas repitam literalmente a implementação. Registre no PR o que foi executado, o resultado e o que ficou fora da validação.

## Comparação e medição atuais

`npm run benchmark` compara os filtros atuais com a referência anterior à otimização, preservada somente nessa ferramenta, e executa medições com cache aquecido. A comparação cobre **6.048 combinações**, incluindo busca, formas, geração, tipo, categoria, ordenação e favoritos. Tempos variam por máquina e não são critério de aprovação do CI.

A revisão também comparou **23.450 saídas HTML de golpes** com a implementação anterior. Essa conferência foi pontual, não uma etapa permanente do CI. Veja [método, resultados e limites](../docs/VALIDACAO.md).

## Comparação histórica da refatoração 1.1.2

Além da suíte permanente, a revisão comparou a versão anterior com a refatorada em 504 combinações de filtros e 11.058 resultados de HTML/imagens. O importador foi executado com os CSVs da revisão já disponíveis, gerando 24 JSONs idênticos em bytes. Essas comparações pontuais não são testes de navegador nem uma etapa automática do CI.
