# Site zAIon — fluxo autorizado de publicação

O usuário autorizou continuamente a publicação das alterações deste portfólio para testar, na conversa de 27/10/2026: “sempre publique, porque preciso testar”. Após implementar e validar uma alteração, publique-a no mesmo GitHub Pages de testes, sem pedir novamente autorização de publicação. Uma instrução posterior do usuário pode suspender ou mudar esse fluxo.

Destino: https://gabrieelwilliam-source.github.io/Site-zAIon/gabriel/ . O usuário confirmou que esse endereço pode ser público. A autorização refere-se a este portfólio e ao mesmo destino de testes; não autoriza publicar a foto pessoal, dados privados, alterar outros projetos, conectar serviços pagos ou mexer na produção/n8n da zAIon.

Aproveite o checkout existente. Cada tarefa da nuvem já é isolada; não crie worktree sem solicitação. Preserve a landing page FR da raiz.

- Desenvolva em `gabriel-portfolio/`. O código é Next.js/TypeScript/Three.js; mantenha modo clássico, movimento reduzido, fallback e os seis ambientes aprovados.
- Valide as mudanças com os testes relevantes. Para mudanças de navegação: `npm run build`, `npm run typecheck`, `npm test` e `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`.
- Gere a exportação com `npm run build:pages` e valide com `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages`. Não rode o servidor dev, builds e testes de produção simultaneamente: usam `.next` internamente.
- A saída é `.next-pages/`. Preserve a versão anterior de `../gabriel/` em um arquivo recuperável fora do checkout antes de atualizá-la. Copie a exportação completa, removendo somente artefatos obsoletos desse destino.
- Revise o conjunto, faça commit das alterações deste portfólio e dos artefatos de `gabriel/`, e envie para `main` no remoto existente. O Pages usa `main` → `/` e `.nojekyll`; preserve essa configuração e os arquivos da landing page FR.
- Aguarde o build do GitHub Pages e confirme a versão pública por HTTPS. Um push sozinho não confirma a publicação. Informe o link de teste e o estado real.

A foto de referência está fora de `public/` e ignorada pelo Git. O formulário apenas prepara um resumo local, sem envio. Não invente contatos, clientes ou resultados profissionais. Não desative verificações TLS ou de integridade para instalar ou validar.

## Revisão atual de redesign
A etapa inicial do pacote Gabriel_3D_Redesign_Pacote_CodeX foi entregue sem publicação. Depois de receber a revisão, o usuário autorizou explicitamente: “pode publicar”. A publicação desta revisão no mesmo GitHub Pages de testes está autorizada. Preserve o backup, valide a exportação e confirme o deploy público. Não publicar a foto pessoal nem alterar outros projetos.

## Preferência atual — 28/10/2026: SEMPRE publicar
Após receber a revisão local, o usuário instruiu: “quero que você SEMPRE publique” e confirmou renomear repositório e endereço para `Site-zAIon`. A suspensão de publicação da etapa anterior terminou. Após implementar e validar cada alteração deste projeto, publique automaticamente, sem pedir nova autorização, salvo instrução posterior explícita do usuário em contrário.

Repositório atual: `gabrieelwilliam-source/Site-zAIon`. Nome exibido: `Site zAIon`. O prefixo do Pages é `/Site-zAIon/gabriel`; o checkout existente pode continuar em `/workspace/landingpages` para preservar o ambiente. Não alterar a landing page FR da raiz, foto privada, integrações ou produção n8n. Relatórios/ZIPs anteriores que dizem “sem publicação” são registros históricos da entrega anterior, não a instrução vigente.
