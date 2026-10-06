# ONG Faculdade

Plataforma web para uma organização do terceiro setor divulgar seus projetos, receber doações e cadastrar voluntários.
É uma **Single Page Application (SPA)** feita com HTML, CSS e JavaScript puro (ES Modules), sem framework e sem etapa de build.

Projeto acadêmico da disciplina de Desenvolvimento Front-end.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Build](#build)
- [Testes](#testes)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura](#arquitetura)
- [Acessibilidade](#acessibilidade)
- [Fluxo de branches e versionamento](#fluxo-de-branches-e-versionamento)
- [Autor](#autor)

## Funcionalidades

- **Navegação SPA:** rotas por hash (`#/inicio`, `#/projetos`, `#/projetos/:id`, `#/cadastro`), sem recarregar a página, com tela 404
- **Projetos gerados por dados:** cards, submenu, filtros e página de detalhe criados a partir de `js/data/projetos.js`
- **Doações:** modal com escolha de projeto e valor; a barra de meta é atualizada na hora
- **Cadastro de voluntários:** máscaras (CPF, telefone, CEP), validação em tempo real, verificação dos dígitos do CPF e mensagens de erro por campo
- **Persistência local:** cadastros, rascunho do formulário, doações e filtro preferido ficam salvos no `localStorage`
- **Transparência:** gráficos de arrecadação e de destino dos recursos (Chart.js), com tabela de dados alternativa
- **Componentes de feedback:** badges, alertas, modal e toasts, documentados em `html/componentes.html`
- **Responsivo:** grid de 12 colunas com 5 breakpoints e menu hambúrguer no mobile
- **Temas de cor:** claro, escuro e alto contraste, com modo automático que segue o sistema operacional

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica, `<dialog>` para o modal, `<template>` para componentes |
| CSS3 | Variáveis (Design System), Grid, Flexbox, media queries, animações |
| JavaScript (ES2022) | ES Modules, manipulação do DOM, eventos, `localStorage` |
| [Chart.js 4](https://www.chartjs.org/) | Gráficos, carregado via CDN (jsDelivr) com `import()` dinâmico |
| Google Fonts | Fontes Poppins (títulos) e Inter (textos) |
| Node.js | Apenas para o servidor local (`npm start`) e os testes (`npm test`) |

O projeto **não tem dependências npm**: o servidor e os testes usam só módulos nativos do Node.

## Pré-requisitos

- Navegador atual (Chrome, Edge, Firefox ou Safari)
- [Node.js 18 ou superior](https://nodejs.org/), para rodar o servidor local e os testes
- Conexão com a internet para carregar as fontes e o Chart.js. Sem ela, o site funciona e os gráficos são substituídos por tabelas

## Instalação e execução

```bash
git clone https://github.com/alucarddz/ong-faculdade.git
cd ong-faculdade
npm start
```

Acesse **http://localhost:5500** (redireciona para `html/index.html`). Para usar outra porta: `PORTA=8080 npm start`.

Não é preciso rodar `npm install`, porque não há dependências.

> **Por que um servidor?** Os scripts são ES Modules, e o navegador bloqueia módulos abertos direto do disco (`file://`).
> Alternativa no VS Code: botão direito em `html/index.html` → **Open with Five Server** (ou Live Server).

## Build

Não existe etapa de build: o navegador executa os ES Modules diretamente, sem bundler nem transpilação.
Para publicar, basta enviar a pasta do projeto para qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).
Como o roteamento usa hash, nenhuma configuração de redirecionamento no servidor é necessária.

## Testes

```bash
npm test
```

Usa o runner nativo do Node (`node --test`), que encontra os arquivos `tests/*.test.js`:

| Arquivo | O que verifica |
|---|---|
| `tests/validacao.test.js` | Cálculo dos dígitos do CPF, sequências repetidas e formatos incompletos |
| `tests/templates.test.js` | Escape contra XSS, formatação de moeda, badges, limite da barra de meta e estado do card |
| `tests/storage.test.js` | Ida e volta em JSON, valor padrão, JSON corrompido, armazenamento indisponível, cadastros e doações (com `localStorage` simulado) |
| `tests/contraste.test.js` | Lê `css/variables.css` e calcula o contraste WCAG de 29 pares de cor nos 3 temas (4,5:1 para texto, 3:1 para bordas e gráficos, 7:1 no alto contraste) |
| `tests/temas.test.js` | Escolha do tema: preferência salva, modo automático, prioridade do alto contraste e valor inválido |

As interações de interface (menu, modal, formulário, falha do CDN) foram validadas manualmente no navegador com o DevTools.

## Estrutura de pastas

```
ong-faculdade/
├── html/
│   ├── index.html          # casca da SPA: cabeçalho, <main id="app">, rodapé, modal
│   └── componentes.html    # guia visual dos componentes
├── css/
│   ├── variables.css       # Design System: cores, tipografia, espaçamentos
│   ├── base.css            # reset e tipografia global
│   ├── layout.css          # grid de 12 colunas, breakpoints, seções, rodapé
│   ├── nav.css             # menu hambúrguer e dropdown
│   ├── buttons.css         # botões e estados
│   ├── forms.css           # campos e estados de validação
│   ├── components.css      # cards, barra de meta, filtros, gráficos
│   ├── feedback.css        # badges, alertas, modal, toasts
│   └── guia.css            # estilos exclusivos do guia de componentes
├── imagens/                # logo, fotos e /icones
├── js/
│   ├── main.js             # ponto de entrada: rotas e inicialização
│   ├── data/projetos.js    # dados dos projetos
│   ├── modules/            # router, templates, validacao, storage, feedback, graficos, temas
│   └── views/              # uma tela por arquivo
├── scripts/servidor.js     # servidor local de desenvolvimento
├── tests/                  # testes automatizados
└── package.json            # scripts npm start e npm test
```

## Arquitetura

As dependências seguem um só sentido: `main.js` → `views/` → `modules/` → `data/`.

- **router.js** recebe as rotas por parâmetro e não conhece nenhuma tela
- Cada **view** exporta `{ titulo, render(), montar() }`: `render` devolve o HTML e `montar` liga os eventos
- **templates.js** concentra as funções que geram componentes a partir de dados
- **storage.js** é o único ponto de acesso ao `localStorage`
- **validacao.js** devolve o resultado por callbacks e não sabe onde os dados serão salvos
- Os módulos se comunicam por callbacks e pelo evento customizado `rota:mudou`, sem importações circulares

## Acessibilidade

- **Três temas** trocados só por variáveis CSS (`<html data-tema="...">`): claro, escuro e alto contraste (AAA, 7:1)
- Modo automático com `prefers-color-scheme` e `prefers-contrast`; a escolha manual fica no `localStorage` e é aplicada antes da primeira pintura
- Suporte a `forced-colors` (alto contraste do Windows)
- Contraste verificado por teste automatizado em todos os temas; paleta dos gráficos validada para daltonismo
- Navegação completa por teclado, com `:focus-visible` e link "Pular para o conteúdo"
- `aria-invalid`, `aria-describedby`, `aria-current` e `aria-expanded` atualizados pelo JavaScript
- Foco movido para o conteúdo a cada troca de rota
- Respeito a `prefers-reduced-motion`

## Fluxo de branches e versionamento

O projeto segue o **GitFlow**, e toda integração passa por pull request:

| Branch | Uso |
|---|---|
| `main` | Somente versões publicadas, com tag |
| `develop` | Integração das funcionalidades (branch padrão) |
| `feature/*` | Uma funcionalidade por branch, criada a partir de `develop` |
| `release/*` | Preparação da versão antes de ir para `main` |
| `hotfix/*` | Correção urgente a partir de `main`, mesclada em `main` e `develop` |

As mensagens de commit seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat:`, `fix:`, `docs:`, `test:`),
e as versões seguem o [versionamento semântico](https://semver.org/lang/pt-BR/). Veja as [releases](https://github.com/alucarddz/ong-faculdade/releases).

## Autor

[github.com/alucarddz](https://github.com/alucarddz)
