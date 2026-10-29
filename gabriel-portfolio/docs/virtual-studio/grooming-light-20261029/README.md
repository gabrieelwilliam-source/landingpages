# Acabamento, luz e sofá — 29/10/2026

Revisão local sobre `3f56847c6f6842f2edd233bf716b687059d862d3`, branch `visual-polish`. [Comparador antes/depois real](index.html).

## Personagem

- Cabelo curto recortado diretamente sobre a anatomia CC0, com linha de entradas curva, textura de stubble e espessura aproximada de 1 mm. Substitui o cap de cards com recortes irregulares. A foto pessoal permanece como referência privada; o coque do concept art não foi adotado.
- Barba com base conectada arredondada e **88 mechas curvas em camadas**, pontas/comprimentos variados e fios claros discretos. Sobrancelhas e bigode em superfícies ajustadas ao rosto, usando um recorte da textura CC0 `eyebrow001.png`. Um atlas RGBA compartilhado reduz o custo de materiais; o recorte alfa recebe cobertura de amostras quando o contexto desktop tem antialiasing.
- Mapas procedurais sutis de micro-normal e rugosidade na pele, tom menos lavado, íris dessaturada/escurecida e expressão de repouso com lábios menos abertos. Não se trata de escaneamento facial nem de cópia fotográfica da identidade.
- Ajuste suave de caimento do capuz; preservados rig, pesos e onze ações. A cor dos materiais PBR agora entra corretamente no albedo do LOD, com teste de regressão para primitivos que compartilham o material e alpha de origem opaco. A versão leve preserva olhos e região do bigode; os fios muito pequenos são retirados.

## Ambiente

- Sofá modular com **três estofados independentes** do SheenChair CC0, braços e encosto de apoio arredondados, duas almofadas e base de nogueira com quatro pés. Corrige o alongamento de uma única cadeira e a falta de massa/apoiamento de um sofá.
- Mesmas dimensões de circulação: aproximadamente **2,73 × 0,855 × 1,03 m**; banco/sofá conserva o nome técnico do arquivo para preservar os carregamentos e as posições dos NPCs. Fonte/materiais originais CC0 e geometria complementar autoral. AO original apenas nos estofados de origem; as peças novas não reutilizam o AO específico da cadeira.
- Uma luz direcional de preenchimento, sem sombra adicional, ajuda a revelar roupa e volumes no caminho PBR. No fallback por software essa luz fica fora da cena; usa-se um ajuste leve da luz hemisférica, preservando o custo do shader simples. Reflexão de ambiente sintético e exposição ACES recalibradas, mantendo o sol e as luminárias. É uma aproximação de iluminação indireta, não GI/path tracing. O bake de oclusão dos seis pisos da etapa anterior foi preservado.

## Orçamento dos assets

| Item | Antes | Agora |
|---|---:|---:|
| Gabriel completo: triângulos | 53.950 | 51.484 |
| Gabriel completo: bytes | 1.131.040 | 1.190.256 |
| Materiais completos | 8 | 7 |
| Gabriel leve: triângulos | 6.867 | 6.726 |
| Gabriel leve: bytes | 123.216 | 123.096 |
| Materiais leves | 1 | 1 |
| Sofá/banco: triângulos | 8.787 | 8.688 |
| Sofá/banco: bytes | 410.704 | 386.408 |

Mesmo rig de 16 ossos e onze ações em ambas as variantes. O verificador mantém os limites de 65 mil / 7 mil triângulos, normalização de pesos, compressão Meshopt/WebP, logo original e conteúdo não vazio dos mapas do piso. Novas verificações garantem que o mobiliário real cabe no espaço de suas colisões e permanece apoiado no chão. Os 17 GLBs de ambientes/pessoas/móveis somam **6.566.388 bytes**, além dos LODs.

## Preservação e limites

Navegação livre/guiada, retorno ao guia, oito funcionários virtuais fictícios, analógico, velocidade, câmera, galeria, simulações, acessibilidade e contato local preservados. Nenhuma publicação ou acesso a n8n/produção. A foto pessoal e os concept arts não integram Git, public ou ZIP. Logo original sem redesenho.

Ainda há diferenças de identidade facial, grooming, detalhamento arquitetônico e luz em relação às referências. O LOD perde microtextura e apresenta planos visíveis em close. O modelo completo tem materiais mais detalhados e maior custo de textura. As medições usam Chromium/SwiftShader e emulação móvel, sem garantia de desempenho em telefone ou GPU físicos.

Créditos completos em [ASSETS_LICENSES.md](../../../ASSETS_LICENSES.md) e no site `/creditos`: anatomia/pele/íris/textura de pelos curtos CC0; moletom **Elvaerwyn, CC BY**, com ajustes; estofados/materiais **Wayfair LLC / Eric Chadwick, CC0**; geometria complementar, scalp/barba e texturas procedurais do projeto. Nenhuma compra ou nova fonte externa. Dados-fonte e hashes em `tools/vendor/`.

## Execução e evidência

As capturas são WebGL dos GLBs reais ou do aplicativo, sem retoque ou render offline. Comparadores do personagem e sofá usam a mesma câmera/luz para antes/depois. `character-pbr-software.png` e `lounge-pbr-software.png` mostram o caminho PBR executado em software; as capturas de entrada/sectores mostram a exportação estática. Não são os concept arts usados como fundo interno.

Reconstrução: `npm run assets:character` e `npm run assets:furniture`. Para visitar a entrega, extraia o ZIP e execute `node INICIAR-REVISAO.mjs`; não precisa instalar dependências para abrir o site já compilado. Código editável: `npm ci` e `npm run dev`. O commit exato fica no `VERSAO.json` do pacote.

Backup integral anterior: `/workspace/artifacts/landingpages-before-grooming-light-20261029.tar.gz`, SHA-256 em arquivo adjacente. Revisão preservada na branch `visual-polish`, sem push.


## Validação da entrega

Lint, build e typecheck aprovados. **34 unitários**, incluindo a correção de cor/alpha do material móvel. **29 E2E** na rodada completa, cobrindo os seis ambientes, navegação, galeria, acessibilidade, contato sem envio e simulações. Após o ajuste final de pelos curtos e iluminação do fallback, **cinco E2E direcionados aprovados** (troca real de LOD, analógico retrato/paisagem, animação ativa e upgrade para PBR durante caminhada).

`npm run build:pages` e `npm run test:pages` aprovados em **360, 768 e 1440 px**. Capturas finais da exportação em desktop/móvel, dos seis setores e do caminho PBR (personagem e lounge) aprovadas. Rig, pesos, onze ações, compressão, cores, mapas, logo, fontes e dimensões do mobiliário verificados. As imagens antes/depois são do GLB real, sem retoque. O aviso de Draco do Blender não se refere ao codec de saída: todos os GLBs finais usam Meshopt.

Amostra final curta de animação ativa, Chromium 154 / ANGLE SwiftShader em 1000×760: **7.16 FPS**, p95 **250 ms**, **44 draw calls / 81,007 triângulos**, heap JS exposto ~38.2 MiB e ~4.73 MiB de recursos acumulados. Não comprova FPS em GPU/telefone físicos. Amostras curtas não sustentam comparação estatística de FPS com revisões anteriores.

Estimativa dos mapas do avatar completo em RGBA8 com mipmaps: **46,0 → 55,3 MiB**, antes/agora; não inclui render targets, alocações do driver, imagens decodificadas na CPU ou outros assets da cena. O custo extra vem do atlas compartilhado e dos mapas de pele, enquanto os materiais caem de oito para sete. O LOD usa **zero mapas de textura / um material**. Método e contagens em `asset-texture-budget.json`; esta estimativa não é memória medida de GPU.

| Critério | Estado / evidência |
|---|---|
| Cabelo/barba, pele, capuz e figurino | Implementados; comparação GLB fixo, PBR no aplicativo e inspeção do LOD. |
| Sofá sem alongamento e com apoios | Implementado; comparação 3D, captura no lounge e limites geométricos verificados. |
| Funções, móvel, clássico e acessibilidade | Preservados; 34 unitários, 29 E2E completos, cinco finais e exportação em três larguras. |
| Reprodução idêntica das referências | Parcial; diferenças de identidade, grooming, arquitetura e luz expostas. |
| FPS em telefone/GPU físicos | Pendente; apenas software e emulação neste ambiente. |
| Publicação | Não executada, conforme etapa de revisão local. |
