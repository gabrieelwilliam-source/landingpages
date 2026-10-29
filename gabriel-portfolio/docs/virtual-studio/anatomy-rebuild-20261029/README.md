# Nova base humana e materiais do estúdio — 29/10/2026

Revisão local sobre `5f7a9c2584002b32610dbed2769c37ed1d5bb295`, branch `visual-polish`. [Comparador real antes/depois](index.html).

## Mudança visual

O personagem principal passa de anatomia genérica com roupa construída em volumes procedurais para uma combinação de morfologia masculina adulta, pele fotográfica genérica com UVs originais e figurino com modelagem e texturas próprias. O código adapta os dados licenciados ao rig existente; o aplicativo e suas funcionalidades foram preservados.

- Cabeça: dois morph targets CC0 de adulto masculino, proporções ajustadas ao corpo, albedo nativo de pele 2048px, olhos azul-cinza com esclera/íris e transparência corrigida, sobrancelhas e cabelo curto. A foto pessoal orienta o cabelo com entradas; o coque do concept art não foi adotado.
- Moletom escuro de Elvaerwyn, CC BY: ajuste de mangas, capuz, proporção e skinning; normal map e albedo. Jeans e tênis CC0, com retargeting e ajuste físico da base dos pés. As mãos usam a mesma pele nativa com seus UVs.
- Barba e mochila autorais preservadas e refinadas. Contorno da barba ajustado às bochechas, textura de fios ondulados e bigode mais denso; cabelo de geometria muito fina continua simplificado à distância.
- UVs dos objetos uniformizadas antes da união no Blender. Isso corrige a perda de UVs nativas que fazia texturas colapsarem em um único ponto durante a exportação.
- Piso dos seis setores com oclusão de contato pré-calculada em Cycles CPU, 512×512 por setor, UV secundária independente e intensidade 0,72. Mapas acompanham os móveis e os limites da arquitetura. O bake é estático e não substitui a sombra móvel do avatar/NPCs.
- Balcão de recepção com mármore escuro de veios procedurais, mantendo a planta, o logo original e os acabamentos azul-marinho/nogueira existentes.

## Celular e custo

O perfil leve fica disponível em paralelo ao PBR completo. A primeira variante que carregar libera a exploração; a troca mantém o rig, a ação e o tempo de animação. O novo E2E bloqueia o download do modelo completo, anda pelo analógico, depois libera o download e confirma a troca para alta qualidade durante a caminhada.

| Gabriel | Completo | Leve |
|---|---:|---:|
| Triângulos do arquivo | 53.950 | 6.867 |
| Bytes do GLB | 1.131.040 | 123.216 |
| Materiais / primitivas | 8 | 1 |
| Ossos | 16 | 16 |
| Ações / poses | 11 | 11 |

As costuras coincidentes da roupa leve são unidas antes da redução, preservando suas bordas e evitando fendas. O orçamento facial inclui a barba; olhos mantêm sua topologia.

O modelo completo troca o único material antigo por oito materiais para conservar a pele, olhos e roupas licenciadas. O LOD incorpora os albedos às cores dos vértices, remove os mapas e continua em uma primitiva. A topologia de íris/esclera é preservada antes da simplificação facial; o cabelo de cards é substituído pela pigmentação curta do couro cabeludo para reduzir recortes e custo. O verificador mantém os limites de 65 mil / 7 mil triângulos, pesos normalizados, clips reais, compressão e integridade do logo. O conteúdo completo dos 17 GLBs de cenas/personagens/móveis soma 6.531.468 bytes; LODs são arquivos adicionais.

## Referências, fontes e limites

Os renders de referência orientam o realismo de materiais, roupa, barba e escritório. Ainda há diferenças de identidade facial, grooming, mobiliário e iluminação: esta entrega não é um escaneamento de Gabriel nem uma reprodução idêntica do concept art. O albedo de pele é genérico e licenciado; não contém pixels da fotografia pessoal. Não há animação facial por blendshapes nem iluminação global completa baked; o novo bake é somente oclusão estática do piso.

A fotografia, moodboards e arquivos privados não integram public, Git ou ZIP. [Licenças completas](../../../ASSETS_LICENSES.md) e fontes individuais com hashes em `tools/vendor/native-human/SOURCES.json`. Moletom: **Elvaerwyn — elvs_hooded_sweat_jacket1**, CC BY conforme o original e o guia do editor. Anatomia, pele, olhos, cabelo, sobrancelhas, jeans e tênis: CC0. O site contém os créditos em `/creditos`.

## Evidência e reprodução

`before/after/low-*.png` são capturas WebGL do GLB real, com as mesmas câmeras e iluminação de inspeção. As imagens do escritório e do analógico são capturas do aplicativo. Não há render offline usado como prova de execução nem retoque. O antes do escritório é a captura histórica da revisão anterior; o comparador do modelo foi renderizado novamente com a mesma câmera. SwiftShader e emulação móvel não comprovam FPS em GPU ou telefone físicos.

Reconstrução: `npm run assets:character` e `npm run assets:build`, com Blender 4.3.2. Código-fonte e dados licenciados são incluídos no pacote. Para visitar o ZIP já compilado, extraia inteiro e execute `node INICIAR-REVISAO.mjs`; não exige npm install para a visita. O commit exato está em `VERSAO.json`.

Backup integral anterior a alterações: `/workspace/artifacts/landingpages-before-anatomy-rebuild-20261029.tar.gz`, com SHA-256 adjacente. Nenhuma publicação, push, alteração da landing page FR ou acesso a n8n/produção nesta etapa.


## Validação funcional

`npm run lint`, `npm run build`, `npm run typecheck`, `npm test`: aprovados; **33 unitários**. `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: **29 E2E aprovados**, incluindo caminhada durante download bloqueado, atualização do modelo em movimento, analógico retrato/paisagem, dois dedos, pausa, colisões, visita guiada, seis setores, galeria, simulações e rascunho sem envio.

GLBs: **seis ambientes, nove pessoas, nove variantes leves e dois móveis compartilhados**, com UV independente e conteúdo não uniforme do bake verificados. O aviso de Draco indisponível do Blender não é o codec usado; a saída usa Meshopt, verificado em todos os arquivos.

Amostra curta de animação ativa da revisão final em 1000×760, com SwiftShader: **8.11 FPS**, p95 **250.0 ms**, **45 draw calls / 81,247 triângulos** no instante registrado. Não é medição em GPU física nem comparação controlada com os concept arts. Há perda de detalhe na versão leve e maior custo de materiais no PBR; não se promete FPS em telefone real. Evidências em `evidence/`.


Após a correção final de olhos/cabelo/costuras no LOD, **cinco E2E direcionados aprovados** (troca de qualidade, analógico retrato/paisagem, desempenho e upgrade durante caminhada). `npm run build:pages` e `npm run test:pages` aprovados em **360, 768 e 1440 px**. Capturas finais de entrada desktop/móvel e PBR aprovadas. O comparador expõe também a ampliação do modelo leve.
