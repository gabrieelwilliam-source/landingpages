# PROMPT MESTRE — IMPLEMENTAÇÃO FINAL DO zAIon VIRTUAL STUDIO

## Missão
Evoluir o **portfólio 3D EXISTENTE do Gabriel** para um escritório virtual da zAIon, profissional, visualmente convincente e utilizável. É uma experiência comercial de descoberta: visitante entra na recepção, explora o escritório livremente, conhece o trabalho do Gabriel, vê projetos e serviços com evidências verdadeiras, e entra em contato. **Não começar do zero sem justificar tecnicamente; não sobrescrever trabalho concluído.** Implementar e validar, não apenas escrever plano ou mockup. Reservar melhorias que exigem ativos indisponíveis como pendências explícitas, sem declarar concluídas.

## Regras prioritárias
1. Esperar a execução anterior do Codex terminar; inspecionar git status, branch, árvore de arquivos, dependências, rotas, scripts, assets, testes e screenshots. Identificar versão vigente e comportamento real. Fazer branch de desenvolvimento + commit/backup rastreável antes de modificar. Preservar modo clássico e dados.
2. **Navegação dual:** (A) **Visita guiada por scroll:** a posição visual do Gabriel permanece estável/próxima do primeiro plano; o cenário e a câmera avançam pelo trajeto em profundidade, com sincronização elegante do movimento. Scroll reverso retorna pela mesma rota. Não transformar em scroll de seções HTML convencionais. (B) **Exploração livre:** WASD/setas ou touch para movimentação 3D real, câmera terceira pessoa e navegação por áreas, sem trilho rígido. Na troca de modo, preservar ponto de interesse/progresso, sem teleporte inesperado. Câmera e direção do deslocamento devem ser coerentes em ambos os modos.
3. Ambiente central: **um único escritório contínuo**, coerente espacialmente; evitar seis túneis repetidos, paredes vazias, formas primitivas como acabamento final, placas genéricas, excesso de HUD. Arquitetura premium sóbria: superfícies PBR reais, madeira escura, pedra/concreto, vidro, metal fosco; azul-marinho/dourado como acentos zAIon. Não replicar literalmente os renders. Dar contraste suficiente e boa legibilidade.
4. **Pessoas no escritório:** personagens 3D com animações convincentes de trabalho, conversa, caminhar entre pontos e pausas; ambientação discreta. NPCs sempre identificados como ilustrações/personagens virtuais, sem atribuir cargos reais ou inventar equipe real. Implementar rotinas locais (máquinas de estados e waypoints), sem chamadas pagas a LLM.
5. Personagem Gabriel: foto original apenas para referência, com cabelo curto/rarefeito, barba longa e olhos claros; animações idle/walk/turn/sit se asset permitir; evitar boneco rígido. Priorizar personagem licenciado rigado e ajustável, documentar licença e adaptação. Não confundir imagem conceitual do personagem com representação fiel.
6. 3D é uma camada de apresentação, **não uma barreira**: modo clássico completo, elementos HTML acessíveis para títulos, links, formulário, galeria e descrições. Nenhum texto essencial renderizado exclusivamente como textura 3D. SEO, teclado, foco, leitores de tela, reduced-motion e dispositivos sem WebGL.
7. Não publicar ou alterar ambientes de produção; não contratar serviços nem introduzir dependências pagas. Não usar chaves, emails, WhatsApp, domínio e URLs fictícios como se fossem verdadeiros. Links externos configurados só quando confirmados.

## Experiência espacial — setores com sentido comercial
- **Recepção e lobby:** identidade Gabriel + assinatura by zAIon; dois convites "Explorar livremente" e "Fazer visita guiada"; recepcionista NPC com menu estático acessível (Projetos / Serviços / Sobre / Contato). Visita acessível mesmo sem NPC.
- **Estúdio Web do Gabriel:** mesas de desenvolvimento, monitores com *screenshots reais* de sites e landing pages autorizados. Ao se aproximar, tecla E/click/toque abre painel HTML com case, contexto, papel, stack, screenshots e URL válida; itens não comprovados marcados "conceito / demonstração", sem clientes inventados. Mesa do Gabriel com portfólio acessível no monitor como detalhe meta, sem recursão que congele navegador.
- **Laboratório de automações:** monitores e diagramas conceituais para clínica estética, imobiliária, salão, marketing e integrações. Diferenciar **desenvolvido**, **em testes** e **em produção comprovada** conforme documentação real; não alegar operação bem-sucedida não verificada. Demos locais simuladas, claramente rotuladas, por padrão; nada de endpoints reais sem autorização.
- **Sala de reuniões:** apresentação simples do processo (descoberta, escopo, design, desenvolvimento, entrega e acompanhamento). CTA de orçamento em modal/rota HTML, sem formulário enganoso: só enviar se endpoint real configurado com consentimento e mensagens de sucesso/erro.
- **Galeria de projetos:** displays interativos, filtros, detalhes e links reais; estado vazio honesto com cases conceituais identificados. Destaques cinematográficos em telas, preservando contraste e desempenho.
- **Espaços de circulação/área social:** funcionários NPC, conversas ambientais subtis, localização espacial legível, pontos de retorno e minimapa opcional só se realmente ajudar. Localizações/portas fazem sentido físico. Espaço pode crescer por fases, mas a estrutura final deve estar coerente.

## Desenho de interações
- Prompt de proximidade E/interagir e toque com foco e contexto; desativar enquanto modal está aberto e impedir inputs de movimentação quando foco está no formulário. Interações repetidas devem ser estáveis.
- Funcionários: idle, digitar, levantar, caminhar, conversar em pontos autorizados, retornar, sentar; sem atravessar paredes/mesas. Animation blending, spawn e caminhos válidos; evitar aglomerações e ciclos visivelmente sincronizados; variar temporização de forma determinística quando útil para testes. Nenhum diálogo afirma que NPC é uma pessoa real; opções de fala pré-escritas e atalhos para áreas.
- Visita guiada: scroll mapeado para distância ao longo de curva/spline, com easing independente do FPS; progresso bidirecional; pausas curtas em pontos de interesse e transições de câmera. Modo exploração livre permite sair do percurso e voltar sem travamentos. Botão "Pular para projetos/contato" sempre acessível.
- Se um asset essencial faltar, procurar alternativas gratuitas com licença compatível; preferir glTF/GLB, animações rigadas e texturas PBR. Não depender de downloads indisponíveis na build final. Documentar origem, autor, licença e atribuição em `ASSET_LICENSES.md`.

## Arquitetura técnica
- Respeitar stack detectada do repositório; para React/Next.js 3D, preferir Three.js, React Three Fiber, Drei, Rapier se adequado; evitar reescrita por moda. Separar `Experience`, `World`, `Office`, `Characters`, `NPCBehavior`, `GuidedTour`, `FreeRoam`, `Interaction`, `Content/Projects`, `UI`, `Accessibility`, `QualitySettings` (nomes conforme convenção atual).
- Modelo de mundo/waypoints orientado a dados; IDs estáveis, coordenadas consistentes, detecção de proximidade, colisões e gatilhos desacoplados do copy e da UI.
- Estado unificado (mode, activeZone, tourProgress, interactionTarget, modal, quality, paused); trocar modo sem desincronizar posição/câmera.
- WebGL: DPR adaptativo, sombras com budgets, LOD/instancing, otimização de GLB, texturas KTX2/WebP quando útil, carregamento por setor e pré-carregamento discreto, meshes combinados, animações apenas quando visíveis; evitar reflexos e luzes caras em toda parte. Prefira bake para iluminação ambiental e materiais com mapas adequados. Limpar event listeners e recursos GPU.
- Meta de experiência fluida definida via medição, não promessa arbitrária. Documentar FPS e tempo de carregamento em dispositivos reais ou emulações, hardware e limitações. Se necessário, qualidade baixa automática e modo 2D clássico.
- Evitar dados pessoais embutidos no bundle: contato e links configuráveis em arquivo sem segredos. Tudo que for exibido como serviço/credencial ou case tem fonte interna verificável.

## Polimento visível
- Paleta profissional em linha com zAIon, marca original sem modificações; pôr do sol suave ou luz de fim de tarde; reflexos contidos, imperfeições naturais, materiais realistas e escala humana correta. Evitar estética genérica sci-fi, excesso de glow e cenários excessivamente escuros.
- Câmera natural; nenhuma parede atravessada, clipping de personagem/objeto ou sombra flutuando; posição adequada da câmera ao alternar modo. Evitar HUD enorme: controles e capítulos de forma compacta, não barra ocupando 20% da altura.
- Tela inicial curta, indicador de carregamento real, transição para escritório sem flash; som ambiente opcional e silencioso por padrão, com toggle e sem áudio protegido por copyright.
- Mobile: alternativa funcional de joystick/movimento e interações por toque, layout legível, qualidade automática; não forçar panorama horizontal sem fallback.
- Acessibilidade: tab order, focus ring, aria labels, escape para sair dos modais, teclas não interceptadas nos campos de texto, reduções de animação e interrupção fácil.

## Sequência de execução — implementar tudo
1. Auditar estado, registrar baseline, backup e checklist de componentes preservados.
2. Ler `02_PROGRAMA_ESPACIAL.md`, `03_INTERACOES_E_NPCS.md`, `04_CONTEUDO_E_DADOS.md`, `05_TESTES_E_ENTREGA.md`, `06_LIMITES_E_DECISOES.md`, `07_DIRECAO_VISUAL.md` e referências.
3. Instalar/importar assets licenciados; criar mapa de mundo com escala e circulação; montar o lobby e fazer a navegação dual funcionar sem regressão.
4. Montar demais espaços interligados; criar NPCs e comportamento, interação com monitores e painéis, galeria, contatos e navegação acessível.
5. Passagem de arte: texturas PBR, luz, câmera, materiais, animações, UI e responsive. Não declarar final se ainda parecer bloco geométrico.
6. Rodar build, tipos, lint, testes unitários de progressão e estados, testes de navegador em desktop/mobile e inspeção visual com screenshots; corrigir erros encontrados. Testar navegação scroll+livre, retorno, abrir/fechar modais, mudança de qualidade, modo clássico, WebGL indisponível e sem rede.
7. Entregar resultado no projeto existente com relatório de arquivos, commits, licenças, screenshots reais, vídeo opcional, instruções de execução/deploy, pendências e comparativo com checklist. Somente pedir autorização para publicação após evidências.

## Critério de pronto
**Não é pronto** se: falta um setor essencial sem aviso; NPCs são bonecos estáticos; textos importantes aparecem só em 3D; conteúdo comercial falso; troca de modo perde estado; scroll rola a página em vez de mover mundo; modo clássico incompleto; assets sem licença; performance inviável; imagens de referência são apresentadas como screenshot real; ou testes não executados.
**É pronto** quando o site funciona e foi verificado de ponta a ponta, com limitações honestas e registro do que foi medido. Se recursos faltarem, explicar bloqueio e entregar o melhor resultado comprovado, sem fingir conclusão.
