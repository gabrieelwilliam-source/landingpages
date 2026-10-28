# Refinamento gráfico — 28/10/2026

## Preservação
Base `ce013a8`, branch `virtual-studio-20261027`. Backup integral anterior à edição, incluindo Git, arquivos ignorados e não rastreados: `/workspace/artifacts/landingpages-before-character-refinement.tar.gz`. SHA-256: `de35cf397535fb8fbf280a9d7c1013b2535a56c20efc871a920baf6a245d6a1a`.

## Resultado
- Personagem original com formas suavizadas nos ombros, cabeça e roupa; pálpebras, olhos claros, orelhas, nariz, barba com fios e cabelo curto. Capuz, costuras, bolsos, tênis com cadarço e mochila com alças e zíper.
- Paleta original por vértice: uma única primitiva skinned, 16 ossos e as animações Idle, Walk e Turn. A conversão para Lambert preserva a paleta no WebGL por software. A representação continua estilizada, sem escaneamento facial nem equivalência fotorrealista às imagens de referência.
- Interior com forro detalhado, peças em nogueira, linhas em bronze, tapetes, luz embutida no balcão, vegetação com copas orgânicas e folhas dobradas. Pedra com veios mais visíveis e rugosidade menor. Direção da luz solar alinhada à fachada.
- Vista urbana local ao entardecer substitui os blocos distantes. É uma imagem ilustrativa gerada por IA apenas para o exterior; não é prova de escritório real. O interior e personagem continuam geometria 3D navegável.
- Correção do centro dos segmentos parciais de piso e vidro nas divisões entre setores. As medidas e a circulação existentes são preservadas; o JSON de colisões foi regenerado a partir da geometria.
- Nenhuma nova dependência, serviço pago ou integração de envio. Foto privada preservada fora da publicação; logo original com SHA-256 validado.

## Reprodução
`npm run assets:character` reconstrói e comprime somente Gabriel. `npm run assets:build` reconstrói os seis setores e dados de colisão. Requer Blender 4.3.2 e Node. `node tools/verify-assets.mjs` verifica compressão, mapas WebP, logo, rig, animações que realmente alteram ossos, cores por vértice e limite de primitivas/triângulos do personagem.

## Limites da direção artística
A linguagem visual aproxima materiais, iluminação quente, cidade, figurino e mochila das referências. Os concept arts possuem reflexos e detalhamento de uma imagem renderizada; a cena interativa não os reproduz integralmente. No renderizador por software são usados Lambert e sombras de contato; PBR e sombras dinâmicas são habilitados em hardware. A qualidade gráfica alta pode custar fluidez; o modo clássico permanece disponível.

NPCs, visita guiada em curva, reconexão por caminho, simulações locais e planta do escopo maior continuam pendentes. Esta etapa concentrou-se no acabamento visual.

## Orçamento dos assets
Sete GLBs: 2,054,124 bytes. Personagem: 149,620 bytes, 20,600 triângulos, uma primitiva skinned. Vista WebP: 230,806 bytes.

## Verificação inicial e limite observado
Build de produção, TypeScript, lint e 16 testes unitários passaram. Na rodada final inicial, 11 de 14 E2E passaram; três cenários de desktop excederam o limite total de 30 segundos (duas auditorias de layout/acessibilidade e a navegação scroll/caminhada). Os erros foram de timeout, sem remoção de assertions. A revalidação usa o mesmo código e limite explícito de 60 segundos; resultado registrado abaixo após a execução.

Amostra durante scroll em Chromium 154/SwiftShader, 1000×760: 2,72 FPS, p95 750 ms, 32 draw calls, 90.597 triângulos. É uma limitação material da execução por software; não demonstra fluidez nem desempenho em GPU real, que não foi medido neste ambiente. O refinamento aumentou detalhes geométricos; o modo clássico é a alternativa leve. Valores completos em performance.json.

Capturas em office-1-1440.png até office-6-1440.png, office-character-front.png, office-portal-390.png e orbit-desktop.png são capturas reais do aplicativo via Playwright. Não são os concept arts nem o render isolado do Blender.

## Revalidação dos três cenários
Os mesmos três testes passaram na execução isolada `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e -- --last-failed --timeout=60000`, em 15,8 s, 14,4 s e 23,9 s respectivamente (todos abaixo do limite original de 30 s). Resultado combinado: os 14 cenários passaram, sendo 11 na primeira rodada final e três na reexecução. Não houve alteração de código, timeout do repositório ou assertions para fazer essa revalidação. A primeira rodada exploratória anterior aos últimos ajustes também havia passado 14/14. O resultado final combinado não significa que a rodada integral tenha sido livre de timeouts.

A URL dos GLBs inclui os primeiros 12 caracteres do SHA-256 do manifesto, evitando reutilizar o personagem e ambientes antigos do cache após a publicação. A exportação estática verifica também essas versões nas requisições reais do navegador.

## Exportação
`npm run build:pages` e `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` passaram na versão definitiva em 360, 768 e 1440 px, incluindo navegação, modelos versionados, contato, galeria, clássico e ausência de erros de execução/recursos. A revisão da URL dos modelos foi coberta por essa rodada estática; os 14 cenários E2E acima foram executados antes dessa alteração de cache.

Backup recuperável do destino publicado anterior: `/workspace/artifacts/gabriel-before-graphics-refinement-publish.tar.gz`, SHA-256 `b722d3edf7580817c4f813fa90bdaca694e3dd6261fa28cf1570333f98991fe8`. Destino autorizado: https://gabrieelwilliam-source.github.io/landingpages/gabriel/ . A exportação contém version.json com revisão-fonte e hash do HTML para conferir a publicação.
