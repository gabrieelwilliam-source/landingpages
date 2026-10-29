# Luz indireta e atlas compacto — revisão local · 29/10/2026

Continuação da branch `visual-polish` sobre `70a65e9`, preservando o escritório existente. [Comparador de capturas reais](index.html). Nenhuma publicação, push ou alteração na pasta pública de testes nesta etapa.

## Resultado

Os seis setores receberam mapas de **luz difusa indireta calculados no Blender/Cycles CPU**, incluindo a contribuição das luminárias, céu e sol de fim de tarde. A luz tem variação espacial sobre paredes, teto, bancadas e grandes móveis; os mapas de normal, rugosidade e AO do piso continuam separados. O PBR recebeu ajuste de luz ambiente e luzes locais, e o sheen dos estofados foi corrigido para azul-marinho/areia. O mapa não transforma as superfícies em emissoras.

A pele licenciada da cabeça/mãos foi reprojetada para atlas de **1024² de cor, 512² de normal e 256² de rugosidade**. Mantém os sete materiais, anatomia, grooming, figurino e animações da revisão anterior. Esta mudança reduz memória preservando a aparência; não é uma nova identidade facial. A triangulação na exportação varia ligeiramente após a união dos UVs. A variante leve continua com um material e sem mapas.

| Asset | Antes | Agora |
|---|---:|---:|
| Gabriel completo · triângulos | 51.484 | 51.485 |
| Gabriel completo · bytes | 1.190.256 | 1.144.236 |
| Gabriel leve · triângulos | 6.726 | 6.739 |
| Gabriel leve · bytes | 123.096 | 123.196 |
| Mapas do avatar · estimativa RGBA8 + mipmaps | 55,3 MiB | 34,3 MiB |
| Arquitetura dos seis setores · bytes | 1.668.160 | 1.873.164 |

A estimativa de mapas do avatar caiu **21 MiB (~38%)**. Os seis novos mapas de luz de 512² exigiriam até **8 MiB RGBA8 com mipmaps**, se todos fossem carregados. Esses valores não são memória total do aplicativo nem uma medição de VRAM: excluem driver, buffers, render targets, imagens CPU e outros assets. Arquivos comprimidos e memória expandida são métricas diferentes. Método em [texture-budget.json](texture-budget.json).

## Pipeline gratuito e reproduzível

Sem novas dependências, compras, assinatura ou serviço pago: Blender/Cycles, Python/NumPy, Three.js/TypeScript e as ferramentas de assets já instaladas. Não houve download de HDRI, modelo ou animação nova. O custo de computar os bakes é offline, na máquina de desenvolvimento.

- `npm run assets:character`: inclui `tools/bake_skin_atlas.py` após o grooming existente; preserva pesos e cores por vértice.
- `npm run assets:build`: inclui `tools/bake_office_light.py`, com 128 amostras, quatro bounces e filtro de baixa frequência em espaço linear, antes da exportação/compressão.
- `npm run assets:furniture`: reaplica a adaptação licenciada e a correção da cor do sheen.
- `node tools/verify-assets.mjs`: verifica mapas, canais UV, compressão, rig/ações, fontes e orçamentos sem elevar limites.

O glTF usa `emissiveTexture` como **transporte** do mapa, marcado por `zaionIndirectLight`; `src/lib/office-lightmaps.mjs` move-o para `lightMap`, preservando canal e espaço de cor. O otimizador pode remover UVs sem uso: o canal final pode ser 0, 1 ou 2 e fica registrado em `zaionLightmapUV`. Cada mapa deve ter coordenadas independentes de qualquer mapa de detalhe existente. Visualizadores glTF genéricos precisam dessa mesma interpretação para reproduzir o resultado. No runtime, as telas/letreiros continuam com sua emissão original. O fallback Lambert também usa o mapa de luz.

## Verificação

| Verificação | Resultado |
|---|---|
| Lint, build de produção, TypeScript | aprovados |
| Unitários | 38 aprovados |
| E2E completos | 31 aprovados |
| Revalidação final após ajuste do metadado UV e diagnóstico de fontes | 2 E2E de iluminação aprovados |
| Exportação estática | aprovada em 360, 768 e 1440 px; sem erros de execução |

Os novos casos cobrem UVs 0/1/2, idempotência da conversão, emissão legítima preservada, PBR e fallback sem erros de shader, troca de qualidade, rig e carregamento de outro setor. A suíte completa mantém analógico, velocidade, câmera, navegação, ações, galeria, simulações, contato e clássico. Evidências brutas em `evidence/`. O ensaio de performance da suíte completa passou; o diretório temporário foi limpo pela revalidação direcionada, por isso não se republica um JSON antigo como medição atual.

A comparação do personagem usa GLB real com câmera/luz fixas. `baseline-reception-pbr.png` preserva o estado anterior do escritório; `before-reception-pbr.png` isola apenas a troca do setor zero na configuração final. Os arquivos `*-pbr-software.png` e recepção exercitam PBR em SwiftShader, ocultando a identificação do renderizador; **não são uma GPU física**. A exportação e o celular usam o caminho software normal. As capturas não são os concept arts enviados.

## Preservação, licença e limites

`src/data/office-layout.json` e `src/data/studio-actors.json` continuam byte a byte iguais ao início desta etapa. Seis setores, oito NPCs fictícios, rig de 16 ossos/11 ações, colisões, visita guiada, analógico e velocidade de 2,6 m/s mantidos. O rascunho continua somente em memória, sem envio. Nenhum segredo, foto privada ou moodboard incorporado ao site ou pacote.

Anatomia/pele/olhos e outros componentes MakeHuman continuam **CC0**. Moletom de **Elvaerwyn, CC BY**, adaptado; crédito no site e pacote. Estofados **Wayfair LLC / Eric Chadwick, CC0**; bake de iluminação e geometria complementar autorais. [Licenças e fontes completas](../../../ASSETS_LICENSES.md).

Ainda há diferenças de identidade facial, cabelo/barba, arquitetura, reflexos e animação em relação às referências. A luz estática acrescenta indireta difusa; não é path tracing em tempo real, nem GI especular completa. Não há escaneamento facial, mocap ou blendshapes faciais. Navegadores usam software e emulação móvel nesta máquina: não se promete FPS ou qualidade aferida em telefone/GPU físicos.

Backup integral anterior, incluindo Git/ignorados/não rastreados: `/workspace/artifacts/landingpages-before-baked-light-20261029.tar.gz`. SHA-256: `9f5ab5d2d819789560e6063da1afae1779f28a72a5c9ed653c64dcf5336887b0`.

Pacote de revisão: `/workspace/artifacts/zAIon-Luz-Precalculada-Revisao-20261029.zip`. Extraia inteiro e execute `node INICIAR-REVISAO.mjs`; Node.js é gratuito. Código-fonte, exportação e licenças incluídos. Veja o registro final de validação do pacote nas evidências.

Capturas finais: recepção antes/depois, personagem PBR próximo, lounge, entrada desktop, entrada móvel com analógico e seis setores. A entrada móvel registra o perfil automático/software real, cuja resolução e detalhe são reduzidos. No menu, Alto preserva o modelo completo; a disponibilidade e o desempenho do PBR dependem do dispositivo.
