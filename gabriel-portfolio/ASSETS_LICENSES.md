# Assets e licenças — Polimento Visual Profissional

Esta revisão usa dados gratuitos com permissão comercial e redistribuição verificadas individualmente. Não foi comprado serviço ou asset. Créditos também disponíveis na página `/creditos`, no menu 3D e no modo clássico.

| Asset / arquivo | Autor e origem fixada | Licença e redistribuição | Adaptações |
|---|---|---|---|
| `tools/vendor/human/base.obj`; cabeça e mãos nos 9 GLBs | MakeHuman hm08. © 2020 Data Collection AB, Joel Palmius, Jonas Hauquier. [Fonte](https://github.com/makehumancommunity/makehuman/blob/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data/3dobjs/base.obj) | CC0 1.0 Universal, explicitamente declarada no cabeçalho da malha e em LICENSE.ASSETS.md. Uso comercial, modificação e redistribuição permitidos. O código AGPL do aplicativo **não foi copiado nem importado**. Avisos originais em `tools/vendor/human/`. | Apenas cabeça/pescoço e mãos são extraídos por código original, com subdivisão/simplificação, escala, orientação, cores, cabelo e adaptação ao rig de 16 ossos do projeto. Não é escaneamento de Gabriel. |
| `tools/vendor/furniture/SheenChair.glb`; `public/models/furniture/lounge-chair.glb` e `lounge-bench.glb` | © 2020 Wayfair LLC / Eric Chadwick. [SheenChair](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/SheenChair) | CC0 1.0 Universal, declaração Legal do README original preservada. Uso comercial, modificação e redistribuição permitidos. Não implica endosso. | Poltrona e banco estofado derivados com escala de assento, paleta azul-marinho/areia, madeira dielétrica, ajuste de densidade UV, normal/AO, texturas WebP 512px e malhas Meshopt. Geometria compartilhada entre salas. |
| Escritório, cadeiras ergonômicas, balcão, rig, roupas e animações | Criações anteriores e novas deste projeto, editáveis nos scripts Blender. | Sem asset de terceiro adicional. Blender GPL é ferramenta; não impõe GPL ao resultado. | Teto, luminárias suportadas, vidro, escala, colisões, posições, perfis curvos de cadeiras e materiais originais. |
| `public/brand/zaion-original.png` | Arquivo oficial fornecido pelo usuário, igual ao novo pacote. | Marca do titular, usada conforme pedido, sem redesenho ou sublicença. | Nenhuma. SHA-256 `fb2edb7999b9c5c35d54ec16a25661650905683a231abbe8d261f04e398b99cc`. |
| `public/environment/city-dusk.webp` | Ilustração exterior original gerada por IA na etapa anterior. | Cenário conceitual do projeto, não foto de cidade/escritório real. | Apenas fora das janelas; não substitui o interior 3D. |
| Foto pessoal e moodboards | Referências privadas fornecidas. | Sem redistribuição nesta entrega. | Não incorporados a site, GLB, Git ou ZIP. |

## Avaliados e não incorporados

- SheenWoodLeatherSofa: derivado de sofá CC0 de Fran Calvente com melhorias de Eric Chadwick / Darmstadt Graphics Group GmbH sob CC BY 4.0. A licença permite uso comercial e redistribuição com atribuição e indicação de mudanças. A aparência clássica foi considerada inadequada para este escritório; o asset **não integra** o site nem o pacote. [Licença individual na fonte](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/8f492390ddc7a2ae221a1369ef560589cf8c70fb/Models/SheenWoodLeatherSofa).
- API Poly Haven consultada; retornou HTTP 403 neste ambiente. Nenhum asset foi baixado por essa API. A poltrona vem da distribuição Khronos, com procedência e licença próprias verificadas.
- Mixamo não incorporado: nenhum arquivo foi extraído de conta Adobe nem de sites de jogos. As animações continuam autorais; a caminhada foi ajustada com uma trajetória analítica dos pés, no mesmo rig e em ciclos in-place.
- R3F/Drei não foram adicionados: a aplicação usa Three.js diretamente e não necessita reescrita. O probe de iluminação continua original (`RoomEnvironment`), com exposição e luz calibradas; não é path tracing nem HDRI fotográfico.

As revisões e os hashes dos dados-fonte constam em `tools/vendor/sources-lock.json`. Dependências e licenças MIT/Apache continuam identificadas em `LICENSE_ASSETS.md` e no lockfile. Nenhum token, conta externa, recurso pago ou integração de produção é necessário para executar a exportação.

## Refinamento do personagem principal — 28/10/2026

O grooming, as pálpebras, a roupa/mochila, o ajuste de cor e o orçamento de simplificação facial desta revisão são código e geometria autorais em `tools/refine_hero.py` e `tools/strip-hero-microgeometry.mjs`. A cabeça e as mãos continuam derivadas dos dados CC0 já creditados acima. Não houve nova fonte externa, compra ou textura pessoal. A foto é apenas referência privada e não integra Git, public ou o pacote.

### Materiais procedurais — 29/10/2026

`tools/human_albedo.py` gera um atlas original de pele/tecido; não utiliza pixels da fotografia nem das artes conceituais. O LOD incorpora a cor às cores dos vértices e remove a textura. A anatomia CC0 e os demais créditos permanecem. Nenhuma compra, download novo ou serviço pago nesta etapa.

## Base humana e figurino texturizados — 29/10/2026

Esta etapa acrescenta as fontes abaixo ao personagem Gabriel. Os registros anteriores descrevem seus respectivos estados históricos; as roupas do protagonista agora também incluem os assets licenciados desta tabela.

| Componente | Autor / fonte | Licença e alterações |
|---|---|---|
| Morfologia adulta, pele masculina genérica, olhos, cabelo curto, sobrancelhas, jeans e tênis | MakeHuman system assets; © 2020 Data Collection AB, Joel Palmius, Jonas Hauquier. [Distribuição oficial](https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip); targets e esqueleto de dados no commit `a8bc2d54ff0ac92e78ff71431b1023eda42bf482`. | CC0 1.0, declarações originais preservadas. Recorte, UVs originais, cores adaptadas, ajuste de escala/rig, cabelo, retargeting e compressão. Não é foto nem escaneamento de Gabriel. Nenhum código do aplicativo MakeHuman importado. |
| Moletom `elvs_hooded_sweat_jacket1` | **Elvaerwyn**, [asset original](http://www.makehumancommunity.org/node/1450), [distribuição oficial shirts02](https://files2.makehumancommunity.org/asset_packs/shirts02/shirts02_ccby.zip). | **CC BY**, conforme cabeçalho original. O guia do editor aponta para [CC BY 2.5 SE](https://creativecommons.org/licenses/by/2.5/se/deed.en). Modelagem e texturas adaptadas: ajuste da silhueta, mangas, capuz, skinning, resolução e compressão. Crédito obrigatório preservado também no site. Sem endosso do autor. |
| Barba, mochila, animações e adaptação | Criações e código deste projeto. | Geometria/grooming e rig originais. Pele e roupas usam as fontes creditadas acima. |
| AO do piso e mármore da recepção | Geração própria a partir da cena do escritório. | Sombra estática em 512px por setor e textura procedural. Nenhuma textura da referência copiada. |

Fontes individuais, membros dos ZIPs e hashes: `tools/vendor/native-human/SOURCES.json`; avisos e guia de licença preservados na mesma pasta. A página `/creditos` integra a exportação e o pacote. O LOD herda as atribuições das malhas de origem. A fotografia pessoal e os moodboards permanecem privados.


## Grooming, materiais e sofá modular — 29/10/2026

Esta etapa substitui o cabelo/sobrancelhas nativos da revisão anterior por **geometria e atlas RGBA de composição autoral**, em `tools/groom_avatar.py`: couro cabeludo recortado da anatomia CC0 com linha de entradas, estopa/base de barba arredondada, 88 mechas curvas, bigode e sobrancelhas. A anatomia abaixo continua CC0; nenhum pixel da foto de Gabriel é usado. A textura CC0 `eyebrow001.png` é recortada e incorporada ao atlas compartilhado para as sobrancelhas e o bigode. As malhas antigas de cabelo/sobrancelhas permanecem como fonte histórica; não são usadas no GLB atual.

Pele e íris continuam derivadas das fontes CC0 acima. Novos mapas de micro-normal/rugosidade são procedurais; a íris foi dessaturada e escurecida com Sharp. Os hashes do arquivo derivado e das fontes foram atualizados. O moletom continua **Elvaerwyn, CC BY**, com um ajuste suave de caimento do capuz. A cor do material PBR é incorporada corretamente ao LOD com teste de regressão, incluindo materiais compartilhados e alpha opaco.

O sofá de três lugares usa **três conjuntos de estofado do SheenChair**, © 2020 Wayfair LLC / Eric Chadwick, CC0, com escala individual; não estica uma única cadeira. Braços e encosto de apoio arredondados, almofadas e base de nogueira com quatro pés são geometria complementar autoral (`tools/modular-sofa.mjs`). Os materiais/têxteis continuam derivados do asset CC0. Oclusão original mantida apenas nos estofados de origem; partes novas não reutilizam o AO específico da cadeira. As dimensões permanecem dentro do espaço de circulação existente. Nenhuma compra ou nova fonte externa.


## Luz indireta e atlas compacto — 29/10/2026

Os seis setores incluem mapas autorais de luz indireta difusa, calculados offline com Blender/Cycles CPU sobre a cena existente, sem HDRI comprado. O runtime interpreta o transporte glTF marcado como lightMap e mantém UVs de detalhe/AO separados. O fallback Lambert também preserva a luz. O sheen dos estofados CC0 foi adaptado à paleta azul-marinho/areia. `tools/bake_skin_atlas.py` reprojeta a pele CC0 já creditada apenas na cabeça/mãos em 1024²/512²/256², sem pixels da foto pessoal. Nenhuma nova fonte externa, compra, assinatura ou serviço pago. Ferramentas gratuitas; licenças dos dados e crédito de Elvaerwyn continuam válidos.


## Rosto e fibras curvas — 29/10/2026

`tools/refine_face_depth.py` contém ajustes locais autorais de forma sobre a cabeça CC0 existente, sem textura da foto privada. `tools/groom_texture.py` gera fios curvos, variações e grisalhos com NumPy; sobrancelhas/bigode agora usam fios curtos modelados, em vez do recorte de sobrancelha CC0 usado na etapa anterior. O atlas de grooming desta etapa é autoral; os créditos da anatomia/pele/olhos e do moletom **Elvaerwyn, CC BY** permanecem. Nenhum novo asset externo, compra, assinatura, serviço pago ou instalação. Blender/Cycles, Python e Three.js são as ferramentas gratuitas já presentes.
