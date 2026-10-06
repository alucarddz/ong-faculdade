// Camada única de acesso ao localStorage. Nenhum outro módulo chama
// localStorage diretamente: assim o prefixo, o JSON e os erros ficam tratados em um só lugar.

const PREFIXO = 'ong:';

export function ler(chave, padrao = null) {
    try {
        const valor = localStorage.getItem(PREFIXO + chave);
        return valor === null ? padrao : JSON.parse(valor);
    } catch {
        // Navegação privada ou dado corrompido: segue com o valor padrão
        return padrao;
    }
}

export function salvar(chave, valor) {
    try {
        localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
        return true;
    } catch {
        return false;
    }
}

export function remover(chave) {
    try {
        localStorage.removeItem(PREFIXO + chave);
    } catch {
        // sem armazenamento disponível, nada a remover
    }
}

// ---------- Cadastros de voluntários/doadores ----------
export function listarCadastros() {
    return ler('cadastros', []);
}

export function adicionarCadastro(dados) {
    const cadastros = listarCadastros();
    const novo = { ...dados, id: Date.now(), criadoEm: new Date().toISOString() };
    cadastros.push(novo);
    salvar('cadastros', cadastros);
    return novo;
}

export function limparCadastros() {
    remover('cadastros');
}

// ---------- Rascunho do formulário ----------
export const lerRascunho = () => ler('rascunho-cadastro', {});
export const salvarRascunho = (dados) => salvar('rascunho-cadastro', dados);
export const limparRascunho = () => remover('rascunho-cadastro');

// ---------- Doações ----------
export function registrarDoacao(projetoId, valor) {
    const doacoes = ler('doacoes', []);
    doacoes.push({ projetoId, valor, data: new Date().toISOString() });
    salvar('doacoes', doacoes);
}

export function totalDoadoNoNavegador(projetoId) {
    return ler('doacoes', [])
        .filter((doacao) => doacao.projetoId === projetoId)
        .reduce((total, doacao) => total + doacao.valor, 0);
}

// ---------- Preferências ----------
export const lerPreferencia = (nome, padrao) => ler(`pref:${nome}`, padrao);
export const salvarPreferencia = (nome, valor) => salvar(`pref:${nome}`, valor);
