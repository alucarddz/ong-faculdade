// Formulário de cadastro de voluntários e doadores (#/cadastro)

import { alerta, escapar, criarElemento } from '../modules/templates.js';
import { iniciarValidacao } from '../modules/validacao.js';
import { mostrarToast } from '../modules/feedback.js';
import {
    adicionarCadastro, listarCadastros, limparCadastros,
    lerRascunho, salvarRascunho, limparRascunho,
} from '../modules/storage.js';

const ESTADOS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
    'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const TIPOS_ATUACAO = {
    'voluntario-campo': 'Voluntário em ações de campo',
    'voluntario-educacao': 'Voluntário em oficinas educativas',
    'voluntario-especializado': 'Voluntário profissional especializado',
    'doador-mensal': 'Doador financeiro recorrente',
    'doador-pontual': 'Doador pontual',
};

const LIMITE_MENSAGEM = 500;

// ---------- Templates locais do formulário ----------
function grupo({ id, rotulo, obrigatorio = true, colunas = 'col-12', dica = '', controle }) {
    const marcador = obrigatorio ? ' <span class="form__obrigatorio" aria-hidden="true">*</span>' : '';
    return `
        <div class="form__grupo ${colunas}">
            <label class="form__rotulo" for="${id}">${rotulo}${marcador}</label>
            ${controle}
            ${dica ? `<p class="form__dica" id="dica-${id}">${dica}</p>` : ''}
            <p class="form__erro" id="erro-${id}" hidden></p>
        </div>`;
}

function campo({ id, nome, tipo = 'text', placeholder = '', extras = '', ...opcoes }) {
    const descricao = opcoes.dica ? `erro-${id} dica-${id}` : `erro-${id}`;
    return grupo({
        id,
        ...opcoes,
        controle: `<input class="form__campo" type="${tipo}" id="${id}" name="${nome}" placeholder="${placeholder}"
            aria-describedby="${descricao}" ${opcoes.obrigatorio === false ? '' : 'aria-required="true"'} ${extras}>`,
    });
}

function selecao({ id, nome, vazio, opcoes: itens, ...opcoes }) {
    const lista = Object.entries(itens)
        .map(([valor, texto]) => `<option value="${valor}">${texto}</option>`)
        .join('');
    return grupo({
        id,
        ...opcoes,
        controle: `<select class="form__campo" id="${id}" name="${nome}" aria-describedby="erro-${id}" aria-required="true">
            <option value="">${vazio}</option>${lista}</select>`,
    });
}

function listaCadastros() {
    const cadastros = listarCadastros();
    if (!cadastros.length) {
        return '<p class="cadastros__vazio">Nenhum cadastro salvo neste navegador ainda.</p>';
    }

    const itens = cadastros.slice().reverse().map((cadastro) => `
        <li class="cadastros__item">
            <span class="cadastros__nome">${escapar(cadastro.nome_completo)}</span>
            <span class="cadastros__detalhe">${escapar(TIPOS_ATUACAO[cadastro.tipo_atuacao])} · ${escapar(cadastro.cidade)}/${escapar(cadastro.estado)}</span>
            <time class="cadastros__data" datetime="${cadastro.criadoEm}">${new Date(cadastro.criadoEm).toLocaleDateString('pt-BR')}</time>
        </li>`).join('');

    return `
        <ul class="cadastros__lista">${itens}</ul>
        <button type="button" class="btn btn--contorno" id="limpar-cadastros">Apagar cadastros salvos</button>`;
}

// Oculta parte do CPF antes de guardar: o navegador não precisa do documento completo
const mascararCpf = (cpf) => `***.${cpf.slice(4, 11)}-**`;

export const cadastro = {
    titulo: 'Cadastro de voluntários e doadores',

    render() {
        const ufs = Object.fromEntries(ESTADOS.map((uf) => [uf, uf]));

        return `
            <header class="cabecalho-pagina">
                <div class="container">
                    <h1>Cadastre-se na nossa rede de apoio</h1>
                    <p>Preencha os dados abaixo para atuar como voluntário ou contribuir com nossas campanhas.</p>
                </div>
            </header>

            <section class="secao">
                <div class="container grid">
                    <div class="col-12 col-lg-8">
                        <div class="alertas" id="alertas-cadastro"></div>

                        <form class="form" id="form-cadastro">
                            <p class="form__legenda-obrigatorio">Campos com <span class="form__obrigatorio">*</span> são obrigatórios.</p>

                            <fieldset class="form__secao grid">
                                <legend>Dados pessoais</legend>
                                ${campo({ id: 'nome-completo', nome: 'nome_completo', rotulo: 'Nome completo', placeholder: 'Ex.: Maria da Silva', extras: 'autocomplete="name"' })}
                                ${campo({ id: 'email', nome: 'email', tipo: 'email', rotulo: 'E-mail', placeholder: 'exemplo@dominio.com', colunas: 'col-12 col-md-6', extras: 'autocomplete="email"' })}
                                ${campo({ id: 'cpf', nome: 'cpf', rotulo: 'CPF', placeholder: '000.000.000-00', colunas: 'col-12 col-md-6', extras: 'inputmode="numeric" autocomplete="off"' })}
                                ${campo({ id: 'telefone', nome: 'telefone', tipo: 'tel', rotulo: 'Celular com DDD', placeholder: '(00) 00000-0000', colunas: 'col-12 col-md-6', extras: 'autocomplete="tel"' })}
                                ${campo({ id: 'data-nascimento', nome: 'data_nascimento', tipo: 'date', rotulo: 'Data de nascimento', colunas: 'col-12 col-md-6' })}
                            </fieldset>

                            <fieldset class="form__secao grid">
                                <legend>Endereço</legend>
                                ${campo({ id: 'cep', nome: 'cep', rotulo: 'CEP', placeholder: '00000-000', colunas: 'col-12 col-md-4', extras: 'inputmode="numeric" autocomplete="postal-code"' })}
                                ${campo({ id: 'logradouro', nome: 'logradouro', rotulo: 'Rua e número', placeholder: 'Ex.: Rua das Flores, 123', colunas: 'col-12 col-md-8', extras: 'autocomplete="street-address"' })}
                                ${campo({ id: 'cidade', nome: 'cidade', rotulo: 'Cidade', placeholder: 'Ex.: Curitiba', colunas: 'col-12 col-md-8', extras: 'autocomplete="address-level2"' })}
                                ${selecao({ id: 'estado', nome: 'estado', rotulo: 'Estado', vazio: 'UF', opcoes: ufs, colunas: 'col-12 col-md-4' })}
                            </fieldset>

                            <fieldset class="form__secao grid">
                                <legend>Como quer participar</legend>
                                ${selecao({ id: 'tipo-atuacao', nome: 'tipo_atuacao', rotulo: 'Como deseja contribuir?', vazio: 'Selecione uma opção', opcoes: TIPOS_ATUACAO, colunas: 'col-12 col-md-8' })}
                                ${campo({ id: 'disponibilidade', nome: 'disponibilidade', tipo: 'number', rotulo: 'Horas por semana', placeholder: 'Ex.: 4', obrigatorio: false, colunas: 'col-12 col-md-4', dica: 'Obrigatório para voluntários.', extras: 'min="1" max="44"' })}
                                ${grupo({
                                    id: 'mensagem',
                                    rotulo: 'Mensagem ou observações',
                                    obrigatorio: false,
                                    controle: `<textarea class="form__campo" id="mensagem" name="mensagem" rows="4" maxlength="${LIMITE_MENSAGEM}"
                                        aria-describedby="erro-mensagem contador-mensagem"
                                        placeholder="Conte brevemente sua motivação ou habilidades que gostaria de compartilhar..."></textarea>
                                        <p class="form__dica form__contador" id="contador-mensagem">0/${LIMITE_MENSAGEM}</p>`,
                                })}
                            </fieldset>

                            <div class="form__grupo">
                                <label class="form__opcao" for="termos">
                                    <input type="checkbox" id="termos" name="termos" aria-describedby="erro-termos" aria-required="true">
                                    <span>Li e concordo com os Termos de Voluntariado e a Política de Privacidade.</span>
                                </label>
                                <p class="form__erro" id="erro-termos" hidden></p>
                            </div>

                            <div class="form__acoes">
                                <button type="reset" class="btn btn--contorno">Limpar formulário</button>
                                <button type="submit" class="btn btn--primario">Finalizar cadastro</button>
                            </div>
                        </form>
                    </div>

                    <aside class="col-12 col-lg-4">
                        <div class="bloco cadastros">
                            <h2 class="cadastros__titulo">Cadastros neste navegador</h2>
                            <p class="cadastros__descricao">Os dados ficam salvos no localStorage e continuam aqui mesmo após recarregar a página.</p>
                            <div id="lista-cadastros">${listaCadastros()}</div>
                        </div>
                    </aside>
                </div>
            </section>`;
    },

    montar(raiz) {
        const form = raiz.querySelector('#form-cadastro');
        const areaAlertas = raiz.querySelector('#alertas-cadastro');
        const areaLista = raiz.querySelector('#lista-cadastros');
        const contador = raiz.querySelector('#contador-mensagem');

        const mostrarAlerta = (html) => {
            areaAlertas.replaceChildren(criarElemento(html));
        };
        const atualizarContador = () => {
            contador.textContent = `${form.elements.mensagem.value.length}/${LIMITE_MENSAGEM}`;
        };

        // Recupera o rascunho salvo (se a pessoa saiu no meio do preenchimento)
        const rascunho = lerRascunho();
        const camposRecuperados = Object.entries(rascunho).filter(([nome, valor]) => {
            const elemento = form.elements[nome];
            if (!elemento || valor === '' || valor === false) return false;
            if (elemento.type === 'checkbox') elemento.checked = valor;
            else elemento.value = valor;
            return true;
        });
        if (camposRecuperados.length) {
            mostrarAlerta(alerta('info', 'Rascunho recuperado', 'Preenchemos os campos com o que você digitou da última vez.'));
            atualizarContador();
        }

        // Salva o rascunho a cada alteração, com um pequeno atraso para não gravar a cada tecla
        let temporizador;
        form.addEventListener('input', () => {
            atualizarContador();
            clearTimeout(temporizador);
            temporizador = setTimeout(() => {
                const dados = Object.fromEntries(new FormData(form));
                dados.termos = form.elements.termos.checked;
                salvarRascunho(dados);
            }, 300);
        });

        form.addEventListener('reset', () => {
            clearTimeout(temporizador);
            limparRascunho();
            areaAlertas.replaceChildren();
            setTimeout(atualizarContador);
        });

        iniciarValidacao(form, {
            aoFalhar(invalidos) {
                const quantidade = invalidos.length;
                mostrarAlerta(alerta('erro', 'Revise o formulário',
                    `${quantidade} ${quantidade === 1 ? 'campo precisa' : 'campos precisam'} de atenção. Os erros estão indicados abaixo de cada campo.`));
            },
            aoEnviar(dados) {
                const salvo = adicionarCadastro({ ...dados, cpf: mascararCpf(dados.cpf) });
                form.reset();

                mostrarAlerta(alerta('sucesso', 'Cadastro realizado com sucesso!',
                    `Bem-vindo(a), ${escapar(salvo.nome_completo.split(' ')[0])}! Enviaremos os próximos passos para ${escapar(salvo.email)}.`));
                mostrarToast('sucesso', 'Cadastro enviado!', 'Entraremos em contato em até 48 horas.');
                areaLista.innerHTML = listaCadastros();
                areaAlertas.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
        });

        areaLista.addEventListener('click', (evento) => {
            if (evento.target.closest('#limpar-cadastros')) {
                limparCadastros();
                areaLista.innerHTML = listaCadastros();
                mostrarToast('info', 'Cadastros apagados', 'Os dados salvos neste navegador foram removidos.');
            }
        });
    },
};
