# Personagem e gráficos — revisão de 28/10/2026

Continuação de `f7b7b41`, na branch local `visual-polish`, sem publicação. [Comparador visual](index.html).

## O que mudou

- Barba com malha frontal conformada ao maxilar, borda superior contínua, volume arredondado e fios em tons castanhos/grisalhos. Substitui o volume cônico rígido e o bigode tubular anterior.
- Cabelo curto com entradas em uma superfície que segue o crânio por ray casting, com microfios. Cabeça ligeiramente mais larga, sobrancelhas finas, pálpebras discretas e tons de pele ajustados. A foto continua privada, sem textura fotográfica no modelo.
- Ombros menos elevados e mangas menos volumosas. Mochila com cantos arredondados, alças planas, costura e puxador de zíper. O figurino azul-marinho permanece.
- Atlas com pele e cabelo mais foscos. ACES mantido, exposição 0,90 → 0,94 e mais preenchimento hemisférico para melhorar a leitura do avatar e dos móveis; sem novas luzes, sombras extras ou efeitos pesados.
- LOD com redução separada do rosto e do corpo. Remove os microfios desconectados e mantém a silhueta da barba e do cabelo; rosto com limite de erro menor e bordas preservadas. Um único primitive skinned depois da junção.
- Analógico, dois dedos, velocidade manual de 2,6 m/s, seis zonas, contatos locais, modos e acessibilidade preservados. Ícones do cabeçalho centralizados.

## Custo do personagem

| Variante | Triângulos antes → depois | Bytes antes → depois |
|---|---:|---:|
| Completa | 58012 → 64464 | 552228 → 666028 |
| Leve | 4640 → 6060 | 104488 → 119652 |

Cada variante mantém **um draw call skinned, 16 ossos e 11 ações**. Geometria completa abaixo de 65 mil triângulos; leve abaixo de 7 mil. Mais detalhes têm custo: não se declara ganho de FPS. Não há validação em GPU física ou telefone real; capturas e testes usam Chromium/SwiftShader e emulação móvel.

## Capturas e limites

`before/after-face/body/back.png`: o GLB efetivo, em WebGL, com a mesma luz de inspeção e câmera. `low-*.png`: versão leve final, ampliada para expor a perda de detalhes. `character-pbr-software.png`: captura do aplicativo, no caminho PBR com renderizador por software. `office-1440.png` e `mobile-analog.png`: exportação final real.

Não há retoque de screenshots nem renders offline apresentados como aplicativo. O resultado continua **estilizado** e não equivale à foto ou às referências cinematográficas: cabelo, pele, barba e roupa continuam simplificados, sobretudo no LOD. Sem escaneamento facial, mocap ou blendshapes faciais. Nenhuma alteração de produção ou publicação.

## Execução e licenças

`npm ci`, `npm run dev`. Para reconstruir o avatar: `npm run assets:character` (Blender necessário apenas na reconstrução). Inspeção: `CHROMIUM_PATH=/usr/bin/chromium node scripts/inspect-hero.mjs`; aceita pasta de saída e um GLB anterior como argumentos opcionais. O comparador HTML pode ser aberto diretamente.

Anatomia CC0 MakeHuman previamente creditada; grooming/roupas/cores autorais, sem nova fonte externa ou custo. [Licenças](../../../ASSETS_LICENSES.md). Backup integral: `/workspace/artifacts/landingpages-before-hero-refinement-20261028.tar.gz`; SHA no arquivo adjacente `hero-refinement-backup.sha256`.

## Verificação final

Lint, typecheck, build normal, 33 unitários e **28 E2E completos** aprovados. Após a última melhoria no LOD facial, os cinco testes de qualidade/close e analógico foram repetidos e passaram. Os GLBs finais passaram pela verificação de rig, pesos, ações, um draw call, hashes, logo, WebP/Meshopt e limites geométricos. O Blender avisa sobre biblioteca Draco indisponível, mas este projeto usa Meshopt, efetivamente verificado nos arquivos finais.

PBR no aplicativo: aprovado, sem erros de página. Exportação estática: aprovada e testada em **360, 768 e 1440 px**; capturas adicionais da exportação final em desktop e móvel, com analógico visível. Logs em `evidence/`. Inspecionadas manualmente frente, corpo, costas, LOD e close dentro do escritório.

Pacote: `/workspace/artifacts/zAIon-Personagem-Refinado-Revisao-20261028.zip`. Contém fonte, site compilado, licenças, capturas, comparador e iniciador local. Extraia e execute `node INICIAR-REVISAO.mjs`; o commit exato fica em `VERSAO.json`. Sem push ou alterações em `gabriel/`, `index.html` ou `.nojekyll` publicados.
