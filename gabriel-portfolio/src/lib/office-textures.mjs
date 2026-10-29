// Preserve the authored UVs, colour spaces and maps while keeping oblique
// stone/wood/cloth surfaces readable. Shared textures are uploaded only once.
export function prepareOfficeTextures(material, anisotropy) {
  const limit = Math.max(1, Math.min(8, Math.floor(anisotropy)));
  for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'lightMap', 'emissiveMap']) {
    const texture = material[key];
    if (!texture?.isTexture || texture.anisotropy === limit) continue;
    texture.anisotropy = limit;
    texture.needsUpdate = true;
  }
}
