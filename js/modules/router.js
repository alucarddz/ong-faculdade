// Roteador da SPA baseado em hash (#/inicio, #/projetos, #/projetos/:id, #/cadastro).
// Troca o conteúdo do <main id="app"> sem recarregar a página.
//
// Cada view é um objeto { titulo, render(...params), montar?(raiz, ...params) }:
// render devolve o HTML da tela e montar liga os eventos depois que ela está no DOM.

const ROTA_INICIAL = '/inicio';

export function iniciarRoteador({ raiz, rotas, naoEncontrada }) {
    function resolver(caminho) {
        for (const rota of rotas) {
            const resultado = caminho.match(rota.padrao);
            if (resultado) return { view: rota.view, params: resultado.slice(1) };
        }
        return { view: naoEncontrada, params: [] };
    }

    function marcarLinkAtivo(caminho) {
        document.querySelectorAll('[data-rota]').forEach((link) => {
            const rotaDoLink = link.getAttribute('href').slice(1);
            const ativo = caminho === rotaDoLink || caminho.startsWith(`${rotaDoLink}/`);
            if (ativo) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    }

    function renderizar({ focar = true } = {}) {
        if (!location.hash) history.replaceState(null, '', `#${ROTA_INICIAL}`);

        const caminho = location.hash.slice(1);
        // Âncoras comuns (ex.: #conteudo) não são rotas: deixa o navegador tratar
        if (!caminho.startsWith('/')) return;

        const { view, params } = resolver(caminho);
        raiz.innerHTML = view.render(...params);
        view.montar?.(raiz, ...params);

        const titulo = typeof view.titulo === 'function' ? view.titulo(...params) : view.titulo;
        document.title = `${titulo} | ONG Faculdade`;
        marcarLinkAtivo(caminho);

        // Reinicia a animação de entrada da tela
        raiz.classList.remove('tela--entrar');
        void raiz.offsetWidth;
        raiz.classList.add('tela--entrar');

        if (focar) {
            window.scrollTo(0, 0);
            // Leitores de tela passam a ler a nova tela desde o início
            raiz.focus({ preventScroll: true });
        }

        document.dispatchEvent(new CustomEvent('rota:mudou', { detail: { caminho } }));
    }

    window.addEventListener('hashchange', () => renderizar());
    renderizar({ focar: false });

    return {
        // Redesenha a tela atual mantendo a posição (ex.: após uma doação)
        atualizar: () => renderizar({ focar: false }),
    };
}
