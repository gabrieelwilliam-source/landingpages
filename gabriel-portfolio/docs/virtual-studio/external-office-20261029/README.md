# Integração dos assets externos — 29/10/2026

Atualização restrita ao escritório existente. A versão de publicação parte do commit público `4242e155553dd3e946ba133ffab3c42eebb4f84b`; a revisão local não aprovada do personagem e os estudos da cabeça permanecem separados e preservados.

## Seleção e conversão

| Asset | Origem recebida | Conversão e tamanho | Uso |
|---|---|---|---|
| Palmeira Livistona | USDZ de 4.140.154 bytes; hash confirmado | OpenUSD gratuito, Blender 4.3.2, glTF-Transform/Meshopt/WebP. Alta: 790.428 bytes / 15.376 triângulos. Web escolhida: 268.976 bytes / 5.274 triângulos | Um ponto existente junto à janela da recepção. Vaso com 36,4 cm de diâmetro, planta com 1,81 m de altura; vaso provisório de 80 cm e margem de colisão mantidos. |
| Cadeiras | FBX de 173.031.984 bytes; hash confirmado | 130 grupos, 2.081 malhas, 1.871.815 triângulos inventariados. Selecionado `Armchair_279`; GLB independente de 98.428 bytes / 9.290 triângulos | Cinco cadeiras das mesas do estúdio. Altura 96 cm; contato do assento aproximadamente 47,8 cm, coerente com a pose sentada atual. |
| NomadWaveUndercut | MHPKG de 178.144.135 bytes; hash e CRC confirmados | 30 arquivos; groom Unreal 5.7; 72.358 fios, 625.667 pontos. Não é um cabelo GLB nem uma base humana pronta | Não utilizado. Requer pipeline Unreal e conversão autorizada, e não corresponde ao cabelo rente do Gabriel. |

A primeira cadeira candidata (`Armchair_154` / Cordia) foi rejeitada após renderização por peças desalinhadas, rodas afastadas e custo excessivo. Não foi usada para substituir modelos funcionais. As poltronas e sofás licenciados existentes foram preservados.

Aquisição e autorização de uso/publicação declaradas pelo titular na conversa. Páginas de origem, nomes dos autores e termos não foram fornecidos; não se afirma licença CC0 nem verificação independente. Detalhes e hashes em `tools/vendor/external-office/ORIGEM.md`.

## Preservação e desempenho

Nenhuma alteração na arquitetura, colisões, planta, posições dos NPCs, câmera, analógico, velocidades, galeria, formulários, integrações ou animações humanas. Apenas os GLBs dos setores 0 e 2 mudaram. Materiais e UVs originais da vegetação foram preservados; normais importadas foram conservadas. Folhas usam alpha MASK e duas faces. A cadeira recebeu reparo das normais, pivô no chão, orientação para as mesas e materiais PBR discretos. A iluminação indireta e as sombras de contato dos dois setores foram recalculadas. A montagem consolida materiais na geometria dos setores, evitando milhares de objetos do FBX e novas solicitações em tempo de execução.

A versão de 5.274 triângulos da palmeira foi escolhida para o site por priorizar celulares. A versão de alta qualidade permanece disponível no pacote de análise. Os níveis gráficos, fallback para WebGL por software e modo clássico continuam ativos.

As capturas são renders reais do Chromium/Three.js. Os testes de tamanho móvel usam viewport/emulação, não aparelhos físicos. O ambiente da nuvem usa SwiftShader por CPU; tempos de frame desse ambiente não medem desempenho de GPU nem garantem FPS em um celular real. Os JSONs de evidência registram draw calls, triângulos e erros; NPCs e visibilidade podem variar entre quadros.

## Reprodução

Requisitos gratuitos: Node.js/dependências do projeto, Blender 4.3.2 com importação/exportação glTF. Os GLBs intermediários otimizados, necessários à montagem, ficam em `tools/vendor/external-office/`. O USD original pode ser auditado separadamente com `usd-core`/OpenUSD, sem depender do importador USD ausente nesta distribuição do Blender.

```sh
npm ci
npm run assets:external
npm run build:pages
CHROMIUM_PATH=/usr/bin/chromium npm run test:pages
```

`assets:external` gera os setores 0 e 2 em uma pasta temporária antes de promover os dois resultados e atualizar o manifesto. Não grava a planta ou os atores e não recria personagens. Depois de uma reconstrução geral com `assets:build`, execute `assets:external` para reaplicar estes assets.

Backup integral anterior à edição, incluindo arquivos não rastreados: `/workspace/artifacts/landingpages-before-external-assets-20261029.tar.gz`. SHA-256: `8172083b1cb94ab5e0b3ccd7a1cf15f1da7f8b01c35b453002aae86a71588dd3`.

## Resultados finais

- `npm run build:pages`, `npm run typecheck`, `npm run lint`: concluídos sem erros.
- `npm test`: sete arquivos de testes aprovados, incluindo os três testes de assets importados.
- `node tools/verify-assets.mjs`: seis cenas, nove humanos, rig/animações, mapas PBR, AO e iluminação indireta válidos.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages`: aprovado em 360, 768 e 1440 px; navegação, salas, assets e modo clássico, sem erros de runtime.
- Playwright, `mobile-joystick.spec.ts`: três testes aprovados; retrato, paisagem, dois dedos, câmera independente, cancelamento, pausa e troca de modo.
- Comparações reais de recepção/estúdio em 1440 e 390 px, sem erros de navegador.
- GLBs finais: recepção 450.260 bytes (antes 245.240), estúdio 608.276 bytes (antes 463.500). Acréscimo total de 349.796 bytes nos downloads dos dois setores.

| Captura | Draw calls antes/depois | Triângulos antes/depois |
|---|---:|---:|
| Recepção 1440 px | 73 / 75 | 303.707 / 333.253 |
| Estúdio 1440 px | 75 / 75 | 245.587 / 272.038 |
| Recepção 390 px | 50 / 50 | 77.460 / 101.944 |
| Estúdio 390 px | 64 / 64 | 98.579 / 125.030 |

São quadros pontuais do renderer por software, incluindo salas adjacentes e NPCs; não são estimativas de FPS em hardware real. A geometria aumentou para obter formas e folhas melhores, enquanto o número de draw calls ficou praticamente estável. A capacidade em aparelhos físicos continua sendo uma limitação desta validação na nuvem.

Veja `index.html` para o antes/depois e os JSONs de captura para o estado real da câmera, quantidade carregada e resultados. A comparação isolada da palmeira mostra a variante alta; o site usa a variante leve, documentada acima.
