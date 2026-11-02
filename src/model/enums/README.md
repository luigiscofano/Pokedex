# Enumeração `Tipo`

[Modelo](../README.md) · [Java original](../../README.md) · [Tipo.java](Tipo.java)

O enum limita o tipo a 18 constantes reconhecidas pelo compilador. Os nomes históricos do exercício estão preservados.

| Constante Java | Nome em português |
| --- | --- |
| `GRAMA` | Planta |
| `AGUA` | Água |
| `FOGO` | Fogo |
| `NORMAL` | Normal |
| `ELETRICO` | Elétrico |
| `FANTASMA` | Fantasma |
| `INSETO` | Inseto |
| `METAL` | Aço |
| `VOADOR` | Voador |
| `FADA` | Fada |
| `LUTADOR` | Lutador |
| `DRAGAO` | Dragão |
| `GELO` | Gelo |
| `SOMBRIO` | Sombrio |
| `PEDRA` | Pedra |
| `TERRA` | Terra |
| `VENENOSO` | Veneno |
| `PSIQUICO` | Psíquico |

Exemplo: `Tipo.FOGO` é um valor de `Tipo`; `"FOGO"` é uma string e não substitui o enum em um construtor que espera `Tipo`.

A ordem das constantes não é um ID da PokéAPI. Não use `ordinal()` para integrar com os JSONs do site. O enum também não contém regras de vantagem: a aplicação web calcula eficácia em um [módulo independente](../../../web/js/domain.js), explicado no [guia de tipos](../../../docs/desenvolvimento/tipos/README.md).
