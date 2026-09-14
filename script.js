const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');
const header = document.querySelector('.site-header');

menuToggle?.addEventListener('click', () => {
  const open = mainMenu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    mainMenu?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 14);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

document.querySelector('#year').textContent = new Date().getFullYear();

const catalogData = {
  panificacao: {
    brand: 'MEGA',
    title: 'Panificação e lanches',
    description: 'Uma linha ampla para o dia a dia, com pães e opções para lanches.',
    tag: 'Linha de pães',
    image: 'assets/catalogo-3.webp',
    alt: 'Linha de panificação Mega',
    products: ['Sovado', 'Leite', 'Sanduíche', 'Integral', 'Caseirinho', 'Hambúrguer', 'Hot-Dog', 'Doguinho', 'Chocomalte', 'Pão de Alho', 'Canudinhos'],
    whatsapp: 'Olá, gostaria de saber mais sobre a linha de panificação da FR Distribuidora.'
  },
  gourmet: {
    brand: 'MEGA GOURMET',
    title: 'Biscoitos e delícias gourmet',
    description: 'Produtos apresentados em potes, com diferentes sabores e combinações.',
    tag: 'Linha Gourmet',
    image: 'assets/catalogo-13.webp',
    alt: 'Linha Gourmet Mega',
    products: ['Delícia de Maracujá', 'Nata Recheada', 'Cookie Tradicional', 'Juju', 'Palito de Chocolate', 'Beijinho de Freira', 'Amor Perfeito', 'Coração de Leite Ninho', 'Chocofesta', 'Rosca de Coco', 'Rosca de Nata', 'Bambolê'],
    whatsapp: 'Olá, gostaria de saber mais sobre a linha Gourmet da FR Distribuidora.'
  },
  amendoins: {
    brand: 'MEGA',
    title: 'Amendoins e snacks',
    description: 'Opções tradicionais, crocantes, temperadas e formatos para diferentes usos.',
    tag: 'Linha de amendoins',
    image: 'assets/catalogo-21.webp',
    alt: 'Linha de amendoins Mega',
    products: ['Japonês', 'Crocante Tradicional', 'Crocante com Pimenta', 'Cebola e Salsa', 'Torrado e Salgado', 'Torrado e Granulado', 'Torrado em Metades', 'Farinha de Amendoim'],
    whatsapp: 'Olá, gostaria de saber mais sobre a linha de amendoins da FR Distribuidora.'
  },
  chopp: {
    brand: 'MEGA CHOPP',
    title: 'Chopp em embalagem de 1,5 L',
    description: 'O catálogo apresenta Chopp 1,5 L, cerveja Pilsen, dentro da linha Mega Chopp.',
    tag: 'Mega Chopp',
    image: 'assets/catalogo-34.webp',
    alt: 'Mega Chopp 1,5 L',
    products: ['Chopp 1,5 L • Cerveja Pilsen'],
    whatsapp: 'Olá, gostaria de saber mais sobre o Mega Chopp 1,5 L da FR Distribuidora.'
  },
  pichau: {
    brand: 'PICHAU ENERGY DRINK',
    title: 'Energéticos Pichau',
    description: 'Sabores e versões zero açúcar em latas de 350 ml apresentados no catálogo.',
    tag: 'Energéticos 350 ml',
    image: 'assets/catalogo-36.webp',
    alt: 'Energético Pichau Original 350 ml',
    products: ['Original', 'Zero Açúcares', 'Tropical', 'Maçã Verde', 'Maçã Verde Zero Açúcares', 'Açaí Zero Açúcares'],
    whatsapp: 'Olá, gostaria de saber mais sobre os energéticos Pichau da FR Distribuidora.'
  },
  timbu: {
    brand: 'TIMBU',
    title: 'Água mineral',
    description: 'Água mineral natural com e sem gás, em diferentes volumes.',
    tag: 'Água mineral natural',
    image: 'assets/catalogo-43.webp',
    alt: 'Água mineral Timbu',
    products: ['Sem gás 500 ml', 'Com gás 500 ml', 'Sem gás 1,5 L', 'Com gás 1,5 L', 'Sem gás 5 L'],
    whatsapp: 'Olá, gostaria de saber mais sobre a linha de água mineral Timbu da FR Distribuidora.'
  },
  refri: {
    brand: 'MEGA REFRI',
    title: 'Refrigerantes',
    description: 'Sabores variados em embalagens de 2 litros apresentados no catálogo.',
    tag: 'Refrigerantes 2 L',
    image: 'assets/catalogo-47.webp',
    alt: 'Refrigerantes Mega Refri',
    products: ['Limão', 'Guaraná', 'Framboesa', 'Laranjinha', 'Laranja', 'Tutti Frutti', 'Abacaxi', 'Mega Cola'],
    whatsapp: 'Olá, gostaria de saber mais sobre os refrigerantes Mega Refri da FR Distribuidora.'
  },
  belma: {
    brand: 'BELMA',
    title: 'Biscoitos e mercearia',
    description: 'Wafers, roscas, recheados, lanchinhos e biscoitos laminados em diferentes sabores.',
    tag: 'Biscoitos Belma',
    image: 'assets/catalogo-53.webp',
    alt: 'Biscoitos Belma',
    products: ['Wafer Morango', 'Wafer Chocolate', 'Wafer Limão', 'Wafer Choconegro', 'Roscas', 'Recheados', 'Lanchinhos', 'Água e Sal', 'Cream Cracker', 'Coco', 'Leite', 'Maizena', 'Maria'],
    whatsapp: 'Olá, gostaria de saber mais sobre a linha de biscoitos Belma da FR Distribuidora.'
  }
};

const tabs = document.querySelectorAll('.catalog-tab');
const catalogImage = document.querySelector('#catalog-image');
const catalogTag = document.querySelector('#catalog-tag');
const catalogBrand = document.querySelector('#catalog-brand');
const catalogTitle = document.querySelector('#catalog-title');
const catalogDescription = document.querySelector('#catalog-description');
const catalogProducts = document.querySelector('#catalog-products');
const catalogWhatsapp = document.querySelector('#catalog-whatsapp');

function renderCatalog(category) {
  const data = catalogData[category];
  if (!data) return;

  tabs.forEach((tab) => {
    const active = tab.dataset.category === category;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  catalogImage.classList.add('is-switching');
  window.setTimeout(() => {
    catalogImage.src = data.image;
    catalogImage.alt = data.alt;
    catalogTag.textContent = data.tag;
    catalogBrand.textContent = data.brand;
    catalogTitle.textContent = data.title;
    catalogDescription.textContent = data.description;
    catalogProducts.innerHTML = data.products.map((product) => `<span class="product-chip">${product}</span>`).join('');
    catalogWhatsapp.href = `https://wa.me/5547996800115?text=${encodeURIComponent(data.whatsapp)}`;
    catalogImage.classList.remove('is-switching');
  }, 120);
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => renderCatalog(tab.dataset.category));
});

renderCatalog('panificacao');
