# Native human data and licensed wardrobe

Retrieved 2026-10-29. No MakeHuman application code was imported. `native_avatar.py` is original fitting code using public OBJ, MHCLO, target and skeleton data.

## System assets — CC0

© 2020 Data Collection AB, Joel Palmius, Jonas Hauquier. Original copyright and CC0 notices remain in the MHCLO/MHMAT files. Legal text: `CC0.md`. Official distribution: https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip . Selected members extracted with ZIP CRC verification. Source revision for macro targets and `default.mhskel`: https://github.com/makehumancommunity/makehuman/tree/a8bc2d54ff0ac92e78ff71431b1023eda42bf482/makehuman/data . Exact source-member mapping and SHA-256 are in `SOURCES.json`.

The adult male morphs and photographic generic male albedo are not a scan of Gabriel. The eye texture was desaturated with `prepare-native-textures.mjs`; source image retained. Head/eyes/hair/brows are fitted and scaled to the existing rig. The suit mesh is cropped to jeans; shoes and cloth are retargeted, textures resized and compressed. No personal photograph pixels are used.

## Hoodie — Elvaerwyn, CC BY

Original: **Elvaerwyn, elvs_hooded_sweat_jacket1**, http://www.makehumancommunity.org/node/1450 . Official distribution: https://files2.makehumancommunity.org/asset_packs/shirts02/shirts02_ccby.zip . The original header says `# author Elvaerwyn` and `# license CC_by`; the publisher's guide defines CC-BY with https://creativecommons.org/licenses/by/2.5/se/deed.en . That guidance is retained as `publisher-license-guide.md`; the original index is `hoodie-pack-license.md`. Credit author and link when redistributing or displaying the adapted model. No endorsement implied.

Adaptations: body morph fitting, sleeve retargeting, hood adjustment, vertex skin weights, resized PBR albedo/normal maps, simplification and glTF/Meshopt export. Original OBJ, textures, metadata and author/license header retained. Attribution is included in the site `/creditos`, root `ASSETS_LICENSES.md`, source and review package.

The original image and mesh files are data with their respective asset licenses. They are not the AGPL application. Public portrait and concept art are excluded from this directory and from the delivered site.


### Grooming revision, 2026-10-29

The current GLB replaces the formerly fitted short01 hair/eyebrow001 meshes with original clipped-scalp/layered-beard/brow geometry and a shared RGBA atlas (procedural scalp/beard, cropped CC0 eyebrow001.png for brows/moustache) (`tools/groom_avatar.py`). The older CC0 source files are retained for reproducibility of the preceding revision. Generic skin and eye data remain licensed sources; subtle normal/roughness maps are procedural. The adapted eye image now also reduces brightness, with its recipe and current hash in SOURCES.json.
