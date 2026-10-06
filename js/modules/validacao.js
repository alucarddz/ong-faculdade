// Validação do formulário de cadastro: máscaras, regras por campo e mensagens de erro.
// O erro só aparece depois que a pessoa sai do campo (blur) ou tenta enviar,
// e some assim que o valor digitado fica correto.

// ---------- Máscaras ----------
const somenteDigitos = (valor) => valor.replace(/\D/g, '');

const MASCARAS = {
    cpf(valor) {
        return somenteDigitos(valor).slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },
    telefone(valor) {
        const digitos = somenteDigitos(valor).slice(0, 11);
        if (digitos.length <= 2) return digitos.replace(/(\d{1,2})/, '($1');
        if (digitos.length <= 10) return digitos.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
    cep(valor) {
        return somenteDigitos(valor).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    },
};

// ---------- Regras auxiliares ----------
export function cpfValido(cpf) {
    const digitos = somenteDigitos(cpf);
    if (digitos.length !== 11 || /^(\d)\1+$/.test(digitos)) return false;

    // Calcula os dois dígitos verificadores
    for (const posicao of [9, 10]) {
        let soma = 0;
        for (let i = 0; i < posicao; i++) soma += Number(digitos[i]) * (posicao + 1 - i);
        const resto = (soma * 10) % 11 % 10;
        if (resto !== Number(digitos[posicao])) return false;
    }
    return true;
}

function idade(dataIso) {
    const nascimento = new Date(`${dataIso}T00:00:00`);
    const hoje = new Date();
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversario = hoje < new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
    if (aindaNaoFezAniversario) anos--;
    return anos;
}

// ---------- Regras por campo (devolvem a mensagem de erro ou '') ----------
const REGRAS = {
    nome_completo: (valor) => {
        if (!valor) return 'Informe seu nome completo.';
        if (valor.split(/\s+/).length < 2) return 'Digite nome e sobrenome.';
        return '';
    },
    email: (valor) => {
        if (!valor) return 'Informe seu e-mail.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return 'Digite um e-mail válido, como nome@exemplo.com.';
        return '';
    },
    cpf: (valor) => {
        if (!valor) return 'Informe seu CPF.';
        if (!cpfValido(valor)) return 'CPF inválido. Confira os números digitados.';
        return '';
    },
    telefone: (valor) => {
        if (!valor) return 'Informe um telefone para contato.';
        if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(valor)) return 'Use o formato (00) 00000-0000.';
        return '';
    },
    data_nascimento: (valor) => {
        if (!valor) return 'Informe sua data de nascimento.';
        const anos = idade(valor);
        if (Number.isNaN(anos) || anos < 0 || anos > 110) return 'Data de nascimento inválida.';
        if (anos < 16) return 'É preciso ter pelo menos 16 anos para se cadastrar.';
        return '';
    },
    cep: (valor) => {
        if (!valor) return 'Informe seu CEP.';
        if (!/^\d{5}-\d{3}$/.test(valor)) return 'Use o formato 00000-000.';
        return '';
    },
    logradouro: (valor) => (valor ? '' : 'Informe rua e número.'),
    cidade: (valor) => (valor.length >= 2 ? '' : 'Informe sua cidade.'),
    estado: (valor) => (valor ? '' : 'Selecione o estado.'),
    tipo_atuacao: (valor) => (valor ? '' : 'Escolha como deseja contribuir.'),
    // Regra condicional: horas só são obrigatórias para quem quer ser voluntário
    disponibilidade: (valor, form) => {
        const ehVoluntario = form.elements.tipo_atuacao.value.startsWith('voluntario');
        if (!valor) return ehVoluntario ? 'Informe quantas horas por semana você pode doar.' : '';
        const horas = Number(valor);
        if (!Number.isInteger(horas) || horas < 1 || horas > 44) return 'Informe um número entre 1 e 44.';
        return '';
    },
    mensagem: (valor) => (valor.length > 500 ? 'Use no máximo 500 caracteres.' : ''),
    termos: (_valor, form) => (form.elements.termos.checked ? '' : 'É necessário aceitar os termos para continuar.'),
};

// ---------- Exibição do resultado ----------
function mostrarResultado(campo, mensagem) {
    const erro = document.getElementById(`erro-${campo.id}`);
    const invalido = Boolean(mensagem);

    campo.setAttribute('aria-invalid', String(invalido));
    campo.classList.toggle('form__campo--valido', !invalido && campo.type !== 'checkbox' && campo.value !== '');

    if (erro) {
        erro.textContent = mensagem;
        erro.hidden = !invalido;
    }
}

export function validarCampo(campo) {
    const regra = REGRAS[campo.name];
    if (!regra) return true;

    const mensagem = regra(campo.value.trim(), campo.form);
    mostrarResultado(campo, mensagem);
    return !mensagem;
}

// ---------- Ligação com o formulário ----------
// aoEnviar(dados) recebe um objeto com os campos já validados.
// aoFalhar(camposInvalidos) permite à tela mostrar um resumo dos erros.
export function iniciarValidacao(form, { aoEnviar, aoFalhar }) {
    form.noValidate = true; // desliga os balões nativos: usamos mensagens próprias
    const tocados = new Set();

    form.addEventListener('input', (evento) => {
        const campo = evento.target;
        const mascara = MASCARAS[campo.name];
        if (mascara) campo.value = mascara(campo.value);
        if (tocados.has(campo.name)) validarCampo(campo);
        // Mudar o tipo de atuação altera a regra da disponibilidade
        if (campo.name === 'tipo_atuacao' && tocados.has('disponibilidade')) {
            validarCampo(form.elements.disponibilidade);
        }
    });

    form.addEventListener('focusout', (evento) => {
        const campo = evento.target;
        if (!campo.name || !(campo.name in REGRAS)) return;
        tocados.add(campo.name);
        validarCampo(campo);
    });

    form.addEventListener('change', (evento) => {
        if (evento.target.type === 'checkbox') {
            tocados.add(evento.target.name);
            validarCampo(evento.target);
        }
    });

    form.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const campos = [...form.elements].filter((campo) => campo.name in REGRAS);
        const invalidos = campos.filter((campo) => {
            tocados.add(campo.name);
            return !validarCampo(campo);
        });

        if (invalidos.length) {
            invalidos[0].focus();
            aoFalhar?.(invalidos);
            return;
        }

        const dados = Object.fromEntries(new FormData(form));
        dados.termos = form.elements.termos.checked;
        aoEnviar(dados);
    });

    form.addEventListener('reset', () => {
        tocados.clear();
        // Aguarda o navegador limpar os valores antes de remover os estados visuais
        setTimeout(() => {
            form.querySelectorAll('[aria-invalid]').forEach((campo) => {
                campo.removeAttribute('aria-invalid');
                campo.classList.remove('form__campo--valido');
            });
            form.querySelectorAll('.form__erro').forEach((erro) => { erro.hidden = true; });
        });
    });
}
