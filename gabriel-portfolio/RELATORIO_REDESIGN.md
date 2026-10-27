# Gabriel — reconstrução 3D para revisão

27/10/2026 · revisão local · publicação NÃO realizada.

## Resultado e limites de aceite

A versão navegável contém seis ambientes GLB originais, personagem humano com skin e animações, jornada em profundidade, duas formas de navegação e modo clássico. Foram preservados a base Next/React/Three, os conteúdos verificáveis e a separação do portfólio de Gabriel da marca-mãe zAIon. O site FR da raiz e a exportação pública anterior `../gabriel/` permaneceram intactos.

**A aceitação visual integral não foi atingida.** A modelagem atual é estilizada. Ela não reproduz o rosto da foto nem a riqueza arquitetônica/fotorrealista das concept arts. Não houve substituição do cenário por imagem, screenshot falsificado, compra de asset ou integração de serviço externo. Esta entrega é funcional para revisão, mas não declara todos os critérios visuais aprovados.

O pacote oferece imagens conceituais e uma foto; não contém modelos humanos/cenários 3D prontos nem animações licenciadas. Como alternativa utilizável, foram produzidos modelos originais com pipeline Blender. As ações são autorais, não retargeting de mocap. Uma representação facial fiel e acabamento artístico equivalente às referências seguem pendentes, conforme detalhado abaixo.

## Preservação e arquivos

Base recuperável: tag local `backup-before-blender-redesign-20261027`, anterior às mudanças. Sem push, deploy ou substituição dos artefatos publicados. A restrição mais recente do usuário prevalece sobre a autorização de publicação de tarefas anteriores.

Principais arquivos alterados/criados:

- `src/lib/spatial-engine.ts`: GLTFLoader/Meshopt, AnimationMixer, cenas progressivas, PMREM/PBR, caminho simplificado, câmeras e descarte de recursos.
- `src/lib/spatial-motion.mjs`: colisões coerentes com as novas áreas e progresso Scroll preservando posição lateral.
- `src/components/SpatialJourney.tsx`: interface, estado do rig, logo em painel, foco de retorno ao fechar diálogos.
- `src/components/ClassicPortfolio.tsx`, `src/data/site.ts`, `src/app/globals.css`: marca original, posições de exposição, linguagem editorial e responsividade.
- `public/models/`: seis ambientes, avatar e manifesto de integridade. `public/brand/`: logo original.
- `tools/build_assets.py`, `tools/optimize-assets.mjs`, `tools/verify-assets.mjs`: fontes, compressão e validação dos assets.
- `tests/`, `scripts/test-pages.mjs`, `scripts/capture-pbr-review.mjs`: verificação de movimento, browser, prefixo estático e caminho PBR.
- `docs/redesign/`, `README.md`, `LICENSE_ASSETS.md`, `CHANGELOG.md`: evidências e instruções atuais. Relatórios anteriores descrevem versões históricas.

## Assets e personagem

Os sete GLBs totalizam **1.293.960 bytes** (1,29 MB decimal). O avatar tem 121.652 bytes, uma skin e **16 ossos**, com ações **Idle, Walk e Turn**. Há JOINTS_0/WEIGHTS_0 reais, curvas de transformação não constantes e deformação por esqueleto. A validação decodifica o GLB e confere pesos e animações, além dos nomes. No browser, o rig carregado e a troca para Walk foram observados por teste.

A modelagem usa superfícies orgânicas subdivididas, calça/casaco contínuos, mãos/dedos, barba cheia e cabelo rarefeito. Não usa foto como textura. Idle/Walk recebem crossfade; Turn acrescenta movimento de cabeça durante mudança lateral. Não há validação de mocap retargeted porque não foi utilizado mocap. A semelhança facial é **parcial**, sem escaneamento ou reconstrução fotográfica.

Cenários autorais têm biséis aplicados, mobiliário, lamelas, superfícies curvas, texturas minerais/madeira em WebP e materiais PBR. As lajes receberam um único chanfro nas pequenas bordas dos ladrilhos para reduzir polígonos sem alterar o percurso. A geometria usa Meshopt e quantização; não requer Draco/CDN. Arquivos e checksums estão em `public/models/manifest.json`.

O PNG transparente da zAIon é idêntico ao original fornecido, sem redesenho ou distorção de proporção. SHA-256: `fb2edb7999b9c5c35d54ec16a25661650905683a231abbe8d261f04e398b99cc`. Peso: 1.004.338 bytes, carregado na área/painel de marca, não na abertura. A foto privada e o leão não estão em public, GLBs ou pacote de revisão. Licenças/fontes: `LICENSE_ASSETS.md`.

## Seis momentos e interações

| Área / distância | Arquitetura | Interação e conteúdo |
|---|---|---|
| 01 Portal / 0 | Entrada aberta, monólitos assimétricos, cobertura em balanço, escultura curva e vista do átrio | Proposta, explorar, acesso direto à galeria |
| 02 Átrio / 24 | Lamelas de madeira em arranjo circular e anéis suspensos | Perfil/abordagem existente, painel de leitura |
| 03 Ateliê / 49 | Cobertura de estúdio, parede em madeira, seis workstations | Capturas reais nos monitores; serviços em painel HTML legível |
| 04 Galeria / 82 | Três blades expositivos em posições alternadas | Três demonstrações identificadas como conceitos, capturas reais, objetivo/papel/stack e páginas navegáveis |
| 05 Laboratório / 112 | Vidros fumê, mesa de colaboração e módulos de integração | Processo, vínculo web/zAIon e logo original; nenhum claim de automação em produção |
| 06 Destino / 145 | Terraço aberto, degraus e guarda-corpo | Preparar resumo local no clássico, retornar à galeria e navegação reversa |

Passarelas unem as plataformas; não há teletransporte obrigatório entre elas. Altura/largura e mobiliário variam entre áreas. Hotspots são projetados a partir de coordenadas 3D e têm botões equivalentes na leitura editorial, evitando depender de precisão de clique no cenário. Os detalhes são HTML: teclado, seleção de texto e rolagem nativa funcionam.

Os três projetos são demonstrações do próprio repositório, **sem clientes ou resultados comerciais alegados**. E-mail/WhatsApp/redes permanecem configuráveis/nulos. O contato prepara texto local; não promete envio, não transmite dados e não apresenta links fictícios.

## Progresso, controles e câmeras

Uma única distância limitada a [0,158] alimenta progresso normalizado, capítulo, mundo, atalhos e histórico. Os seis destinos são [0,24,49,82,112,145].

**Scroll:** mundo desloca no Z; avatar conserva sua posição física e a câmera conserva a âncora longitudinal. O avatar permanece Idle, sem caminhada ou bob sincronizado ao scroll. A posição lateral do momento de entrada também é preservada. Roda, trackpad, swipe, Page Up/Down e setas permitem avançar/recuar. Isso respeita a instrução direta do usuário de que o personagem só se move quando guiado.

**Caminhar:** WASD/setas e controles de toque movem fisicamente o avatar, com aceleração/frenagem, limites de plataformas/passarelas e obstáculos de mobiliário. A câmera de terceira pessoa acompanha por amortecimento; Walk e mudanças de direção respondem ao movimento. Simulação avança em subpassos quando a renderização é lenta, preservando velocidade.

Alternância conserva o ponto da jornada. Atalhos usam transições suaves; movimento reduzido elimina a travessia animada. P/Escape e o botão pausam; perda de foco também pausa. Diálogos congelam o mundo e devolvem o foco ao botão de origem. Atalhos, Anterior/Próximo, links `?chapter=...` e histórico retornam às seções anteriores sem loops.

## Mobile, acessibilidade e conteúdo HTML

Capturas reais em 1440×900, 1280×900, 390×844, 360×844 e orientação 844×390. Não houve overflow horizontal da página nos testes. Os atalhos móveis têm rolagem horizontal própria. Avatar à direita no celular libera a coluna de texto; interface inferior foi reduzida em relação ao estado anterior.

Axe não encontrou violações nas vistas iniciais 3D/clássica das quatro larguras e no painel horizontal. Isso não substitui auditoria WCAG manual nem teste com leitor de tela. Foram verificados foco, pausa, painel com rolagem própria, gesto touch, links, histórico e alternância. WebGL indisponível abre fallback; preferência por movimento reduzido inicia em clássico. Conteúdo clássico permanece pré-renderizado e legível sem JavaScript.

Metadados/OpenGraph, idioma, sitemap e páginas HTML permanecem. A configuração de revisão anterior conserva `noindex`/robots bloqueado: **indexação pública não está ativada nesta revisão**. Esse item deve ser alterado para a publicação final autorizada; não é declarado PASS para SEO indexável em produção.

## Desempenho medido

Chromium 154 headless, Linux, renderização WebGL por software neste ambiente; sem Android/iPhone/GPU física conectados. A amostra de Scroll ativo em 1000×760 registrou **47 frames em 3.060,2 ms**, aproximadamente **15,36 FPS**, p95 **83,4 ms**, 23 draw calls e 38.327 triângulos. Heap JS informado pelo browser: cerca de 13,3 MB. O detalhamento bruto está em `docs/redesign/performance.json`.

Esse resultado **não atinge fluidez de 60 FPS**, nem prova desempenho em aparelho real. A renderização por software é a limitação indicada pelo teste; não houve profiling separado de CPU e GPU. Nas iterações anteriores, a cena tinha cerca de 75 mil triângulos e ficou próxima de 9 FPS no mesmo teste. A simplificação das bordas do piso e compressão reduziram os modelos de 2,76 MB para 1,29 MB e a carga visível para cerca de 38 mil triângulos.

Medidas aplicadas: carregamento dinâmico do motor, GLBs progressivos, prefetch da próxima área, invisibilidade de cenas distantes, Meshopt/WebP, resolução adaptativa, sombras limitadas e descarte de buffers/materiais/texturas. Renderizador de software usa Lambert sem os mapas de superfície e sem PMREM/sombras; os monitores e marca continuam presentes. GPU compatível usa PBR com probe. Clássico está sempre acessível para equipamentos modestos.

Foi exercitado o caminho PBR num teste adicional que oculta a extensão de diagnóstico do renderer. O cenário carregou sem erro JS e gerou `pbr-portal-software.png`. **Ainda usa software**, portanto não valida hardware nem autoriza alegar FPS de GPU. As demais capturas registram o caminho simplificado normal do ambiente de testes.

Build Next: rota inicial aproximadamente **9,25 kB / 116 kB First Load JS**; compartilhado 103 kB. Esses números não incluem os chunks dinâmicos de Three/GLTF nem todos os assets progressivos. O campo `encodedResourceBytes` do perfil é apenas a soma de recursos terminados até a amostragem, não o peso total da experiência. Não confundir bundle inicial com os 1,29 MB de modelos ou o PNG de marca.

## Verificações executadas

```bash
npm run lint
npm run typecheck
npm test
node tools/verify-assets.mjs
npm run build
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
CHROMIUM_PATH=/usr/bin/chromium node scripts/capture-pbr-review.mjs
npm run build:pages
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

Resultados: lint sem erros, TypeScript sem erros, **11 testes unitários**, **10 E2E** aprovados, build normal e exportação estática aprovados. O teste estático verifica 360/768/1440px, prefixo `/landingpages/gabriel`, navegação, os sete GLBs, identidade do logo, favicon e ausência de erros JS/HTTP. O build emite aviso de que o plugin específico Next não está configurado no ESLint; as regras gerais configuradas foram executadas. Não há alegação de execução de regras de plugin ausente.

A suíte E2E verifica: seis capítulos; rig real carregado; Scroll com mundo móvel e avatar/câmera Z fixos; reversibilidade; Caminhar com avatar móvel/Walk; atalhos e progresso; projetos/painéis; pausa; deep link/histórico; reduzido/clássico; falha WebGL; toque; leitura sem JS; orientações e ações de contato sem sobrepor o rodapé; rolagem de modal sem mover o mundo; foco e logo original.

Falhas encontradas e corrigidas durante a execução: orientação do personagem, estado de rig não publicado após carga, velocidade em frames lentos, renderização de áreas distantes, painéis de monitores posicionados atrás das molduras, conversão sRGB das texturas, sobreposição de ações no contato e foco ao fechar painéis. Os registros finais não apresentam essas falhas.

## Matriz de aceite

| Critério do prompt | Estado | Evidência / limite |
|---|---|---|
| Scroll no eixo Z com avatar ancorado | PASS | Testes observam transformação real do mundo, avatar e câmera; ida/volta |
| Seis checkpoints implementados e distintos | PASS funcional | Seis GLBs e capturas próprias; qualidade artística avaliada separadamente |
| Avatar humano rigged, Idle/Walk | PASS técnico | Skin, 16 ossos, pesos, curvas e clips no GLB; Walk observado no browser |
| Semelhança facial / retargeted validado | PARCIAL | Avatar estilizado; ações autorais, sem retargeting externo; semelhança fotográfica não atingida |
| Assets premium e fidelidade às concept arts | **FAIL de aceite visual** | Materiais/modelos originais funcionam, mas acabamento, anatomia e riqueza arquitetônica ainda inferiores |
| Projetos reais ou demos identificadas | PASS | Três conceitos existentes e rotulados, sem clientes inventados |
| Caminhar e clássico sem conflito | PASS | Movimento, troca de modo, fallback e conteúdo sem JS |
| Contato verificado ou configurável | PASS | Valores nulos, resumo local, sem envio/links fictícios |
| Quatro larguras + orientação móvel | PASS em emulação | Capturas reais do browser e checagem de overflow; não teste físico |
| Typecheck/lint/build/E2E/logo | PASS | Logs e testes reproduzíveis; checksum do original |
| Medição de FPS/assets | PASS de medição / PARCIAL de desempenho | 15,36 FPS por software; falta validar e melhorar fluidez em hardware físico |
| SEO publicamente indexável | PARCIAL | HTML/metadata presentes; noindex conservado na revisão |
| Documentação, licença, changelog e evidências | PASS | Arquivos desta revisão e comparação independente |
| Não publicar | PASS | Nenhum push/deploy; exportação pública anterior preservada |

## Pendências e plano de reparo

1. **Arte/identidade:** refinar cabeça/feições, mãos, roupa e ciclo de caminhada a partir de modelagem humana de maior fidelidade com identidade e licença verificáveis. Validar em vistas frontal/perfil/traseira antes de substituir o GLB. Não usar um rosto genérico como se fosse Gabriel.
2. **Arquitetura:** aumentar riqueza de revestimentos, objetos de criação e iluminação indireta nos cenários autorais, comparando capturas com 01/02/03. O visual atual ainda não passa o critério premium sem flexibilização; não mascarar esse ponto com a imagem conceitual.
3. **Fluidez física:** testar em desktop com GPU e celular real, medir p95/FPS/memória; se insuficiente, adicionar LOD específico do personagem/cenários e ajustar draw calls/sombras. O dado de software não é substituto desse teste.
4. **Conteúdo/lançamento:** manter contatos oficiais configuráveis até confirmação; retirar noindex apenas na publicação final autorizada. Nenhuma informação profissional ou comercial foi inventada para preencher lacunas.

## Revisar e executar

Código em `gabriel-portfolio/`; `npm ci`, `npm run build`, `npm run start -- --hostname 0.0.0.0`. Rota local de desenvolvimento: `/`; no próprio ambiente o servidor padrão é `http://127.0.0.1:3000` (endereço local, não link público de teste). Para imagens e referências lado a lado, abrir o HTML independente `gabriel-redesign-comparacao.html` entregue com a revisão.

A exportação testada fica em `.next-pages/` e tem prefixo `/landingpages/gabriel/`. O ZIP de revisão inclui cópia estática pronta para servir e instruções próprias. Não contém node_modules, foto pessoal, secrets ou código de produção zAIon. Nenhuma publicação foi realizada.
