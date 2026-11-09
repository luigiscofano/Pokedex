# Solução de problemas

[Início](../../README.md) · [Guia de uso](../usuario/README.md) · [Publicação](../publicacao/README.md)

## Executar no computador

| Sintoma | Verificação e solução |
| --- | --- |
| `npm` ou `node` não encontrado | Instale/configure Node.js 20+ e reabra o terminal; confira `node --version` e `npm --version` |
| Não encontra `package.json` | Entre na pasta `Pokedex`, a raiz do clone, antes de executar os comandos |
| Porta 3000 ocupada | Rode `npm run dev -- --port 3001` e abra `http://localhost:3001` |
| HTML abre, mas catálogo não carrega | Use o endereço HTTP do servidor; não abra o HTML diretamente por `file://` |
| Erro ao importar dados | A importação é opcional para usar o site; para regenerar, confira Python 3.10+, rede e revisão da fonte |
| `javac` não encontrado | Java é opcional para o site; para o exercício, configure JDK 17 conforme o [guia Java](../../src/README.md) |

Não é necessário executar `npm install` para o código atual: não há dependências npm declaradas. A base já vem no repositório. Para encerrar o servidor, use Ctrl+C no terminal que o iniciou.

## Imagens e dados ausentes

**O catálogo abre, mas algumas imagens falham.** Os atributos vêm dos JSONs locais; imagens e metadados de sprites cosméticos vêm de fontes externas. Confira acesso à internet, bloqueadores e o status da requisição no painel de rede do navegador. O site informa quando não há uma imagem utilizável.

**Uma forma não tem shiny.** Ausência de recurso na fonte não autoriza recolorir automaticamente ou exibir a imagem normal como shiny. Consulte outra forma ou volte para Normal; [entenda a seleção de imagens](../usuario/formas-e-shiny/README.md).

**A ficha não tem encontros.** Isso significa ausência de registros no snapshot para essa variedade/versão. Não conclua que a espécie seja impossível de obter. Eventos, presentes, trocas e outros métodos não estão integralmente cobertos.

**Os textos estão em inglês ou outro idioma.** A interface é em português; textos da franquia preservam os idiomas disponíveis na fonte. Escolha um idioma na aba Textos dos jogos. Não há promessa de tradução oficial em português para cada registro.

## Busca, destaque, favoritos e links

**Não encontro Começar a explorar.** Esse botão foi removido. Use **Explorar** no menu ou role até o catálogo. A seleção de gerações fica na Pokédex de bolso.

**Explorar não aparece selecionado.** Quando o catálogo mostra **Seus favoritos**, a seleção correta é **Favoritos**. Clique em Explorar para sair desse filtro; busca, região e tipo continuam valendo.

**Não encontro Tornar destaque no catálogo.** Abra o cartão do Pokémon: a opção aparece somente nas ações internas da ficha, em um botão grafite com Pokébola.

**O destaque voltou para Charizard.** A escolha pertence ao navegador e à origem; não sincroniza entre dispositivos. Limpar dados do site ou usar outro perfil remove a preferência. Se o armazenamento estiver bloqueado, a escolha funciona apenas nesta sessão e a aplicação avisa.


**Não encontro uma forma alternativa.** Ative Incluir formas, retire outros filtros e pesquise a espécie. O filtro de geração usa a geração da espécie, não necessariamente a estreia da forma.

**Meus favoritos sumiram ao mudar de endereço.** O armazenamento pertence à origem do navegador. `localhost:3000`, `localhost:3001` e o domínio publicado são origens diferentes. Outro perfil, outro dispositivo ou janela privada também usa armazenamento separado. Não há conta nem sincronização em nuvem.

**O favorito existe, mas não aparece na lista.** Os filtros continuam combinados: inclua formas alternativas e retire tipo, geração, categoria ou busca que excluam a entrada.

**O link não preservou a aba ou a ordenação.** O contrato atual serializa busca, geração, tipo, inclusão de formas, shiny e ID da ficha. Aba, ordenação e seletores internos não fazem parte do link. [Parâmetros documentados](../usuario/favoritos-e-links/README.md).

## Depois de publicar

Confira se todos os arquivos de `dist/` foram enviados, inclusive os JSONs de `data/species/`. Respostas HTML no lugar de JavaScript/JSON geralmente indicam caminho incorreto ou regra de hospedagem. Sirva módulos com MIME adequado e preserve caminhos relativos.

Se aparecer uma versão antiga, compare os arquivos publicados com o commit escolhido e confira o cache do navegador/hospedagem. Alterar `main` no GitHub não publica automaticamente esta instalação: siga o [guia de publicação](../publicacao/README.md).

O acesso à instalação em Sites pode depender da audiência configurada na plataforma. Isso é separado da disponibilidade pública do código.

## Relatar um problema reproduzível

Inclua URL sem dados privados, espécie/forma, aparência Normal ou Shiny, jogo/idioma selecionado, passos, resultado esperado e observado, navegador e captura relevante. Para erro local, inclua comando, versão do runtime e trecho do erro. Não envie tokens, credenciais ou conteúdo completo do armazenamento do navegador.
