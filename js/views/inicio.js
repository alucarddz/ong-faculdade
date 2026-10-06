// Tela inicial (#/inicio)

import { PROJETOS } from '../data/projetos.js';
import { cardProjeto, icone } from '../modules/templates.js';
import { listarCadastros } from '../modules/storage.js';

export const inicio = {
    titulo: 'Seja o herói na vida de alguém',

    render() {
        const voluntarios = PROJETOS.reduce((total, projeto) => total + projeto.voluntarios, 0)
            + listarCadastros().length;

        return `
            <section class="hero">
                <div class="container grid hero__grid">
                    <div class="hero__conteudo col-12 col-lg-6">
                        <h1>Seja o herói na vida de alguém</h1>
                        <p class="hero__texto">Conectamos pessoas e recursos a causas humanitárias urgentes em todo o Brasil.</p>
                        <div class="hero__acoes">
                            <a href="#/projetos" class="btn btn--primario">Conheça os projetos ${icone('seta')}</a>
                            <a href="#/cadastro" class="btn btn--contorno">Quero ser voluntário</a>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <img class="hero__imagem" src="../imagens/hero-voluntarios.jpg" alt="Voluntários unidos em ação comunitária">
                    </div>
                </div>
            </section>

            <section class="secao">
                <div class="container">
                    <header class="secao__cabecalho">
                        <h2>Projetos em destaque</h2>
                        <p>Encontre uma causa na sua cidade ou ajude em ocorrências de outras regiões.</p>
                    </header>
                    <div class="grid">
                        ${PROJETOS.map((projeto) => `<div class="col-12 col-md-6 col-lg-4">${cardProjeto(projeto)}</div>`).join('')}
                    </div>
                </div>
            </section>

            <section class="secao secao--alternada">
                <div class="container">
                    <header class="secao__cabecalho">
                        <h2>Vidas transformadas</h2>
                        <p>Como nosso trabalho conjunto impactou o Brasil.</p>
                    </header>
                    <ul class="grid estatisticas">
                        <li class="col-12 col-sm-6 col-lg-3 estatistica"><strong>1.000+</strong><span>famílias atendidas no último ciclo</span></li>
                        <li class="col-12 col-sm-6 col-lg-3 estatistica"><strong>${voluntarios}</strong><span>voluntários ativos</span></li>
                        <li class="col-12 col-sm-6 col-lg-3 estatistica"><strong>87%</strong><span>do valor arrecadado vai para as ações de campo</span></li>
                        <li class="col-12 col-sm-6 col-lg-3 estatistica"><strong>100%</strong><span>dos relatórios financeiros auditados</span></li>
                    </ul>
                </div>
            </section>

            <section class="secao">
                <div class="container grid">
                    <div class="col-12 col-lg-5">
                        <img class="imagem-arredondada" src="../imagens/hero-voluntarios.jpg" alt="Equipe de apoiadores da ONG">
                    </div>
                    <div class="col-12 col-lg-7 sobre">
                        <h2>Sobre a ONG</h2>
                        <p>A ONG Faculdade é uma organização da sociedade civil que atua no acolhimento de famílias em vulnerabilidade social.</p>
                        <p>Nossa missão é oferecer amparo, capacitação e segurança alimentar para que cada pessoa alcance sua dignidade plena.</p>
                        <div class="hero__acoes">
                            <button type="button" class="btn btn--doar" data-doar>${icone('coracao')}Fazer uma doação</button>
                            <a href="#/cadastro" class="btn btn--contorno">Cadastre-se</a>
                        </div>
                    </div>
                </div>
            </section>`;
    },
};
