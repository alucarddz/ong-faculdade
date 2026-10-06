// Página de detalhe de um projeto (#/projetos/:id)

import { PROJETOS, buscarProjeto } from '../data/projetos.js';
import { badge, barraMeta, cardProjeto, escapar, foto, icone, metaAtingida, TAMANHOS } from '../modules/templates.js';
import { naoEncontrada } from './nao-encontrada.js';

export const projeto = {
    titulo(id) {
        return buscarProjeto(id)?.titulo ?? naoEncontrada.titulo;
    },

    render(id) {
        const dados = buscarProjeto(id);
        if (!dados) return naoEncontrada.render();

        const concluido = metaAtingida(dados);
        const outros = PROJETOS.filter((item) => item.id !== dados.id);

        return `
            <section class="secao">
                <div class="container">
                    <a href="#/projetos" class="link-voltar">${icone('voltar')}Voltar para projetos</a>

                    <div class="grid detalhe">
                        <div class="col-12 col-lg-7">
                            ${foto(dados.imagem, { classe: 'imagem-arredondada detalhe__imagem', alt: dados.alt, sizes: TAMANHOS.detalhe, prioridade: true })}
                        </div>
                        <div class="col-12 col-lg-5 detalhe__info">
                            <div class="badges">
                                ${badge(dados.categoria.nome, dados.categoria.tipo)}
                                ${concluido
                                    ? badge('Meta atingida', 'sucesso', { comIcone: 'sucesso' })
                                    : badge(dados.status.nome, dados.status.tipo, { ponto: true })}
                            </div>
                            <h1 class="detalhe__titulo">${escapar(dados.titulo)}</h1>
                            <p class="detalhe__resumo">${escapar(dados.resumo)}</p>
                            ${barraMeta(dados)}
                            <p class="detalhe__voluntarios">${icone('usuarios')}<span><strong>${dados.voluntarios}</strong> voluntários atuando</span></p>
                            <div class="hero__acoes">
                                ${concluido
                                    ? '<button type="button" class="btn btn--doar" disabled>Meta atingida</button>'
                                    : `<button type="button" class="btn btn--doar" data-doar="${dados.id}">${icone('coracao')}Doar para este projeto</button>`}
                                <a href="#/cadastro" class="btn btn--contorno">Quero ser voluntário</a>
                            </div>
                        </div>
                    </div>

                    <article class="bloco detalhe__descricao">
                        <h2>Sobre o projeto</h2>
                        ${dados.descricao.map((paragrafo) => `<p>${escapar(paragrafo)}</p>`).join('')}
                    </article>
                </div>
            </section>

            <section class="secao secao--alternada">
                <div class="container">
                    <header class="secao__cabecalho"><h2>Conheça outros projetos</h2></header>
                    <div class="grid">
                        ${outros.map((item) => `<div class="col-12 col-md-6">${cardProjeto(item)}</div>`).join('')}
                    </div>
                </div>
            </section>`;
    },
};
