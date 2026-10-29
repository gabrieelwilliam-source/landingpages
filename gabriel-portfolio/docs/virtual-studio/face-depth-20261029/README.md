# Rosto, barba e leitura no celular — revisão local · 29/10/2026

Continuação da branch `visual-polish`, sobre `8c4f222`. [Comparador real antes/depois](index.html). Nenhuma reescrita, compra, serviço pago ou publicação.

## O que mudou

- Ajustes discretos de forma na base do nariz, bochechas e região acima dos olhos, mantendo a anatomia CC0, as UVs e o encaixe dos olhos existentes.
- Sobrancelhas e bigode deixam de depender de faixas grandes recortadas. Fios curtos modelados têm ponta afilada, direções variadas e sombra suave na pele.
- Barba com 128 mechas parciais, fibras curvas geradas de forma irregular, grisalhos distribuídos e fundo mais arredondado. A raiz é tratada separadamente para reduzir a borda rígida nas bochechas.
- Cabelo curto com recorte de densidade que revela a pele entre os fios. Sem coque, conforme a foto prioritária.
- O caminho software/móvel recebeu ajuste na cor/intensidade da luz hemisférica **já existente**. Não se acrescentou luz, sombra dinâmica, pós-processamento ou passe de renderização.
- O LOD mantém a cor suave de raiz já contida na pele e remove os fios pequenos das sobrancelhas/bigode. A proteção da íris, lábios e silhueta continua ativa.

A foto foi consultada visualmente. Nenhum pixel dela foi incorporado ao modelo, textura, site, Git ou ZIP. O rosto continua sendo uma adaptação estilizada de anatomia genérica; não é escaneamento nem cópia facial exata.

## Pipeline gratuito

`tools/refine_face_depth.py` faz os ajustes locais sobre a malha existente. `tools/groom_texture.py` gera as fibras curvas com NumPy, sem imagem externa. `tools/groom_avatar.py` mantém um atlas compartilhado e cria o grooming com o mesmo rig. `tools/build-character-lods.mjs` e `tools/strip-hero-microgeometry.mjs` produzem o modelo leve sem os fios de detalhe.

Reconstrução: `npm run assets:character`, com Blender 4.3.2/Cycles CPU e as dependências Node já existentes. Não houve instalação de pacote, asset novo de terceiro, assinatura ou API paga. O bake de pele compacto e a luz indireta dos seis setores, entregues antes, foram preservados.

## Custos e verificação

Os números finais dos manifestos e das capturas de WebGL são registrados junto às evidências. O completo mantém sete materiais e o leve um material sem texturas. O orçamento de **menos de 65 mil triângulos** no completo e **menos de 7 mil** no leve não foi elevado.

O teste `tests/hero-lod.test.mjs` exercita componentes desconectados de pelo próximos dos olhos/boca junto de uma barba conectada, íris e lábios. Ele confirma que a remoção do detalhe preserva as partes necessárias. Os 40 casos unitários foram executados no mesmo processo com `node --test --test-isolation=none tests/*.test.mjs`; isso evita que o isolamento de processos do ambiente esconda a contagem individual dos casos.

A suíte de navegador e a exportação estática são documentadas na matriz final abaixo. O teste completo preserva movimentos, controles móveis, galeria, simulações, rascunho, elenco fictício e modo clássico.

As imagens `before/after/low` usam o GLB real e a mesma câmera/luz em WebGL. As imagens do escritório vêm da aplicação. A entrada móvel registra o perfil automático de software real: sua resolução e a geometria do LOD são menores. O comparador não substitui esse resultado por concept art.

## Licenças e preservação

MakeHuman CC0 para anatomia, pele, olhos e componentes nativos; moletom de **Elvaerwyn, CC BY**, adaptado, com crédito no site e no pacote. O novo grooming, a textura de fibras e os ajustes locais são autorais. Os estofados e os demais assets preservados mantêm suas atribuições. [Licenças completas](../../../ASSETS_LICENSES.md).

Planta, colisões, dados do elenco, seis setores, 16 ossos, 11 ações, analógico, velocidade de 2,6 m/s e rascunho local preservados. Os GLBs dos ambientes e dos NPCs completos não foram reconstruídos nesta etapa. O logo continua idêntico ao arquivo original. Não houve alteração em produção/n8n, `../gabriel/`, raiz FR ou configuração de publicação.

Backup integral anterior, incluindo ignorados/não rastreados/Git: `/workspace/artifacts/landingpages-before-face-depth-20261029.tar.gz`. SHA-256: `6a3cfdd7fa6c4daf5af8a599dc81a080ab734935d5d753e532a71c1ff17f4101`.

## Limites

Continuam diferenças de identidade facial, cabelo/barba, expressão, arquitetura e iluminação em relação às referências. Não há animação facial por blendshapes ou mocap. O resultado exige avaliação artística; a geometria extra e os fios não o tornam fotorrealista. O modelo leve perde detalhe quando ampliado, como mostram as capturas. SwiftShader e emulação de toque/viewport não comprovam desempenho em GPU ou celular físicos. LCP é medição do DOM, não conclusão visual do canvas; estimativas de memória não equivalem à VRAM do driver.

O novo caso em `tests/hero-materials.test.mjs` verifica que o tile de couro cabeludo mantém uma superfície opaca contínua ao virar LOD, enquanto as outras áreas transparentes do grooming continuam sendo recortadas. O marcador `zaionOpaqueLodTile` acompanha o GLB e é validado junto dos assets. Isso evita converter o pontilhado do cabelo em milhares de bordas geométricas no modelo leve.

## Orçamento final de assets

| Medida | Antes | Agora |
|---|---:|---:|
| Gabriel completo · triângulos | 51.485 | 55.313 |
| Gabriel completo · bytes | 1.144.236 | 1.453.348 |
| Gabriel leve · triângulos | 6.739 | 6.882 |
| Gabriel leve · bytes | 123.196 | 123.888 |
| Materiais · completo / leve | 7 / 1 | 7 / 1 |

Mais geometria e entropia na textura aumentam o download do completo; essa troca está exposta, não é apresentada como otimização de peso. As dimensões e a quantidade dos mapas permanecem: ~34,3 MiB teóricos RGBA8+mipmaps para os mapas do avatar completo, excluindo buffers, driver, imagens CPU e os outros assets. O LOD continua sem mapas. Dados e hashes em [asset-budget.json](asset-budget.json) e nos manifestos de `public/models/`.

## Medição real por perfil

Fonte: [performance/metrics.json](performance/metrics.json), gerado por `CHROMIUM_PATH=/usr/bin/chromium node scripts/measure-face-depth.mjs`. CPU informada pela API: AMD EPYC 9V74 80-Core Processor, 5 threads expostas. Chromium headless/SwiftShader; emulação de viewport/toque, não aparelho físico. Amostras curtas de scroll ativo, sequenciais e com fases de NPC/carregamento diferentes; não são comparação controlada de ganho de desempenho.

### Viewport 1440 × 900

Cena pronta em 5.28 s; LCP DOM 188 ms. LCP não representa o canvas pronto.

| Qualidade | FPS médio | P95 frame (ms) | Draw calls | Triângulos | Mapas WebGL estimados (MiB) |
|---|---:|---:|---:|---:|---:|
| auto | 5.5 | 416.7 | 65 | 104.672 | 47.2 |
| low | 7.9 | 299.9 | 65 | 104.672 | 47.2 |
| medium | 1.6 | 850.0 | 72 | 242.528 | 77.9 |
| high | 1.5 | 916.7 | 73 | 303.707 | 77.9 |

### Viewport 390 × 844

Cena pronta em 2.90 s; LCP DOM 904 ms. LCP não representa o canvas pronto.

| Qualidade | FPS médio | P95 frame (ms) | Draw calls | Triângulos | Mapas WebGL estimados (MiB) |
|---|---:|---:|---:|---:|---:|
| auto | 19.3 | 116.6 | 44 | 68.437 | 33.6 |
| low | 24.8 | 66.7 | 60 | 88.060 | 44.6 |
| medium | 10.5 | 199.9 | 70 | 169.717 | 75.2 |
| high | 9.4 | 250.1 | 71 | 230.897 | 75.2 |

**Metas de 50–60 FPS desktop e ~30 FPS móvel não foram comprovadas.** O renderer software foi especialmente lento nos perfis detalhados. Esses resultados expõem o limite da máquina de testes, sem serem tratados como homologação de celular/GPU. No aplicativo, Leve/Automático e o modo clássico permanecem disponíveis. A estimativa de mapas considera alocações observadas na API WebGL e formatos float comuns; evita cobrar a cadeia de mipmaps duas vezes em storage imutável. Não inclui renderbuffers/driver nem equivale à VRAM total. O teste funcional completo anterior ao último ajuste de densidade está registrado separadamente em `evidence/full-suite-performance.json`.

## Matriz final de validação

| Item | Resultado |
|---|---|
| Integridade de assets, marca, rig/ações, limites de malha | aprovada |
| Lint, build de produção e TypeScript | aprovados |
| Unitários | 40 aprovados |
| E2E completos | 31 aprovados |
| E2E após último ajuste de densidade do cabelo | 6 aprovados: PBR/fallback, analógico/release/cancel e carregamento progressivo |
| Capturas reais | rosto/corpo/costas antes/depois, LOD e personagem PBR na aplicação |
| Exportação estática | aprovada em 360, 768 e 1440 px; sem erros de execução |
| Capturas da exportação | entrada desktop/celular com analógico e seis setores concluídas |
| Desempenho físico | pendente; medições de software publicadas acima, sem alegação de metas cumpridas |

Pacote: `/workspace/artifacts/zAIon-Rosto-e-Barba-Revisao-20261029.zip`. Extraia inteiro e execute `node INICIAR-REVISAO.mjs`, com Node.js gratuito. A exportação não exige `npm install` para visitar. Código, modelos, fontes de reconstrução e licenças incluídos; foto/moodboards, credenciais, backups, Git e node_modules excluídos. O iniciador escuta somente em localhost.
