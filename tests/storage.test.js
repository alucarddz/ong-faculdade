import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// O Node não tem localStorage: este substituto em memória imita a API do navegador
class LocalStorageFalso {
    #dados = new Map();
    getItem(chave) { return this.#dados.has(chave) ? this.#dados.get(chave) : null; }
    setItem(chave, valor) { this.#dados.set(chave, String(valor)); }
    removeItem(chave) { this.#dados.delete(chave); }
}

const storage = await import('../js/modules/storage.js');

beforeEach(() => {
    globalThis.localStorage = new LocalStorageFalso();
});

test('salvar() e ler() fazem o caminho JSON de ida e volta com prefixo', () => {
    storage.salvar('teste', { nome: 'Maria', tags: ['a', 'b'] });

    assert.equal(localStorage.getItem('ong:teste'), '{"nome":"Maria","tags":["a","b"]}');
    assert.deepEqual(storage.ler('teste'), { nome: 'Maria', tags: ['a', 'b'] });
});

test('ler() devolve o valor padrão quando a chave não existe', () => {
    assert.deepEqual(storage.ler('inexistente', []), []);
});

test('ler() devolve o valor padrão quando o JSON está corrompido', () => {
    localStorage.setItem('ong:quebrado', '{nao é json');
    assert.equal(storage.ler('quebrado', 'padrão'), 'padrão');
});

test('salvar() não lança erro quando o armazenamento está indisponível', () => {
    globalThis.localStorage = { setItem() { throw new Error('QuotaExceededError'); } };
    assert.equal(storage.salvar('teste', 1), false);
});

test('adicionarCadastro() acumula registros com id e data', () => {
    storage.adicionarCadastro({ nome_completo: 'Ana Souza' });
    storage.adicionarCadastro({ nome_completo: 'João Lima' });

    const cadastros = storage.listarCadastros();
    assert.equal(cadastros.length, 2);
    assert.equal(cadastros[1].nome_completo, 'João Lima');
    assert.ok(cadastros[0].id);
    assert.ok(!Number.isNaN(Date.parse(cadastros[0].criadoEm)));
});

test('totalDoadoNoNavegador() soma só as doações do projeto pedido', () => {
    storage.registrarDoacao('educar', 50);
    storage.registrarDoacao('educar', 100);
    storage.registrarDoacao('prato-cheio', 25);

    assert.equal(storage.totalDoadoNoNavegador('educar'), 150);
    assert.equal(storage.totalDoadoNoNavegador('acolher'), 0);
});
