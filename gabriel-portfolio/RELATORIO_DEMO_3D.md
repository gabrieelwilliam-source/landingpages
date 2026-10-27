# Demonstração espacial 3D — 27/10/2026

## Estado entregue antes da autorização de publicação

Demonstração funcional local com **exatamente dois ambientes conectados**. Não houve commit, push, deploy ou atualização dos artefatos publicados em `../gabriel/`. O site público continua com a versão anterior. A ampliação para os outros ambientes aguarda validação desta demonstração.

1. **Átrio de ideias / Sobre Gabriel:** colunata de pedra clara, pórticos curvos, esculturas em plintos e painéis de apresentação/abordagem.
2. **Atelier digital / Serviços:** estrutura escura com cobertura geométrica, bancadas e monitores; painéis de serviços e acesso a um conceito existente.

O eixo principal é a profundidade do mundo (Z negativo na cena). Gabriel tem rig 3D autoral com roupa escura, cabelo curto, olhos claros e barba longa; membros alternam ao caminhar e o personagem orienta-se pelo deslocamento. A câmera acompanha em terceira pessoa com suavização exponencial e enquadramento adaptado à altura disponível.

## O que funciona

- WASD, setas e botões de toque; aceleração/desaceleração, velocidade diagonal normalizada e limites do mundo. Colisões simples impedem atravessar os plintos e sair da passagem; a entrada da ponte bloqueia avanço lateralmente desalinhado sem deslocar o personagem de forma brusca.
- Avançar e retornar a pé, inclusive entre os dois ambientes; atalhos com centralização e travessia suave. Progresso 0–100% e fim explícito da demonstração.
- Exploração principal em viewport fixa, sem usar scroll para movimentar o mundo. Modo clássico com scroll convencional, todo o conteúdo existente e contexto de seção/posição preservado ao alternar.
- Pausa por botão/P/Escape, perda de foco ou ocultação da aba. A pausa congela a física e a travessia. Paineis abrem diálogos HTML nativos, pausam o mundo, mantêm o foco e retornam ao cenário ao fechar.
- Anotações HTML projetadas junto aos objetos do cenário; marcadores que colidiriam com textos/controles são ocultados. Os conteúdos também podem ser acessados pelo painel do ambiente ou pelo modo clássico.
- Preferência de movimento reduzido respeitada e ajustável: deslocamento continua disponível, mas sem animação dos membros, interpolação da câmera ou travessia animada.
- Carregamento dinâmico de Three.js somente ao entrar na exploração; atelier completo construído apenas na aproximação ou por seu atalho. Falta de WebGL apresenta acesso ao modo clássico; perda de contexto gráfico tem mensagem de recuperação pelo modo clássico.
- Geometria procedural, materiais compartilhados, sem imagens IA, modelos externos, pós-processamento ou sombras em tempo real. Pixel ratio limitado e desenho suspenso em repouso após a câmera assentar. Descarte de geometrias, texturas, renderer, RAF e listeners ao sair da exploração.
- Conteúdo clássico pré-renderizado, inclusive sem JavaScript. Conceitos e formulário local existentes preservados. Foto pessoal ausente do site e do pacote de revisão; nenhum serviço de produção integrado.

## Verificações executadas

Ambiente: Node 24.19.0, npm 11.9.0, Next 15.5.28, Three.js 0.186.1 e Chromium do sistema via Playwright.

| Verificação | Resultado final |
| --- | --- |
| `npm run build` | Passou; tipos e geração de 8 páginas concluídos |
| `npm run typecheck` | Passou |
| `npm test` | 6 testes passaram; nenhum falhou ou foi ignorado |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` | 11 testes passaram em 39,6 s; nenhum falhou ou foi ignorado |
| `npm run build:pages` | Exportação estática passou, sem publicação |
| `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` | Passou em 360, 768 e 1440 px, com prefixo do Pages |
| `git diff --check` | Sem erros de whitespace |
| Arquivos da landing page e de `../gabriel/` | Sem alterações |

Os testes unitários exercitam ida/volta completa, limites, normalização diagonal, colisões de plintos/ponte, desaceleração, limite de delta e easing. Os testes funcionais exercitam profundidade e câmera, ausência de navegação por scroll, pausa efetiva do motor, contexto entre modos, travessia e retorno físico, carregamento progressivo, diálogos/foco, preferência de movimento reduzido, soltura fora dos controles, gesto de toque/cancelamento via CDP em dispositivo emulado, orientação horizontal, ausência de WebGL, leitura sem JS, conceitos, validação local e ausência de envio de contato, 404 e foto não servida.

Axe não apontou violações nas telas avaliadas de exploração/leitura em 360, 768 e 1440 px, nem no diálogo de apresentação. As capturas foram inspecionadas; texto e personagem ficaram livres dos controles após ajustes de enquadramento e reserva de áreas do HUD. O teste do atelier verifica orçamento inferior a 180 chamadas de desenho e 15 mil triângulos renderizados nessa vista.

A exportação estática testou carregamento de JS/CSS, os dois ambientes, modo clássico, links de conceito/retorno e favicon com o prefixo correto, sem erros JavaScript ou respostas HTTP de erro.

As rodadas iniciais identificaram contraste insuficiente no número de um atalho, sobreposição de marcador, enquadramento do personagem e uma observação prematura do HUD ao testar pausa. Foram corrigidos contraste, reserva dos painéis, enquadramento e observabilidade do estado efetivo de pausa. A suíte final observa a posição somente depois da confirmação do motor pausado e mantém a asserção de imobilidade exata.

## Evidências e execução

- `test-results/spatial-atrium-1440.png`, `spatial-atrium-768.png`, `spatial-atrium-360.png`: átrio nas três larguras.
- `test-results/spatial-workshop-900.png`: atelier, personagem e interação de conceito.
- `test-results/classic-*.png`: modo clássico.
- `README.md`: instalação, controles e comandos completos.

Servidor de produção iniciado novamente nesta instância após os testes. Processos não persistem entre tarefas; reiniciar com os comandos do README. Nenhum endereço público novo foi criado.

## Limites e próximo passo

A implementação para nos dois ambientes solicitados. A leitura clássica mantém os demais conteúdos já existentes; eles não foram expandidos para novos cenários. A próxima etapa é revisar esta experiência antes de decidir pela expansão ou autorizar uma publicação de teste.

A checagem automatizada não substitui revisão com leitor de tela ou hardware físico. Safari/iOS físico e desempenho sustentado em celulares modestos não foram medidos. Não há nota Lighthouse ou FPS alegada. O build informa aproximadamente 113 kB de First Load JS para a home; isso não inclui os chunks dinâmicos do 3D. Na exportação avaliada, os dois maiores chunks do motor somam aproximadamente 559,8 kB brutos / 137,3 kB gzip, além do código da cena. Não há downloads de modelos ou texturas externas.

O avatar é uma representação geométrica com poucos polígonos, não um retrato ou personagem com animação capturada. As colisões são simples e adequadas a este percurso sem saltos ou física complexa. Contato real, aprovação editorial e projetos comprovados continuam pendentes conforme a entrega anterior.

## Publicação autorizada posteriormente

Após a entrega local, o usuário autorizou publicar e confirmou expressamente que o endereço público do GitHub Pages pode ser usado. A informação de acesso exclusivo foi esclarecida: o Pages deste repositório é público e não tem autenticação para visitantes. Esta autorização substitui a restrição de publicação da fase de desenvolvimento acima.

Os 33 artefatos da exportação estática validada foram preparados em `../gabriel/`. A versão anterior foi preservada em `/tmp/gabriel-pages-before-3d.tar.gz`. A landing page FR na raiz permanece inalterada. Nenhuma foto pessoal é incluída. O formulário permanece local, sem envio. A expansão permanece limitada aos dois ambientes.

Destino autorizado: https://gabrieelwilliam-source.github.io/landingpages/gabriel/

### Confirmação externa

Push da demo: `eca55048f7e7cca15b3929d2956ac6d765190022` em `main`. A API do GitHub Pages confirmou build `built`, sem erro. Os 33 artefatos públicos retornaram HTTP 200 e bytes idênticos à exportação validada localmente, incluindo chunks do motor 3D, HTML, CSS e páginas de conceitos, com validação TLS ativa. A landing page FR na raiz também retornou HTTP 200 com seu conteúdo preservado. Não se alega novo teste de interação do navegador contra o domínio público: a interação foi validada localmente nos mesmos artefatos.

Link publicado: https://gabrieelwilliam-source.github.io/landingpages/gabriel/

O endereço é público conforme confirmação expressa do usuário. O escopo continua sendo os dois ambientes; nenhum ambiente adicional foi desenvolvido ou publicado. A foto pessoal continua excluída.
