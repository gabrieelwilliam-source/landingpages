# Gabriel — Web & Digital | by zAIon

Jornada arquitetônica 3D com seis momentos: Portal, Átrio de Ideias, Ateliê Digital, Galeria de Projetos, Laboratório/Processo + zAIon e Destino/Contato. Aproveita a base existente Next.js/TypeScript/Three.js e mantém o modo clássico completo.

**Regra principal:** no modo Scroll, Gabriel fica parado na posição em que está. O mundo se desloca em profundidade; não se trata de um zoom ou uma imagem estática. Somente no modo Caminhar ele se move fisicamente. O Scroll é o padrão; movimento reduzido do sistema abre o modo clássico por padrão.

## Executar

Node 22/24 e npm. Validado neste ambiente com Node 24.19.0 e Next 15.5.28.

```bash
cd /workspace/landingpages/gabriel-portfolio
npm ci --cache /tmp/gabriel-npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
```

Use o checkout atual, sem criar worktree: cada tarefa na nuvem já é isolada. Nenhuma credencial é necessária. Preserve a landing page FR na raiz.

## Controles e conteúdo

- Scroll/trackpad para frente e para trás, ou deslizar verticalmente sobre o cenário no touch. O avatar permanece ancorado; posição do mundo, progresso e área ativa são compartilhados.
- Caminhar: focar o cenário e usar WASD/setas ou controles de toque. O personagem se move e a câmera acompanha.
- Setas ↑/↓ e Page Up/Page Down controlam o percurso com Scroll selecionado. P/Escape pausam; perda de foco também pausa. Diálogos congelam o mundo e conservam sua rolagem nativa.
- Seis atalhos e Anterior/Próximo permitem acessar conteúdo sem usar gestos. Links `?chapter=inicio`, `sobre`, `servicos`, `projetos`, `processo` ou `contato` abrem capítulos; histórico do navegador funciona entre atalhos.
- Modo clássico mantém os serviços, projetos conceituais, processo, vínculo zAIon e contato. A alternância conserva seção e controle quando possível.
- Galeria usa capturas reais das três demonstrações conceituais existentes; abre painéis com contexto, papel, stack e link para a respectiva demonstração. Nenhum cliente ou resultado comercial é alegado.
- Contatos oficiais ainda não definidos: não há links falsos. O botão de contato prepara resumo local no modo clássico; não envia nem armazena dados em servidor.

## Verificar

Pare qualquer servidor dev/produção antes de build e testes. Eles usam `.next`; a suíte recusa reaproveitar servidor preexistente.

```bash
npm run lint
npm run typecheck
npm test
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
npm run build:pages
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

O Chromium do sistema está disponível nesta máquina. Em outra, use a instalação oficial de Playwright, sem desativar TLS. A suíte funcional inicia e encerra seu servidor; para revisão de produção local, execute `npm run build` e `npm run start -- --hostname 0.0.0.0`. A exportação também usa `.next` internamente.

## Organização

- `src/data/site.ts`: textos confiáveis, ambientes, serviços, projetos e pontos de interação.
- `src/lib/JourneyController.mjs`: transformação normalizada entre progresso, mundo, avatar e câmera.
- `src/lib/spatial-motion.mjs`: limites, zonas, destinos, suavização e controles testáveis.
- `src/lib/spatial-engine.ts`: materiais, rig articulado, arquiteturas procedurais, renderização e descarte.
- `src/components/SpatialJourney.tsx`: interface HTML, painéis, controles, histórico e acessibilidade.
- `src/components/ClassicPortfolio.tsx`: leitura convencional pré-renderizada, sem depender de WebGL/JS.
- `src/config/visual.ts`: tokens visuais; `public/concepts/`: capturas reais dos próprios conceitos.

Há carregamento dinâmico do motor e construção das áreas seguintes durante aproximação/atalho. Geometrias e materiais são compartilhados; sombras e materiais completos são mantidos enquanto o dispositivo sustenta a renderização. Frames lentos reduzem pixel ratio e substituem materiais por iluminação mais simples, sem remover conteúdo. A preferência de movimento reduzido e o fallback clássico continuam disponíveis. Não há pós-processamento pesado, sons ou analytics.

## Publicação autorizada

O usuário autorizou continuamente publicar as alterações validadas no mesmo GitHub Pages público de testes:
https://gabrieelwilliam-source.github.io/landingpages/gabriel/

`npm run build:pages` produz `.next-pages/` com o prefixo correto. Após validar, arquive `../gabriel/` fora do checkout, substitua somente seus artefatos, revise, faça commit/push para `main`, aguarde Pages `built` e verifique os arquivos por HTTPS. O site FR da raiz e `.nojekyll` devem ser preservados. O comando de build sozinho não publica.

SEO inclui idioma, metadata/OpenGraph, favicon e sitemap com o domínio de testes real. Indexação permanece bloqueada nesta versão de revisão, por decisão editorial existente.

## Referências e limitações

A foto original permanece fora de `public/` e ignorada pelo Git. Avatar estilizado procedural: não é um modelo facial fotorrealista nem usa captura de movimento. Não há assets externos pagos ou APIs de produção. Consulte `ASSETS_AND_LICENSES.md`, `CONTENT_TO_CONFIRM.md` e `RELATORIO_FINAL.md` para fontes, dados pendentes, evidências e limitações medidas. Relatórios anteriores descrevem versões históricas.
