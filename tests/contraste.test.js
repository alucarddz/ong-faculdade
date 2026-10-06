// Verifica o contraste WCAG 2.1 de todos os pares de cor usados na interface,
// nos três temas. Lê os tokens direto de css/variables.css: se alguém mudar
// uma cor e quebrar o contraste, este teste falha.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/variables.css', import.meta.url), 'utf8');

// Conteúdo de um bloco "seletor { ... }" (sem blocos aninhados)
function bloco(seletor) {
    const inicio = css.indexOf(`${seletor} {`);
    assert.ok(inicio >= 0, `bloco ${seletor} não encontrado`);
    return css.slice(inicio, css.indexOf('}', inicio));
}

function tokens(texto) {
    return Object.fromEntries([...texto.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, nome, valor]) => [nome, valor.trim()]));
}

// O tema claro é o :root base; os outros sobrescrevem só o que mudam
const base = tokens(bloco(':root'));
const TEMAS = {
    claro: base,
    escuro: { ...base, ...tokens(bloco(':root[data-tema="escuro"]')) },
    'alto-contraste': { ...base, ...tokens(bloco(':root[data-tema="alto-contraste"]')) },
};

function resolver(tema, nome) {
    const valor = tema[nome];
    const referencia = valor?.match(/^var\((--[\w-]+)\)$/);
    return referencia ? resolver(tema, referencia[1]) : valor;
}

function luminancia(hex) {
    const [r, g, b] = hex.replace('#', '').match(/../g).map((par) => {
        const canal = parseInt(par, 16) / 255;
        return canal <= 0.03928 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(hexA, hexB) {
    const [clara, escura] = [luminancia(hexA), luminancia(hexB)].sort((a, b) => b - a);
    return (clara + 0.05) / (escura + 0.05);
}

// [primeiro plano, fundo, mínimo, onde aparece]
const TEXTO = 4.5;
const COMPONENTE = 3;
const PARES = [
    ['--cor-texto', '--cor-fundo-alt', TEXTO, 'texto da página'],
    ['--cor-texto', '--cor-superficie', TEXTO, 'texto em cards e campos'],
    ['--cor-texto-suave', '--cor-superficie', TEXTO, 'descrições e dicas'],
    ['--cor-texto-suave', '--cor-fundo-alt', TEXTO, 'subtítulos de seção'],
    ['--cor-primaria', '--cor-superficie', TEXTO, 'link ativo do menu e porcentagem da meta'],
    ['--cor-destaque', '--cor-superficie', TEXTO, 'links'],
    ['--cor-destaque', '--cor-fundo-alt', TEXTO, 'links sobre o fundo'],
    ['--cor-erro', '--cor-superficie', TEXTO, 'mensagem de erro do campo'],
    ['--cor-texto', '--cor-erro-clara', TEXTO, 'texto digitado em campo inválido'],
    ['--cor-sobre-cor', '--cor-primaria', TEXTO, 'botão primário'],
    ['--cor-sobre-cor', '--cor-primaria-hover', TEXTO, 'botão primário (hover)'],
    ['--cor-sobre-cor', '--cor-erro', TEXTO, 'botão e badge de erro'],
    ['--cor-sobre-cor', '--cor-erro-hover', TEXTO, 'botão de erro (hover)'],
    ['--cor-sobre-cor', '--cor-destaque', TEXTO, 'botão de informação'],
    ['--cor-sobre-cor', '--cor-destaque-hover', TEXTO, 'botão de informação (hover)'],
    ['--cor-sobre-ambar', '--cor-secundaria', TEXTO, 'botão "Quero doar"'],
    ['--cor-sobre-ambar', '--cor-secundaria-escura', TEXTO, 'botão "Quero doar" (hover)'],
    ['--cor-branco', '--cor-faixa', TEXTO, 'cabeçalho de página e rodapé'],
    ['--cor-sucesso-texto', '--cor-sucesso-clara', TEXTO, 'badge de sucesso'],
    ['--cor-primaria', '--cor-sucesso-clara', TEXTO, 'título do alerta de sucesso'],
    ['--cor-erro', '--cor-erro-clara', TEXTO, 'badge e alerta de erro'],
    ['--cor-aviso-texto', '--cor-aviso-clara', TEXTO, 'badge e alerta de aviso'],
    ['--cor-destaque', '--cor-info-clara', TEXTO, 'badge e alerta de informação'],
    ['--cor-texto-suave', '--cor-neutra-clara', TEXTO, 'badge neutro'],
    ['--cor-borda-campo', '--cor-superficie', COMPONENTE, 'contorno dos campos'],
    ['--cor-destaque', '--cor-superficie', COMPONENTE, 'anel de foco'],
    ['--grafico-1', '--cor-superficie', COMPONENTE, 'gráfico: série 1'],
    ['--grafico-2', '--cor-superficie', COMPONENTE, 'gráfico: série 2'],
    ['--grafico-3', '--cor-superficie', COMPONENTE, 'gráfico: série 3'],
];

for (const [nomeTema, tema] of Object.entries(TEMAS)) {
    test(`tema ${nomeTema}: todos os pares atingem o contraste mínimo`, () => {
        const falhas = PARES
            .map(([frente, fundo, minimo, uso]) => {
                const razao = contraste(resolver(tema, frente), resolver(tema, fundo));
                return { uso, razao: razao.toFixed(2), minimo, ok: razao >= minimo };
            })
            .filter((par) => !par.ok);

        assert.deepEqual(falhas, [], `pares abaixo do mínimo no tema ${nomeTema}`);
    });
}

test('alto contraste: todo texto atinge o nível AAA (7:1)', () => {
    const tema = TEMAS['alto-contraste'];
    const textos = PARES.filter(([, , minimo]) => minimo === TEXTO);
    for (const [frente, fundo, , uso] of textos) {
        const razao = contraste(resolver(tema, frente), resolver(tema, fundo));
        assert.ok(razao >= 7, `${uso}: ${razao.toFixed(2)}:1`);
    }
});
