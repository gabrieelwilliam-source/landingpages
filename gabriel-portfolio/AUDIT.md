# Auditoria — Polimento Visual Profissional

Base: commit `cd9cdb55738e596e0aac917fcac55b72a50b8701`, versão pública anterior. Revisão local na branch `visual-polish`, sem publicação. Backup integral anterior a alterações: `/workspace/artifacts/landingpages-before-professional-polish-20261028.tar.gz`; SHA em arquivo adjacente.

## Stack e funcionalidades existentes

Next.js 15.5.28, React 19.1, Three.js 0.186.1 diretamente (sem R3F/Drei), TypeScript 5.9, Node.js 24, Blender 4.3.2. glTF-Transform 4.5 e Meshoptimizer 1.3; GLBs com Meshopt e WebP embutido. Seis setores em edifício longitudinal, oito NPCs fictícios e Gabriel com rig de 16 ossos e onze ações. Navegação livre, scroll ancorado reversível, retorno ao guia por A*, câmera orientável, modo clássico, toque, pausa e movimento reduzido. Galeria e quatro simulações locais, sem produção. Rascunho de contato compartilhado em memória, sem envio. Rodada anterior: 29 unitários, 24 E2E e exportação em três larguras aprovados.

## Defeitos confirmados por inspeção de código e imagem

- Suspensão de luminária usa cabo no centro e orientação longitudinal inadequada; numerosas barras de teto em ambos os eixos produzem sobreposição e repetição. Altura 3,48 m faz as barras parecerem atravessar o plano visual do personagem em algumas perspectivas.
- Cadeiras são montagens de volumes separados; parte do encosto/lombar não participa da rotação da cadeira. Sofás, braços e costas têm silhueta muito retangular.
- Gabriel tem rosto e roupas contínuos, mas anatomia facial, cabelos e dedos seguem estilizados. Mais polígonos na revisão anterior não produziram semelhança proporcional ao custo. Atlas PBR não substitui topologia anatômica.
- Seis mesas idênticas no estúdio e quatro no laboratório, mesma altura e disposição; eixo de 90 m reforça corredor. Divisórias de vidro já abriram a visão, mas teto não distingue funções.
- Sol/ambiente e luzes acompanham o avatar e a exposição dos materiais tem diferenças fortes entre caminhos PBR e software. Calibração de pedra em runtime evita brilho excessivo, sem resolver todos os tons lavados.
- HUD tem painel editorial, hotspots, navegação de capítulos, atalhos, pausa, ajuda, progresso, recentrar e setas simultâneos. Precisa de organização recolhível e prompts contextuais.
- Início olha para o fundo do edifício; Gabriel não aponta para o balcão à esquerda. Scroll ancora posição, mas ainda não dirige o ciclo de caminhada pelo deslocamento virtual.

## Baseline

Capturas e métricas serão coletadas antes de modificar a cena. Perfis desktop/mobile usarão Chromium em SwiftShader, com resolução, GPU declarada, FPS, draw calls, triângulos, LCP, bytes e estimativa de alocação de texturas documentados. Não corresponde a GPU física nem permite afirmar 50–60 FPS desktop/30 FPS mobile real.

## Baseline medido

| Perfil | Qualidade | FPS médio | Draw calls | Triângulos | Estimativa texturas (MiB) | LCP DOM (ms) |
|---|---|---:|---:|---:|---:|---:|
| 1440×900 | auto | 3.79 | 42 | 80107 | 43.72 | 192 |
| 1440×900 | low | 9.75 | 42 | 80107 | 43.72 | 192 |
| 1440×900 | medium | 1.85 | 42 | 184623 | 43.72 | 192 |
| 1440×900 | high | 1.81 | 43 | 212363 | 43.72 | 192 |
| 390×844 | auto | 25.43 | 34 | 70505 | 32.62 | 140 |
| 390×844 | low | 38.47 | 34 | 70505 | 44.62 | 140 |
| 390×844 | medium | 14.40 | 36 | 157955 | 44.62 | 140 |
| 390×844 | high | 13.62 | 37 | 181815 | 44.62 | 140 |

Fonte: `docs/virtual-studio/professional-polish/baseline/metrics.json`. A memória é uma estimativa das alocações expostas por chamadas WebGL; não inclui todas as decisões do driver. LCP mede conteúdo DOM elegível, não conclusão do canvas. Hardware reportado: AMD EPYC 9V74 80-Core Processor. Renderizador efetivo: SwiftShader, emulação móvel por viewport/toque, sem GPU física.
