// Tela exibida quando a rota não existe

import { icone } from '../modules/templates.js';

export const naoEncontrada = {
    titulo: 'Página não encontrada',

    render() {
        return `
            <section class="secao nao-encontrada">
                <div class="container">
                    <p class="nao-encontrada__codigo">404</p>
                    <h1>Página não encontrada</h1>
                    <p>O endereço acessado não existe ou foi removido.</p>
                    <a href="#/inicio" class="btn btn--primario">${icone('voltar')}Voltar ao início</a>
                </div>
            </section>`;
    },
};
