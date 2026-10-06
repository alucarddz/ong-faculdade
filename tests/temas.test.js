import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolverTema } from '../js/modules/temas.js';

test('preferência explícita vence a configuração do sistema', () => {
    assert.equal(resolverTema('claro', { sistemaEscuro: true }), 'claro');
    assert.equal(resolverTema('escuro', { sistemaEscuro: false }), 'escuro');
    assert.equal(resolverTema('alto-contraste'), 'alto-contraste');
});

test('modo automático segue o sistema', () => {
    assert.equal(resolverTema('auto'), 'claro');
    assert.equal(resolverTema('auto', { sistemaEscuro: true }), 'escuro');
});

test('pedido de mais contraste no sistema tem prioridade sobre o escuro', () => {
    assert.equal(resolverTema('auto', { sistemaEscuro: true, sistemaMaisContraste: true }), 'alto-contraste');
});

test('valor desconhecido (ex.: localStorage adulterado) cai no modo automático', () => {
    assert.equal(resolverTema('roxo', { sistemaEscuro: true }), 'escuro');
    assert.equal(resolverTema(null), 'claro');
});
