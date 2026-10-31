# Pokédex em Java · Fundamentos de orientação a objetos

> Uma coleção de Pokémon em memória para estudar classes, construtores, enumerações, cópia de objetos e controle de vida, com demonstração no terminal.

[O que faz](#o-que-este-projeto-faz) · [Módulos](#funcionalidades-e-módulos) · [Executar](#como-executar) · [Aprendizagem](#o-que-desenvolvi-e-aprendi) · [Estado atual](#estado-atual) · [Documentação](#documentação-e-navegação)

## O que este projeto faz

Este é um exercício pequeno de orientação a objetos: representa cada Pokémon como um objeto Java e reúne vários desses objetos em uma lista. O programa de exemplo cria quatro personagens, modifica uma cópia, aplica dano e imprime os resultados no terminal. Não exige navegador, banco de dados, servidor ou uma conta em serviços externos.

## Qual problema resolve

O problema didático é sair de variáveis soltas e organizar informações que pertencem à mesma entidade. Espécie, tipos, treinador e vida passam a ter um lugar definido na classe `Pokemon`; as operações de cópia, dano e consulta ficam próximas dos dados que manipulam.

## Funcionalidades e módulos

As três partes são complementares; este repositório contém uma única demonstração, não três aplicativos.

| Parte | O que faz | Arquivo |
| --- | --- | --- |
| Modelo | Guarda espécie, tipo principal/secundário, treinador, vida atual e vida total; oferece construtores, getters, setters e dano | [Pokemon.java](src/model/Pokemon.java) |
| Vocabulário de tipos | Enumera os 18 tipos, evitando usar textos arbitrários para representá-los | [Tipo.java](src/model/enums/Tipo.java) |
| Demonstração | Cria objetos, usa construtor de cópia, altera a cópia e percorre um `ArrayList` | [Main.java](src/Main.java) |

### Construção e cópia

Há um construtor completo, outro com espécie/tipo/vida e um construtor de cópia. Na implementação atual, a cópia começa com a **vida total** do objeto de origem, mesmo que ele já tenha sofrido dano. Essa é a semântica do código disponível; não representa uma cópia integral de todo o estado transitório.

### Dano e proporção de vida

`receberDano(50)` subtrai 50 da vida atual. `porcentagemVida()` devolve uma **fração**, como `0.6875`; para exibi-la como porcentagem, multiplique por 100. O método não acrescenta `%` automaticamente.

### Coleção em memória

O `Main` guarda quatro objetos em `List<Pokemon>` e os imprime com `forEach`. A lista desaparece quando o programa termina. Não há integração com PokéAPI, busca de espécies na internet, imagens ou persistência.

## Como executar

**Requisito:** um JDK 17 ou superior no PATH. Não é preciso instalar bibliotecas adicionais.

```sh
git clone https://github.com/luigiscofano/Pokedex.git
cd Pokedex
```

Compile a classe principal; o compilador encontra as classes dos pacotes em `src`:

```sh
javac -encoding UTF-8 -d build/classes -sourcepath src src/Main.java
java -cp build/classes Main
```

Os comandos funcionam no PowerShell, Linux e macOS quando o JDK está disponível. Para verificar, execute `java -version` e `javac -version`.

### O que deve aparecer

As duas primeiras linhas são `0.6875` e `110`: o objeto copiado tinha 160 pontos e recebeu 50 de dano. Depois aparecem Infernape, Torterra, Starmie e Empoleon, com os tipos definidos no programa. Um tipo secundário ausente aparece como `null` no texto atual.

Para experimentar, altere os dados em `Main.java`, compile novamente e observe como as instâncias da lista mudam. Não há menu interativo nem argumentos de linha de comando.

## O que desenvolvi e aprendi

O exercício reúne modelagem de uma entidade, encapsulamento básico, sobrecarga de construtores, cópia, enumerações, listas genéricas e sobrescrita de `toString`. Uma atividade útil é danificar o objeto de origem antes de copiá-lo e explicar por que a cópia recupera a vida total nesta versão.

Também permite discutir invariantes que ainda precisam ser implementados: vida total positiva, dano não negativo e limites para a vida atual.

## Estado atual

| Situação | Recursos |
| --- | --- |
| Implementado | Modelo Java, enumeração de tipos, construtores, dano, proporção de vida e demonstração com lista |
| Limitações conhecidas | Dano pode levar a vida a valores negativos; dano negativo aumenta a vida; não há validação de vida total zero; cópia reinicia a vida |
| Evoluções possíveis | Validação de argumentos, testes automatizados, cadastro e persistência; essas funções ainda não estão implementadas |

## Validação e limites

O caminho de execução é compilação e demonstração por terminal. O repositório não contém suíte automatizada nem workflow de CI. A saída do `Main` verifica um exemplo, sem cobrir todos os estados possíveis. Pokémon é o tema do exercício; o projeto não tem afiliação com os titulares da franquia.

## Documentação e navegação

| Caminho | Para que serve |
| --- | --- |
| [src/](src/README.md) | Mapa das três classes e instruções para estudar o exemplo |
| [src/Main.java](src/Main.java) | Ponto de entrada e valores usados na demonstração |
| [src/model/Pokemon.java](src/model/Pokemon.java) | Implementação do modelo |
| [src/model/enums/Tipo.java](src/model/enums/Tipo.java) | Valores da enumeração |

## Autoria e licença

Projeto acadêmico de **Luigi Scofano de Araujo**. O repositório não contém um arquivo de licença geral; sua visibilidade pública não equivale à concessão automática de uma licença de redistribuição.


## Tópicos do repositório

`java` · `object-oriented-programming` · `oop` · `collections` · `enums` · `pokemon` · `educational` · `computer-engineering`
