// Ponto de entrada da aplicação: registra as rotas e inicializa os módulos.

import { iniciarRoteador } from './modules/router.js';
import { iniciarAlertas, iniciarModalDoacao } from './modules/feedback.js';
import { iniciarTemas } from './modules/temas.js';
import { PROJETOS } from './data/projetos.js';
import { escapar } from './modules/templates.js';
import { inicio } from './views/inicio.js';
import { projetos } from './views/projetos.js';
import { projeto } from './views/projeto.js';
import { cadastro } from './views/cadastro.js';
import { naoEncontrada } from './views/nao-encontrada.js';

const ROTAS = [
    { padrao: /^\/inicio$/, view: inicio },
    { padrao: /^\/projetos$/, view: projetos },
    { padrao: /^\/projetos\/([\w-]+)$/, view: projeto },
    { padrao: /^\/cadastro$/, view: cadastro },
];

// ---------- Menu: submenu gerado a partir dos dados + hambúrguer ----------
function iniciarMenu() {
    const cabecalho = document.querySelector('.header');
    const botaoMenu = cabecalho.querySelector('.nav__toggle');
    const submenu = cabecalho.querySelector('#submenu-projetos');
    const botaoSubmenu = cabecalho.querySelector('.nav__subtoggle');

    submenu.insertAdjacentHTML('beforeend', PROJETOS
        .map((item) => `<li><a class="nav__sublink" href="#/projetos/${item.id}" data-rota>${escapar(item.titulo)}</a></li>`)
        .join(''));

    const definirMenu = (aberto) => {
        botaoMenu.setAttribute('aria-expanded', String(aberto));
        botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        cabecalho.classList.toggle('nav--aberta', aberto);
        document.body.classList.toggle('menu-aberto', aberto);
    };
    const definirSubmenu = (aberto) => {
        botaoSubmenu.setAttribute('aria-expanded', String(aberto));
        botaoSubmenu.closest('.nav__item--dropdown').classList.toggle('aberto', aberto);
    };

    botaoMenu.addEventListener('click', () => {
        definirMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
    });
    botaoSubmenu.addEventListener('click', () => {
        definirSubmenu(botaoSubmenu.getAttribute('aria-expanded') !== 'true');
    });
    cabecalho.querySelector('.nav__overlay').addEventListener('click', () => definirMenu(false));

    document.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Escape') return;
        if (cabecalho.classList.contains('nav--aberta')) {
            definirMenu(false);
            botaoMenu.focus();
        }
        definirSubmenu(false);
    });

    // Clique fora do submenu (desktop) fecha o dropdown
    document.addEventListener('click', (evento) => {
        if (!evento.target.closest('.nav__item--dropdown')) definirSubmenu(false);
    });

    // Ao trocar de tela, o menu mobile e o submenu se fecham
    document.addEventListener('rota:mudou', () => {
        definirMenu(false);
        definirSubmenu(false);
    });
}

// "Pular para o conteúdo" sem alterar o hash (que é usado pelas rotas)
function iniciarLinkDePulo() {
    document.querySelector('.link-pulo').addEventListener('click', (evento) => {
        evento.preventDefault();
        document.getElementById('app').focus();
    });
}

iniciarTemas(document.getElementById('seletor-tema'));
iniciarMenu();
iniciarLinkDePulo();
iniciarAlertas();

const roteador = iniciarRoteador({
    raiz: document.getElementById('app'),
    rotas: ROTAS,
    naoEncontrada,
});

// Depois de uma doação, a tela é redesenhada para atualizar as barras de meta
iniciarModalDoacao(() => roteador.atualizar());
