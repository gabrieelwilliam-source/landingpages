# CONTRATOS DE INTERAÇÃO E NPCs

## Modos
`guided_scroll`: scroll(delta) avança/retrocede progressão da spline, atualiza mundo/câmera e animação do avatar; personagem deve permanecer aproximadamente ancorado no enquadramento, não necessariamente imóvel no mundo. Progresso em [0,1], transições com smoothing e limite de aceleração. Impedir scroll da página quando canvas está ativo, mas preservar alternativa normal no modo clássico.

`free_roam`: controles WASD/setas, câmera de seguimento com oclusão e colisão, toque/joystick; movimentação física do avatar e mundo permanece estável. E/enter/toque interage com foco próximo. Retomar guia a partir de waypoint válido próximo ao personagem, não teleportar para início.

`classic`: render HTML sem WebGL, mesmas informações e caminhos de contato.

## Máquina de estados NPC
`idle → walkToDesk → sit → typing → stand → talkToColleague → return`, com transições válidas por asset/locomoção e rotas NavMesh ou waypoints. Para cada NPC, aplique um subconjunto coerente; recepcionista pode permanecer na recepção, desenvolvedores digitam, dois colegas trocam gestos suaves. Nunca todos repetirem a mesma animação simultânea.

Estados interrompíveis: ao aproximar-se, NPC pode virar a cabeça e sinalizar interação; diálogo é menu estático, não chatbot real. Evitar interrupções durante caminho que provoquem clipping. Ação do NPC não deve bloquear o progresso do usuário.

## Exemplos de interação
- Recepção: "Quer conhecer os projetos do Gabriel ou explorar o escritório?" → `Projetos`, `Explorar`, `Serviços`, `Contato`.
- Mesa do Gabriel: "Conheça os trabalhos e experiências web" → modal de projetos.
- Monitor do laboratório: "Veja como esta automação foi projetada" → fluxo DEMONSTRATIVO local; status explícito.
- Sala de reuniões: "Como trabalhamos" → etapas e orçamento.

## Erros a impedir
Inputs simultâneos, wheel causando teleportes, câmera atravessando vidro/parede, modal aberto mas personagem continua andando, NPCs atravessando mobília, repetição de prompts fora de alcance, foco perdido ao fechar modal, posição salva incorreta na troca de modo.
