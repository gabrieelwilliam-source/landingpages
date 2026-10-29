# Assets, autoria e permissões

**Etapa atual de Polimento Profissional (incluindo a base texturizada de 29/10):** cabeça/mãos agora usam dados CC0 MakeHuman e os assentos estofados usam SheenChair CC0. O protagonista também usa pele/olhos/cabelo/jeans/tênis CC0 e moletom CC BY de Elvaerwyn. Consulte `ASSETS_LICENSES.md` e `/creditos` para autoria, revisão exata e adaptações. Os registros abaixo descrevem etapas anteriores e os demais assets preservados.

Revisão de 28/10/2026. Este documento identifica as fontes; não transfere direitos de marcas ou arquivos pessoais.

| Arquivo / grupo | Fonte e uso | Licença / restrição |
|---|---|---|
| `public/models/gabriel-rigged.glb` | Modelagem original produzida neste projeto em Blender. Malha com skin e 16 ossos; ações Idle, Walk, Turn criadas no script. | Asset original entregue ao titular deste projeto; nenhuma biblioteca externa, compra ou atribuição de terceiro é necessária. Não é escaneamento facial nem mocap retargeted. |
| `public/models/environment-0.glb` a `environment-5.glb` | Seis cenas originais com volumes biselados, mobiliário, superfícies curvas e texturas minerais/madeira geradas pelo script. | Mesma autoria do projeto. Sem modelos baixados ou texturas de banco de imagens. |
| `tools/build_assets.py`, `tools/build_office.py`, `tools/build_character.py` | Fonte editável e reprodutível da geometria, skin, animações e texturas. | Código original deste projeto. Blender 4.3.2 é ferramenta GPL; seus termos não impõem GPL aos modelos produzidos. |
| `public/brand/zaion-original.png` | Cópia **byte a byte** de `Logo_zAIon_ORIGINAL_transparente.png` fornecido pelo usuário. | Marca do respectivo titular. Uso neste portfólio conforme solicitação; não redesenhada, não sublicenciada. SHA-256 no manifesto. |
| `public/concepts/*` | Capturas das demonstrações autorais já existentes no repositório. | Uso no portfólio; identificadas como conceitos, sem atribuir clientes/resultados comerciais. |
| `public/environment/city-dusk.webp` | Vista urbana original gerada por IA nesta etapa, usada apenas como exterior distante pelas janelas. | Cenário ilustrativo; não é uma fotografia do escritório nem uma captura do aplicativo. Não contém a foto pessoal. |
| Foto de Gabriel | Referência visual privada fornecida pelo usuário. | Não incorporada ao site, GLB, documentação pública ou ZIP de revisão. Sem textura facial extraída. |
| Leão e logo com fundo claro | Referências fornecidas; examinadas. | Não usados como decoração nem redistribuídos no site. |
| Concept arts e capturas anteriores do pacote | Referências de comparação, nunca fundo da cena ou prova de execução. | Não incluídas em `public/`. A comparação HTML privada de revisão identifica separadamente as referências fornecidas e as capturas reais. |

Three.js, React, Next.js, glTF-Transform e Meshoptimizer possuem licença MIT; consulte os arquivos LICENSE dos respectivos pacotes e o lockfile para versões exatas. Playwright e TypeScript usam Apache-2.0. Essas ferramentas não fornecem a identidade, os modelos ou as animações do avatar.

A distribuição dos GLBs utiliza `EXT_meshopt_compression` e `EXT_texture_webp` e o decoder Meshopt distribuído com Three.js. Os arquivos não dependem de CDN, token ou serviço pago. `node tools/verify-assets.mjs` valida compressão, skin, nomes das animações e integridade do logo. Não há promessa de fidelidade facial fotográfica: o modelo atual é uma interpretação estilizada da referência.

Na revisão gráfica de 28/10, o personagem passou a ter mochila, costuras, capuz e detalhes do rosto/barba, com uma paleta original por vértice e uma única primitiva skinned. A conversão para Lambert preserva essas cores em renderizadores por software. O exterior substitui os antigos blocos distantes; interiores, mobiliário e personagem continuam sendo geometria 3D navegável.

## Revisão para aprovação — pacote zAIon Studio Referências, 28/10/2026

Nenhum novo asset de terceiros foi incorporado. Gabriel e os oito modelos `public/models/npc-0.glb` a `npc-7.glb` são modelagens originais, com identidade fictícia para o elenco. `tools/build_character.py` inclui superfícies contínuas de roupa, rosto e calças, rig autoral e onze poses/ações: Idle, Walk, Turn, Start, Stop, Interact, Sit, Type, Talk, StandUp, SitDown. `Sit` é uma pose mantida; os demais clips contêm transformações que variam. `tools/build_cast.sh` reconstrói o conjunto; não há Mixamo, captura de movimento ou modelos pessoais fotogramétricos.

As superfícies de pedra, nogueira e tecidos dos interiores têm mapas originais baseColor, roughness e normal, em WebP embutido nos GLBs. O metal usa fator de metalicidade onde apropriado. UVs em escala métrica, oclusão de contato e uma aproximação de luz indireta completam a cena. A iluminação de ambiente utiliza a reflection probe `RoomEnvironment` do Three.js; não foi baixado um HDRI de terceiros.

A biblioteca gratuita Universal Base Characters, por Quaternius, foi consultada como alternativa: https://quaternius.com/packs/universalbasecharacters.html . A página declara licença CC0 e uso pessoal/comercial gratuito. **Não foi incorporada**; nenhum modelo, animação ou textura dessa biblioteca integra esta entrega. O elenco mantém a geometria e o rig autorais do projeto. Esta consulta não torna fotorrealista a modelagem entregue.

A vista `public/environment/city-dusk.webp` é a ilustração exterior gerada na etapa anterior. Nenhum moodboard foi convertido em fundo do interior, material de marca ou rosto. A foto original permanece fora de public, Git e ZIP. O logo do novo pacote foi comparado byte a byte ao existente e coincide; seu SHA-256 continua validado pelo verificador. As imagens de revisão são screenshots reais do navegador, identificadas separadamente dos concept arts.

`public/models/low/*.glb`: nove variantes LOD derivadas unicamente dos personagens autorais, por `tools/build-character-lods.mjs`, usando glTF-Transform/Meshoptimizer. Mantêm rig, cores e ações; sem nova fonte externa ou mudança de licença.

## Reformulação azul-marinho — 28/10/2026

Vidros internos, acabamentos azul-marinho/azul-real, ajustes de pedra e latão, acessórios e desenhos de editor de código são originais deste projeto. Nenhum asset externo novo foi incorporado. Telas de código são ilustrações estáticas locais, sem dados de clientes. Logo na reunião e recepção usa o mesmo PNG original, sem redesenho. Gabriel recebeu cor de roupa e ajustes nas ações autorais; variantes dos funcionários preservadas. As mesmas permissões e restrições da tabela acima continuam aplicáveis.

Refinamento adicional do elenco nesta etapa: planos faciais e mãos remesclados, mechas autorais de barba/cabelo, dobras esculpidas e atlas procedural de micro-normal/rugosidade 256×256, diferenciando regiões da pele, olhos, tecidos e acessórios. Tudo gerado por `tools/build_character.py`, sem amostragem da fotografia, texturas compradas ou biblioteca de personagens de terceiros. Uma primitiva skinned por personagem e LODs abaixo de 7 mil triângulos são verificados automaticamente.
