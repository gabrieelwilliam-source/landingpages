# Aproximação às referências — 29/10/2026

Revisão local sobre `77802c4`, sem publicação. [Comparativo real](index.html).

## Direção aplicada

As referências orientam a roupa escura, materiais táteis, luz quente, barba e composição. A fotografia pessoal continua prioritária para o cabelo curto com entradas, sem o coque da arte conceitual. A foto e os moodboards não foram colocados no Git, public ou ZIP.

Nesta etapa foram implementados:

- Atlas original de albedo 1024 × 512 com variação de pele, sombra orbital/nasal discreta e padrão de tecido; sem pixels fotográficos. Continua combinado com os mapas de normal/rugosidade e a paleta de vértices.
- Barba com comprimento e largura reduzidos, contorno inferior curvo e menos fios isolados; integração de pigmento na região do maxilar. Abertura dos olhos reduzida, calça mais ajustada e base dos tênis menos arredondada.
- Luz hemisférica mais quente no escritório, preservando o sol, a exposição e o orçamento de luzes existente. Nenhuma nova zona ou mudança de controles.
- No modelo leve, a cor do atlas é incorporada aos vértices antes da simplificação por região (rosto, extremidades e corpo), removendo a textura de albedo do LOD. Cabelo/barba de geometria miúda continuam removidos no LOD.
- Exportação explícita da paleta ativa no Blender. O verificador rejeita cores fictícias inteiramente brancas, evitando regressão de material.

## Custo medido do avatar

Modelo completo: **61344 triângulos**, 609400 bytes. Leve: **6704 triângulos**, 128896 bytes. Ambos continuam um primitive skinned, 16 ossos e 11 ações. O atlas completo tem aproximadamente 2 MiB em RGBA descomprimido, além de mipmaps; o LOD não carrega esse atlas.

## Limites da aproximação

**A qualidade cinematográfica da referência ainda não foi alcançada.** A anatomia facial continua genérica adaptada; roupas, sapatos e cabelo permanecem simplificados e não equivalem a modelos escaneados ou esculpidos profissionalmente. Não há iluminação global baked, face por blendshapes ou fotorealismo garantido. A revisão não deve ser apresentada como resultado final idêntico à referência.

As imagens `before/after/low-*.png` são WebGL do GLB real com a mesma luz e câmera; os arquivos `character-pbr-software.png`, `office-1440.png` e `mobile-analog.png` mostram o aplicativo. São capturas reais, sem retoque ou concept art disfarçada de execução. SwiftShader/emulação não validam FPS em GPU ou telefone físicos.

Fontes e custos: mesma anatomia CC0 já creditada, materiais e ajustes autorais, sem compra ou nova fonte externa. [Licenças](../../../ASSETS_LICENSES.md).

Reconstrução: `npm run assets:character`. Desenvolvimento: `npm ci` e `npm run dev`. ZIP: extraia e execute `node INICIAR-REVISAO.mjs`. O commit do pacote é registrado em `VERSAO.json`.

Backup integral antes desta etapa: `/workspace/artifacts/landingpages-before-reference-pass-20261029.tar.gz`, com SHA em `reference-pass-backup.sha256`. Nenhuma publicação ou alteração de n8n/produção.

## Verificação da entrega

Lint, typecheck, build e **33 unitários / 28 E2E completos** aprovados. Após a separação final das extremidades no LOD, passaram também cinco reexecuções direcionadas de gráficos e analógico. Exportação estática validada em 360, 768 e 1440 px. Capturas finais da exportação e do caminho PBR aprovadas; inspeção manual de rosto, corpo, costas, versão leve e escritório. Logs em `evidence/`.

O aviso do Blender sobre Draco indisponível não é o codec utilizado: os arquivos finais usam Meshopt, verificado junto com pesos, ossos, ações, cores reais e hashes.

Pacote: `/workspace/artifacts/zAIon-Referencia-Visual-Revisao-20261029.zip`. Fonte exata em `VERSAO.json`, iniciante local `node INICIAR-REVISAO.mjs`. Arquivos publicados `gabriel/`, `index.html` e `.nojekyll` preservados; nenhum push.
