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
| [domain.test.mjs](domain.test.mjs) | 8 | Catálogo padrão, busca, filtros, favoritos, armazenamento bloqueado, lotes, eficácia e condições de evolução |
| [data.test.mjs](data.test.mjs) | 6 | Hashes, vínculos de todas as formas, atributos, 324 relações de tipos, referências, contagens e famílias |
| [images.test.mjs](images.test.mjs) | 5 | URLs normal/shiny, IDs de variedade, cache de formas, ausência de shiny, rejeição de URLs inválidas e nova tentativa |
| [loading.test.mjs](loading.test.mjs) | 3 | Cargas concorrentes, recuperação de erros HTTP/JSON e fichas por lote |
| [panels.test.mjs](panels.test.mjs) | 7 | Seleção, conteúdo das fichas, ausência de registros, escape HTML e família de Eevee |
| [presentation.test.mjs](presentation.test.mjs) | 4 | Dezoito símbolos distintos, nomes acessíveis, pares ordenados, entradas especiais e componente do destaque |

**Total: 33 testes.** Eles rodam sem navegador e sem depender da rede. Os testes de imagens simulam respostas; não garantem que um servidor externo esteja disponível no momento de uso. A suíte de dados percorre a base versionada, incluindo referências de golpes, habilidades, descrições e encontros.

Para executar apenas uma área:

```sh
node --test tests/domain.test.mjs
node --test tests/data.test.mjs
node --test tests/images.test.mjs
```

`npm run check` valida sintaxe JavaScript, referências locais do HTML e invariantes básicos. `npm run build` verifica a geração da saída. Nenhum desses comandos é uma auditoria completa de acessibilidade ou um teste visual de navegador. Links Markdown precisam de revisão própria.

## Roteiro manual por mudança

| Área alterada | Cenário | Resultado esperado |
| --- | --- | --- |
| Pesquisa e filtros | Buscar `#0025`, `flabebe` e combinar tipo/geração | IDs e acentos resolvidos; filtros se combinam |
| Formas | Ativar formas, abrir Mega Charizard X | Fogo/Dragão, Tough Claws e total base 634 |
| Tipos | Abrir Charizard padrão | Pedra 4×, Terra 0× e Planta ¼× |
| Textos | Trocar jogo e idioma | Texto corresponde às duas seleções, com ausência explícita quando aplicável |
| Evoluções | Abrir Eevee | Oito ramificações e condições disponíveis na fonte |
| Encontros | Pikachu, jogo Red | Áreas, níveis, chances de slots e condições distinguíveis |
| Golpes | Charizard, Scarlet Violet, busca `flame` | Apenas registros correspondentes ao grupo e ao nome |
| Favoritos | Salvar uma forma, recarregar e filtrar favoritos | Persistência na mesma origem; forma alternativa exige inclusão de formas |
| Links | Copiar ficha shiny e abrir em outra aba | Mesma forma e aparência; filtros não serializados voltam ao padrão |
| Concorrência | Trocar de forma/aba/aparência durante a carga | Resposta antiga não substitui a seleção atual |
| Erros e vazios | Falhar uma carga; abrir ficha sem encontros | Mensagem adequada e opção de tentar novamente quando aplicável |

### Shiny e apresentação

Confira Charizard, Mega Charizard X, uma forma cosmética como Unown B e cartões de evoluções. Uma imagem shiny ausente deve ser identificada, sem substituição silenciosa por imagem normal. Verifique símbolos e faixas dos tipos em cartões, fichas e agrupamentos de eficácia.

### Teclado e telas estreitas

Use Tab, atalho `/`, setas/Home/End nas abas e Escape no diálogo. Confirme foco visível, retorno ao catálogo, leitura dos controles e ausência de rolagem horizontal da página. Tabelas podem rolar dentro dos próprios painéis. Repita em desktop e viewport estreito; em uma entrega de acessibilidade, inclua tecnologias assistivas reais.

## Java e CI

O [workflow](../.github/workflows/ci.yml) usa Node.js 22 e um job separado com JDK 17 para compilar e executar o [Java original](../src/README.md). A execução de `Main` é um teste básico de compilação e funcionamento; não é uma suíte unitária completa da classe `Pokemon`.

Ao mudar comportamento, prefira uma asserção que detecte o problema real. Não acrescente testes que apenas repitam literalmente a implementação. Registre no PR o que foi executado, o resultado e o que ficou fora da validação.

## Comparação durante a refatoração 1.1.2

Além da suíte permanente, a revisão comparou a versão anterior com a refatorada em 504 combinações de filtros e 11.058 resultados de HTML/imagens. O importador foi executado com os CSVs da revisão já disponíveis, gerando 24 JSONs idênticos em bytes. Essas comparações pontuais não são testes de navegador nem uma etapa automática do CI.
