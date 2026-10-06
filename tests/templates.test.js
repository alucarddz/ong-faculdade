import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapar, formatarMoeda, badge, barraMeta, cardProjeto } from '../js/modules/templates.js';
import { PROJETOS } from '../js/data/projetos.js';

test('escapar() neutraliza HTML digitado pelo usuário (XSS)', () => {
    assert.equal(
        escapar('<img src=x onerror="alert(1)">'),
        '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
    assert.equal(escapar("Rock & Roll's"), 'Rock &amp; Roll&#39;s');
    assert.equal(escapar(undefined), '');
});

test('formatarMoeda() usa o padrão brasileiro', () => {
    // Intl usa espaço não separável entre "R$" e o valor
    assert.equal(formatarMoeda(7800).replace(/\s/g, ' '), 'R$ 7.800');
});

test('badge() aplica a classe do tipo e escapa o texto', () => {
    const html = badge('<b>Saúde</b>', 'sucesso');
    assert.match(html, /class="badge badge--sucesso"/);
    assert.match(html, /&lt;b&gt;Saúde&lt;\/b&gt;/);
});

test('barraMeta() limita a porcentagem a 100%', () => {
    const html = barraMeta({ id: 'teste', titulo: 'Teste', meta: 100, arrecadado: 250 });
    assert.match(html, /aria-valuenow="100"/);
    assert.match(html, /flex-basis: 100%/);
});

test('cardProjeto() desabilita a doação quando a meta foi atingida', () => {
    const concluido = PROJETOS.find((projeto) => projeto.arrecadado >= projeto.meta);
    const emAndamento = PROJETOS.find((projeto) => projeto.arrecadado < projeto.meta);

    assert.match(cardProjeto(concluido), /disabled>Meta atingida/);
    assert.match(cardProjeto(emAndamento), new RegExp(`data-doar="${emAndamento.id}"`));
});
