// Lista de projetos com filtro por categoria (#/projetos)

import { PROJETOS, DESTINO_RECURSOS } from '../data/projetos.js';
import { arrecadadoAtual, cardProjeto, escapar, formatarMoeda, icone } from '../modules/templates.js';
import { lerPreferencia, salvarPreferencia } from '../modules/storage.js';
import { graficoArrecadacao, graficoDestinoRecursos } from '../modules/graficos.js';

// Valores já somando as doações feitas neste navegador
const projetosAtualizados = () =>
    PROJETOS.map((projeto) => ({ ...projeto, arrecadado: arrecadadoAtual(projeto) }));

function tabelaArrecadacao() {
    const linhas = projetosAtualizados().map((p) => `
        <tr>
            <th scope="row">${escapar(p.titulo)}</th>
            <td>${formatarMoeda(p.arrecadado)}</td>
            <td>${formatarMoeda(p.meta)}</td>
            <td>${Math.min(100, Math.round((p.arrecadado / p.meta) * 100))}%</td>
        </tr>`).join('');

    return `
        <details class="grafico__dados">
            <summary>Ver dados em tabela</summary>
            <table class="tabela">
                <thead><tr><th scope="col">Projeto</th><th scope="col">Arrecadado</th><th scope="col">Meta</th><th scope="col">%</th></tr></thead>
                <tbody>${linhas}</tbody>
            </table>
        </details>`;
}

const TODAS = 'Todas';

function categorias() {
    return [TODAS, ...new Set(PROJETOS.map((projeto) => projeto.categoria.nome))];
}

function aplicarFiltro(raiz, categoria) {
    let visiveis = 0;

    raiz.querySelectorAll('[data-categoria]').forEach((card) => {
        const mostrar = categoria === TODAS || card.dataset.categoria === categoria;
        card.closest('[class*="col-"]').hidden = !mostrar;
        if (mostrar) visiveis++;
    });

    raiz.querySelectorAll('[data-filtro]').forEach((botao) => {
        botao.setAttribute('aria-pressed', String(botao.dataset.filtro === categoria));
    });

    raiz.querySelector('#contador-projetos').textContent =
        `${visiveis} ${visiveis === 1 ? 'projeto encontrado' : 'projetos encontrados'}`;
}

export const projetos = {
    titulo: 'Projetos, voluntariado e doações',

    render() {
        return `
            <header class="cabecalho-pagina">
                <div class="container">
                    <h1>Projetos sociais</h1>
                    <p>Conheça nossas frentes de atuação e descubra como fazer a diferença com voluntariado e doações.</p>
                </div>
            </header>

            <section class="secao" aria-labelledby="titulo-frentes">
                <div class="container">
                    <header class="secao__cabecalho">
                        <h2 id="titulo-frentes">Nossas frentes de atuação</h2>
                        <p>Iniciativas contínuas voltadas à inclusão e ao suporte humanitário.</p>
                    </header>

                    <div class="filtros" role="group" aria-label="Filtrar projetos por categoria">
                        ${categorias().map((nome) => `
                            <button type="button" class="filtro" data-filtro="${escapar(nome)}" aria-pressed="false">${escapar(nome)}</button>
                        `).join('')}
                    </div>
                    <p class="filtros__contador" id="contador-projetos" aria-live="polite"></p>

                    <div class="grid">
                        ${PROJETOS.map((projeto) => `<div class="col-12 col-md-6 col-lg-4">${cardProjeto(projeto)}</div>`).join('')}
                    </div>
                </div>
            </section>

            <section class="secao secao--alternada" aria-labelledby="titulo-voluntariado">
                <div class="container grid">
                    <header class="secao__cabecalho col-12">
                        <h2 id="titulo-voluntariado">Atividades de voluntariado</h2>
                        <p>O trabalho voluntário sustenta nossos projetos. Não é preciso experiência, apenas dedicação e empatia.</p>
                    </header>
                    <article class="bloco col-12 col-lg-6">
                        <h3>Como se envolver</h3>
                        <ul class="lista-marcada">
                            <li><strong>Ações de campo:</strong> entrega de mantimentos e logística de eventos comunitários.</li>
                            <li><strong>Educacional:</strong> apoio em monitorias, aulas e contação de histórias.</li>
                            <li><strong>Especializado:</strong> psicologia, assistência social, design ou comunicação.</li>
                        </ul>
                    </article>
                    <article class="bloco col-12 col-lg-6">
                        <h3>Passo a passo para participar</h3>
                        <ol class="passos">
                            <li>Preencha a ficha cadastral com suas preferências e disponibilidade.</li>
                            <li>Participe da palestra de ambientação e alinhamento de diretrizes.</li>
                            <li>Comece sua jornada em uma de nossas equipes de acolhimento.</li>
                        </ol>
                        <a href="#/cadastro" class="btn btn--primario">Inscrever-se no voluntariado ${icone('seta')}</a>
                    </article>
                </div>
            </section>

            <section class="secao" aria-labelledby="titulo-doacoes">
                <div class="container grid">
                    <header class="secao__cabecalho col-12">
                        <h2 id="titulo-doacoes">Campanhas e canais de doação</h2>
                        <p>Nossas campanhas seguem processos rigorosos de prestação de contas, garantindo que cada centavo chegue ao destino.</p>
                    </header>
                    <article class="bloco col-12 col-lg-6">
                        <h3>Contribuição financeira</h3>
                        <ul class="lista-marcada">
                            <li><strong>PIX:</strong> chave CNPJ 00.000.000/0001-00 (qualquer valor ajuda).</li>
                            <li><strong>Apoiador recorrente:</strong> assinatura mensal a partir de R$ 20,00.</li>
                            <li><strong>Transferência:</strong> Banco Social S/A · Ag. 1234 · CC 56789-0.</li>
                        </ul>
                        <button type="button" class="btn btn--doar" data-doar>${icone('coracao')}Fazer uma doação</button>
                    </article>
                    <article class="bloco col-12 col-lg-6">
                        <h3>Transparência e impacto</h3>
                        <ul class="lista-marcada">
                            <li>Mais de 1.000 famílias atendidas no último ciclo.</li>
                            <li>100% dos relatórios financeiros auditados e publicados.</li>
                            <li>87% do valor arrecadado vai direto para as ações de ponta.</li>
                            <li>Recebemos alimentos, itens de higiene, roupas e materiais escolares nos pontos de coleta.</li>
                        </ul>
                    </article>
                </div>
            </section>

            <section class="secao secao--alternada" aria-labelledby="titulo-numeros">
                <div class="container grid">
                    <header class="secao__cabecalho col-12">
                        <h2 id="titulo-numeros">Transparência em números</h2>
                        <p>Acompanhe a arrecadação de cada projeto. Os valores incluem as doações feitas por você.</p>
                    </header>
                    <figure class="bloco grafico col-12 col-lg-7">
                        <figcaption class="grafico__titulo">Arrecadação por projeto (% da meta)</figcaption>
                        <div class="grafico__area">
                            <canvas id="grafico-arrecadacao" role="img" aria-label="Gráfico de barras com a porcentagem da meta arrecadada por projeto"></canvas>
                        </div>
                        <p class="grafico__status" hidden></p>
                        ${tabelaArrecadacao()}
                    </figure>
                    <figure class="bloco grafico col-12 col-lg-5">
                        <figcaption class="grafico__titulo">Para onde vai cada real doado</figcaption>
                        <div class="grafico__area">
                            <canvas id="grafico-destino" role="img" aria-label="Gráfico de rosca: ${DESTINO_RECURSOS.map((f) => `${f.rotulo} ${f.valor}%`).join(', ')}"></canvas>
                        </div>
                        <p class="grafico__status" hidden></p>
                        <details class="grafico__dados">
                            <summary>Ver dados em tabela</summary>
                            <table class="tabela">
                                <thead><tr><th scope="col">Destino</th><th scope="col">%</th></tr></thead>
                                <tbody>
                                    ${DESTINO_RECURSOS.map((f) => `<tr><th scope="row">${escapar(f.rotulo)}</th><td>${f.valor}%</td></tr>`).join('')}
                                </tbody>
                            </table>
                        </details>
                    </figure>
                </div>
            </section>`;
    },

    montar(raiz) {
        const categoriaSalva = lerPreferencia('filtro-projetos', TODAS);
        aplicarFiltro(raiz, categorias().includes(categoriaSalva) ? categoriaSalva : TODAS);

        raiz.querySelector('.filtros').addEventListener('click', (evento) => {
            const botao = evento.target.closest('[data-filtro]');
            if (!botao) return;
            aplicarFiltro(raiz, botao.dataset.filtro);
            // O filtro escolhido é lembrado na próxima visita
            salvarPreferencia('filtro-projetos', botao.dataset.filtro);
        });

        // Se o CDN estiver fora do ar, a página continua funcionando e a tabela fica visível
        const avisarFalha = (canvas) => {
            const figura = canvas.closest('.grafico');
            canvas.closest('.grafico__area').hidden = true;
            const status = figura.querySelector('.grafico__status');
            status.textContent = 'Não foi possível carregar o gráfico. Confira os dados abaixo.';
            status.hidden = false;
            figura.querySelector('details')?.setAttribute('open', '');
        };

        const barras = raiz.querySelector('#grafico-arrecadacao');
        const rosca = raiz.querySelector('#grafico-destino');
        graficoArrecadacao(barras, projetosAtualizados()).catch(() => avisarFalha(barras));
        graficoDestinoRecursos(rosca, DESTINO_RECURSOS).catch(() => avisarFalha(rosca));
    },
};
