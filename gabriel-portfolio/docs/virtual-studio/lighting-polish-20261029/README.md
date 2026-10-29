# Polimento de iluminação e materiais — 29/10/2026

Continuação do escritório publicado em `a54f63cfb50957358fc0ca00e2086b567ccd0cad`. A publicação desta etapa usa essa base, preservando as revisões não aprovadas de Gabriel na branch local.

## Mudanças

- Luz indireta dos seis setores recalculada no Blender/Cycles CPU. Força do céu do bake: 0,35 → 0,60; luminárias existentes: 230 → 340 W; lavagem da recepção: 110 → 175 W.
- Mapas de luz continuam com 512 × 512 px e 128 amostras, preservando os canais de UV independentes, mapas PBR, alpha da vegetação e sombras de contato.
- Iluminação hemisférica existente mais neutra e suave nas sombras. Exposição ACES: 0,94 → 1,00 no fallback e 0,90 → 0,98 no PBR. Reflexos do ambiente PBR: 0,24 → 0,34; qualidade alta: 0,28 → 0,46.
- Filtragem anisotrópica limitada à capacidade do dispositivo, até 8× no desktop e 4× no celular. Modo econômico e renderização por software usam 1×. Mapas compartilhados não recebem atualizações repetidas; espaços de cor, UVs e repetição permanecem intactos.

Nenhuma nova luz em tempo real, novo pós-processamento ou geometria adicional. Triângulos, grupos de desenho e limites dos seis GLBs são exatamente iguais aos anteriores, verificados após decodificar os GLBs. O acréscimo total dos mapas comprimidos foi de **4776 bytes**. Veja `asset-comparison.json`.

As malhas, rig e animações de Gabriel e dos NPCs, planta, posições, arquitetura, móveis integrados, navegação, câmera e funcionalidades foram preservados. A luz altera naturalmente a aparência das superfícies e das pessoas; o personagem não recebeu nova modelagem nesta etapa. A landing page FR e o n8n não foram alterados.

## Comparação e limites

`index.html` apresenta um comparador deslizante de 11 enquadramentos: cinco de desktop, três de celular e três com shader PBR. As imagens são renders reais, sem fotografia de referência publicada e sem render sintético substituindo a cena do site. Os NPCs continuam em suas rotinas e podem mudar de pose. O perfil PBR foi forçado sob SwiftShader para testar os materiais; o ambiente da nuvem não oferece validação de FPS em GPU ou aparelho físico.

A primeira tentativa de captura usava pausa durante a troca de setor e sofreu uma corrida de atualização do estado. O comparador passou a aguardar o fim da transição, sem depender da pausa. Uma execução concorrente do teste Pages também excedeu a espera de 5 segundos pelo snapshot do rig; a versão final é validada sem concorrência com outros testes gráficos. Esses problemas do procedimento não foram usados para relaxar os testes do aplicativo.

## Reprodução

```sh
npm ci
npm run assets:lighting
npm run build:pages
npm run typecheck
npm run lint
npm test
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

`assets:lighting` preserva a palmeira leve e as cinco cadeiras de trabalho, gera todos os setores em diretório temporário e só promove os arquivos quando todas as conversões terminam. Não regrava planta, atores ou personagens.

Backup integral, incluindo arquivos não rastreados: `/workspace/artifacts/landingpages-before-lighting-polish-20261029.tar.gz`. SHA-256: `718ad2afdb2a80735ecda765c0fd13c0634b8efa20a0ed49c256b94de3121440`.

## Validação final

- Exportação Pages, TypeScript e lint: aprovados.
- Oito arquivos de testes unitários aprovados, incluindo filtragem sem alteração de UV/cor, idempotência de texturas compartilhadas e orçamento de filtragem.
- Pages aprovado em 360, 768 e 1440 px, com navegação, assets, seis setores e modo clássico.
- Cinco E2E aprovados: mapas no fallback e no shader PBR, analógico em retrato/paisagem e dois dedos com pausa/cancelamento/troca de modo.
- Onze enquadramentos antes/depois, sem erros de recursos ou shaders.
- Comparador interativo testado por HTTP em 390 px, com seleção de perfil e controle deslizante por teclado, sem transbordamento horizontal.
- Hashes dos personagens, rig/animações e dados de navegação preservados. Alterações no motor restritas à exposição, iluminação existente e filtragem de texturas.

Os testes de PBR são executados sob SwiftShader e não comprovam FPS em hardware de celular. O personagem continua sendo o modelo público anterior; sua revisão de cabeça permanece pendente.
