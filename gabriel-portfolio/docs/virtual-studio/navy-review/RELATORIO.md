# Reformulação visual zAIon — 28/10/2026

Continuação do projeto existente, sem recomeçar a aplicação. A preferência vigente do titular autoriza publicar as versões validadas neste GitHub Pages. O pedido desta etapa proíbe publicar **sem autorização**; não revoga essa autorização. Não há alteração de n8n ou integrações de produção.

## Alterações

- Recepção com painel azul-marinho, iluminação indireta lateral e fascia azul no balcão de pedra/nogueira. Logo oficial preservado byte a byte, inclusive ponte, tipografia e pingo do i.
- Dez divisórias de pedra substituídas por vidro com estrutura e faixa de segurança discretas. O centro mantém passagem livre e os setores podem ser vistos entre si. O vidro continua tendo colisão física.
- Piso contínuo com juntas espaçadas, removendo a malha de pequenas placas e reduzindo fortemente os veios repetitivos. Madeira escura e tecidos mantêm mapas PBR originais; latão menos brilhante e mais fosco.
- Laboratório com painel azul-marinho e elementos verticais azul-real. Quatro monitores conservam diagramas de clínica, imobiliária, salão e marketing; integrações personalizadas continuam no conteúdo existente, sem conexões externas.
- Estúdio com telas distintas: conceitos existentes de um lado e editores de programação autorais do outro; acessórios variados. Seis pontos de interação junto às estações abrem as demonstrações existentes. Não há clientes ou métricas inventadas.
- Marca oficial na recepção e sala de reuniões, evitando repetição no laboratório. Exterior ilustrativo de entardecer mantido exclusivamente fora das janelas; interior continua sendo geometria 3D.
- Gabriel preserva malha contínua, cabelo curto com entradas, barba longa, olhos claros e mochila. Roupa azul-marinho discreta, rotação de tronco e articulação dos pés acrescentadas à caminhada. Rig de 16 ossos e onze ações preservados, com variante de baixa geometria atualizada.
- Oito funcionários fictícios existentes mantidos, com digitação, conversa, levantar/sentar e percursos locais, carregamento por setor e LOD. Não representam uma equipe real.
- Qualidade gráfica e movimento reduzido movidos para o menu secundário “Câmera e ajuda”, junto à distância, ombro e instruções. Pausa, modos de navegação e troca de setor continuam acessíveis.
- Colisões de câmera agora incluem os monitores e a estação da recepção na altura da tela, além de vidro, mobiliário, pessoas e luminárias. O movimento do personagem continua usando as mesmas regras de colisão.

## Execução

Com Node.js instalado: `npm ci`, `npm run build`, `npm run start`. Desenvolvimento: `npm run dev`. Exportação: `npm run build:pages`; revisão estática: `npm run preview:review`. A configuração de repositório e prefixo fica em `src/config/deployment.json`.

Assets de escritório: `npm run assets:build` com Blender. Avatar: `npm run assets:character`. Autoria e licenças em `LICENSE_ASSETS.md`; nenhuma nova dependência, modelo pago ou serviço contratado nesta etapa.

## Preservação

Backup integral anterior às alterações, incluindo Git, ignorados e não rastreados: `/workspace/artifacts/landingpages-before-navy-redesign-20261028.tar.gz`.
SHA-256: `a44bc1f3ea358a9de9682b700ad15707b051aca516c1f4ac1ecbe93895486859`.
Foto pessoal e backups privados permanecem fora do site, Git e pacote distribuível. Landing page FR na raiz preservada.

## Limitações visuais e técnicas

O avatar continua estilizado; não tem o nível de detalhe facial e das mãos do concept art. Animações são autorais, sem mocap ou IK. Contatos com cadeira, teclado e chão são aproximados. As divisórias são volumes planos de vidro transparente com reflexo de ambiente controlado, sem refração/ray tracing. A arquitetura mantém a organização longitudinal dos seis setores para preservar scroll e conteúdo; a transparência reduz o efeito de corredor, sem transformar o projeto em outra planta.

A nuvem utiliza Chromium com SwiftShader. Capturas comprovam execução real, mas não garantem desempenho em uma GPU física. O modo clássico permanece disponível. Formulário guarda rascunho em memória e prepara resumo, sem enviar mensagens ou dados.

## Validação

`npm run build`, `npm run lint` e `npm test` concluídos. **29 testes unitários e 24 E2E passaram** na versão final. Os E2E incluem acessibilidade, desktop de 360/390/1280/1440 px, toque real em contexto móvel, scroll reversível, caminhar/orbitar/colisões, retorno ao guia, seis setores, NPCs, pausa, níveis gráficos, formulários e demonstrações locais. A verificação de altura das luminárias foi mantida e separada dos novos testes de monitores, que ficam em altura diferente.

## Refinamento adicional dos personagens

A pedido do titular durante esta etapa, o refinamento foi ampliado para todo o elenco. O rosto recebe planos de maçãs, sobrancelha, nariz e queixo incorporados por remesh de maior resolução, detalhes de pálpebra/sobrancelha e linhas faciais discretas. A barba de Gabriel recebe mais mechas e variação de direção, com cabelo curto esparso no topo. As mãos unem palma, dedos e polegar em superfície contínua, com unhas; as roupas recebem pequenas dobras esculpidas e o elenco recebe detalhes direcionais no cabelo.

Um atlas PBR procedural original de 256×256 diferencia rugosidade e micro-normal entre pele, olhos, tecido, cabelo e acessórios. Não utiliza pixels da foto pessoal. Mantém uma primitiva skinned por personagem. Para sustentar os detalhes próximos, o teto de geometria em qualidade completa sobe para 65 mil triângulos no Gabriel e 45 mil no elenco; os LODs continuam limitados a 7 mil e a menos de um quarto do modelo completo. Esses números são limites verificados, não contagens finais. A câmera agora permite distância mínima de 2,2 m para inspecionar o personagem, mantendo colisões.

Em renderizadores por software, a conversão para Lambert preserva cores e geometria, mas não mostra a resposta PBR de micro-normal/rugosidade. Por isso é necessário distinguir a melhoria geométrica da aparência esperada em GPU, que não pode ser garantida pelas capturas da nuvem.

A composição desktop também desloca o painel de texto para a parte inferior esquerda e reduz sua descrição, deixando o logo da parede livre. Essa decisão foi tomada comparando capturas reais, nas quais os botões anteriores passavam sobre a marca.

Os planos de maçãs e sobrancelhas são suavizados no gerador. A versão leve remove os mapas de micro-superfície/UVs correspondentes antes da simplificação, preservando cores por vértice, skin e animações. O modelo próximo mantém os mapas PBR completos.

Os trajetos locais dos quatro funcionários que caminham foram revisados contra as colisões reais de mesas, cadeiras e vidro. A saída da cadeira interpola lateralmente até o início da rota, com retorno reverso ao sentar. A animação deixa o deslocamento horizontal a cargo dessa trajetória. Um teste amostra todo o circuito e verifica continuidade nas quatro transições da rotina, além das colisões entre pessoas já existentes.

A distribuição final traz `index.html` com comparação antes/depois e capturas dos seis setores, do avatar em duas geometrias, da recepção em close e do uso por toque. O desempenho por nível é registrado em `performance-tiers.json`; as medições não são um comparativo controlado entre máquinas ou GPUs.

## Medições da versão final

| Qualidade | FPS médio observado | Triângulos no quadro | Geometria de Gabriel |
|---|---:|---:|---|
| auto | 8.54 | 74617 | low |
| low | 10.71 | 74473 | low |
| medium | 3.07 | 184623 | high |
| high | 2.20 | 212363 | high |

Amostras curtas em 1000×760, com scroll ativo e SwiftShader, sem erros de JavaScript. Qualidade alta em renderização por software é lenta; Automática/Baixa ou modo clássico são as alternativas neste ambiente. Não foi medida uma GPU física e os cenários não foram sincronizados entre amostras. O caminho PBR também foi capturado em software. A rugosidade mínima da pedra é calibrada em 0,66 no carregamento, para reduzir reflexos excessivos vistos no close PBR. O gerador adota a mesma rugosidade para futuras reconstruções.

Destino autorizado: https://gabrieelwilliam-source.github.io/landingpages/gabriel/ . Repositório real: `landingpages`; a renomeação administrativa para `Site-zAIon` permanece pendente.
