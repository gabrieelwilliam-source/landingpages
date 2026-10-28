# Site zAIon — Virtual Studio do Gabriel

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
- `src/lib/spatial-engine.ts`: carregamento GLB/Meshopt, AnimationMixer, câmeras, renderização e descarte.
- `src/components/SpatialJourney.tsx`: interface HTML, painéis, controles, histórico e acessibilidade.
- `src/components/ClassicPortfolio.tsx`: leitura convencional pré-renderizada, sem depender de WebGL/JS.
- `src/config/visual.ts`: tokens visuais; `public/concepts/`: capturas reais dos próprios conceitos.

Há carregamento dinâmico do motor e dos GLBs da área atual e próximas. Cenas distantes ficam invisíveis. Em GPU compatível, materiais PBR usam iluminação ambiente por PMREM, luz de fim de tarde e sombras suaves; renderizadores de software usam materiais Lambert sem mapas de superfície e resolução menor. Frames lentos reduzem resolução. Isso preserva o conteúdo, mas reduz a qualidade de materiais e não garante 60 FPS em equipamentos modestos. Não há pós-processamento pesado, som ou analytics.

## Assets editáveis

Blender 4.3.2 e Node 22/24:

```bash
npm run assets:build
node tools/verify-assets.mjs
```

O primeiro comando regenera os GLBs brutos e depois os comprime com Meshopt. Não execute somente o otimizador sobre os GLBs já comprimidos. `tools/build_assets.py` contém as utilidades originais, `tools/build_office.py` reconstrói a arquitetura e `tools/build_character.py` reconstrói o personagem; `public/models/manifest.json` registra peso, ossos, clips e SHA-256. Os manifestos registram o peso dos modelos completos e das variantes leves. As texturas de superfície usam WebP embutido. O avatar tem 16 ossos e clips Idle, Walk e Turn; é estilizado, sem escaneamento facial ou mocap externo.

## Estado de publicação

O usuário autorizou publicar esta revisão após receber o pacote de revisão. Destino de testes:
https://gabrieelwilliam-source.github.io/landingpages/gabriel/

`npm run build:pages` gera `.next-pages/` com prefixo definido em `src/config/deployment.json`; `npm run test:pages` valida a exportação. Antes de substituir `../gabriel/`, arquive a versão anterior fora do checkout. Publique somente esse destino, preservando a landing page FR, `.nojekyll` e a configuração existente do Pages. Confirme o build e os arquivos públicos por HTTPS; um push sozinho não comprova deploy.

A revisão mantém as limitações artísticas e de desempenho documentadas. `RELATORIO_REDESIGN.md` registra a etapa de revisão anterior à autorização; suas menções a “não publicado” descrevem aquele momento.

SEO mantém HTML pré-renderizado, idioma, metadata/OpenGraph e sitemap. O conteúdo é legível sem JavaScript; indexação permanece bloqueada enquanto esta é uma revisão, conforme configuração anterior.

## Evidências e limites

Consulte `RELATORIO_REDESIGN.md`, `LICENSE_ASSETS.md`, `CHANGELOG.md` e `docs/redesign/` para a matriz de aceite, fontes, capturas reais, dados medidos e comparação visual. `CONTENT_TO_CONFIRM.md` registra contatos pendentes. Os demais relatórios são históricos.

A foto original permanece fora de `public/` e ignorada pelo Git. O personagem atual é humano articulado, mas sua aparência é estilizada e a semelhança facial não equivale à foto. Não há assets pagos, APIs de produção ou envio real de formulário. O visual fotorrealista das concept arts não foi atingido integralmente; o relatório explicita os desvios e a validação de GPU/dispositivos físicos ainda necessária.


### Revisão do escritório contínuo
O cenário atual tem seis setores conectados em `public/models/environment-*.glb`, gerados por `tools/build_office.py`. Para reconstruir apenas o escritório mantendo o avatar existente: `npm run assets:build` (requer Blender). O comando gera também `src/data/office-layout.json`, fonte das colisões; não edite suas medidas independentemente dos modelos. Refaça build e testes depois de modificar os assets. `public/models/manifest.json` registra integridade, tamanho e compressão.

Gráficos: Automático ajusta a resolução conforme os frames; Leve reduz resolução e sombras; Alto aumenta a resolução em relação a Leve. GPUs compatíveis usam PBR; renderizadores por software mantêm texturas e iluminação com Lambert e sombras de contato leves. Alto em software não ativa os efeitos de GPU. O modo clássico segue disponível. A visita mantém scroll reversível e atalhos; a descrição desta etapa é histórica; a revisão completa abaixo acrescenta NPCs, curva de guia e reconexão.

Relatório e capturas atuais: `docs/virtual-studio/office-review/`.


### Câmera orientável e filtros
No modo Caminhar, arraste para olhar, use WASD/setas (ou direcional por toque) para mover na direção da visão, I/J/K/L para câmera e R ou Recentrar câmera para voltar à orientação inicial. A câmera respeita o envelope do edifício e volumes de móveis altos. Pausa e modais bloqueiam a exploração.

A galeria tem filtros por tipo, prévias e detalhes dos conceitos, no modo clássico e no painel Filtrar projetos do setor Galeria. O conteúdo continua explicitamente demonstrativo. Relatório e capturas: `docs/virtual-studio/camera-gallery/`.

### Refinamento visual de 28/10/2026

Para reconstruir somente o personagem: `npm run assets:character`. Mantém uma primitiva com cores por vértice, 16 ossos e Idle/Walk/Turn. Para os interiores: `npm run assets:build`. A vista ilustrativa `public/environment/city-dusk.webp` é um asset local gerado por IA, não uma foto privada; veja LICENSE_ASSETS.md. O modo por software preserva os mapas e cores, com Lambert; materiais PBR e sombras dinâmicas ficam disponíveis em hardware.

## Revisão completa do estúdio — publicação autorizada

A entrega local foi revisada pelo usuário, que agora instruiu **SEMPRE publicar** após as alterações validadas. A revisão completa e as próximas alterações deste projeto devem ser publicadas no mesmo Pages sem nova confirmação, salvo instrução posterior contrária. Nome de repositório autorizado: `Site-zAIon` (a renomeação foi recusada pela integração, HTTP 403, e ainda depende do titular no GitHub). Repositório real atual: `gabrieelwilliam-source/landingpages`; nome exibido: `Site zAIon`. A instrução anterior de não publicar permanece apenas como histórico nos relatórios daquele momento.

- Dados e papéis do elenco fictício: `src/data/studio-actors.json`; orientações são roteiros locais, sem funcionários reais alegados.
- Regenerar o elenco: `npm run assets:cast` (Blender 4.3.2 e Node). Regenerar interiores: `npm run assets:build`. Execute separadamente, pois o verificador exige todos os arquivos já comprimidos. Scripts abortam se Blender encontrar erro de Python.
- `npm test` inclui movimento, rotas, NPCs, simulações e configuração do contato. Em ambiente que não permite processos de teste isolados: `node --test --test-isolation=none tests/*.test.mjs`.
- O laboratório tem quatro simulações locais por etapas. A sala de reunião oferece briefing que acrescenta texto ao rascunho sem substituir o que já foi escrito. O rascunho segue somente em memória durante a visita; não persiste após recarregar.
- Para habilitar um CTA oficial, definir somente um endereço público verdadeiro em `profile.contactUrl`, em `src/data/site.ts` (HTTPS, mailto ou tel). O valor atual é null. O link não envia automaticamente o rascunho. Não colocar tokens/endpoints privados nesse campo.
- Em Caminhar, WASD/setas movem, arraste ou I/J/K/L orientam a câmera, E abre a interação próxima, R recentra. Câmera e ajuda permite distância e ombro. No Scroll, mundo e progresso avançam em profundidade e retornam, mantendo Gabriel ancorado. Voltar ao guia percorre uma rota livre antes de retomar o scroll. Pausa, movimento reduzido e qualidades Baixa/Média/Alta/Automática permanecem disponíveis.
- As mesmas orientações e funcionalidades estão no modo clássico; as fichas de personagens encaminham às seções compartilhadas para evitar formulários/simuladores duplicados.

Veja `docs/virtual-studio/refinement-review/RELATORIO.md` e a galeria de capturas reais desse diretório para evidências e limites.

As variantes leves de Gabriel e dos oito NPCs são geradas com `npm run assets:lod` e incorporadas por `assets:cast`/`assets:character`. Baixa e Automática por software usam geometria reduzida; Média/Alta mantêm o protagonista completo. NPCs podem reduzir detalhe à distância. Os arquivos completos continuam disponíveis; o manifesto da pasta low registra os hashes e os triângulos.

A configuração pública de deploy é centralizada em `src/config/deployment.json`. O export injeta o basePath nos assets/clientes e o servidor local/testes usam a mesma configuração. Após a renomeação real pelo titular, atualizar repository/basePath nesse arquivo, o remote e publicar a exportação validada. Não usar credenciais nessa configuração.

## Escritório azul-marinho e personagens detalhados

Revisão e capturas atuais: [docs/virtual-studio/navy-review/index.html](docs/virtual-studio/navy-review/index.html). [Relatório completo](docs/virtual-studio/navy-review/RELATORIO.md), autoria/licenças em [LICENSE_ASSETS.md](LICENSE_ASSETS.md).

As divisórias internas de vidro mantêm colisão; computadores do estúdio abrem demonstrações existentes. “Câmera e ajuda” reúne qualidade, movimento reduzido, distância de 2,2 a 8,5 m, ombro e instruções. O logo original aparece na recepção e reunião.

O elenco completo usa atlas PBR procedural de micro-normal/rugosidade e malhas faciais/mãos refinadas; os LODs dispensam esses mapas e preservam cores/rig/animações com menos de 7 mil triângulos por personagem. Os personagens continuam estilizados. Rotas de funcionários são verificadas contra vidro e móveis, com saída lateral contínua das cadeiras. `CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-studio-quality.mjs` registra quatro níveis gráficos e uma captura do caminho PBR, em servidor local próprio, depois de `npm run build` e sem outros builds/testes simultâneos. O teste na nuvem usa SwiftShader e não representa desempenho em GPU física.

## Revisão local — Polimento Visual Profissional

A branch `visual-polish` segue o novo pacote: **sem publicação**, sem push e sem alterar a versão de `../gabriel/`. Veja [AUDIT.md](AUDIT.md), [ASSETS_LICENSES.md](ASSETS_LICENSES.md) e [REPORT_FINAL.md](REPORT_FINAL.md). Capturas e comparação: `docs/virtual-studio/professional-polish/`.

A navegação usa uma planta de 72 m configurada por `src/data/office-plan.json`, com entrada de 7 m para manter o enquadramento. `office-layout.json`, assentos e atores são gerados pela mesma fonte física. O eixo anterior era 90 m; mesas/cadeiras e avatares preservam sua escala, e os demais elementos centrais são ajustados à planta. Não alterar só a extensão visual sem atualizar colisões e pontos de interação.

Dados CC0 MakeHuman fornecem anatomia de cabeça/mãos; figurino, rig e ações permanecem do projeto. Poltrona e banco estofado derivam de SheenChair CC0; usam cache compartilhado de geometria/materiais por visita. Fontes e licenças estão incluídas. Reconstruir: `npm run assets:furniture`, `npm run assets:build`, `npm run assets:cast`, em sequência, com Blender instalado. O uso de Blender e das fontes não é necessário para abrir o export já pronto.

A interface mantém marca, modos, pausa, menu, ação próxima e progresso. “Sobre este ambiente” revela a apresentação. Destinos, gráficos, câmera/FOV e ajuda estão no menu. A tecla Escape fecha o menu e devolve o foco ao cenário; rolar o painel não desloca o mundo. Scroll dirige o ciclo de caminhada pela distância virtual, mantendo a raiz ancorada; o sentido inverso reverte o ciclo. Conteúdo, rascunho e modo clássico continuam disponíveis.

Para auditar após build: `CHROMIUM_PATH=/usr/bin/chromium node scripts/audit-studio.mjs docs/virtual-studio/professional-polish/final`. A ferramenta usa servidor de produção próprio; execute sem outros builds/testes simultâneos. Memória de textura é estimativa por alocações WebGL, não VRAM física. LCP mede DOM, não conclusão do canvas. O perfil móvel na nuvem é emulação por viewport/toque, não benchmark de telefone real.
