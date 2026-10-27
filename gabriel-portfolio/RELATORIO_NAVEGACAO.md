# Caminhar e scroll — desenvolvimento e publicação

Implementado o pedido explícito de duas formas de navegar pelo mesmo cenário 3D, aproveitando a base existente. A publicação anterior continua inalterada. Nenhum commit, push, deploy ou cópia para `../gabriel/` foi realizado nesta etapa.

## Comportamento entregue

**Caminhar:** preserva WASD, setas, botões de toque, física e colisões. O mouse não desloca o mundo neste modo.

**Scroll:** a roda do mouse/trackpad acumula um destino de profundidade. O personagem avança/retorna com aceleração e câmera suave, sem mover a página verticalmente. A navegação usa o mesmo mundo, dois ambientes, progresso, conteúdos e atalhos. Em mobile, o gesto vertical sobre o cenário tem o mesmo efeito; ↑/↓ e Page Up/Page Down também funcionam com o cenário focado.

A posição não é reiniciada ao trocar de controle. Ao iniciar o percurso guiado fora do eixo central, o personagem entra gradualmente na faixa livre e contorna um plinto lateral quando necessário. A pausa e a perda de foco cancelam o destino pendente, evitando deslocamento residual ao continuar. O modo clássico preserva a forma de controle escolhida. Movimento reduzido elimina a interpolação do scroll.

O listener de roda só está ativo no modo Scroll e ignora diálogos, campos, gesto de zoom e rolagem predominantemente horizontal. Não há listener global permanente nem captura de teclado fora do cenário. Toque usa Pointer Events e permite o gesto de pinça; cancelamento interrompe a navegação guiada.

## Organização e decisões

- `src/components/ui/NavigationModes.tsx`: seletor acessível com estado anunciado.
- `SpatialJourney.tsx`: roda, gesto, teclado, ajuda contextual e integração com os controles existentes.
- `Experience.tsx`: mantém a escolha entre modo 3D e clássico.
- `spatial-engine.ts`: alternância de controle sem recriar o renderer/cena, destino guiado e pausa.
- `spatial-motion.mjs`: normalização de deltas (pixels, linhas, páginas), limites e condução testável com as colisões existentes.

Mantido o Three.js já integrado; nenhuma nova dependência foi necessária. O texto anexado foi lido como referência adicional. Esta entrega concentra-se no pedido de navegação: a revisão visual ampla, remodelagem do personagem e eventual migração para React Three Fiber/drei não foram realizadas nesta etapa e não são alegadas como concluídas. Os dois ambientes foram preservados, sem expansão.

## Verificação real

| Comando | Resultado |
| --- | --- |
| `npm run build` | Passou; compilação e geração das páginas |
| `npm run typecheck` | Passou |
| `npm test` | 10 testes passaram; nenhum falhou ou foi ignorado |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` | 15 testes passaram em 51,3 s; nenhum falhou ou foi ignorado |
| `npm run build:pages` | Exportação estática passou; não publicada |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` | Passou em 360, 768 e 1440 px, incluindo os dois controles |

Novas verificações: normalização de roda/trackpad, convergência e retorno, limites, contorno do plinto ao entrar na faixa central, movimento reduzido, wheel real do Chromium, continuidade ao trocar de controle, cancelamento da inércia ao pausar, retorno do modo clássico, teclado no modo Scroll, preservação de scroll do diálogo/zoom e gesto de toque via CDP. O teste unitário identificou um resíduo lateral ao centralizar; o controlador foi corrigido e chega ao destino com velocidade zero.

Axe não apontou violações nas telas avaliadas dos dois controles, modos clássico e diálogos; layouts e marcadores foram inspecionados nas capturas. Não se alega validação em hardware físico ou Safari. Não foram medidas novas notas Lighthouse/FPS.

Capturas reais:
- `test-results/dual-navigation-scroll-1000.png`
- `test-results/dual-navigation-scroll-390.png`
- `test-results/spatial-atrium-1440.png` (modo Caminhar)

## Revisão local

```bash
cd /workspace/landingpages/gabriel-portfolio
npm ci --cache /tmp/gabriel-npm-cache --no-audit --no-fund
npm run dev -- --hostname 0.0.0.0
```

O build de produção também pode ser iniciado com `npm run start -- --hostname 0.0.0.0`. Pare o servidor dev antes de builds/testes, porque compartilham `.next`. A exportação estática fica em `.next-pages/`, ignorada pelo Git, e não publica o site automaticamente.

Foto pessoal, contatos e integrações continuam como antes: a foto não é servida, o contato prepara apenas resumo local e não há ligação com produção/n8n. O endereço público anterior ainda não oferece os dois controles desta revisão.

## Autorização contínua de publicação

Após a entrega local, o usuário determinou: “sempre publique, porque preciso testar”. A autorização cobre publicar as alterações validadas deste portfólio no mesmo endereço público de testes, sem pedir confirmação a cada revisão. O fluxo foi registrado em `AGENTS.md`; a foto pessoal continua fora da autorização e dos artefatos. O refinamento visual amplo continua separado do pedido de dois controles.
