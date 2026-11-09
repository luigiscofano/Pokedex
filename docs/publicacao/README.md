# Build, publicação e conferência

[Início](../../README.md) · [Ferramentas](../../scripts/README.md) · [Solução de problemas](../solucao-de-problemas/README.md)

A Pokédex é uma aplicação estática. A entrega consiste em HTML, CSS, módulos JavaScript e JSONs, com imagens e fontes externas. Não há servidor de aplicação, banco de dados ou chave de API para configurar.

## Preparar uma entrega

1. Escolha o commit que será publicado e confira o diff e o CI.
2. Execute na raiz:

```sh
npm run check
npm test
npm run build
```

3. Confira se `dist/index.html`, `dist/js/`, `dist/data/catalog.json`, `dist/data/reference.json`, `dist/data/manifest.json` e os 21 lotes existem.
4. Publique **o conteúdo de `dist/`**, mantendo sua estrutura.
5. Registre qual commit originou a entrega e faça a conferência no endereço final.

O build apaga e recria `dist/` como cópia de `web/`. Não baixa dados, não transforma os módulos e não instala dependências. Documentação Markdown dentro de `web/` também é copiada, mas não participa da execução do aplicativo. Não envie a raiz inteira do repositório como substituto da saída estática.

## Requisitos da hospedagem

| Requisito | Motivo |
| --- | --- |
| HTTP/HTTPS para HTML, CSS, JS e JSON | Módulos e fetch precisam de uma origem de servidor |
| MIME correto para JavaScript | O navegador rejeita módulos recebidos como HTML ou outro tipo inadequado |
| Todos os lotes de fichas | O catálogo pode abrir mesmo quando uma ficha posterior está ausente |
| Preservar caminhos relativos | Permite servir em domínio ou subdiretório |
| Query string preservada | Fichas e preferências compartilhadas usam parâmetros |
| Acesso às fontes externas no navegador | Ilustrações, sprites e tipografia não são empacotados integralmente |

Não há rotas de SPA como `/pokemon/6`; a ficha é selecionada na query string. Um fallback que converta qualquer arquivo ausente em `index.html` pode ocultar erros de JSON e módulos. Defina cache de forma que HTML, módulos e manifesto possam ser atualizados juntos.

## Esta instalação em Sites

Quando presente, `.openai/hosting.json` registra a identidade da instalação e `dist` é o diretório estático configurado. Use a identidade existente ao atualizar esta instalação; outra instalação independente deve ter identidade própria.

O pacote publicado deve corresponder ao commit escolhido. `package.json` registra a versão do pacote; Sites mantém sua própria sequência de publicações. Não trate esses números como equivalentes nem presuma que uma mudança em `main` já esteja hospedada. Código no GitHub, aprovação de PR e publicação hospedada são etapas distintas. Esta instalação está configurada para **acesso público desde 03/11/2026**, no endereço https://pokedex-luigi-explorer.luigiscofano.chatgpt.site. A audiência é configurada na plataforma e não muda por editar o README ou tornar um repositório público.

No início da revisão de 09/11/2026, a publicação pública era a **versão 16 de Sites**. Esse é um registro da consulta, não uma promessa de que o site siga nessa versão após publicações futuras. O pacote 1.3.3 inclui manutenção posterior; confira a entrega hospedada separadamente.

O [CI](../../.github/workflows/ci.yml) apenas verifica, testa, compila Java e gera o build. Ele não recebe credenciais de hospedagem e **não faz deploy automático**.

## Conferência no endereço final

- Página inicial com “Temos que pegar!”, descrição e crédito de fã para fãs, sem o antigo botão “Começar a explorar” nem “Um universo de descobertas”.
- Regiões na Pokédex de bolso, estado selecionado e grade de três colunas em tela estreita.
- Navegação Favoritos/Explorar sincronizada com o catálogo e quantidade encontrada em negrito.
- Pesquisa `#0025`, seleção de forma alternativa e filtros combinados.
- Normal/Shiny no catálogo e ficha, incluindo link recarregado com `shiny=1`.
- Charizard: tipos com símbolos vetoriais e faixas coloridas e multiplicadores de referência.
- Uma descrição, uma evolução, um encontro e um golpe carregados.
- Favoritos na mesma origem, teclado e viewport estreito.
- Abertura em uma sessão sem cache prévio de desenvolvimento.

Use o [roteiro de validação](../../tests/README.md) conforme a área alterada. Uma página inicial correta não confirma sozinha todos os lotes e painéis.

## Corrigir ou voltar a uma entrega anterior

Identifique o commit afetado, reproduza o erro e abra um PR com a correção. Se for necessário voltar à versão anterior hospedada, gere e publique o conjunto completo do commit conhecido, preservando código e dados compatíveis. Não misture arquivos de duas revisões nem reescreva o histórico público para ocultar uma falha.

Atualizações apenas de documentação não exigem mudar a versão do aplicativo ou republicar sua interface. Atualizações de runtime/dados precisam da conferência acima.
