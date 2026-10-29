# Revisão mais recente — rosto, barba e leitura no celular, 29/10/2026

Continuação local sobre `8c4f222`, branch `visual-polish`. [Comparador de GLBs reais](docs/virtual-studio/face-depth-20261029/index.html) e [relatório com custos, capturas e limites](docs/virtual-studio/face-depth-20261029/README.md).

Ajustes discretos na anatomia do rosto CC0, sobrancelhas/bigode com fios curtos modelados, barba de fibras curvas/grisalhos e ponta arredondada, raiz mais suave e cabelo curto com densidade calibrada. A luz ambiente já existente do software/móvel revela melhor as sombras, sem novas luzes ou passes. Ferramentas gratuitas; nenhuma compra, nova dependência ou foto pessoal incorporada.

Completo: **55.313 triângulos / 1.453.348 bytes / sete materiais**. Leve: **6.882 / 123.888 bytes / um material sem mapas**. O completo ganhou detalhe e aumentou de peso; mapas continuam nas mesmas dimensões (~34,3 MiB estimados RGBA8+mipmaps, não VRAM total). O orçamento de 65 mil/7 mil triângulos não foi elevado. Dois testes protegem a remoção de pelos finos e a superfície contínua de couro cabeludo do LOD.

Lint, build, TypeScript, integridade/fontes, **40 unitários / 31 E2E completos**, mais **seis E2E revalidados após o ajuste final de densidade** aprovados. Exportação estática aprovada em **360, 768 e 1440 px**; capturas reais, medições por perfil e pacote no relatório atual. Planta, rig/11 ações, seis setores, oito NPCs fictícios, analógico, velocidade e contato local preservados. Nenhum push, publicação ou alteração em `../gabriel/`, FR ou produção/n8n. Backup integral anterior e atribuições no relatório.

Persistem diferenças de identidade facial, grooming e iluminação em relação às referências. Emulação por SwiftShader/toque não comprova FPS ou qualidade em dispositivos físicos. A medição curta do viewport móvel registrou ~19,3 FPS em Automático e ~24,8 em Leve; o desktop software ficou muito abaixo dos alvos. As metas de FPS não estão homologadas; dados brutos e condições no relatório. O comparador mostra o modelo efetivamente executado, sem substituir a captura pelo concept art.

---

## Histórico anterior

# Revisão mais recente — luz indireta e atlas compacto, 29/10/2026

Continuação local sobre `70a65e9`, branch `visual-polish`. [Comparador real](docs/virtual-studio/baked-light-20261029/index.html) e [relatório completo](docs/virtual-studio/baked-light-20261029/README.md).

Seis setores com mapas de luz indireta difusa em Cycles CPU, preservando detalhe e AO; PBR recalibrado e sheen dos estofados corrigido. Pele da cabeça/mãos reprojetada para atlas compacto, sem pixels da foto privada. Ferramentas gratuitas, nenhuma dependência/compra nova. Memória estimada dos mapas do avatar **55,3 → 34,3 MiB RGBA8+mips**; até 8 MiB adicionais para os seis mapas de luz se todos carregados. Não é medição da memória total/GPU. Completo **51.485 triângulos / 1.144.236 bytes / sete materiais**; leve **6.739 / 123.196 bytes / um material sem mapas**.

Lint/build/typecheck e integridade aprovados; **38 unitários / 31 E2E completos / 2 E2E finais de iluminação**. Exportação estática aprovada em **360, 768 e 1440 px**; capturas reais e pacote documentados no relatório atual. Rig, 11 ações, colisões, seis setores, elenco, analógico e velocidade preservados. Ainda há diferenças em relação às referências; não houve teste em GPU/telefone físicos. Sem push/publicação ou alterações em `../gabriel/`, landing page FR e n8n. Backup integral e licenças no relatório. Pacote extraído e testado pelo iniciador: movimento/parada no analógico, modos, contato, créditos e mapas de luz aprovados. [Evidência do ZIP](docs/virtual-studio/baked-light-20261029/evidence/zip-smoke.json). CRC e hashes verificados.

---

## Histórico anterior

# Revisão mais recente — acabamento gráfico, 29/10/2026

Branch `visual-polish`, revisão local sobre `3f56847`. [Comparador real antes/depois](docs/virtual-studio/grooming-light-20261029/index.html) e [relatório, custos e evidências](docs/virtual-studio/grooming-light-20261029/README.md).

Gabriel recebeu scalp ajustado à anatomia, barba arredondada com 88 mechas em camadas, textura CC0 de pelos curtos para sobrancelhas/bigode, pele com micro-normal/rugosidade, íris menos saturada, lábios em repouso e capuz com caimento suavizado. O escritório recebeu luz de preenchimento no PBR e sofá de três lugares com estofados independentes, braços, almofadas, encosto apoiado e quatro pés de nogueira. Mesmos limites de circulação, rig, animações, analógico, câmera, galeria, NPCs fictícios e rascunho local.

Modelo completo: **51.484 triângulos / 1.190.256 bytes / sete materiais**, versus 53.950 / 1.131.040 / oito antes. Leve: **6.726 triângulos / 123.096 bytes / um material sem mapas**. Sofá: **8.688 triângulos / 386.408 bytes**, no mesmo volume físico. Memória teórica dos mapas do avatar completo sobe de ~46,0 para ~55,3 MiB RGBA8 com mipmaps; método/limites estão no relatório. Não se promete fotorealismo idêntico às referências nem FPS em hardware físico.

Validação: lint/build/typecheck, **34 unitários e 29 E2E completos**, **cinco E2E finais direcionados**, assets/fontes e exportação estática em **360, 768 e 1440 px** aprovados. Capturas de personagem, sofá, PBR, entrada móvel/desktop e seis setores reais; não são os concept arts. A luz extra é omitida do fallback por software. Nenhum teste foi removido ou limite elevado para aceitar os assets.

Backup integral anterior: `/workspace/artifacts/landingpages-before-grooming-light-20261029.tar.gz`, SHA-256 `7f8025726e4bfc2bd7dfcf346f3d7dfb0e9ab3afec638a06cd3c379d630272d0`. Pacote: `/workspace/artifacts/zAIon-Acabamento-Grafico-Revisao-20261029.zip`; commit exato no `VERSAO.json`. Pacote extraído e testado pelo iniciador em Chromium móvel: analógico, parada ao soltar, modos, contato local e créditos, sem erros; evidência em `docs/virtual-studio/grooming-light-20261029/evidence/zip-smoke.json`. CRC e hashes de todas as entradas aprovados. Nada foi enviado/push, publicado ou copiado para `../gabriel/`; landing page FR e produção/n8n preservados.

---

## Histórico anterior

# Revisão mais recente — base humana e materiais nativos, 29/10/2026

Implementação local na branch `visual-polish`, sem publicação. [Comparador real antes/depois](docs/virtual-studio/anatomy-rebuild-20261029/index.html) e [relatório desta etapa](docs/virtual-studio/anatomy-rebuild-20261029/README.md).

Gabriel usa agora morfologia adulta, pele/olhos/cabelo/sobrancelhas/mãos com UVs nativas e figurino modelado e texturizado: moletom de Elvaerwyn CC BY, jeans/tênis CC0. As fontes e hashes estão em `tools/vendor/native-human/`; créditos no site e em `ASSETS_LICENSES.md`. Barba, mochila, rig e animações do projeto adaptados, sem pixels da foto pessoal. Piso dos seis setores com oclusão de contato pré-calculada em 512px/UV independente e balcão de mármore escuro. Câmera, analógico, velocidade, colisões, galeria, oito NPCs fictícios, simulações e rascunho sem envio preservados.

Completo: **53.950 triângulos / 1.131.040 bytes / 8 materiais**. Leve: **6.867 triângulos / 123.216 bytes / 1 material**. Mesmo rig de 16 ossos e 11 ações. Carregamento paralelo permite caminhar na variante leve enquanto a detalhada baixa; a troca mantém a animação em curso. As costuras da roupa leve são unidas antes da simplificação; olhos protegidos e maior orçamento para rosto/barba.

Validação: lint, build, typecheck, **33 unitários e 29 E2E** na rodada completa; **5 E2E direcionados** após o ajuste final do LOD; GLBs, fontes, pesos, cores, UVs, bake não vazio, compressão, logo e hashes aprovados. Exportação estática em **360, 768 e 1440 px**, capturas desktop/mobile e caminho PBR aprovados. A ampliação do LOD e o custo de materiais são expostos no comparador. Não foi feita validação em telefone/GPU físicos; permanecem diferenças de identidade facial, grooming, mobiliário e iluminação em relação às referências.

Backup integral anterior: `/workspace/artifacts/landingpages-before-anatomy-rebuild-20261029.tar.gz`, SHA-256 `22fe78372f81f8b6a2c3e71059ee02a7fcd068d0b3b4e45aa58ebd1c6fcb0969`. Pacote desta revisão: `/workspace/artifacts/zAIon-Nova-Base-3D-Revisao-20261029.zip`. O ZIP foi extraído e testado pelo iniciador em Chromium com toque, movimento/liberação do analógico, troca de modos, contato local e créditos, sem erros; evidência em `docs/virtual-studio/anatomy-rebuild-20261029/evidence/zip-smoke.json`. CRC e hashes de todas as entradas aprovados. A revisão exata está no `VERSAO.json` do ZIP. Preservados `../gabriel/`, `../index.html` e `../.nojekyll`; nenhum push ou acesso a produção/n8n.

---

## Histórico de revisões anteriores

# zAIon Virtual Studio — Polimento Visual Profissional

28/10/2026 · branch local `visual-polish` · sem publicação.

**Atualização mais recente:** [aproximação às referências — 29/10/2026](docs/virtual-studio/reference-pass-20261029/index.html), com [escopo e limites](docs/virtual-studio/reference-pass-20261029/README.md). ZIP: `/workspace/artifacts/zAIon-Referencia-Visual-Revisao-20261029.zip`. Controle móvel preservado; sem publicação.

Esta revisão continua o projeto existente a partir de `cd9cdb5`. Não substitui o portfólio por outra aplicação. A versão pública e a landing page FR permanecem preservadas. A nova instrução do pacote suspende a preferência anterior de publicação automática nesta etapa.

## Implementação

| Área | Entregue | Validação |
|---|---|---|
| Preservação | Backup integral, branch local e histórico anterior. Foto pessoal fora de public/Git/ZIP; nenhum acesso a n8n/Supabase ou sistema de produção. | SHA e escopo abaixo; comparação de arquivos publicados na conclusão. |
| Planta e arquitetura | Eixo de 90 para 72 m, entrada de 7 m, seis setores mantidos. Fonte configurável, coordenadas, assentos e colisores gerados juntos. Envoltória contínua permanece visível quando interiores distantes são ocultados. | Unitários da circulação, limites, rotas e reconexão; capturas dos seis setores. |
| Teto e luminárias | Menos baffles e travessas; ritmos por setor. Luminárias a ~4,81 m com dois cabos, bases fixadas ao teto e difusores. Canopy acústico do lounge também tem cabos. Limite superior da câmera 4,65 m. | Verificação de suportes/alturas e inspeção real das imagens. |
| Mobiliário | Poltrona e banco estofado CC0 com UVs, normal/AO e texturas WebP, compartilhados entre ambientes. Cadeiras de escritório com encosto curvo contínuo; rotação de todas as peças e rodas corrigida. Uma estação repetida removida; reunião delimitada por vidro. | Verificador GLB, licenças, medidas e circulação. |
| Materiais e luz | Pedra sem rabiscos, micro-normal e rugosidade; madeira/tecido com PBR, metal acetinado, vidro controlado. Sol direcional coerente, exposição/hemisfério/ambiente calibrados e AO de contato. Panorama ilustrativo apenas no exterior. | Inspeção dos caminhos software e PBR, sem alegar GPU física. |
| Gabriel | Cabeça e mãos extraídas de anatomia CC0, adaptadas ao rig/figurino original. Cabelo curto com entradas pintado na malha, barba ajustada em comprimento e volume, olhos claros, lábios/sobrancelhas e dedos contínuos. | Rig, pesos, onze ações e LODs verificados; closes reais de duas geometrias. |
| Locomoção | Ciclo dos pés calculado por trajetória de apoio e cinemática de duas articulações; gait ligado à distância. No Scroll, a raiz permanece fixa e a distância virtual dirige a caminhada, inclusive no retorno. | Scroll reversível, troca de modo, caminhada, câmera e pausa em navegador. |
| Equipe virtual | Oito atores fictícios, com typing/talk/idle/sit/levantar/sentar e rotas locais. Número e LOD por qualidade. Posições refeitas a partir dos assentos físicos. | Percursos amostrados contra móveis/vidro, continuidade de transições e colisões com pessoas. |
| Interface | Um cabeçalho; menu recolhível com destinos, gráficos, câmera, FOV e ajuda; ação contextual e progresso discreto. Apresentação do ambiente sob demanda. Painel rolável não movimenta o mundo; Escape retorna foco. | Desktop, toque, teclado, leitor de tela/axe, menu e FOV. |
| Conteúdo | Mesmos projetos/conceitos, páginas e filtros. Quatro simulações locais e rascunho em memória sem envio. Clássico com conteúdo e créditos. | E2E e exportação estática; nenhuma requisição de envio. |

## Fontes e custos

R$0 em assets/serviços obrigatórios. Anatomia MakeHuman e SheenChair têm liberação **CC0 individualmente verificada**, com originais, avisos e hashes incluídos. O sofá clássico pesquisado não foi incorporado por incompatibilidade estética. Documentação completa: [ASSETS_LICENSES.md](ASSETS_LICENSES.md), página `/creditos` e `tools/vendor/sources-lock.json`. Rig, animações e arquitetura são do projeto. O software AGPL MakeHuman não é importado; apenas a malha de dados CC0 é adaptada por código original.

## Execução

- Desenvolvimento: `npm ci` e `npm run dev`.
- Produção local: `npm run build` e `npm run start`.
- Exportação: `npm run build:pages`; revisão: `npm run preview:review`.
- No ZIP final: `node INICIAR-REVISAO.mjs`, sem instalar dependências para a versão estática; abrir o endereço mostrado. Node.js deve estar instalado.
- Blender só é necessário para reconstruir assets, não para visitar o export.

## Evidências e limitações

Auditoria e baseline: [AUDIT.md](AUDIT.md). [Comparador visual e capturas finais](docs/virtual-studio/professional-polish/index.html), com medições JSON de antes/depois e logs em `evidence/`. As imagens são capturas do aplicativo, não concept art ou renders offline. A comparação usa as mesmas zonas, resolução e parâmetros de câmera; as profundidades são mapeadas para a planta compactada, e o enquadramento foi ajustado de propósito.

O avatar é uma adaptação anatômica, **não uma cópia facial exata**. Não há textura extraída da foto, escaneamento, mocap ou expressão facial por blendshapes. Cabelo/barba, dedos e contato com teclado/cadeira continuam simplificados. A caminhada tem apoio analítico no clip e blending; não há solver de física/IK em runtime para cada triângulo do cenário.

O escritório continua longitudinal por preservar a jornada e os seis setores; foi encurtado, não transformado em outro edifício. Não há path tracing, GI baked, SSR ou pós-processamento pesado. WebP/Meshopt foram mantidos; não foi introduzido KTX2 sem pipeline validado. O telefone é emulado por viewport/toque em Chromium/SwiftShader, e a memória é estimada por chamadas WebGL. Não foi medida GPU física ou telefone real, portanto **não se afirma 50–60 FPS desktop ou 30 FPS mobile**. Gráficos automáticos/baixos e modo clássico permanecem como alternativas.

Backup anterior: `/workspace/artifacts/landingpages-before-professional-polish-20261028.tar.gz`.
SHA-256: `947040da6751e84a226c47e4dacc4803a097bc08d71542dc815445e39ad054f0`.

## Testes executados

- `npm run lint`, `npm run build` e `npm run typecheck`: aprovados.
- `npm test`: **30 unitários aprovados**.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: **25 E2E aprovados**, incluindo 360/390/1280/1440 px, toque, câmera, FOV, popup rolável, créditos, filtros, rascunho, simulações, LOD, navegação e acessibilidade axe.
- GLBs: seis cenas, nove pessoas em qualidade completa e nove LODs, dois assets estofados compartilhados; skin/pesos/clips/hashes/logo/PBR/compressão verificados.

Os testes de aproximação do balcão usam o limite físico do balcão da planta nova. Os testes dos controles de câmera e destinos agora abrem o menu, pois esses controles foram recolhidos por requisito. Não foram removidas verificações para aceitar as mudanças.

## Comparação medida

CPU AMD EPYC 9V74, 5 threads expostas, Chromium headless com ANGLE/SwiftShader, sem GPU física. Amostras RAF curtas de rolagem ativa e mudanças de qualidade na mesma página; recursos são acumulados, incluindo LODs/telas/materiais já solicitados. Não representam apenas o primeiro download.

| Viewport | Qualidade | FPS antes → revisão | Draw calls | Triângulos | Texturas MiB estimados | Recursos MiB acumulados |
|---|---|---|---|---|---|---|
| 1440 px | auto | 3.79 → 8.00 | 42 → 56 | 80,107 → 100,675 | 43.72 → 52.76 | 3.06 → 3.73 |
| 1440 px | low | 9.75 → 9.89 | 42 → 54 | 80,107 → 94,074 | 43.72 → 52.76 | 3.06 → 3.73 |
| 1440 px | medium | 1.85 → 1.79 | 42 → 58 | 184,623 → 243,549 | 43.72 → 52.76 | 3.06 → 3.99 |
| 1440 px | high | 1.81 → 1.71 | 43 → 59 | 212,363 → 304,728 | 43.72 → 52.76 | 3.28 → 4.23 |
| 390 px | auto | 25.43 → 26.77 | 34 → 39 | 70,505 → 65,822 | 32.62 → 46.54 | 3.25 → 4.02 |
| 390 px | low | 38.47 → 33.49 | 34 → 52 | 70,505 → 85,064 | 44.62 → 46.55 | 3.28 → 4.05 |
| 390 px | medium | 14.40 → 12.81 | 36 → 55 | 157,955 → 171,331 | 44.62 → 46.55 | 3.50 → 4.30 |
| 390 px | high | 13.62 → 11.95 | 37 → 58 | 181,815 → 240,422 | 44.62 → 46.55 | 3.71 → 4.55 |

LCP DOM: desktop 192 → 192 ms; móvel emulado 140 → 120 ms. Cena pronta: desktop 2.74 → 4.41 s; móvel emulado 1.62 → 2.03 s. Sem erros de página/HTTP nas duas coletas. O aumento de detalhes **elevou draw calls, memória e download**, e os FPS medium/high diminuíram nesta execução. A amostra auto desktop melhorou, mas não é ensaio estatístico de ganho de performance. Não se declara que as metas de GPU física foram atingidas. As opções low e clássico seguem disponíveis.

### Aceite e pendências explícitas

| Critério | Estado | Evidência / limite |
|---|---|---|
| Navegação, colisões, Scroll ancorado, reverso e modos | Testado | 30 unitários e 25 E2E; asserções de raiz/câmera e ação Walk. |
| Marca, UI, mobiliário, materiais e seis zonas | Implementado e inspecionado | Comparador real, PBR, versões móveis; preservação binária do logo. |
| Luminárias e canopy sustentados | Implementado e testado | Cabos/bases, testes de alturas e inspeção das capturas. |
| Avatar realista idêntico à foto / concept art | Parcial | Melhor anatomia e mãos, mas resultado ainda estilizado; sem cópia facial exata ou cabelo volumétrico. |
| Desempenho em desktop e telefone físicos | Pendente | Somente SwiftShader/emulação; custos acima e nenhuma garantia de 50–60/30 FPS reais. |
| Sofá/cadeiras/balcão totalmente substituídos por modelos externos | Parcial | Estofados externos CC0; balcão e cadeiras de escritório continuam malhas próprias aprimoradas. |
| GI baked, HDRI externo, KTX2 e mocap | Não incorporado | Mantido pipeline gratuito existente com PMREM de ambiente sintético, WebP, Meshopt e animações autorais; limitações já descritas. |
| Publicação | Não executada por instrução | Entrega local; nenhum push nem alteração dos arquivos públicos existentes. |

## Inspeção visual e exportação

Inspecionadas manualmente as capturas reais dos seis setores em 1440 × 900, a entrada em 390 × 844 e os closes de Gabriel, incluindo o caminho PBR em 1000 × 760. Recepção e marca aparecem no enquadramento desktop; o recorte vertical móvel mostra menos da parede da recepção. O caminho software tem luz mais simples e interiores mais escuros que o PBR. Essas diferenças estão expostas nas imagens, sem retocar screenshots.

`npm run build:pages` aprovado. `CHROMIUM_PATH=/usr/bin/chromium npm run test:pages` aprovado em **360, 768 e 1440 px**, validando navegação, GLBs versionados, logo original, Scroll/Caminhar, modo clássico, favicon e ausência de erros de runtime. A exportação está em `.next-pages/`, para revisão, sem copiar para a pasta publicada `../gabriel/`.

Comparação com `cd9cdb5`: `gabriel/`, `index.html` e `.nojekyll` não tiveram alterações. Nenhum push foi executado nesta etapa.

## Pacote e histórico local

Implementação registrada no commit local `6fa26565bd60e3b4b2d48871b100e23dcfb0ef3e`, branch `visual-polish`; um commit seguinte registra a conclusão documental. A versão exata incluída no ZIP consta em `VERSAO.json`.

Entrega: `/workspace/artifacts/zAIon-Polimento-Profissional-Revisao-20261028.zip`. Inclui código-fonte, assets/licenças, auditoria, capturas, comparador e site estático já compilado. Os 17 GLBs completos (seis cenas, nove pessoas e dois móveis compartilhados) somam 5.87 MB decimais; os nove LODs são variantes adicionais.

O ZIP foi extraído em diretório separado e iniciado com `node INICIAR-REVISAO.mjs`. Smoke real no Chromium aprovado: rig de 16 ossos, diálogo de Lia, contato clássico e página de créditos CC0, sem erros de página/HTTP. Evidências: `docs/virtual-studio/professional-polish/evidence/zip-smoke.json` e captura `final/package-reception-dialog.png`. Integridade CRC e SHA-256 de cada arquivo também verificada. O SHA-256 do pacote final fica ao lado do ZIP em `pro-polish-package.json`, para evitar autorreferência dentro do pacote.

Para revisar, extraia tudo, execute o iniciador e abra `http://127.0.0.1:8080/landingpages/gabriel/`. O comparador de screenshots também pode ser aberto diretamente em `codigo-fonte/docs/virtual-studio/professional-polish/index.html`. Não abrir o site 3D por `file://`.
