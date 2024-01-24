const companies = [
  {
    name: 'Google',
    description: '',
    state: '',
    city: '',
    site: '',
    picture: '',
    value: 30000
  },
];


const goal = [
  {
    index: '0'
  },
]

const contacts = [
  {
    name: 'Exemplo de Contato',
    email: 'teste@figio.com.br',
    phone: '12987979532',
    city: 'São Paulo',
    state: 'SP',
  },
];

const mailers = [
  {
    subject: 'E-mail de boas vindas',
    title: 'Seja bem vindo!',
    template: 'Empresarial',
    text: 'Olá {{Contact}}, seja bem vindo a nossa empresa, ficamos felizes em te ter aqui conosco!',
    color:"#0048fc"
  },
];
const automations = [
  {
    name: 'Automação para criar negociação',
    input: 'Criar contato',
    condition: "",
    action: "Criar negociação",
    output: 0,
  },
  {
    name: 'Automação de atividade',
    input: 'Criar contato',
    condition: '',
    action: "Registrar atividade",
    output: 'Atividade registrada',
  },
];

const funnels = [
  {
    name: 'Funil Padrão',
    description: 'Funil de captação e conversão padrão.',
  },
]

const users = [
  {
    name: 'Suporte Técnico',
    email: 'suporte@figio.com.br',
    role: 'ADMIN',
    password: 'die140401',
  },
];

const exercice = [
  {
    name: 'Supino Reto',
    description: 'Treino voltado para hipertrofia.',
  },
]

const workout = [
  {
    name: 'Peito',
    description: 'Treino voltado para hipertrofia.',
  },
]

const evaluation = [
  {
    name: 'Avaliação inicial',
    description: 'Avaliação inicial.',
  },
]

const member = [
  {
    name: 'Diego Ciara',
    email: 'suporte.diegociara@gmail.com.br',
  },
];

const partners = [
  {
    name: 'Figio',
    type: 'Promotora',
  },
];

const contracts = [
  {
    name: 'Contrato Consignado',
  },
];

const convenios = [
  {
    name:'INSS'
  },
  {
    name:'BPC LOAS'
  },
  {
    name:'FGTS'
  },
  {
    name:'GOV ESTADO'
  },
  {
    name:'GOV FEDERAL'
  },
]


const product = [
  {
    name: 'Margem'
  },
];

const deals = [
  {
    name: 'Exemplo de negociação',
    deadline: new Date(),
    priority: 'medium',
    value: 676577,
  },
];

const deals2 = [
  {
    name: 'nReport',
    deadline: new Date(),
    priority: 'medium',
    value: 258445,
  },
];

const deals3 = [
  {
    name: 'nReport',
    deadline: new Date(),
    priority: 'medium',
    value: 258445,
  },
];

const deals4 = [
  {
    name: 'nReport',
    deadline: new Date(),
    priority: 'high',
    value: 258445,
  },
];

export { companies, evaluation, contacts, product, users, convenios, funnels, contracts, partners, goal, deals, member, exercice, workout, automations, mailers,deals2, deals3, deals4 };
