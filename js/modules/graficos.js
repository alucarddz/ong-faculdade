// Integração com a biblioteca Chart.js (via CDN, como ES Module).
// A biblioteca só é baixada quando uma tela com gráfico é aberta (import dinâmico),
// e não cria variáveis globais: o objeto Chart existe apenas dentro deste módulo.

const URL_CHART_JS = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm';

let carregamento = null;
const graficosAtivos = new Set();

// Lê as cores do Design System direto das variáveis CSS (mudam conforme o tema)
const token = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

// As cores são passadas como funções ("opções scriptable" do Chart.js): a biblioteca
// as reavalia a cada update(), então trocar o tema não exige recriar o gráfico.
const cor = (nome) => () => token(nome);

function carregarChart() {
    // Guarda a Promise: várias chamadas reaproveitam o mesmo download
    carregamento ??= import(URL_CHART_JS).then(({ Chart, registerables }) => {
        Chart.register(...registerables);

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 13;
        Chart.defaults.maintainAspectRatio = false;
        // As cores vêm do Design System, nunca da paleta automática da biblioteca
        Chart.defaults.plugins.colors.enabled = false;
        // Respeita quem pediu menos animação no sistema operacional
        Chart.defaults.animation = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? false
            : { duration: 600 };

        return Chart;
    }).catch((erro) => {
        // Sem isso a falha ficaria guardada e nunca haveria nova tentativa ao voltar a conexão
        carregamento = null;
        throw erro;
    });
    return carregamento;
}

// Gráficos de telas anteriores são destruídos para liberar memória
function limparGraficosAntigos() {
    graficosAtivos.forEach((grafico) => {
        if (!grafico.canvas.isConnected) {
            grafico.destroy();
            graficosAtivos.delete(grafico);
        }
    });
}

// O canvas não lê CSS: ao trocar de tema, os gráficos são redesenhados com as novas cores
document.addEventListener('tema:mudou', () => {
    limparGraficosAntigos();
    graficosAtivos.forEach((grafico) => grafico.update('none'));
});

async function criarGrafico(canvas, configuracao) {
    const Chart = await carregarChart();
    limparGraficosAntigos();
    const grafico = new Chart(canvas, configuracao);
    graficosAtivos.add(grafico);
    return grafico;
}

const formatarReal = (valor) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// Barras horizontais: quanto da meta cada projeto já arrecadou
export function graficoArrecadacao(canvas, projetos) {
    const porcentagens = projetos.map((p) => Math.min(100, Math.round((p.arrecadado / p.meta) * 100)));

    return criarGrafico(canvas, {
        type: 'bar',
        data: {
            labels: projetos.map((p) => p.titulo.replace('Projeto ', '')),
            datasets: [{
                label: '% da meta',
                data: porcentagens,
                backgroundColor: cor('--grafico-1'),
                borderRadius: 4,
                barThickness: 22,
            }],
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    ticks: { callback: (valor) => `${valor}%`, color: cor('--cor-texto-suave') },
                    grid: { color: cor('--grafico-grade') },
                    border: { display: false },
                },
                y: {
                    ticks: { color: cor('--cor-texto') },
                    grid: { display: false },
                    border: { display: false },
                },
            },
            plugins: {
                legend: { display: false }, // série única: o título já identifica
                tooltip: {
                    callbacks: {
                        label: (contexto) => {
                            const projeto = projetos[contexto.dataIndex];
                            return ` ${formatarReal(projeto.arrecadado)} de ${formatarReal(projeto.meta)} (${contexto.parsed.x}%)`;
                        },
                    },
                },
            },
        },
    });
}

// Rosca: para onde vai cada real doado
export function graficoDestinoRecursos(canvas, fatias) {
    const CORES_FATIAS = ['--grafico-1', '--grafico-3', '--grafico-2'];

    return criarGrafico(canvas, {
        type: 'doughnut',
        data: {
            labels: fatias.map((f) => f.rotulo),
            datasets: [{
                data: fatias.map((f) => f.valor),
                backgroundColor: (contexto) => token(CORES_FATIAS[contexto.dataIndex]),
                borderColor: cor('--cor-superficie'),
                borderWidth: 2, // separa as fatias
                hoverOffset: 6,
            }],
        },
        options: {
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 16,
                        // Gerada a cada update: acompanha o tema. A legenda mostra o valor,
                        // então a cor nunca é a única pista
                        generateLabels: () => fatias.map((fatia, i) => ({
                            text: `${fatia.rotulo}: ${fatia.valor}%`,
                            fillStyle: token(CORES_FATIAS[i]),
                            strokeStyle: token(CORES_FATIAS[i]),
                            fontColor: token('--cor-texto'),
                            pointStyle: 'circle',
                            index: i,
                        })),
                    },
                },
                tooltip: {
                    callbacks: { label: (contexto) => ` ${contexto.label}: ${contexto.parsed}%` },
                },
            },
        },
    });
}
