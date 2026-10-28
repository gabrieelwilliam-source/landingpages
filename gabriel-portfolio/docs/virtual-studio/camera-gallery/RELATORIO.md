# Continuação — câmera e galeria

## Estado e preservação
Base: `20f0037`, checkout limpo na branch `virtual-studio-20261027`. Backup integral anterior às alterações: `/workspace/artifacts/landingpages-before-camera-gallery.tar.gz`, incluindo arquivos ignorados e não rastreados e metadados Git. SHA-256: `36d2027055875ea4f9dd128361a927eee93b6050c33a2201882542a4e3a80a42`.

## Entrega desta etapa
- Câmera orientável no modo Caminhar, por arraste de mouse/toque e teclas I/J/K/L; R e botão para recentrar. A visão não desloca o visitante.
- Caminhada relativa à direção da câmera, com velocidade diagonal preservada. Trocar para scroll recentra a orientação preservando a posição. Os atalhos recentram a câmera no destino escolhido.
- Segmento entre personagem e câmera é limitado pelo edifício e por volumes de móveis altos. O cálculo considera alturas e permite olhar por cima de móveis baixos. A proteção usa caixas conservadoras; não é uma colisão por triângulo para cada detalhe decorativo ou folha.
- Culling dos setores considera a direção de visão no modo livre, permitindo olhar para trás sem ocultar os setores próximos.
- Dados de altura e dois painéis sólidos adicionados a `office-layout.json`; gerador atualizado para reproduzir esses campos. Modelos GLB preservados.
- Telas do estúdio/laboratório alinhadas às molduras; logo do laboratório ajustado para ficar à frente da superfície.
- Galeria HTML compartilhada entre clássico e painel 3D, com Todos/Landing pages/Portfólios/Institucionais, contagem acessível, prévias existentes e links para os conceitos originais. Todos continuam identificados como demonstrações, sem clientes ou resultados inventados.
- Ajuda reposicionada no desktop para não cobrir o direcional. O formulário compartilhado e seu comportamento sem envio permanecem preservados.

## Arquivos
`src/lib/office-camera.mjs`, `src/lib/spatial-engine.ts`, `src/data/office-layout.json`, `src/data/site.ts`, `src/components/SpatialJourney.tsx`, `src/components/ProjectGallery.tsx`, `src/components/ClassicPortfolio.tsx`, `src/app/globals.css`, `tools/build_office.py`, testes e `scripts/test-pages.mjs`.

## Verificação
- Build de produção, tipos e lint passaram.
- 16 testes unitários passaram, incluindo rotação da caminhada, clipping de câmera por altura, envelope do edifício e integridade dos dados.
- 14 testes de navegador passaram na rodada final: mouse, teclas de câmera, caminhada, pausa, toque, filtros em ambos os modos, foco ao fechar modal, acessibilidade, contato, regressões dos seis setores, movimento reduzido e fallback.
- Capturas reais: `orbit-desktop.png`, `orbit-mobile.png`, `gallery-dialog.png`. Inspecionadas após as correções de tela e interface. Desktop capturado com movimento reduzido e Chromium por software.
- Amostra de 3.041s em 1000×760, Chromium 154/SwiftShader: 6.58 FPS, p95 266.7 ms, 38 draw calls. Não constitui medição de GPU real nem prova de fluidez; modo clássico disponível.

## Uso
No modo Caminhar, arraste uma área livre do cenário para olhar; WASD/setas ou direcional por toque movem o visitante. I/J/K/L ajustam a câmera com teclado e R recentra. Pausa e modais suspendem essas ações. No setor Galeria, escolha Filtrar projetos; no clássico, use os mesmos filtros na seção Projetos.

Instalar/executar/testar com os comandos documentados no README. Não há novas dependências ou serviços. Publicação autorizada somente no mesmo Pages de testes, preservando landing page FR e produção/n8n.

## Escopo maior pendente
NPCs com rotinas, guia em curva e reconexão por caminho, simulações locais interativas e planta ainda não foram implementados nesta etapa. O avatar e a interpretação visual estilizada continuam os existentes. Não há contatos reais ou integrações de envio configurados.

## Exportação e publicação
`npm run build:pages` passou; `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` passou em 360, 768 e 1440 px. O teste estático inclui giro/recentralização e filtros com os caminhos do Pages. A versão anterior do destino foi preservada em `/workspace/artifacts/gabriel-before-camera-gallery-publish.tar.gz`. Publicação autorizada no mesmo Pages; confirmação por HTTPS pode permanecer bloqueada pela política ativa de rede.
