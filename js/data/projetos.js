// Dados dos projetos da ONG. Para cadastrar um novo projeto, basta
// adicionar um objeto aqui: cards, menu e página de detalhe são gerados a partir desta lista.

export const PROJETOS = [
    {
        id: 'prato-cheio',
        titulo: 'Projeto Prato Cheio',
        categoria: { nome: 'Alimentação', tipo: 'aviso' },
        status: { nome: 'Urgente', tipo: 'urgente' },
        imagem: 'hero-voluntarios',
        alt: 'Voluntários distribuindo cestas de alimentos',
        resumo: 'Distribuição mensal de cestas de alimentos e refeições prontas para famílias em situação de extrema vulnerabilidade alimentar.',
        descricao: [
            'O Prato Cheio atende famílias cadastradas nos bairros com maior índice de insegurança alimentar da região metropolitana.',
            'Cada cesta contém itens básicos para um mês e é montada por voluntários em mutirões realizados aos sábados.',
        ],
        meta: 12000,
        arrecadado: 7800,
        voluntarios: 42,
    },
    {
        id: 'educar',
        titulo: 'Projeto Educar para o Futuro',
        categoria: { nome: 'Educação', tipo: 'info' },
        status: { nome: 'Ativo', tipo: 'primario' },
        imagem: 'hero-voluntarios',
        alt: 'Crianças em oficina de reforço escolar',
        resumo: 'Oficinas socioeducativas, reforço escolar e capacitação em habilidades digitais para crianças e adolescentes da periferia.',
        descricao: [
            'As turmas acontecem no contraturno escolar e combinam reforço em português e matemática com oficinas de informática.',
            'Voluntários com formação em educação ou tecnologia podem atuar como monitores.',
        ],
        meta: 8000,
        arrecadado: 3150,
        voluntarios: 18,
    },
    {
        id: 'acolher',
        titulo: 'Projeto Acolhimento e Saúde',
        categoria: { nome: 'Saúde', tipo: 'sucesso' },
        status: { nome: 'Ativo', tipo: 'primario' },
        imagem: 'hero-voluntarios',
        alt: 'Equipe de saúde em atendimento comunitário',
        resumo: 'Triagens de saúde básica, orientações psicológicas e encaminhamentos comunitários para atendimento digno.',
        descricao: [
            'Mensalmente, profissionais voluntários realizam triagens de pressão, glicemia e acompanhamento nutricional.',
            'Os casos que precisam de continuidade são encaminhados à rede pública de saúde com apoio da nossa equipe social.',
        ],
        meta: 10000,
        arrecadado: 10000,
        voluntarios: 25,
    },
];

// Distribuição de cada real arrecadado (relatório de transparência)
export const DESTINO_RECURSOS = [
    { rotulo: 'Ações de campo', valor: 87 },
    { rotulo: 'Gestão e administração', valor: 9 },
    { rotulo: 'Captação de recursos', valor: 4 },
];

export function buscarProjeto(id) {
    return PROJETOS.find((projeto) => projeto.id === id);
}
