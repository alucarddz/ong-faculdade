// Componentes de feedback: alertas, toasts e modal de doação.

import { toast, criarElemento, formatarMoeda, escapar } from './templates.js';
import { PROJETOS, buscarProjeto } from '../data/projetos.js';
import { registrarDoacao } from './storage.js';

// ---------- Alertas: botão de fechar (delegação de evento) ----------
export function iniciarAlertas() {
    document.addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-fechar-alerta]');
        if (!botao) return;

        const elemento = botao.closest('.alerta');
        elemento.classList.add('alerta--saindo');
        elemento.addEventListener('animationend', () => elemento.remove(), { once: true });
    });
}

// ---------- Toasts ----------
function fecharToast(elemento) {
    if (elemento.classList.contains('toast--saindo')) return;
    elemento.classList.add('toast--saindo');
    elemento.addEventListener('animationend', (evento) => {
        if (evento.animationName === 'toast-sair') elemento.remove();
    });
}

export function mostrarToast(tipo, titulo, texto) {
    const area = document.getElementById('toasts');
    const elemento = criarElemento(toast(tipo, titulo, texto));

    elemento.querySelector('.btn-fechar').addEventListener('click', () => fecharToast(elemento));
    // Quando a barra de tempo termina, o toast sai sozinho
    elemento.querySelector('.toast__progresso').addEventListener('animationend', () => fecharToast(elemento));

    area.appendChild(elemento);
}

// ---------- Modal de doação ----------
// aoDoar: função chamada depois de uma doação confirmada (ex.: redesenhar a tela)
export function iniciarModalDoacao(aoDoar) {
    const modal = document.getElementById('modal-doacao');
    const form = modal.querySelector('form');
    const seletor = form.elements.projeto;

    seletor.innerHTML = PROJETOS
        .map((projeto) => `<option value="${projeto.id}">${escapar(projeto.titulo)}</option>`)
        .join('');

    // Qualquer botão com data-doar abre o modal (o valor do atributo pré-seleciona o projeto)
    document.addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-doar]');
        if (!botao) return;

        form.reset();
        if (botao.dataset.doar) seletor.value = botao.dataset.doar;
        modal.returnValue = '';
        modal.showModal();
    });

    // Clique no fundo escurecido fecha o modal
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) modal.close('cancelar');
    });

    modal.addEventListener('close', () => {
        if (modal.returnValue !== 'confirmar') return;

        const projeto = buscarProjeto(seletor.value);
        const valor = Number(form.elements.valor.value);
        registrarDoacao(projeto.id, valor);

        mostrarToast('sucesso', 'Doação confirmada!',
            `${formatarMoeda(valor)} para o ${projeto.titulo}. Obrigado por ajudar!`);
        aoDoar?.();
    });
}
