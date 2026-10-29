## 2026-10-29 — luz indireta e atlas compacto (revisão local)

- Seis setores com bake difuso indireto em Cycles CPU, lightMap no PBR/Lambert e UVs de detalhe preservados.
- Correção do sheen azul-marinho/areia e recalibração das fontes de luz PBR.
- Atlas CC0 de pele para cabeça/mãos em 1024/512/256 px; estimativa dos mapas do avatar reduzida em 21 MiB.
- Validação de canais UV após compressão, conversão idempotente e testes reais de qualidade/carregamento.
- Ferramentas gratuitas, mesmos controles e conteúdo. Relatório: docs/virtual-studio/baked-light-20261029/.

# Changelog

## 2026-10-27 — Reconstrução para revisão, sem publicação

- Substituído o personagem procedural de execução por GLB original com skin, 16 ossos e ações Idle/Walk/Turn.
- Criados seis cenários GLB distintos em Blender: portal, átrio circular, ateliê, galeria, laboratório e terraço. Passarelas conectam as áreas.
- Acrescentadas texturas originais, materiais PBR, probe de iluminação, transparência e o logo original da zAIon.
- Mantidos Scroll com avatar ancorado, Caminhar com câmera de acompanhamento, progresso reversível, atalhos, pausa, histórico e modo clássico.
- Refeita a interface em grafite/bronze; navegação compacta e enquadramento adaptado ao celular.
- Implementados carregamento progressivo, recorte de cenas distantes e caminho gráfico simplificado para renderizadores de software.
- Atualizadas colisões e tempo de simulação; mantidos projetos conceituais e contato local, sem envio fictício.
- Adicionados pipeline de assets, manifesto verificável, capturas reais, medição e relatório de comparação. Consulte RELATORIO_REDESIGN.md para resultados e limites.

Versões anteriores permanecem no histórico Git e nos relatórios históricos. A revisão não substitui `../gabriel/` e não foi enviada ao remoto.

## 2026-10-27 — Publicação de testes autorizada

- Após revisar a entrega local, o usuário autorizou explicitamente a publicação no mesmo GitHub Pages.
- Exportação validada, com backup da versão pública anterior fora do checkout. Permanecem as limitações visuais documentadas no relatório de revisão.
