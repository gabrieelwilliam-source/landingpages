# Revisão gráfica do Virtual Studio — 27/10/2026

## Pedido e direção
Evoluir o ambiente conforme as três imagens de referência do pacote original. Foram inspecionadas as imagens `01_CONCEITO_GERAL`, `02_PERCURSO_E_ATELIE` e `03_PANORAMA_AMBIENTES`: arquitetura sóbria, madeira/pedra/bronze, luz quente, fachada de vidro e interiores com funções diferentes. São referências artísticas; nenhuma delas foi apresentada como captura do site ou inserida como falso cenário navegável.

## Preservação
Estado inicial: `bd1b4e5`, branch local `virtual-studio-20261027`, sem alterações pendentes. Backup integral anterior a esta revisão: `/workspace/artifacts/landingpages-before-office-redesign-20261027.tar.gz` (inclui arquivos não rastreados/ignorados e `.git`), SHA-256 `3c1034a368eaa8db0e9b2a0029d139f6b81f11ab6b7d65de26c5144b864ac585`.

## Alterações concretas
- Seis GLBs novos de interiores conectados: recepção, lounge/biblioteca, estúdio, galeria, laboratório e reunião/contato. Piso, teto, fachada, esquadrias, estrutura e rodapés compartilham limites de setores.
- Retiradas plataformas isoladas e passarelas externas. Percurso mais compacto, com distância máxima de 90 unidades e circulação central livre.
- Balcão, estantes com livros, mesas, telas de conceitos existentes, teclados, cadeiras com base e rodízios, sofás com almofadas, mesas de apoio, luminárias, vasos e vegetação originais.
- Texturas originais de pedra e madeira com rugosidade, corrigidas para sRGB e incorporadas aos modelos; compressão WebP/Meshopt. Sem novos pacotes pagos ou assets externos.
- PBR, iluminação de ambiente e sombras em GPUs compatíveis; fallback Lambert com mapas e luzes para renderizadores por software. O agrupamento por cores do mobiliário estático reduz chamadas de desenho nesse fallback. Setores distantes e seus monitores são ocultados juntos, evitando telas flutuantes sem o mobiliário.
- Controles Automático/Leve/Alto; Alto amplia a resolução em relação a Leve. Em CPU não ativa sombras/PBR de GPU.
- Enquadramento reposicionado para dar espaço ao conteúdo; avatar e controles de navegação preservados.
- Logo oficial preservado na recepção/laboratório, sem redesenho. Avatar original também preservado byte a byte.
- Quatro diagramas conceituais de automação nas telas do laboratório; mesmo conteúdo em HTML no painel e no modo clássico. São diagramas locais, sem simulações de envio ou integrações reais.
- `src/data/office-layout.json` registra 50 obstáculos a partir do mobiliário real do gerador. Colisões usam esses dados, sem as antigas barreiras estreitas das passarelas. Teste confirma passagem central livre.

## Arquivos principais
`tools/build_office.py`, `tools/optimize-assets.mjs`, `public/models/environment-*.glb`, `public/models/manifest.json`, `src/data/office-layout.json`, `src/lib/spatial-engine.ts`, `src/lib/spatial-motion.mjs`, `src/lib/office-rendering.mjs`, `src/data/site.ts`, `src/components/SpatialJourney.tsx`, `src/components/ClassicPortfolio.tsx`, `src/app/globals.css`, testes, README e licenças.

## Reprodução
`npm ci`; `npm run build`; `npm run typecheck`; `npm run lint`; `node --test --test-isolation=none tests/spatial-motion.test.mjs`; `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`.

Para reconstruir os interiores: `npm run assets:build` com Blender instalado. Isso preserva o avatar existente e atualiza modelos, colisões e manifesto. Para exportar: `npm run build:pages`; em seguida `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages`. Não execute dev/build/testes de produção simultaneamente.

## Evidências visuais
As imagens `office-1-1440.png` a `office-6-1440.png` são capturas reais dos seis setores; `office-portal-1366.png`, `office-portal-390.png` e `office-studio-390.png` cobrem laptop e celular. Capturas com movimento reduzido e qualidade Alto no desktop, Leve no celular, em Chromium por software. O modo Alto em hardware não foi medido nesta máquina.

Antes: [captura real anterior](../validation/final-portal-1440.png). Depois: [recepção atual](office-1-1440.png), [estúdio](office-3-1440.png), [reunião](office-6-1440.png).

## Limitações do escopo maior
A arquitetura foi reconstruída nesta revisão; não foi recuperado o código não commitado da execução antiga. A apresentação continua estilizada, sem equivalência fotorealista aos renders. O avatar anterior foi mantido. NPCs com rotinas, guia em curva com reconexão por caminho, câmera orientável e galeria com filtros continuam fora desta rodada gráfica e não são declarados prontos. Não foram conectados endpoints, contatos pessoais, n8n ou outros sistemas de produção. A landing page FR permanece intacta.

## Correção de geometria comprimida
O agrupamento do mobiliário no fallback converte posições e normais quantizadas para Float32 antes de aplicar as matrizes. Isso evita overflow de coordenadas e preserva a posição real das peças. Um teste de regressão usa posições Int16 normalizadas, escala e translação em metros para verificar a transformação sem alterar os dados de origem. As capturas finais foram conferidas após essa correção.

## Orçamento gráfico
O fallback agrupa mobiliário estático e limita a distância de desenho. Em software, Automático reduz o pixel ratio até 0,45 e Leve usa 0,45; em GPU os limites são mais altos. As informações HTML mantêm a resolução da tela. A medição de CPU deve ser interpretada como limitação desta máquina, sem promessa de 60 FPS ou de desempenho em hardware não testado. Para navegação sem custo WebGL, o modo clássico está disponível.

## Resultado final de validação
- Build de produção, tipos, lint e integridade dos assets: passaram.
- 13 testes unitários passaram, incluindo colisões e a transformação de coordenadas quantizadas.
- 12 testes E2E passaram na rodada final, com seis setores, três perfis gráficos, contato, acessibilidade, navegação, toque, fallback WebGL e leitura sem JavaScript.
- Medição: Chromium 154 / SwiftShader, 1000×760, 3.061 s, 5.88 FPS médios, p95 283.4 ms, 38 draw calls e 80263 triângulos. A amostra anterior ao ajuste teve ~3,3 FPS e ~100 draw calls. O fallback continua lento nesta máquina e não comprova fluidez em dispositivo real; modo clássico disponível. PBR em GPU não foi medido.
- Avatar e logo oficial mantêm os hashes originais. Modelos otimizados somam 1.767.544 bytes, incluindo avatar; ver manifesto.
