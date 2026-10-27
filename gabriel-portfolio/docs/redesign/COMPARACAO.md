# Comparação visual — revisão local de 27/10/2026

As três referências visuais, os dois registros anteriores, a foto original, os logos e a referência do leão foram examinados. Referências são concept art, não modelos nem capturas da implementação. A foto privada não foi copiada para site ou evidências. O leão não foi inserido no cenário.

| Referência | Implementação observada nas capturas reais | Diferença que permanece |
|---|---|---|
| 01 — Hero/perspectiva | Personagem humano de costas, portal assimétrico, próximo ambiente visível em profundidade, palette grafite/bronze, texto lateral e checkpoints compactos. | Silhueta ainda estilizada; composição menos rica; não alcança a arquitetura e iluminação fotográficas da referência. |
| 02 — Ateliê/interações | Seis estações, monitores com capturas reais de conceitos existentes, galeria com três displays, detalhes e serviços legíveis em DOM. | Mobiliário e revestimentos mais simples; iluminação indireta e densidade visual inferiores. |
| 03 — Jornada/mobile | Seis áreas, swipe, atalhos horizontais, pausa, retorno e clássico. Gabriel e serviços web mantidos, sem copiar rosto/claims de IA da colagem. | Mesma arquitetura se adapta ao viewport, não replica a colagem. Ainda requer avaliação em aparelho físico. |
| Estado anterior | Substituídos avatar/arquitetura de execução por GLBs originais; novo rig, materiais, marca e interface. | O resultado continua estilizado; não deve ser vendido como reprodução premium integral dos conceitos. |

As imagens `final-*` são capturas integrais do Chromium headless. Nesse ambiente, o renderer de software ativa materiais Lambert sem mapas de superfície e reduz resolução; as capturas registram essa condição real, sem esconder os limites. `pbr-portal-software.png` é uma captura adicional do caminho PBR: teste instrumentado oculta apenas a extensão de diagnóstico do renderer para exercitar o outro caminho. Também usa software, não mede uma GPU física.

- Desktop: `final-portal-1440.png` (1440×900), `final-portal-1280.png` (1280×900).
- Mobile: `final-portal-390.png` (390×844), `final-portal-360.png` (360×844).
- Ambientes: `final-room-1.png` a `final-room-6.png` (1280×720).
- Orientação horizontal/painel/logo: `final-landscape-dialog.png` e `final-landscape-contact.png` (844×390).
- Performance: `performance.json`; cenário PBR: `pbr-check.json`.

O HTML independente `gabriel-redesign-comparacao.html`, entregue junto do ZIP, coloca todas as referências e capturas lado a lado, com identificação clara de fonte. Pode ser regenerado com:

```bash
python3 tools/build-review.py /caminho/Gabriel_3D_Redesign_Final /caminho/comparacao.html
```

Avaliação: navegação e interfaces verificadas; fidelidade artística **parcial**. Não considerar o requisito de semelhança facial/premium fotorrealista aprovado. Consulte a matriz e o plano de reparo em `RELATORIO_REDESIGN.md`.
