export type Chapter = { id:string; index:string; nav:string; headline:string; description:string };
export const chapters: Chapter[] = [
 {id:'sobre',index:'01',nav:'Sobre',headline:'Código com intenção.',description:'Sou Gabriel. Trabalho com desenvolvimento web e exploro tecnologia, IA e automações para transformar ideias em experiências digitais úteis.'},
 {id:'servicos',index:'02',nav:'Serviços',headline:'Do conceito à interface.',description:'Sites institucionais, landing pages, portfólios, experiências interativas e integrações digitais sob medida.'},
 {id:'projetos',index:'03',nav:'Projetos',headline:'Ideias que podem ganhar forma.',description:'Uma seleção inicial de conceitos para demonstrar direções visuais e funcionais. Cases reais serão adicionados após validação.'},
 {id:'processo',index:'04',nav:'Processo',headline:'Clareza em cada etapa.',description:'Descoberta, direção, design, desenvolvimento e revisão antes da entrega.'},
 {id:'zaion',index:'05',nav:'zAIon',headline:'Criação conectada à automação.',description:'Esta frente de desenvolvimento web faz parte do ecossistema zAIon, que reúne soluções digitais e automações com IA.'},
 {id:'contato',index:'06',nav:'Contato',headline:'Vamos construir algo?',description:'Conte sua ideia e o que você precisa. Os canais diretos serão habilitados assim que os dados oficiais forem confirmados.'},
];
export const services = [
 {name:'Sites institucionais',detail:'Presença digital clara, responsiva e fácil de navegar.'},
 {name:'Landing pages',detail:'Páginas focadas em uma proposta e chamada para ação.'},
 {name:'Portfólios',detail:'Experiências que mostram o trabalho e a personalidade de quem cria.'},
 {name:'Web interativa',detail:'Movimento e interação a favor da mensagem, sem prejudicar a usabilidade.'},
 {name:'Integrações',detail:'Conexão com APIs e ferramentas de automação após definição de escopo.'},
];
export const projects = [
 {slug:'conceito-landing',title:'Landing de serviço',category:'Conceito / demonstração',description:'Exercício de apresentação de serviço, hierarquia visual e conversão.',link:null},
 {slug:'conceito-portfolio',title:'Portfólio editorial',category:'Conceito / demonstração',description:'Proposta de apresentação profissional focada em clareza e identidade.',link:null},
 {slug:'conceito-site',title:'Site institucional',category:'Conceito / demonstração',description:'Estudo de navegação, informação e linguagem visual para uma empresa fictícia.',link:null},
];
export const profile = {firstName:'Gabriel',role:'Desenvolvimento web e experiências digitais',location:'Joinville, SC',affiliation:'by zAIon',email:null as string|null,whatsapp:null as string|null,linkedin:null as string|null,github:null as string|null};
export const concepts:Record<string,{brand:string;headline:string;description:string;items:string[];goal:string}>={
 'conceito-landing':{brand:'Forma — serviço fictício',headline:'Espaço para sua próxima ideia.',description:'Um conceito de landing page para um estúdio de arquitetura imaginário.',items:['Escuta e descoberta','Espaços com propósito','Do traço ao detalhe'],goal:'Apresentar uma única oferta com clareza, conduzindo a leitura da proposta até o contato.'},
 'conceito-portfolio':{brand:'Índice — profissional fictício',headline:'Trabalho, processo e ponto de vista.',description:'Um estudo editorial para organizar a apresentação de um profissional criativo.',items:['Identidade visual','Objetos e matéria','Experimentos digitais'],goal:'Dar espaço aos trabalhos e tornar o percurso profissional fácil de entender, sem inventar realizações.'},
 'conceito-site':{brand:'Norte — empresa fictícia',headline:'Boas ideias precisam de uma direção.',description:'Uma proposta institucional para uma consultoria imaginária.',items:['Quem somos','O que fazemos','Como pensamos'],goal:'Organizar informações institucionais com navegação direta e uma linguagem visual consistente.'}
};
