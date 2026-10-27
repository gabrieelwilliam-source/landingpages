# Jornada espacial Gabriel — entrega e QA

## Resultado

Base preservada e expandida para seis momentos navegáveis no mesmo mundo 3D: Portal, Átrio de Ideias, Ateliê Digital, Galeria de Projetos, Laboratório/Processo + zAIon e Destino/Contato. Não são seis páginas de scroll vertical. Há deslocamento real do grupo de arquitetura em profundidade, perspectivas e áreas conectadas.

A regra foi corrigida: **Scroll não desloca Gabriel**. O avatar permanece ancorado no ponto onde o controle foi trocado; mundo e progresso se deslocam em relação a ele. A câmera também mantém sua referência. Só em Caminhar há translação e passos físicos do personagem. A transformação é centralizada em `JourneyController.mjs`, com zonas, destinos, limites e suavização em `spatial-motion.mjs` e estado único no motor.

Implementados: atalhos para as seis áreas, Anterior/Próximo, retorno reversível, URL `?chapter=...`, histórico do navegador, progresso, pausa, toque, teclado, movimento reduzido, fallback WebGL e modo clássico pré-renderizado. A preferência reduzida abre o clássico por padrão. Modais mantêm foco/rolagem local e pausam a jornada; contatos ausentes não geram links falsos.

Galeria: três demonstrações próprias explicitamente conceituais, com capturas reais de suas rotas funcionais, painéis com descrição, papel, stack e acesso ao respectivo caso. Não foram acrescentados clientes, resultados ou credenciais fictícios. Processo e zAIon têm apresentação conjunta; Contato permite preparar resumo local, reiniciar ou voltar à galeria, sem prometer envio.

## Visual e arquitetura

Materiais minerais com relevo procedural discreto, metal/latão controlado, sombras direcionais suaves quando há capacidade, tipografia editorial e paleta centralizada em `config/visual.ts`. Novas áreas incluem pavilhão circular, quadros arquitetônicos de projetos, laboratório escuro com sequência de etapas e pórtico de destino. O avatar recebeu torso e membros arredondados, barba volumosa com detalhes claros, cabelo curto e olhos claros; mantém roupa discreta e animação articulada procedural no modo Caminhar.

Instâncias agrupam blocos arquitetônicos repetidos por material; materiais/geometrias são compartilhados e áreas posteriores são construídas por aproximação/atalho. A qualidade reduz pixel ratio, sombras e complexidade de materiais quando os frames ficam lentos. Recursos, listeners e RAF são descartados ao sair do 3D. Sem pós-processamento pesado, modelos pagos, APIs externas, analytics ou automações de produção.

Mantido o motor Three.js existente, em vez de migrar para React Three Fiber/drei ou acrescentar uma segunda engine física: há um único loop e limites simples, suficientes ao percurso. Essa decisão preserva a base e evita duplicação de controle. As informações essenciais são HTML acessível fora do canvas; imagens de quadros são complementadas pelos painéis e pelo modo clássico.

## Verificações e evidências

- `npm run build`: passou; 9 páginas geradas, sem erro de tipos.
- `npm run lint`: passou, com regras ESLint de correção/sintaxe e parser TypeScript. O build emite aviso não bloqueante de que o plugin específico Next não está configurado; não se alega executar o conjunto recomendado desse plugin.
- `npm run typecheck`: passou.
- `npm test`: 11 testes passaram, nenhum ignorado ou falhando. Incluem a invariância do avatar e transformação do mundo nos seis destinos, limites, colisões do modo guiado, normalização, direção reversa e suavização.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: rodada final completa com 9 testes passando em 41,9 s, nenhum ignorado/falhando. Verificam quatro larguras (360/390/768/1440), acessibilidade axe, seis capítulos/painéis, links de casos, histórico, pausa, avatar/câmera ancorados, caminhada física, toque, preferência reduzida, fallback sem WebGL e leitura sem JS.
- `npm run build:pages`: exportação estática validada; `test:pages` exercita prefixo do Pages, dois controles, ateliê, galeria, retorno clássico, casos, JS/CSS/favicon nas três larguras.
- Capturas reais preservadas em `docs/qa/final-portal-*.png` e `docs/qa/final-room-1.png` até `final-room-6.png`. Dados de desempenho em `docs/qa/performance.json`.

As capturas foram abertas e revisadas para hierarquia, enquadramento, ausência de sobreposição dos controles com o avatar e apresentação dos quadros. Axe não encontrou violações nas telas avaliadas, sem desativar regras. Corrigidos o alvo do skip link e uma atualização de estado ao concluir uma transição sem deslocamento. Um servidor de revisão antigo foi encerrado ao diagnosticar assets inconsistentes; a suíte agora recusa reaproveitar servidores preexistentes.

## Desempenho medido e limites

Chromium headless 154 no ambiente Linux disponível, viewport 1000×760, amostra de aproximadamente 3 segundos com eventos de scroll ativos. Resultado preservado: **16,28 RAF/s**, P95 **166,7 ms**, heap JavaScript **12.077.965 bytes**, recursos codificados carregados **268.554 bytes**, **59 chamadas de desenho / 5.914 triângulos** na vista medida. São medidas locais deste ambiente; não representam uma promessa de FPS em celulares ou GPUs reais. A amostra inclui mudanças de qualidade e custo inicial de shaders.

A medição inicial apresentou FPS baixo; foram implementadas qualidade adaptativa e instancing (a vista anterior registrava 112 chamadas). Mesmo após otimização, o desempenho deste navegador headless continua limitado. Não se afirma ter atingido 60 FPS ou validado todos os dispositivos modestos. Modo clássico e movimento reduzido oferecem acesso completo; Safari/iOS físico, bateria, memória GPU e testes com leitor de tela não foram medidos. O build informa cerca de 115 kB de First Load JS da home, além dos chunks dinâmicos do 3D. A galeria adiciona aproximadamente 120 kB de capturas locais.

O avatar é estilizado e articulado por código: não é facialmente fotorrealista, não usa fotogrametria ou retargeting de captura de movimento. Essa é a alternativa local autoral, sem serviços pagos, e pode ser substituída posteriormente por asset aprovado. Não há texturas PBR de bancos externos nem lightmaps baked; materiais e relevo são procedurais. Não foi gravado vídeo. Nenhum desses itens é apresentado como realizado.

## Conteúdo, assets e publicação

Dados ainda a confirmar em `CONTENT_TO_CONFIRM.md`; fontes/licenças em `ASSETS_AND_LICENSES.md`. Foto original fora de `public/`, ignorada no Git e ausente dos artefatos. SEO tem títulos, descrição, OpenGraph, idioma, favicon e sitemap real; a versão de testes mantém bloqueio de indexação. O formulário continua local, sem envio ou coleta em servidor.

Checkpoint anterior: tag `backup-before-six-room-journey-20261027`. A landing page FR da raiz e sua configuração foram preservadas. A publicação no mesmo GitHub Pages público está autorizada continuamente pelo usuário; o fluxo é exportar, testar, preservar a versão anterior, copiar somente os artefatos de `gabriel/`, fazer commit/push, aguardar `built` e verificar HTTPS. Consulte o histórico Git para o commit final e a confirmação pública na entrega do chat.

## Testar

```bash
cd /workspace/landingpages/gabriel-portfolio
npm ci --cache /tmp/gabriel-npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
```

Pare esse processo antes de builds/testes. Para produção local: `npm run build` e `npm run start -- --hostname 0.0.0.0`. Para Pages: `npm run build:pages` e `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages`. A saída `.next-pages/` não publica automaticamente. Os comandos completos e controles estão no README.
