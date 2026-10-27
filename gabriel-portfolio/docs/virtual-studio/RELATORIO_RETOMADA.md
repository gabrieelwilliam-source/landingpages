# Retomada do Virtual Studio — 27/10/2026

## Estado preservado
O workspace finalmente ficou acessível. O checkout encontrado estava limpo na branch `work`, HEAD `888a3deaf299f84bca8d5f5f369bbeced7e7b888`. Criada a branch local `virtual-studio-20261027`, sem commit, push ou publicação. A consulta remota somente de leitura encontrou apenas `main` no mesmo SHA.

Backup integral antes das alterações: `/tmp/landingpages-before-resume-20261027.tar.gz`, incluindo `.git` e todos os arquivos do checkout, sem exclusões. Arquivo listado com sucesso pelo tar. SHA-256: `e167728794075cd13cdee30cbfa36393f61239bc02c3931371dcfd69d38f0215`.

A branch e o backup da execução anterior não foram encontrados neste checkout. Os arquivos `office-layout.json`, `office/motion.mjs`, `office/npc.mjs`, `office.test.mjs`, o gerador de escritório e as capturas `office-*` também não existem. O ZIP recebido contém briefing e referências, não código. Portanto esta entrega NÃO recupera nem certifica aquela implementação de seis setores contínuos/cinco NPCs/guia curvo.

## Alterações desta retomada
- `ContactDraftContext.tsx`: campos compartilhados apenas em memória, acima da troca entre clássico e 3D.
- `ContactForm.tsx`: campos controlados, limpeza explícita e aviso sobre recarga; resumo local, sem endpoint, armazenamento persistente ou envio.
- `Experience.tsx`: provider compartilhado; troca de modo não perde os campos.
- `SpatialJourney.tsx`: formulário acessível no painel de contato; CTA abre o painel, preservando pausa e foco existentes.
- `site.ts`: descrição atualizada do contato nos dois modos.
- `tests/contact-draft.spec.ts`: fechamento/reabertura, alternância, limpeza, recarga e ausência de POST.
- `scripts/test-pages.mjs`: verificação do formulário e preservação de campos na exportação estática, em três larguras.
- `docs/virtual-studio/brief/`: documentos do pacote original, preservados como material de referência. A foto pessoal não foi extraída para o projeto ou bundle.

## Validação
- Instalação congelada: `npm ci --no-audit --no-fund`, mantendo lockfile e verificações TLS.
- `npm run build`, `npm run typecheck`, `npm run lint`: passaram.
- `node --test --test-isolation=none tests/spatial-motion.test.mjs`: 11 testes passaram. No Node 24 desta máquina, `npm test` mostrou apenas o arquivo como unidade; a execução sem isolamento confirmou os 11 casos internos.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: 11 passaram (10 existentes e 1 novo). Cobertura: quatro larguras, acessibilidade, scroll reversível e avatar ancorado, caminhada, seis destinos antigos, foco e modais, histórico, pausa, movimento reduzido, WebGL indisponível, toque, leitura sem JS e rascunho.
- Os ajustes finais de texto e CTA são cobertos novamente na exportação estática; ver resultado abaixo.
- Capturas reais e performance em `validation/`. São da versão disponível, não do escritório descrito na execução perdida.
- Amostra Chromium headless 154, viewport 1000×760, 3,066 s: ~15 FPS, p95 83,4 ms, 23 draw calls e 38.327 triângulos. É medição da máquina de testes, sem promessa de desempenho real.

## Executar
No diretório `gabriel-portfolio`: `npm ci`, `npm run dev` para desenvolvimento. Para produção local: `npm run build` e `npm start`. Para exportação: `npm run build:pages` e `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages`. Não rode dev e builds/testes de produção ao mesmo tempo. `.next-pages` usa o prefixo `/landingpages/gabriel` e exige servidor HTTP; não abrir HTML por file://.

Instruções reutilizáveis de instalação e início foram salvas no rascunho de configuração do ambiente, sem mudar rede ou credenciais. Não foram publicadas/ativadas.

## Pendências importantes
É necessário recuperar o backup com o código não commitado ou reconstruir a evolução do escritório. Permanecem não comprovados: arquitetura contínua com teto/fachada, guia curvo e reconexão por caminho livre, câmera orientável, cinco NPCs animados, galeria com filtros, quatro simulações locais, seletor de qualidade e planta. Não substituir o pedido de recuperação por alegações de conclusão. As capturas atuais não são capturas definitivas desse escopo.

Assets 3D, logo e licenças existentes foram preservados, sem novos downloads de assets ou dependências. Consultar `ASSETS_AND_LICENSES.md` e `LICENSE_ASSETS.md`. Nenhum arquivo de `../gabriel` ou landing page FR foi alterado. Nenhum contato, cliente ou resultado foi inventado. Sem comunicação com sistemas de produção.

## Exportação final validada
`npm run build:pages` passou; `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` passou em 360, 768 e 1440 px, incluindo GLBs, hash do logo original, ambos os modos, campos compartilhados do contato, rotas de conceitos e favicon, sem erros HTTP/JavaScript. Capturas adicionais `validation/pages-contact-*.png`.

O pacote de retomada contém código, evidências e a exportação estática em `.next-pages/`. Não representa conclusão do escritório contínuo.
