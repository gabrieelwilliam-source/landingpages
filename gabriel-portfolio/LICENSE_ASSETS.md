# Assets, autoria e permissões

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
