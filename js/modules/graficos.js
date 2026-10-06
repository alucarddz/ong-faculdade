// Integração com a biblioteca Chart.js (via CDN, como ES Module).
// A biblioteca só é baixada quando uma tela com gráfico é aberta (import dinâmico),
// e não cria variáveis globais: o objeto Chart existe apenas dentro deste módulo.

const URL_CHART_JS = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm';

let carregamento = null;
const graficosAtivos = new Set();

// Lê as cores do Design System direto das variáveis CSS
const token = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();

function carregarChart() {
    // Guarda a Promise: várias chamadas reaproveitam o mesmo download
    carregamento ??= import(URL_CHART_JS).then(({ Chart, registerables }) => {
        Chart.register(...registerables);

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 13;
        Chart.defaults.color = token('--cor-texto-suave');
        Chart.defaults.maintainAspectRatio = false;
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
                backgroundColor: token('--grafico-1'),
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
                    ticks: { callback: (valor) => `${valor}%` },
                    grid: { color: token('--grafico-grade') },
                    border: { display: false },
                },
                y: { grid: { display: false }, border: { display: false } },
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
    return criarGrafico(canvas, {
        type: 'doughnut',
        data: {
            labels: fatias.map((f) => f.rotulo),
            datasets: [{
                data: fatias.map((f) => f.valor),
                backgroundColor: [token('--grafico-1'), token('--grafico-3'), token('--grafico-2')],
                borderColor: token('--cor-branco'),
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
                        color: token('--cor-texto'),
                        padding: 16,
                        // A legenda mostra o valor, então a cor nunca é a única pista
                        generateLabels: (grafico) => grafico.data.labels.map((rotulo, i) => ({
                            text: `${rotulo}: ${fatias[i].valor}%`,
                            fillStyle: grafico.data.datasets[0].backgroundColor[i],
                            strokeStyle: grafico.data.datasets[0].backgroundColor[i],
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
