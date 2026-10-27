# Gabriel · jornada espacial 3D

Demonstração local de **dois ambientes conectados**: Átrio de ideias (Sobre Gabriel) e Atelier digital (Serviços). O personagem percorre o eixo de profundidade, com câmera em terceira pessoa. A expansão para os outros ambientes fica suspensa até a validação desta experiência.

**Esta demonstração não foi publicada.** O site público continua na versão anterior; `../gabriel/` contém os artefatos dessa publicação e não foi alterado. Não fazer push, copiar a nova exportação para essa pasta nem realizar deploy sem nova autorização.

## Rodar e revisar

Node 22/24 e npm. Nesta máquina: Node 24.19.0, npm 11.9.0, Next 15.5.28 e Three.js 0.186.1.

```bash
cd /workspace/landingpages/gabriel-portfolio
npm ci --cache /tmp/gabriel-npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
```

Use o checkout existente: cada tarefa da nuvem já é isolada; não criar worktree sem solicitação. A landing page FR da raiz deve permanecer preservada.

## Controles

- Clique/foco no cenário, depois **W/S** ou ↑/↓ para avançar/retornar em profundidade e **A/D** ou ←/→ para deslocar lateralmente.
- Botões de toque permitem caminhar sem teclado; capturam o ponteiro e param ao soltar/cancelar, mesmo fora do botão.
- **P/Esc** ou Pausar exploração congelam a jornada, inclusive a transição. Perda de foco da janela/aba pausa a exploração; retome pelo botão.
- Atalhos 01/02 fazem uma travessia de aproximadamente 1,65 s, centrando o personagem antes da passagem. A câmera acompanha com amortecimento exponencial; não depende do scroll.
- Os marcadores junto aos objetos abrem painéis HTML. O painel prende foco de forma nativa, pausa o mundo e fecha com Escape, retornando o foco ao cenário.
- **Movimento reduzido** respeita o sistema e pode ser alternado: remove balanço dos membros, interpolação da câmera e travessia animada; a navegação continua utilizável.
- **Modo clássico** recupera o capítulo atual e mantém todo o conteúdo original, incluindo os conceitos e o formulário local. Voltar à jornada mantém a posição, ou leva ao ambiente correspondente se a seção de leitura mudou.

O percurso termina no segundo ambiente, em 100%. É possível voltar a pé, por atalho ou acessar o modo clássico. Não há portas falsas para ambientes ainda não construídos.

## Verificar

Pare o servidor dev antes do build. Os fluxos usam `.next` e não podem executar simultaneamente.

```bash
npm run build
npm run typecheck
npm test
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

A suíte funcional inicia o servidor de produção quando a porta está livre. O navegador Chromium do sistema está disponível; em outra máquina, instalar o navegador oficial com `npx playwright install chromium`, mantendo TLS e verificações ativos.

Para revisar o build: `npm run start -- --hostname 0.0.0.0`. Os processos não são preservados em futuras tarefas.

A exportação para GitHub Pages pode ser **validada localmente**, sem publicação:

```bash
npm run build:pages
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

A saída estática fica em `.next-pages/` (ignorada pelo Git), com prefixo `/landingpages/gabriel`. O exportador também usa `.next` internamente; não rodar em paralelo com outro fluxo Next. Não copiar para `../gabriel/` nem enviar ao remoto sem autorização.

## Arquitetura e desempenho

- `src/components/Experience.tsx`: seleção de modo e contexto. O HTML clássico é pré-renderizado e funciona sem JavaScript.
- `src/components/SpatialJourney.tsx`: controles acessíveis, progresso, atalhos, painéis e fallback.
- `src/lib/spatial-engine.ts`: Three.js carregado por importação dinâmica somente na exploração; câmera, rig original de Gabriel, dois cenários e descarte de recursos.
- `src/lib/spatial-motion.mjs`: aceleração/desaceleração, limites, normalização diagonal e colisões simples de passagem/plintos.
- `src/components/ClassicPortfolio.tsx`: leitura convencional responsiva. As seções existentes continuam disponíveis, sem se tornarem novos ambientes 3D.
- `src/data/site.ts`: conteúdo editável, ambientes e pontos de interação.

Geometria procedural com poucos polígonos, materiais compartilhados, sem modelos externos, imagens IA, pós-processamento ou sombras em tempo real. O atelier completo é construído ao aproximar-se da passagem ou selecionar o atalho; inicialmente há apenas sua silhueta. Pixel ratio limitado a 1,25 em telas pequenas e 1,5 nas demais. Desenhos param em repouso após a câmera assentar; atualizações de HUD são limitadas e publicadas somente quando há mudanças. Recursos GPU e listeners são liberados ao sair do modo 3D. Falta de WebGL e perda de contexto apresentam acesso ao modo clássico.

## Dados e limites

A foto de referência permanece fora de `public/`, ignorada pelo Git e ausente da cena. O avatar 3D é uma representação low-poly autoral, sem modelo fotográfico. Não há serviços de produção ou n8n conectados. Contato prepara somente um resumo local: não transmite nem armazena dados em servidor. Projetos existentes continuam rotulados como conceitos.

Bio, serviços, contatos e domínio final ainda dependem de validação editorial. A demonstração mantém indexação bloqueada. Performance e compatibilidade em celulares físicos/Safari e validação com leitor de tela devem ser revisadas antes de expandir. Consulte `RELATORIO_DEMO_3D.md` para evidências e pendências desta versão; `RELATORIO_EXECUCAO.md` registra a entrega e publicação anteriores.

## Atualização da autorização

Depois da revisão local, o usuário autorizou a publicação desta demo no endereço **público** do GitHub Pages. Os 33 artefatos de `.next-pages/` foram preparados para substituir a versão anterior em `../gabriel/`. O acesso não é exclusivo e `noindex` não é controle de acesso. A autorização vale para a demonstração de dois ambientes, sem a foto pessoal. A confirmação da publicação será registrada no relatório após a verificação externa.
