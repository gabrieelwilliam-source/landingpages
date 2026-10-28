# zAIon Virtual Studio — revisão completa para aprovação

> Registro da entrega local anterior. Depois desta revisão, o usuário autorizou **SEMPRE publicar** e confirmou a renomeação para Site-zAIon. A instrução vigente está em AGENTS.md; a preparação da publicação está em ../site-zaion-publicacao/RELATORIO.md.

## Estado e preservação
Esta entrega continua o código existente em `gabriel-portfolio/`, na branch `virtual-studio-20261027`, a partir de `06151451b16c0d23a34a9590db9febc2b68a0dbf`. Não houve criação de outro projeto, descarte de alterações ou substituição por uma imagem do interior. O checkout estava limpo no início desta etapa.

Backup integral anterior às edições, incluindo Git, ignorados e não rastreados: `/workspace/artifacts/landingpages-before-full-studio-refinement-20261028.tar.gz`. A leitura da lista do arquivo foi verificada. SHA-256: `6d776f54b56da43c3672f4d4df7c9e95ba4c1cc269d73b3a838c55eb2152daf3`. Branch local de segurança: `safety-before-full-refinement-20261028`.

A solicitação atual do usuário prevalece sobre a autorização anterior: **sem publicação, push ou deploy nesta etapa**. O destino `../gabriel/`, a landing page FR da raiz e as integrações/produção n8n não integram a alteração.

## Leitura e direção artística
Foram lidos integralmente `00_LEIA_PRIMEIRO.md`, `01_PROMPT_CODEX_REFINAMENTO.md` e `02_GUIA_DAS_REFERENCIAS.md`, preservados em `brief/`. Os dois moodboards, a foto, o logo e as três capturas do estado anterior foram examinados. Moodboards são concept arts; suas pessoas, cabelos e logos gerados não foram usados como identidade.

A foto original orienta cabelo curto/rarefeito, barba longa e olhos claros de Gabriel. Ela fica fora do Git, public e ZIP. O logo do pacote é idêntico ao existente; seu checksum continua validado. A interpretação do protagonista é **estilizada, sem promessa de likeness fotográfico**.

## O que mudou
- Roupa, rosto e calças passam por união volumétrica e relaxamento de superfície, substituindo as junções visíveis entre tronco/mangas e pelve/pernas. Pesos de pele são reconstruídos por região anatômica. O rig existente de 16 ossos foi preservado, com paleta por vértice e uma única primitiva skinned por modelo.
- Gabriel tem Idle, Walk, Turn, Start, Stop e Interact. A caminhada usa o deslocamento real para controlar a fase do ciclo; início/parada e interação usam transições. Os arquivos também contêm as poses/ações do elenco. Sit é uma pose mantida; Type, Talk, StandUp e SitDown têm curvas animadas. O verificador distingue pose estática de movimento real.
- Oito personagens fictícios têm variações de pele, roupa, cabelo, largura do rosto, altura, posição e papel. As bases compartilham a linguagem autoral, sem se apresentarem como funcionários reais. Recepção, convivência, desenvolvimento, galeria, IA e reunião têm orientação útil.
- Rotinas locais determinísticas e escalonadas combinam digitação, conversa gestual, levantar, caminhada em circuitos e retorno ao assento. O relógio local para quando a rota é ocupada, evitando avançar a simulação e reaparecer adiante do visitante. Há bloqueio de corpo para a caminhada e volumes de pessoas para a câmera.
- Materiais de pedra, nogueira e tecidos incluem baseColor, normal e roughness em WebP. Metais usam fatores apropriados. UVs métricas substituem a projeção anterior dos cubos. Costuras, apoio lombar, almofadas, blocos de anotação, canetas e equipamentos de recepção diferenciam os móveis.
- Balcão mais baixo deixa a recepcionista visível. Divisórias e vãos físicos identificam salas e interrompem a vista repetitiva; a faixa central da visita permanece livre. O mobiliário e as colisões foram regenerados juntos. As almofadas foram corrigidas após as primeiras capturas.
- Luz quente, oclusão de contato, uma aproximação de luz indireta de rodapé e reflection probe local complementam os materiais. Os veios foram suavizados após comparação visual. Não há SSR total, ray tracing ou integração paga.
- A cidade ilustrativa anterior permanece somente no exterior. Interior, pessoas, móveis, paredes e terminais são geometria navegável; nenhum moodboard foi usado como fundo do escritório.
- O Scroll percorre uma curva suave e reversível: o mundo muda em profundidade e lateralmente ao redor do Gabriel ancorado. Caminhar continua independente. Ao retornar ao guia fora da faixa central, um A* local reconecta por pontos livres, com verificação de diagonais. Atalhos também reconectam antes da travessia quando necessário.
- Câmera com distância e escolha de ombro, orientação por arraste e teclado, proteção de fachada, paredes, móveis, pessoas e luminárias suspensas. Obstáculos aéreos têm altura inferior própria, permitindo caminhar por baixo. A proteção continua por volumes conservadores, não por colisão de cada triângulo/folha.
- HUD recolhe descrição e ajuda persistente após começar; câmera e instruções ficam sob demanda. E ou toque abre a interação próxima. Orientação do ambiente oferece acesso direto, sem exigir caça a hotspots. Esc fecha e devolve foco; pausa e movimento reduzido suspendem as rotinas.
- Laboratório com simulações locais de clínica, imobiliária, salão e marketing: seleção de exemplo, três transições, resultado e reinício, sem agendamento, IA ao vivo, API ou envio. Estados são reais no navegador, com conteúdo demonstrativo identificado.
- Briefing orientado acrescenta tipo/objetivo ao rascunho existente, sem sobrescrevê-lo. O contato compartilhado em memória, galeria filtrável, conceitos navegáveis, histórico e modo clássico foram preservados. No clássico, fichas do elenco apontam para os controles compartilhados, evitando duplicação de formulários e regiões acessíveis.
- CTA oficial configurável em `profile.contactUrl`. Atualmente é null, por falta de um canal real confirmado. Apenas HTTPS/mailto/tel públicos são aceitos; URLs com credenciais ou protocolos inseguros são rejeitadas. Abrir o link nunca envia automaticamente o rascunho.
- Baixa/Média/Alta controlam limite global de 6/7/8 personagens; Automática mantém adaptação e usa seis em software. NPCs carregam por área e são ocultados à distância. GLBs são comprimidos por Meshopt, o elenco é simplificado e a decoração estática usa agrupamento/instancing. Renderizadores por software usam Lambert preservando mapas e cores; idle é renderizado em frequência menor, com movimento/câmera atualizados sob demanda.

## Matriz de aceite e evidência
| Requisito | Implementação / comprovação |
|---|---|
| Continuar e preservar | Backup integral, branch de segurança, projeto/stack mantidos; produção fora do diff |
| Identidade | Foto privada como referência, cabelo curto e barba; logo original com hash validado |
| Seis áreas + fachada panorâmica | Recepção, convivência, web, galeria, IA e reunião; fachada é parte das áreas, não um sétimo menu |
| PBR e escala | Mapas originais + UV métrica; piso, tecidos, madeira, pedra, metal e vidro separados |
| Protagonista rigado | Uma primitiva, 16 ossos, seis estados de protagonismo e curvas reais verificadas |
| 5–8 personagens | Oito modelos fictícios, seis papéis base distribuídos por todos os setores; limite por qualidade |
| Rotinas e interação | Digitar, sentar/levantar, conversar, andar; E/toque, painéis úteis e roteiros identificados |
| Visita e exploração | Scroll ancorado/reversível, caminhada relativa à câmera, curva e reconexão livre |
| Câmera / colisões | Distância, ombro, arquitetura, corpos e obstáculos suspensos com limites de altura |
| Laboratório / reunião | Quatro simulações locais e briefing que preserva o rascunho |
| Conteúdo HTML | Terminais legíveis, projetos conceituais reais do próprio repositório e modo clássico compartilhado |
| Mobile / acessibilidade | Toque, teclado, Esc/foco, pausa, movimento reduzido, fallback e auditorias Axe |
| Assets / custos | Autoria original; consulta de alternativa CC0 documentada em LICENSE_ASSETS.md; nenhum serviço pago |
| Privacidade / publicação | Foto e backups fora do ZIP; nenhum segredo de servidor no cliente; sem push/deploy |

## Arquivos principais
- `tools/build_character.py`, `tools/build_cast.sh`, `tools/build_office.py`, `tools/build_assets.py`, `tools/optimize-assets.mjs`, `tools/verify-assets.mjs` e os 15 GLBs/manifesto.
- `src/data/studio-actors.json`, `office-layout.json`, `site.ts`; `src/lib/office/npc.mjs`, `motion.mjs`, `simulation.mjs`, `office-camera.mjs`, `contact-channel.mjs`, `spatial-engine.ts`.
- `StudioAssistant.tsx`, `AutomationDemo.tsx`, `BriefingAssistant.tsx`, `SpatialJourney.tsx`, `ClassicPortfolio.tsx`, `Experience.tsx`, `ContactForm.tsx`, CSS.
- `tests/office.test.mjs`, `tests/full-studio.spec.ts`; testes anteriores permanecem. `scripts/serve-review.mjs`, scripts npm, README, licenças e relatório.

## Limites importantes
O acabamento continua estilizado e não reproduz a fidelidade de um render offline dos moodboards. A foto não virou textura facial. Há topologia/cores compartilhadas entre variantes, sem alegação de oito identidades humanas escaneadas. Mãos, pés e assentos usam animação autoral aproximada, sem IK por contato nem captura de movimento; a sincronização por distância reduz escorregamento, mas não prova sua eliminação em todas as poses.

A câmera e a navegação protegem volumes do cenário; objetos de detalhe não têm colisão por triângulo. A panorama exterior é uma imagem ilustrativa, com perspectiva aproximada, sem parallax urbano completo. O envio real de briefing e integrações continuam ausentes, e são identificados como tal. GPU física não está disponível no ambiente de revisão: os resultados medidos em SwiftShader não comprovam desempenho ou aparência de PBR em hardware real. O modo clássico permanece a alternativa leve.

## Executar e revisar
No código: `npm ci`, `npm run build`, `npm run start`. Para exportação independente: `npm run build:pages` e `npm run preview:review`.

No ZIP entregue, extrair e executar `node INICIAR-REVISAO.mjs`. Ele serve a pasta `site-revisao` localmente, com os caminhos corretos; não faz deploy e não precisa instalar dependências. Node 20+ é suficiente para esse servidor. O console mostra o endereço local. Ctrl+C encerra. Não abrir index.html diretamente, pois modelos e módulos precisam de HTTP.

Abrir `gabriel-portfolio/docs/virtual-studio/refinement-review/index.html` para navegar pelas capturas reais e ler as evidências. Os testes finais e métricas são registrados a seguir após sua conclusão.

## Ajuste de desempenho após a primeira validação completa
A primeira rodada integral limpa passou os 20 cenários, mas a amostra de scroll em SwiftShader ainda mediu 3,33 FPS, p95 450 ms, 128.151 triângulos. Esse valor não foi tratado como fluidez aceitável. Foi acrescentado LOD real: nove GLBs de detalhe reduzido em `public/models/low/`, com os mesmos ossos, animações e cores. O protagonista leve tem 4.686 triângulos; NPCs leves ficam em torno de quatro mil.

A qualidade Baixa e Automática em renderização por software selecionam os modelos leves. Média/Alta preservam o protagonista completo; NPCs distantes podem usar LOD. Na Alta, todos os NPCs dentro da distância de renderização mantêm o modelo completo. A troca preserva o relógio local, a ação e a fase do movimento, sem substituir geometrias quantizadas entre esqueletos diferentes. A variante completa permanece disponível se o arquivo leve não carregar. Os testes finais abaixo incluem essa alteração.

`tools/build-character-lods.mjs` gera as variantes a partir dos modelos originais com Meshopt; `tools/verify-assets.mjs` confirma redução abaixo de 25% dos triângulos, cores, pesos normalizados, 16 ossos e nomes das ações. Há 15 GLBs completos e nove variantes leves, todas autorais.

## Verificação final de código e navegador
- Build de produção e verificação TypeScript passaram. ESLint passou.
- 27 testes unitários passaram, incluindo rotas, guia/reconexão, movimento, colisão de corpos/câmera/luminárias, LOD, contato e os quatro redutores de simulação. Registro: evidence/unit-tests.txt.
- 21 testes de navegador passaram integralmente na rodada final, em 3,7 minutos. Sem reexecuções nessa rodada. Cobrem as regressões anteriores e os novos NPCs, relógios/pausa, orientações dos seis setores, todos os simuladores, briefing, distância/ombro, reconexão, toque em personagem e troca de LOD. Registro: evidence/browser-tests.txt; lista: evidence/browser-test-list.txt.
- Os problemas encontrados nas rodadas exploratórias foram corrigidos: controles/regiões duplicados no clássico, label do seletor, notificação de término da reconexão, seletor de teste ambíguo, balcão/cadeiras/almofadas e câmera em obstáculos aéreos. Nenhuma assertion funcional foi removida para obter o resultado final. O teste do teto passou a usar a nova altura segura configurada no cenário.
- Verificação dos assets passou: 15 modelos completos, nove LODs, mapas PBR de pelo menos três materiais por ambiente, Meshopt/WebP, cores, pesos normalizados, rig e movimentos/poses. O logo continua idêntico.

### Amostra de desempenho final
Chromium 154 / SwiftShader, 1000×760, 3123.7 ms de scroll ativo: 3.84 FPS, p95 383.4 ms, 38 draw calls, 82737 triângulos. Esses valores **ainda são lentos**, não satisfazem fluidez em software e não constituem teste de GPU física. A amostra curta não é um ensaio controlado de ganho de FPS. O LOD reduz efetivamente a geometria; o modo clássico segue sendo a alternativa leve. O desempenho em GPU real permanece pendente de revisão no dispositivo alvo.

### Peso e geometria
Modelos completos: 4,356,368 bytes. Nove LODs: 922,560 bytes. Gabriel completo: 33,682 triângulos; leve: 4,686. Os modelos completos permanecem disponíveis na qualidade Alta.

## Exportação final
`npm run build:pages` e `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` passaram na versão definitiva em 360, 768 e 1440 px, com assets versionados, ambos os modos, câmera, contato, galeria, links e ausência de erros de recursos/execução. Evidência: evidence/pages-tests.txt. O destino publicado permanece fora do diff. O ZIP inclui uma exportação local separada, não copiada para o destino de publicação.

## Pacote funcional de revisão
O próprio iniciador do pacote foi aberto em Node, sem node_modules ou servidor Next dentro da pasta de revisão. Chromium carregou o 3D e os recursos locais, confirmou 16 ossos, trocou entre LOD leve/completo, abriu a recepcionista, fechou o painel e acessou o modo clássico. Não houve erro de recurso ou execução. Evidência: evidence/package-smoke.json; captura: package-smoke.png.

O código permanece como alterações locais para revisão, sem commit de entrega, push ou deploy. A base Git é a indicada acima; o manifesto do ZIP registra o fingerprint dos arquivos entregues. O arquivo publicado da etapa anterior permaneceu inalterado.
