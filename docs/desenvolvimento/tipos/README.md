# Como as vantagens de tipo são calculadas

[Início](../../../README.md) · [Arquitetura](../README.md) · [Uso da ficha](../../usuario/fichas/README.md)

O módulo [domain.js](../../../web/js/domain.js) usa os 18 tipos modernos e uma matriz com **18 × 18 = 324** combinações. A chave `ataque/defesa` em `reference.efficacy` identifica o multiplicador. Por exemplo, `6/10` representa Pedra atacando Fogo.

## Defesa: multiplicar os fatores

Para um golpe de tipo A contra uma forma com tipos D1 e D2:

```text
multiplicador = eficácia(A, D1) × eficácia(A, D2)
```

| Ataque contra Charizard Fogo/Voador | Contra Fogo | Contra Voador | Produto |
| --- | ---: | ---: | ---: |
| Pedra | 2 | 2 | 4 |
| Planta | 0,5 | 0,5 | 0,25 |
| Terra | 2 | 0 | 0 |

A interface agrupa valores acima de 1 em fraquezas, entre 0 e 1 em resistências, iguais a 0 em imunidades e iguais a 1 em dano neutro. Uma imunidade não é anulada por uma fraqueza: o produto com zero continua zero.

## Ataque: escolher a melhor opção entre os tipos próprios

Para uma forma de tipos A1 e A2 contra um alvo de tipo único D:

```text
melhor eficácia = máximo(eficácia(A1, D), eficácia(A2, D))
```

Isso responde: **“qual dos tipos próprios oferece a melhor eficácia contra esse tipo?”** Não considera todos os golpes aprendidos pelo Pokémon. Charizard pode aprender golpes de outros tipos, mas eles não entram nessa coluna.

## O que a conta não representa

Não é cálculo de dano final, previsão de vitória nem recomendação automática de equipe. Não inclui nível, atributos treinados, poder do golpe, STAB, habilidades, itens, clima, Terastalização ou alvos ofensivos de dois tipos. A matriz não reconstrói regras históricas de cada geração.

Tipos especiais fora dos 18 reconhecidos geram `RangeError` nas funções puras. A interface detecta essas formas e apresenta aviso explicativo. Dados com referências quebradas devem ser corrigidos na origem/importação, não cobertos por uma interpretação inventada.

## Validar uma mudança

```sh
node --test tests/domain.test.mjs tests/data.test.mjs
```

Os testes exercitam fraqueza 4×, resistência ¼×, imunidade, melhor opção ofensiva e integridade da matriz. Compare depois a ficha de Charizard padrão e a de Mega Charizard X no navegador: mudar os tipos deve mudar os agrupamentos.
