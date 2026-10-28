# PROMPT DEFINITIVO — POLIMENTO VISUAL E PERSONAGENS DO ESCRITÓRIO VIRTUAL zAIon

Você está trabalhando no portfólio 3D do Gabriel, integrado visualmente à zAIon. O projeto e o escritório já existem. Não recomece do zero. Avalie primeiro o estado atual do repositório e o trabalho em andamento. Este documento complementa os requisitos anteriores, priorizando os novos moodboards anexados. Não assuma que a imagem conceitual é um render do site atual.

## Objetivo de aceitação
Entregar uma experiência de **escritório virtual 3D real navegável no browser**, visualmente coesa, habitada e utilizável como portfólio comercial; forte qualidade de ambiente, comportamento natural, navegação acessível e desempenho aceitável. Não basta compilar ou mostrar uma cena estática.

## Identidade e fidelidade
- Foto `referencias/03_FOTO_ORIGINAL_GABRIEL.jpeg`: referência prioritária para a identidade do protagonista: cabelo bem curto/rarefeito, barba longa cheia, olhos claros. Os moodboards gerados mostram cabelo preso e rostos diferentes: **não copiar essas características**. Não prometer likeness fotográfico se não for atingível; preferir likeness estilizado profissional consistente.
- Logotipo `referencias/04_LOGO_OFICIAL_ZAION_TRANSPARENTE.png`: aplicar o arquivo exato, mantendo ponte, pingo do i, cores e lettering. Não gerar outra versão.
- Paleta: azul-marinho/negro, madeira escura, dourado/latão em detalhes controlados, iluminação quente de fim de tarde. Evitar brilho exagerado e texto decorativo ilegível.

## Arquitetura e áreas
Preservar as áreas já implementadas, reorganizando o espaço como escritório plausível (sem corredores infinitos repetitivos):
1. Recepção: balcão bem modelado, logo oficial, recepcionista virtual, menu contextual para visita guiada, livre e modo clássico.
2. Desenvolvimento web: mesas diversificadas, telas de sites reais/autorizados, equipe codando, interação para ver projetos.
3. Laboratório de IA: visual de automações e integrações; telas com conteúdo demonstrativo verídico, sem expor endpoints ou segredos.
4. Sala de reuniões: mesa, cadeiras, painel, fluxo de briefing e CTA real configurável.
5. Convivência: sofas de escala crível, cafés e personagens conversando em loops variados.
6. Galeria/projetos: monitores com demos e descrição editável.
7. Área envidraçada e panorama: materiais realistas, reflexos discretos, proteção para evitar atravessar vidros, luz ambiental coerente com o entardecer.

## Qualidade gráfica que falta nas capturas atuais
- Substituir modelos primitivos (corpo cilíndrico, rostos simples, móveis-caixas, plantas chapadas) por modelos 3D otimizados de boa qualidade.
- Aplicar PBR real (texturas baseColor, normal, roughness, metalness quando apropriado), UV consistente, modelos com escala certa, sombras coerentes, ambient occlusion suave e tone mapping consistente.
- Piso, vidro, madeira, sofá, monitor, iluminação de teto, molduras e plantas devem ter materiais diferentes e críveis.
- Corrigir objetos suspensos, recortes, clipping, luzes atravessando pessoas, falhas de colisão, câmera dentro de paredes e repetição modular aparente.
- Evitar excesso de efeitos caros (SSR total, ray tracing, reflexos múltiplos) no navegador. Usar alternativas eficientes, lightmaps quando apropriado, ambiente HDRI otimizado, reflection probes ou materiais aproximados.
- O mundo deve ter composição e objetivos, não apenas mobília; pontos de interesse reconhecíveis e orientação sutil.

## Gabriel — personagem 3D
- Modelar/adaptar avatar humano com semelhança à foto original, proporções naturais e vestuário moderno discreto (ex.: moletom/casaco escuro), com rig e animações estáveis.
- Estados: idle com micro movimento, walk, turn, start/stop, interação, e transições suaves; pés sem deslizar de forma evidente; evitar penetração em chão/móveis.
- No modo livre: câmera terceira pessoa com ajuste de distância, ombro e colisão; sem cortar a cabeça. No modo guiado: scroll controla deslocamento da cena/progresso, **Gabriel fica aproximadamente ancorado no enquadramento**; não usar scroll vertical de páginas.
- Proporcionar opção de câmera e qualidade gráfica; respeitar movimento reduzido.

## Funcionários/NPCs
- Inicialmente 5–8, escaláveis conforme hardware: recepcionista, devs, designer, equipe de IA e visitantes. Variação real de roupas, poses, posições e animações; não clones idênticos.
- Rotinas determinísticas locais: sentar, digitar, levantar, andar em rotas seguras, conversar em pequenos grupos e olhar telas. Idle natural e sincronização escalonada para evitar movimentos robóticos.
- Proximidade + tecla E/toque para informações pertinentes; sem fingir conversa ao vivo com IA. Falas guiadas e conteúdo são roteirizados, identificados como demonstração, salvo integração real posterior aprovada.
- Não inventar funcionários reais, experiências ou cases verificados.

## UX e demonstrações
- Reduzir HUD persistente: manter navegação principal compacta, ajuda contextual sob demanda, progresso discreto e opção modo clássico.
- Hotspots somente perto de coisas relevantes; ativação com E ou toque e feedback claro; fechar com Esc e retornar foco para controle.
- Terminais abrem HTML/UI legível, com projetos e serviços editáveis em dados. Não usar textos minúsculos dentro de texturas como interface obrigatória.
- Respeitar fluxo de visita e descobrir informações sem caça a hotspots; todos os conteúdos também no modo clássico.
- Ambos: exploração livre WASD+mouse, visita guiada por scroll com mundo avançando em profundidade, além de navegação por toque.

## Engenharia e limites
- Manter stack atual: Next.js/TypeScript/React Three Fiber/Three.js e dependências já integradas; evitar reescrita desnecessária.
- Procurar assets gratuitos com licença comercial verificável; registrar URL, autor, licença e atribuição exigida para CADA asset externo. Sem baixar conteúdo sem licença ou usar marca comercial de terceiros sem autorização.
- Usar glTF/GLB e instancing, Draco/Meshopt/KTX2 quando compatível, LOD, culling, carregamento por área, limites de NPC e opção de qualidade Baixa/Média/Alta.
- Manter compatibilidade com mobile e fallback de modo clássico para WebGL indisponível. Evitar custos de API e serviços pagos.
- Não expor credenciais e não alterar integrações n8n ou produção da zAIon.
- Não publicar/deploy sem autorização.

## Execução
1. Auditar código, screenshots atuais e integração do projeto em desenvolvimento. Preservar git e preparar plano de alterações.
2. Identificar assets disponíveis e lacunas críticas; criar/obter licitamente modelos de qualidade. Se algum recurso não estiver disponível, implementar a melhor alternativa e explicitar limitação — não simular conclusão.
3. Polir recepção e avatar como padrão; aplicar padrão a todo o escritório, NPCs, áreas, interações e modo clássico.
4. Testar com Playwright ou ferramenta disponível, inspecionar screenshots REAIS em resoluções desktop e celular e corrigir problemas observados. Verificar console, performance, navegação, colisões, animações, links, acessibilidade, build/lint.
5. Entregar relatório com arquivos alterados, assets e licenças, links para capturas, pendências e instruções de execução; identificar com precisão os itens efetivamente concluídos.

## Critérios mínimos de aceite
- Ambiente coerente e navegável, sem personagens presos em objetos nem câmera passando por vidro.
- Avatar não mais representado por blocos/cilindros provisórios e com características fiéis à foto na medida possível.
- NPCs animados e distribuídos pelos setores, com pelo menos uma interação útil por ambiente.
- Scroll realmente avança pelo espaço, com Gabriel ancorado no enquadramento, e WASD oferece exploração livre independente.
- Conteúdo profissional acessível também pelo modo clássico.
- Qualidades gráficas adaptativas e navegação mobile funcional.
- Demonstrações e links reais somente se disponíveis; placeholders claramente marcados.
- Não há segredos no cliente/repo, nem deploy não autorizado.
- Entrega comprovada por screenshots reais e relatório, não só por screenshots geradas por IA.
