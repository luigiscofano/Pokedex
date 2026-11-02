# Build e publicação

## Gerar a aplicação

```sh
npm run check
npm test
npm run build
```

`dist/` recebe uma cópia de `web/`. O build não baixa dados e não exige dependências. Não publique `.cache/`, `build/`, credenciais ou arquivos temporários de QA.

## Hospedagem estática

Publique o conteúdo de `dist/` em um serviço que forneça HTML, CSS, JavaScript e JSON por HTTP. Os caminhos da aplicação são relativos, permitindo implantação em um subdiretório. Os parâmetros de ficha ficam na query string; não é necessário fallback de rota de SPA.

Verifique que arquivos `.js` sejam servidos como JavaScript e que os JSONs de `data/species/` estejam incluídos. Imagens e fontes externas precisam estar acessíveis no navegador do visitante. Defina uma política de cache que permita atualizar HTML, módulos e manifesto juntos.

## Instalação em Sites

A identidade desta instalação fica em `.openai/hosting.json`, quando presente. O diretório estático configurado é `dist`. A publicação deve usar o mesmo commit dos arquivos empacotados. Para criar outra instalação independente, não reutilize a identidade de uma instalação existente sem intenção explícita.

A publicação do código no GitHub e o acesso ao site hospedado são coisas separadas. A audiência da instalação em Sites é controlada na própria plataforma e não é alterada pelo código.

## Conferência após publicação

Abra a página inicial, pesquise uma espécie, abra uma ficha por URL, altere a forma e confira uma aba que carrega dados. Teste também um navegador ou janela sem dados locais para não depender do cache de desenvolvimento.

O pipeline de CI deste repositório verifica e gera os arquivos, mas não recebe credenciais nem publica automaticamente em serviços externos.
