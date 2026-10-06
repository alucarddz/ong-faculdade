import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpfValido } from '../js/modules/validacao.js';

test('aceita CPF válido com e sem máscara', () => {
    assert.equal(cpfValido('111.444.777-35'), true);
    assert.equal(cpfValido('11144477735'), true);
});

test('rejeita CPF com dígito verificador errado', () => {
    assert.equal(cpfValido('111.444.777-36'), false);
    assert.equal(cpfValido('111.444.777-05'), false);
});

test('rejeita sequências repetidas, que passam no cálculo mas são inválidas', () => {
    assert.equal(cpfValido('000.000.000-00'), false);
    assert.equal(cpfValido('111.111.111-11'), false);
});

test('rejeita CPF incompleto ou vazio', () => {
    assert.equal(cpfValido('123.456.789'), false);
    assert.equal(cpfValido(''), false);
});
