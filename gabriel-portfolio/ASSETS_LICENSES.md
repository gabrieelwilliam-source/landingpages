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
