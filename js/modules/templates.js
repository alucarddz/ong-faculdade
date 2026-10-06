// Templates reutilizáveis: funções que recebem dados e devolvem HTML.
// As telas (js/views) montam o conteúdo combinando estes componentes.

import { totalDoadoNoNavegador } from './storage.js';

// Evita que textos digitados pelo usuário sejam interpretados como HTML (XSS)
export function escapar(texto) {
    return String(texto ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export const formatarMoeda = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// ---------- Ícones ----------
const CAMINHOS_ICONES = {
    sucesso: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    erro: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    aviso: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
    coracao: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    usuarios: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    seta: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    voltar: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
};

export function icone(nome, classe = '') {
    return `<svg class="icone ${classe}" viewBox="0 0 24 24" aria-hidden="true">${CAMINHOS_ICONES[nome]}</svg>`;
}

// ---------- Foto responsiva ----------
// Gera <picture> com AVIF e WebP e um JPEG de reserva para navegadores antigos.
// "sizes" informa a largura exibida em cada breakpoint; com o srcset, o navegador baixa
// a menor versão suficiente para a tela (inclusive considerando a densidade de pixels).
// As versões são geradas por scripts/otimizar-imagens.js.
export const LARGURAS_FOTO = [400, 800];
const PROPORCAO_FOTO = { largura: 800, altura: 533 };

export function foto(nome, { alt = '', classe = '', sizes = '100vw', prioridade = false } = {}) {
    const srcset = (formato) => LARGURAS_FOTO
        .map((largura) => `../imagens/${nome}-${largura}.${formato} ${largura}w`)
        .join(', ');
    // A primeira imagem da tela carrega com prioridade; as demais só quando se aproximam da viewport
    const carregamento = prioridade ? 'fetchpriority="high"' : 'loading="lazy"';

    return `<picture>
            <source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}">
            <source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}">
            <img class="${classe}" src="../imagens/${nome}-800.jpg" srcset="${srcset('jpg')}" sizes="${sizes}"
                 width="${PROPORCAO_FOTO.largura}" height="${PROPORCAO_FOTO.altura}" alt="${escapar(alt)}"
                 decoding="async" ${carregamento}>
        </picture>`;
}

// Larguras exibidas (ver layout.css): container de 1200px, grid de 12 colunas e gutter de 32px
export const TAMANHOS = {
    card: '(min-width: 1200px) 368px, (min-width: 992px) calc((100vw - 96px) / 3), (min-width: 768px) calc((100vw - 56px) / 2), calc(100vw - 32px)',
    metade: '(min-width: 1200px) 568px, (min-width: 992px) calc((100vw - 64px) / 2), calc(100vw - 32px)',
    detalhe: '(min-width: 1200px) 668px, (min-width: 992px) calc((100vw - 32px) * 0.58), calc(100vw - 32px)',
    sobre: '(min-width: 1200px) 468px, (min-width: 992px) calc((100vw - 32px) * 0.4), calc(100vw - 32px)',
};

// ---------- Badge ----------
// tipo: sucesso | erro | aviso | info | primario | urgente | doar | contorno
export function badge(texto, tipo = '', { ponto = false, comIcone = null } = {}) {
    const modificador = tipo ? ` badge--${tipo}` : '';
    const marcador = ponto
        ? '<span class="badge__ponto" aria-hidden="true"></span>'
        : comIcone ? icone(comIcone) : '';
    return `<span class="badge${modificador}">${marcador}${escapar(texto)}</span>`;
}

// ---------- Progresso da arrecadação ----------
export function arrecadadoAtual(projeto) {
    return projeto.arrecadado + totalDoadoNoNavegador(projeto.id);
}

export function metaAtingida(projeto) {
    return arrecadadoAtual(projeto) >= projeto.meta;
}

export function barraMeta(projeto) {
    const arrecadado = arrecadadoAtual(projeto);
    const porcentagem = Math.min(100, Math.round((arrecadado / projeto.meta) * 100));
    return `
        <div class="meta-doacao">
            <div class="meta-doacao__info">
                <span><strong>${formatarMoeda(arrecadado)}</strong> de ${formatarMoeda(projeto.meta)}</span>
                <span class="meta-doacao__porcentagem">${porcentagem}%</span>
            </div>
            <div class="meta-doacao__barra" role="progressbar" aria-label="Arrecadação do ${escapar(projeto.titulo)}"
                 aria-valuemin="0" aria-valuemax="100" aria-valuenow="${porcentagem}">
                <span class="meta-doacao__preenchimento" style="flex-basis: ${porcentagem}%"></span>
            </div>
        </div>`;
}

// ---------- Card de projeto ----------
export function cardProjeto(projeto) {
    const concluido = metaAtingida(projeto);
    const status = concluido
        ? badge('Meta atingida', 'sucesso', { comIcone: 'sucesso' })
        : badge(projeto.status.nome, projeto.status.tipo, { ponto: true });

    const acao = concluido
        ? '<button type="button" class="btn btn--doar btn--bloco" disabled>Meta atingida</button>'
        : `<button type="button" class="btn btn--doar btn--bloco" data-doar="${projeto.id}">${icone('coracao')}Quero doar</button>`;

    return `
        <article class="card-projeto" data-categoria="${escapar(projeto.categoria.nome)}">
            <a class="card-projeto__midia" href="#/projetos/${projeto.id}" tabindex="-1" aria-hidden="true">
                ${foto(projeto.imagem, { sizes: TAMANHOS.card })}
            </a>
            <div class="card-projeto__corpo">
                <div class="badges">
                    ${badge(projeto.categoria.nome, projeto.categoria.tipo)}
                    ${status}
                </div>
                <h3 class="card-projeto__titulo">
                    <a href="#/projetos/${projeto.id}">${escapar(projeto.titulo)}</a>
                </h3>
                <p class="card-projeto__texto">${escapar(projeto.resumo)}</p>
                ${barraMeta(projeto)}
                <div class="card-projeto__botao">${acao}</div>
            </div>
        </article>`;
}

// ---------- Alerta ----------
// O texto aceita HTML (ex.: links); dados digitados pelo usuário devem passar por escapar() antes.
export function alerta(tipo, titulo, texto, { fechavel = true } = {}) {
    const papel = tipo === 'erro' ? 'alert' : 'status';
    const botao = fechavel
        ? `<button type="button" class="btn-fechar" data-fechar-alerta aria-label="Fechar alerta">${icone('fechar')}</button>`
        : '';
    return `
        <div class="alerta alerta--${tipo}" role="${papel}">
            ${icone(tipo, 'alerta__icone')}
            <div class="alerta__conteudo">
                ${titulo ? `<p class="alerta__titulo">${escapar(titulo)}</p>` : ''}
                <p class="alerta__texto">${texto}</p>
            </div>
            ${botao}
        </div>`;
}

// ---------- Toast ----------
export function toast(tipo, titulo, texto) {
    const papel = tipo === 'erro' ? 'alert' : 'status';
    return `
        <div class="toast toast--${tipo}" role="${papel}">
            ${icone(tipo, 'toast__icone')}
            <div class="toast__conteudo">
                <p class="toast__titulo">${escapar(titulo)}</p>
                <p class="toast__texto">${escapar(texto)}</p>
            </div>
            <button type="button" class="btn-fechar" aria-label="Fechar notificação">${icone('fechar')}</button>
            <span class="toast__progresso" aria-hidden="true"></span>
        </div>`;
}

// Converte uma string HTML em elemento DOM
export function criarElemento(html) {
    const modelo = document.createElement('template');
    modelo.innerHTML = html.trim();
    return modelo.content.firstElementChild;
}
