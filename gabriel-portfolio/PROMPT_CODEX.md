# PROMPT PARA COLAR NO CODEX (COPIAR A PARTIR DAQUI)

Você é o desenvolvedor sênior responsável por ENTREGAR, e não apenas descrever, um portfólio público e comercial para Gabriel — desenvolvedor de sites, landing pages e soluções digitais, vinculado à zAIon como braço de web design/desenvolvimento.

## PRIMEIRA AÇÃO OBRIGATÓRIA
Leia integralmente `COMECE_AQUI.md`, `BRIEFING_E_PRD.md`, `CONTEUDO_E_POSICIONAMENTO.md`, `DIRECAO_VISUAL.md`, `CRITERIOS_E_TESTES.md` e `src/data/site.ts`. Depois audite o código existente. EVITE recomeçar do zero sem razão técnica. A base está incluída para acelerar a implementação; corrija, complete e refine.

## OBJETIVO PRINCIPAL
Publicar futuramente um site que pareça CRIADO POR UM ESTÚDIO HUMANO DE ALTO NÍVEL, não um render genérico de IA. Inspirar-se na ideia de percurso interativo do site https://www.pvwebprojects.com/pedro/ sem clonar assets ou layout, com um avatar 2D autoral do Gabriel, progressão por seções, mecânicas leves de plataforma e alternativa de leitura convencional.

## PERFIL / FATOS APROVADOS PARA REDAÇÃO
- Nome de apresentação: Gabriel (sobrenome não confirmado).
- Área: programação, IA, automações, criação de sites e landing pages.
- Vinculação: zAIon, empresa/ecossistema de automações e soluções digitais.
- Local de atuação: Joinville/SC com atendimento remoto possível (não afirmar clientes atendidos).
- Foto fornecida em `public_gabriel_foto_original.jpg` (USAR SOMENTE como referência de aparência; solicitar aprovação antes de publicar a foto real).
- Aparência do avatar: cabelo curto, barba longa, olhos claros, traço 2D minimalista, roupa casual escura. Não criar retrato hiper-realista ou fantasia sci-fi.
- Não inventar idade, currículo, certificações, projetos comerciais realizados, depoimentos, preços ou contatos.

## PRIORIDADES DE EXECUÇÃO
P0. `npm install`, `npm run build` e correção dos erros reais; validar acessibilidade e modo leitura.
P0. Substituir o avatar provisório por arte SVG vetorial 2D ORIGINAL com estados parado, andando e pulando e respeitar prefers-reduced-motion.
P0. Refinar arte-direção sóbria: tipografia, malha/grid, estruturas arquitetônicas planas, navegação compreensível, ouro usado com parcimônia. Sem imagens genéricas de IA, sem brilhos exagerados.
P1. Evoluir o modo explorar para um percurso horizontal de verdade (navegação com setas/A-D, espaço para pular, colisões simples e checkpoints), mantendo todo o conteúdo legível via HTML e modo clássico.
P1. Criar páginas de caso por projeto com tela de demo/conceito, sem fingir que há clientes reais. Se não houver links validados, NÃO criar href falso.
P1. Implementar formulário de contato com validação e estratégia segura: sem backend/configuração, exibir instrução clara, sem prometer envio. Só integrar serviço real quando houver credenciais aprovadas.
P1. Meta tags, OpenGraph, favicon SVG original, sitemap/robots se apropriado, performance em dispositivos modestos e páginas sem JS significativo.
P1. Testes unitários/funcionais onde viável, checklist manual documentado e README final.
P2. Preparar evolução opcional Phaser apenas se necessário depois de validar a versão leve; evitar dependência pesada prematura.

## EXPERIÊNCIA
- Desktop: CTA "Explorar" entra no modo gamificado; jogador usa ← → ou A/D, espaço para pular; o avatar percorre fases associadas a Sobre, Serviços, Projetos, Processo, zAIon e Contato. Marcadores de progresso e atalhos de seção visíveis.
- Mobile: D-pad acessível e/ou swipe, botão Pular; ausência de travamento de scroll, botões grandes; fallback para modo leitura.
- Modo Leitura: site clássico acessível; links e textos não dependem de colisões ou jogos.
- Garantir alternância de modo sem perda do contexto da seção.
- Cada fase termina com uma interação real: ler seção, abrir projeto, acessar formulário ou, onde há URL verificada, seguir link.
- Opção para pausar/reduzir animação; sem sons automáticos.

## DIREÇÃO COMERCIAL
O objetivo é atrair compradores de sites, landing pages e soluções digitais e ao mesmo tempo funcionar como portfólio para recrutamento. Apresentar o Gabriel com competência técnica, SEM credenciais fabricadas. CTA "Solicitar um projeto" e "Ver trabalhos". zAIon como chancela discreta, não como protagonista que apaga a identidade do Gabriel.

## DADOS & SEGURANÇA
Todo dado editável fica em `src/data/site.ts` ou arquivo equivalente. O site deve funcionar mesmo sem contatos definidos, com CTA de contato interno em vez de WhatsApp fictício. Nunca expor credenciais; não tocar no n8n ou produção da zAIon; não publicar sem confirmação explícita. Não remover/alterar outros projetos existentes na pasta/repositório do usuário.

## ENTREGÁVEIS EXIGIDOS
1. Código funcionando (`npm run build` passando).
2. Design responsivo, acessível e consistente, sem depender de imagens IA.
3. Personagem 2D original e navegação jogável, ou documentação honesta do que falta se houver restrição.
4. Copy em pt-BR, campos pendentes claramente enumerados.
5. README atualizado de instalação, configuração, testes e deploy.
6. Relatório `RELATORIO_EXECUCAO.md`: realizado vs não realizado, testes com evidências, pendências reais.

Não peça esclarecimentos sobre dados não bloqueantes: use placeholders honestos. Não diga que realizou deploy, rodou testes ou integrou sistemas se não houver provas. Ao fim, entregue o estado exato do repositório e comandos verificados.
