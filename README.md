# ONG Faculdade

Plataforma web (SPA) para uma ONG divulgar projetos, captar doações e cadastrar voluntários.
Feita com HTML, CSS e JavaScript puro (ES Modules), com Chart.js via CDN.

## Como executar

Os scripts usam ES Modules, que o navegador só carrega por um servidor.
No VS Code, clique com o botão direito em `html/index.html` → **Open with Five Server**
(ou qualquer servidor estático na raiz do projeto).

## Estrutura

```
html/     index.html (casca da SPA) e componentes.html (guia de componentes)
css/      Design System, layout, menu, formulários e componentes
imagens/  logo, fotos e ícones
js/       main.js (entrada), modules/, views/ e data/
```

## Fluxo de branches (GitFlow)

| Branch | Uso |
|---|---|
| `main` | Somente versões publicadas, marcadas com tag (`v1.0.0`, `v1.0.1`) |
| `develop` | Integração contínua das funcionalidades prontas |
| `feature/*` | Uma funcionalidade por branch, criada a partir de `develop` |
| `release/*` | Preparação da versão (documentação, ajustes finais) antes de ir para `main` |
| `hotfix/*` | Correção urgente criada a partir de `main`, mesclada em `main` e `develop` |

Todos os merges usam `--no-ff` para manter visível no histórico onde cada branch começou e terminou.
