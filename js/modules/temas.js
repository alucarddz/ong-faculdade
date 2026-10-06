// Temas de cor: claro, escuro e alto contraste.
// A preferência ("auto" segue o sistema operacional) fica no localStorage; o tema
// efetivo vai para <html data-tema="...">, e o CSS só troca os tokens de cor.
//
// O mesmo cálculo existe em versão mínima num <script> no <head> dos HTMLs,
// para aplicar o tema antes da primeira pintura e evitar o "piscar" do tema claro.

import { lerPreferencia, salvarPreferencia } from './storage.js';

export const TEMAS = ['auto', 'claro', 'escuro', 'alto-contraste'];

const consultaEscuro = () => window.matchMedia('(prefers-color-scheme: dark)');
const consultaContraste = () => window.matchMedia('(prefers-contrast: more)');

// Função pura: decide o tema efetivo a partir da preferência e do sistema
export function resolverTema(preferencia, { sistemaEscuro = false, sistemaMaisContraste = false } = {}) {
    if (TEMAS.includes(preferencia) && preferencia !== 'auto') return preferencia;
    if (sistemaMaisContraste) return 'alto-contraste';
    return sistemaEscuro ? 'escuro' : 'claro';
}

export function aplicarTema(preferencia) {
    const tema = resolverTema(preferencia, {
        sistemaEscuro: consultaEscuro().matches,
        sistemaMaisContraste: consultaContraste().matches,
    });
    if (document.documentElement.dataset.tema === tema) return;

    document.documentElement.dataset.tema = tema;
    // Avisa quem desenha com cores calculadas em JS (gráficos do Chart.js)
    document.dispatchEvent(new CustomEvent('tema:mudou', { detail: { tema } }));
}

export function iniciarTemas(seletor) {
    let preferencia = lerPreferencia('tema', 'auto');
    if (!TEMAS.includes(preferencia)) preferencia = 'auto';

    seletor.value = preferencia;
    aplicarTema(preferencia);

    seletor.addEventListener('change', () => {
        preferencia = seletor.value;
        salvarPreferencia('tema', preferencia);
        aplicarTema(preferencia);
    });

    // No modo automático, acompanha mudanças feitas no sistema com a página aberta
    const aoMudarSistema = () => { if (preferencia === 'auto') aplicarTema('auto'); };
    consultaEscuro().addEventListener('change', aoMudarSistema);
    consultaContraste().addEventListener('change', aoMudarSistema);
}
