export type Chapter = {
  id: string;
  index: string;
  nav: string;
  headline: string;
  description: string;
};
export const chapters: Chapter[] = [
  {
    id: "sobre",
    index: "01",
    nav: "Sobre",
    headline: "Código com intenção.",
    description:
      "Uma abordagem que combina estrutura, clareza visual e tecnologia para desenvolver projetos digitais sob medida.",
  },
  {
    id: "servicos",
    index: "02",
    nav: "Serviços",
    headline: "Do conceito à interface.",
    description:
      "Sites institucionais, landing pages, portfólios, experiências interativas e integrações digitais sob medida.",
  },
  {
    id: "projetos",
    index: "03",
    nav: "Projetos",
    headline: "Ideias que podem ganhar forma.",
    description:
      "Uma seleção inicial de conceitos para demonstrar direções visuais e funcionais. Cases reais serão adicionados após validação.",
  },
  {
    id: "processo",
    index: "04",
    nav: "Processo",
    headline: "Clareza em cada etapa.",
    description:
      "Descoberta, direção, design, desenvolvimento e revisão antes da entrega.",
  },
  {
    id: "zaion",
    index: "05",
    nav: "zAIon",
    headline: "Criação conectada à automação.",
    description:
      "Esta frente de desenvolvimento web faz parte do ecossistema zAIon, que reúne soluções digitais e automações com IA.",
  },
  {
    id: "contato",
    index: "06",
    nav: "Contato",
    headline: "Vamos construir algo?",
    description:
      "Conte sua ideia e o que você precisa. Os canais diretos serão habilitados assim que os dados oficiais forem confirmados.",
  },
];
export const services = [
  {
    name: "Sites institucionais",
    detail: "Presença digital clara, responsiva e fácil de navegar.",
  },
  {
    name: "Landing pages",
    detail: "Páginas focadas em uma proposta e chamada para ação.",
  },
  {
    name: "Portfólios",
    detail:
      "Experiências que mostram o trabalho e a personalidade de quem cria.",
  },
  {
    name: "Web interativa",
    detail:
      "Movimento e interação a favor da mensagem, sem prejudicar a usabilidade.",
  },
  {
    name: "Integrações",
    detail:
      "Conexão com APIs e ferramentas de automação após definição de escopo.",
  },
];
export const projects = [
  {
    slug: "conceito-landing",
    title: "Landing de serviço",
    category: "Conceito / demonstração",
    description:
      "Exercício de apresentação de serviço, hierarquia visual e conversão.",
    link: null,
  },
  {
    slug: "conceito-portfolio",
    title: "Portfólio editorial",
    category: "Conceito / demonstração",
    description:
      "Proposta de apresentação profissional focada em clareza e identidade.",
    link: null,
  },
  {
    slug: "conceito-site",
    title: "Site institucional",
    category: "Conceito / demonstração",
    description:
      "Estudo de navegação, informação e linguagem visual para uma empresa fictícia.",
    link: null,
  },
];
export const profile = {
  firstName: "Gabriel",
  role: "Desenvolvimento web e experiências digitais",
  location: "Joinville, SC",
  affiliation: "by zAIon",
  contactUrl: null as string | null,
  email: null as string | null,
  whatsapp: null as string | null,
  linkedin: null as string | null,
  github: null as string | null,
};
export const concepts: Record<
  string,
  {
    brand: string;
    headline: string;
    description: string;
    items: string[];
    goal: string;
  }
> = {
  "conceito-landing": {
    brand: "Forma — serviço fictício",
    headline: "Espaço para sua próxima ideia.",
    description:
      "Um conceito de landing page para um estúdio de arquitetura imaginário.",
    items: [
      "Escuta e descoberta",
      "Espaços com propósito",
      "Do traço ao detalhe",
    ],
    goal: "Apresentar uma única oferta com clareza, conduzindo a leitura da proposta até o contato.",
  },
  "conceito-portfolio": {
    brand: "Índice — profissional fictício",
    headline: "Trabalho, processo e ponto de vista.",
    description:
      "Um estudo editorial para organizar a apresentação de um profissional criativo.",
    items: ["Identidade visual", "Objetos e matéria", "Experimentos digitais"],
    goal: "Dar espaço aos trabalhos e tornar o percurso profissional fácil de entender, sem inventar realizações.",
  },
  "conceito-site": {
    brand: "Norte — empresa fictícia",
    headline: "Boas ideias precisam de uma direção.",
    description: "Uma proposta institucional para uma consultoria imaginária.",
    items: ["Quem somos", "O que fazemos", "Como pensamos"],
    goal: "Organizar informações institucionais com navegação direta e uma linguagem visual consistente.",
  },
};

export const environments = [
  {
    id: "inicio",
    name: "Portal",
    label: "Abertura",
    number: "01",
    title: "Ideias bem construídas.",
    description:
      "Sites, landing pages e experiências web pensadas para comunicar melhor e funcionar de verdade.",
    accent: "#a88a55",
  },
  {
    id: "sobre",
    name: "Átrio de ideias",
    label: "Sobre",
    number: "02",
    title: "Clareza encontra estrutura.",
    description:
      "Uma abordagem que combina estrutura, clareza visual e tecnologia para desenvolver projetos digitais sob medida.",
    accent: "#a88a55",
  },
  {
    id: "servicos",
    name: "Atelier digital",
    label: "Serviços",
    number: "03",
    title: "Do conceito à interface.",
    description:
      "Sites institucionais, landing pages, portfólios e experiências digitais sob medida.",
    accent: "#8ebbb1",
  },
  {
    id: "projetos",
    name: "Galeria de projetos",
    label: "Projetos",
    number: "04",
    title: "Possibilidades em exposição.",
    description:
      "Estudos autorais de interface. Todos os trabalhos desta galeria são projetos conceituais, sem clientes ou resultados comerciais alegados.",
    accent: "#a88a55",
  },
  {
    id: "processo",
    name: "Laboratório zAIon",
    label: "Processo",
    number: "05",
    title: "Intenção em cada etapa.",
    description:
      "Entender, planejar, desenhar, desenvolver, testar e entregar. Desenvolvimento web conectado ao ecossistema zAIon.",
    accent: "#8ebbb1",
  },
  {
    id: "contato",
    name: "Destino",
    label: "Contato",
    number: "06",
    title: "Vamos construir algo?",
    description:
      "Uma presença digital que faça sentido para seu negócio. Os canais oficiais aguardam confirmação; você pode preparar um resumo local neste painel ou no modo clássico.",
    accent: "#a88a55",
  },
];
export const spatialExhibits = [
  {
    id: "portal",
    area: 0,
    label: "Conhecer a proposta",
    title: "Gabriel — Web & Digital",
    body: environments[0].description,
    position: [-4.9, 1.4, 3],
  },
  {
    id: "perfil",
    area: 1,
    label: "Conhecer Gabriel",
    title: "Código com intenção.",
    body: environments[1].description,
    position: [-4.8, 1.4, 14],
  },
  {
    id: "abordagem",
    area: 1,
    label: "Uma forma de criar",
    title: "Clareza antes do efeito.",
    body: "Conteúdo bem organizado, interfaces legíveis e movimento com propósito.",
    position: [4.8, 1.4, 14],
  },
  {
    id: "servicos",
    area: 2,
    label: "Explorar serviços",
    title: "Do conceito à interface.",
    body: environments[2].description,
    position: [-4.5, 1.2, 27],
  },
  ...projects.map((p, i) => ({
    id: p.slug,
    area: 3,
    label: p.title,
    title: p.title,
    body:
      p.description + " Projeto conceitual; não representa um cliente real.",
    position: [i % 2 ? 5 : -5, 2.2, 39 + i * 5],
  })),
  {
    id: "processo",
    area: 4,
    label: "Conhecer o processo",
    title: "Da escuta à entrega.",
    body: environments[4].description,
    position: [-4.8, 1.4, 63],
  },
  {
    id: "contato",
    area: 5,
    label: "Preparar um projeto",
    title: environments[5].title,
    body: environments[5].description,
    position: [4.7, 1.4, 83],
  },
  {id: "galeria", area: 3, label: "Filtrar projetos", title: "Galeria de conceitos", body: "Explore por tipo. Todos os itens são demonstrações autorais, sem clientes ou resultados comerciais alegados.", position: [3.8,1.3,47]},
];

export const automationConcepts = [
  { title: "Clínica", steps: ["Solicitação", "Agenda", "Confirmação"] },
  { title: "Imobiliária", steps: ["Interesse", "Preferências", "Visita"] },
  { title: "Salão", steps: ["Serviço", "Horário", "Lembrete"] },
  { title: "Marketing", steps: ["Briefing", "Conteúdo", "Revisão"] },
];
