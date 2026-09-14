const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const WHATSAPP = '5547996800115';
const catalogData = {
  panificacao: {
    brand: 'MEGA',
    title: 'Panificação e lanches',
    kicker: 'Linha de pães',
    description: 'Pães e opções para lanches apresentados no catálogo da FR Distribuidora.',
    image: 'assets/catalog/page-3.webp',
    alt: 'Linha de panificação Mega',
    page: 3,
    products: ['Sovado', 'Leite', 'Sanduíche', 'Integral', 'Caseirinho', 'Hambúrguer', 'Hot-Dog', 'Doguinho', 'Chocomalte', 'Pão de Alho Tradicional', 'Pão de Alho Queijo', 'Canudinhos']
  },
  gourmet: {
    brand: 'MEGA GOURMET',
    title: 'Biscoitos e delícias gourmet',
    kicker: 'Linha Gourmet',
    description: 'Biscoitos e produtos de diferentes sabores apresentados na linha Mega Gourmet.',
    image: 'assets/catalog/page-13.webp',
    alt: 'Linha Gourmet Mega',
    page: 13,
    products: ['Delícia de Maracujá', 'Nata Recheada', 'Cookie Tradicional Banhado no Chocolate', 'Juju', 'Palito de Chocolate', 'Beijinho de Freira', 'Amor Perfeito', 'Coração de Leite Ninho', 'Chocofesta', 'Rosca de Coco', 'Rosca de Nata', 'Bambolê', 'Amendoim com Chocolate']
  },
  amendoins: {
    brand: 'MEGA',
    title: 'Amendoins e snacks',
    kicker: 'Linha de amendoins',
    description: 'Opções tradicionais, crocantes, temperadas e em diferentes formatos de embalagem.',
    image: 'assets/catalog/page-21.webp',
    alt: 'Linha de amendoins Mega',
    page: 21,
    products: ['Amendoim Japonês', 'Amendoim Crocante Tradicional', 'Amendoim Crocante com Pimenta', 'Amendoim Crocante Cebola e Salsa', 'Amendoim Torrado e Salgado', 'Amendoim Torrado e Granulado', 'Amendoim Torrado em Metades', 'Farinha de Amendoim']
  },
  chopp: {
    brand: 'MEGA CHOPP',
    title: 'Mega Chopp',
    kicker: 'Cerveja Pilsen',
    description: 'Chopp em embalagem de 1,5 litro apresentado no catálogo da FR Distribuidora.',
    image: 'assets/catalog/page-34.webp',
    alt: 'Mega Chopp 1,5 L',
    page: 34,
    products: ['Chopp 1,5 L — Cerveja Pilsen']
  },
  pichau: {
    brand: 'PICHAU ENERGY DRINK',
    title: 'Energéticos Pichau',
    kicker: 'Energéticos 350 ml',
    description: 'Sabores e versões zero açúcar em latas de 350 ml apresentados no catálogo.',
    image: 'assets/catalog/page-36.webp',
    alt: 'Energético Pichau Original 350 ml',
    page: 36,
    products: ['Original 350 ml', 'Zero Açúcares 350 ml', 'Tropical 350 ml', 'Maçã Verde 350 ml', 'Maçã Verde Zero Açúcares 350 ml', 'Açaí Zero Açúcares 350 ml']
  },
  timbu: {
    brand: 'TIMBU',
    title: 'Água mineral',
    kicker: 'Água mineral natural',
    description: 'Água mineral natural com e sem gás em diferentes volumes.',
    image: 'assets/catalog/page-43.webp',
    alt: 'Água mineral Timbu',
    page: 43,
    products: ['Água sem gás 500 ml', 'Água com gás 500 ml', 'Água sem gás 1,5 L', 'Água com gás 1,5 L', 'Água sem gás 5 L']
  },
  refri: {
    brand: 'MEGA REFRI',
    title: 'Refrigerantes',
    kicker: 'Refrigerantes 2 L',
    description: 'Sabores variados em embalagens de 2 litros apresentados no catálogo.',
    image: 'assets/catalog/page-47.webp',
    alt: 'Refrigerantes Mega Refri',
    page: 47,
    products: ['Limão 2 L', 'Guaraná 2 L', 'Framboesa 2 L', 'Laranjinha 2 L', 'Laranja 2 L', 'Tutti Frutti 2 L', 'Abacaxi 2 L', 'Mega Cola 2 L']
  },
  belma: {
    brand: 'BELMA',
    title: 'Biscoitos e mercearia',
    kicker: 'Wafers, roscas e biscoitos',
    description: 'Wafers, roscas, recheados, lanchinhos e biscoitos laminados em diferentes sabores.',
    image: 'assets/catalog/page-53.webp',
    alt: 'Biscoitos Belma',
    page: 53,
    products: ['Wafer Morango', 'Wafer Chocolate', 'Wafer Limão', 'Wafer Choconegro', 'Rosca Chocolate 300 g', 'Rosca Leite 300 g', 'Rosca Coco 300 g', 'Rosca Banana com Canela 300 g', 'Rosca Milho Verde 300 g', 'Rosca Chocolate 100 g', 'Rosca Leite 100 g', 'Rosca Coco 100 g', 'Recheado Chocomuuu', 'Recheado Chocolate', 'Recheado Morango', 'Recheado Limão', 'Lanchinho Chocolate', 'Lanchinho Morango', 'Lanchinho Choconegro', 'Lanchinho Chocomuuu', 'Biscoito Água e Sal', 'Cream Cracker', 'Biscoito Coco', 'Biscoito Leite', 'Biscoito Maizena', 'Biscoito Maria']
  }
};

const state = {
  activeCategory: 'panificacao',
  query: ''
};

function normalize(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesQuery(categoryKey, productName, query) {
  if (!query) return true;
  const data = catalogData[categoryKey];
  const haystack = normalize(`${productName} ${data.title} ${data.brand} ${data.kicker} ${categoryKey}`);
  return haystack.includes(normalize(query));
}

function findBestCategoryForQuery(query) {
  if (!query.trim()) return null;
  return Object.keys(catalogData).find(key =>
    catalogData[key].products.some(product => matchesQuery(key, product, query))
  ) || null;
}

function renderProductList() {
  const list = $('#products-list');
  const empty = $('#catalog-empty');
  const count = $('#product-count');
  if (!list || !empty || !count) return;

  const data = catalogData[state.activeCategory];
  const products = data.products.filter(product =>
    matchesQuery(state.activeCategory, product, state.query)
  );

  count.textContent = `${products.length} ${products.length === 1 ? 'item' : 'itens'}`;
  empty.hidden = products.length !== 0;

  list.innerHTML = products.map((product, index) => `
    <article class="product-row">
      <span class="product-row-index">${String(index + 1).padStart(2, '0')}</span>
      <div class="product-row-info">
        <strong>${product}</strong>
        <small>${data.brand}</small>
      </div>
      <span class="product-view-label">Produto</span>
    </article>
  `).join('');
}

function renderCategory(category, { keepQuery = false } = {}) {
  if (!catalogData[category]) return;

  state.activeCategory = category;

  if (!keepQuery) {
    state.query = '';
    const search = $('#global-search');
    if (search) search.value = '';
  }

  const data = catalogData[category];

  $$('.category-tab').forEach(tab =>
    tab.classList.toggle('is-active', tab.dataset.category === category)
  );

  const frame = $('.catalog-image-frame');
  frame?.classList.add('is-switching');

  window.setTimeout(() => {
    const image = $('#category-image');
    if (image) {
      image.src = data.image;
      image.alt = data.alt;
    }

    $('#category-brand').textContent = data.brand;
    $('#category-kicker').textContent = data.kicker;
    $('#category-title').textContent = data.title;
    $('#category-description').textContent = data.description;

    const pageLink = $('#catalog-page-link');
    if (pageLink) pageLink.href = `assets/catalogo-fr.pdf#page=${data.page}`;

    frame?.classList.remove('is-switching');
  }, 120);

  renderProductList();
}

renderCategory('panificacao');

const header = $('.site-header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

const menuToggle = $('.menu-toggle');
const nav = $('#main-nav');

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

$$('.main-nav a').forEach(link => link.addEventListener('click', () => {
  nav?.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

$$('.reveal').forEach(el => revealObserver.observe(el));

$$('.category-tab').forEach(tab => {
  tab.addEventListener('click', () => renderCategory(tab.dataset.category));
});

$('#global-search')?.addEventListener('input', event => {
  state.query = event.target.value.trim();

  if (state.query) {
    const bestCategory = findBestCategoryForQuery(state.query);
    if (bestCategory && bestCategory !== state.activeCategory) {
      renderCategory(bestCategory, { keepQuery: true });
    } else {
      renderProductList();
    }
  } else {
    renderProductList();
  }
});

$$('[data-jump-category]').forEach(button => {
  button.addEventListener('click', () => {
    renderCategory(button.dataset.jumpCategory);
    $('#catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Friendly image fallback: avoids broken-image icons if an asset was not uploaded.
$$('img').forEach(img => {
  img.addEventListener('error', () => {
    img.classList.add('image-missing');
    img.alt = '';
  }, { once: true });
});

$('#year').textContent = new Date().getFullYear();
