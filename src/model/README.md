# Modelo `Pokemon`

[Java original](../README.md) · [Código da classe](Pokemon.java) · [Enumeração](enums/README.md)

`Pokemon` representa um objeto simples para estudo de orientação a objetos. Não é o modelo de dados usado pela aplicação web.

## Estado e construção

| Grupo | Campos |
| --- | --- |
| Identidade | `especie`, `nomeTreinador` |
| Tipagem | `tipoPrincipal`, `tipoSecundario` |
| Vida | `vidaAtual`, `vidaTotal` |

| Construtor | Resultado |
| --- | --- |
| Espécie, dois tipos, treinador e vida total | Preenche os campos e começa com vida cheia |
| Espécie, tipo principal e vida total | Começa com vida cheia; treinador e segundo tipo ficam `null` |
| Outro `Pokemon` | Copia os dados descritivos e a vida total; a vida atual da cópia volta ao total |

Strings e enumerações utilizadas aqui são imutáveis; a classe não contém listas mutáveis internas que exijam uma cópia profunda. Ainda assim, dois objetos `Pokemon` têm estados próprios.

## Métodos e contratos observados

| Método | Comportamento atual |
| --- | --- |
| Getters | Disponibilizam os campos; `vidaTotal` tem getter, sem setter |
| Setters | Alteram os valores sem validar domínio ou limites |
| `receberDano(dano)` | Executa `vidaAtual = vidaAtual - dano` |
| `porcentagemVida()` | Retorna a razão em `double`, sem multiplicar por 100 |
| `toString()` | Imprime espécie e dois tipos, incluindo `null` quando ausente |

Por exemplo, um original com vida total 160 e vida atual 110 gera uma cópia com vida atual **160**. Já `Pokemon b = a` aponta para o mesmo objeto: mudar `b` afeta o objeto observado por `a`.

O código permite vida negativa, dano negativo e vida total zero. Se o objetivo for fortalecer o modelo, defina antes os contratos desejados, trate esses casos e documente a mudança. Não apresente o comportamento atual como uma implementação completa das regras de Pokémon.
