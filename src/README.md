# Java original · Primeiros passos com orientação a objetos

[Início](../README.md) · [Documentação](../docs/README.md) · [Modelo Pokémon](model/README.md) · [Tipos](model/enums/README.md)

Este é o exercício Java que deu origem ao repositório em 2023. Ele demonstra criação de objetos, sobrecarga de construtores, encapsulamento, enumeração, cópia e coleções. Está preservado como parte da trajetória do projeto.

**O site não depende deste Java para funcionar.** A aplicação web lê os JSONs de `web/data/`; as classes desta pasta executam uma demonstração independente no terminal, sem interface gráfica, integração com a PokéAPI ou entrada interativa.

## Executar

Use um **JDK 17** para reproduzir o ambiente do CI. Confira `java -version` e `javac -version`. Na raiz do repositório:

```sh
javac -encoding UTF-8 -d build/classes -sourcepath src src/Main.java
java -cp build/classes Main
```

O primeiro comando compila `Main` e as classes referenciadas para `build/classes`. O segundo usa essa pasta como classpath. Não execute de dentro de `src/` com os mesmos caminhos. O diretório `build/` é saída local e não deve ser versionado.

Saída prevista pelo código de [Main.java](Main.java):

```text
0.6875
110
Espécie: Infernape - FOGO + LUTADOR
Espécie: Torterra - GRAMA + TERRA
Espécie: Starmie - AGUA + null
Espécie: Empoleon - AGUA + METAL
```

`0.6875` é a razão `110 / 160`; equivale a 68,75%, embora o método se chame `porcentagemVida()`. O `null` de Starmie aparece porque o exemplo não define um tipo secundário.

## Leitura guiada

| Arquivo | O que observar |
| --- | --- |
| [Main.java](Main.java) | Instanciação, alteração de estado, `List<Pokemon>` e impressão com `forEach` |
| [model/Pokemon.java](model/Pokemon.java) | Campos privados, três construtores, getters, setters e métodos de instância |
| [model/enums/Tipo.java](model/enums/Tipo.java) | Conjunto fixo de valores do tipo `Tipo` |

1. `p1` e `p2` são criados com dois tipos e treinador.
2. `p3` usa o construtor simplificado para Starmie, com 160 de vida.
3. `p4` é outro objeto, construído a partir de `p3`, e recebe o nome Empoleon e tipo secundário Metal.
4. O dano de 50 altera `p4` para 110 de vida; não altera `p3`.
5. A lista reúne os quatro objetos e imprime `toString()` de cada um.

Há ainda uma lista de inteiros construída a partir de `List.of(1,2,3,4)`. Ela ilustra construção de uma coleção a partir de outra e não participa da saída.

## O que o exercício ensina

| Conceito | Onde aparece | Pergunta para experimentar |
| --- | --- | --- |
| Encapsulamento | Campos privados e métodos públicos | Qual estado pode ser alterado por um setter? |
| Sobrecarga | Construtores com assinaturas diferentes | Quais campos ficam sem valor no construtor curto? |
| Identidade e cópia | `new Pokemon(p3)` | Alterar a cópia modifica o objeto original? |
| Enumeração | `Tipo` | Como o compilador impede um valor textual arbitrário? |
| Coleções e generics | `List<Pokemon>` | Quais elementos essa lista aceita? |
| Representação textual | `toString()` | Por que o tipo ausente aparece como `null`? |

## Comportamento atual e limites

O construtor de cópia inicia a vida da cópia com a **vida total**, mesmo que o original esteja ferido. Isso é diferente de copiar integralmente o estado atual. `receberDano()` apenas subtrai: pode produzir vida negativa, e dano negativo aumenta a vida. Os setters não validam limites, e vida total zero afeta a divisão.

Essas características estão documentadas como comportamento do exercício; não são regras de batalha da franquia. Alterações futuras devem ser isoladas em um PR Java, com exemplos que mostrem o efeito da mudança. Não há simulação de turnos, persistência, captura, evolução ou cálculo de eficácia neste módulo.

## Problemas comuns

- `javac` não encontrado: instale/configure um JDK, incluindo o compilador no `PATH`; ter apenas uma JVM não basta.
- Classe principal não encontrada: compile antes e execute `java -cp build/classes Main` na raiz.
- Acentos incorretos: compile com `-encoding UTF-8` e use terminal com suporte a UTF-8.

[Detalhes da entidade](model/README.md) · [Fluxo de contribuição](../CONTRIBUTING.md) · [CI](../.github/README.md).
