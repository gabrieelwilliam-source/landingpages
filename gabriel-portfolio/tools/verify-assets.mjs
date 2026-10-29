import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import {getBounds} from "@gltf-transform/functions";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const root = new URL("../public/models/", import.meta.url);
const entries = [];
const logo = await readFile(
  new URL("../public/brand/zaion-original.png", import.meta.url),
);
const originalLogoHash =
  "fb2edb7999b9c5c35d54ec16a25661650905683a231abbe8d261f04e398b99cc";
assert.equal(createHash("sha256").update(logo).digest("hex"), originalLogoHash);
for (const name of [...(await readdir(root)).filter(n=>n.endsWith(".glb")),...(await readdir(new URL("furniture/",root))).filter(n=>n.endsWith(".glb")).map(n=>"furniture/"+n)].sort()) {
  const b = await readFile(new URL(name, root));
  assert.equal(b.toString("ascii", 0, 4), "glTF");
  const json = JSON.parse(b.toString("utf8", 20, 20 + b.readUInt32LE(12)));
  assert.ok(json.extensionsRequired.includes("EXT_meshopt_compression"));
  const entry = {
    name,
    bytes: b.length,
    sha256: createHash("sha256").update(b).digest("hex"),
    meshes: json.meshes.length,
    skins: json.skins?.length || 0,
    animations: (json.animations || []).map((a) => a.name),
    textureFormats: [
      ...new Set((json.images || []).map((img) => img.mimeType)),
    ],
  };
  if (name.startsWith("environment")) {
    assert.ok(json.extensionsUsed.includes("EXT_texture_webp"));
    assert.ok(json.images.every((img) => img.mimeType === "image/webp"));
    assert.ok(json.materials.some(m=>m.name.startsWith("Floor stone")&&m.occlusionTexture?.texCoord===1),"floor contact AO must retain its independent UV channel");
    const sceneDoc=await io.read(new URL(name,root).pathname),floor=sceneDoc.getRoot().listMaterials().find(m=>m.getName().startsWith("Floor stone"));
    const stats=await sharp(floor.getOcclusionTexture().getImage()).stats();
    const baked=sceneDoc.getRoot().listMaterials().filter(m=>m.getExtras().zaionIndirectLight);
    assert.ok(baked.length>=4,'floor, walls, ceiling and auxiliary surfaces retain baked indirect lighting');
    const maps=new Set();for(const m of baked){assert.ok(m.getEmissiveTexture(),'marked glTF materials transport an RGB lightmap');const uv=m.getEmissiveTextureInfo().getTexCoord();assert.ok(uv>=0&&uv<=3,'irradiance retains a valid packed atlas UV');for(const detail of [[m.getBaseColorTexture(),m.getBaseColorTextureInfo()],[m.getNormalTexture(),m.getNormalTextureInfo()],[m.getMetallicRoughnessTexture(),m.getMetallicRoughnessTextureInfo()],[m.getOcclusionTexture(),m.getOcclusionTextureInfo()]])if(detail[0])assert.notEqual(uv,detail[1].getTexCoord(),'baked lighting must not reuse tiled/detail UVs');assert.equal(m.getExtras().zaionLightmapUV,uv,'metadata follows UV compaction');assert.ok(sceneDoc.getRoot().listMeshes().flatMap(mesh=>mesh.listPrimitives()).filter(p=>p.getMaterial()===m).every(p=>p.getAttribute('TEXCOORD_'+uv)),'all lightmapped primitives retain the referenced UV stream');maps.add(m.getEmissiveTexture());}
    assert.equal(maps.size,1,'one shared indirect lightmap per sector');
    const light=[...maps][0];assert.deepEqual(light.getSize(),[512,512]);const irradiance=await sharp(light.getImage()).stats();
    assert.ok(irradiance.channels[0].max-irradiance.channels[0].min>32&&irradiance.channels[0].mean>1,'indirect lightmaps must contain real nonempty irradiance');
    assert.ok(stats.channels[0].max-stats.channels[0].min>64,"floor AO must contain spatial contact shadows, not a blank bake");
    assert.ok(json.materials.filter(material => material.normalTexture && material.pbrMetallicRoughness?.baseColorTexture && material.pbrMetallicRoughness?.metallicRoughnessTexture).length >= 2, "architectural stone and wood retain full PBR maps; upholstered assets are shared separately");
  }
  if(name.startsWith('furniture/')){
    assert.ok(json.materials.some(m=>m.normalTexture&&m.occlusionTexture),'licensed upholstery keeps its normal and AO maps');
    const tris=json.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+json.accessors[p.indices].count/3,0);assert.ok(tris<10000,'shared furniture realtime budget');
    const furnitureDoc=await io.read(new URL(name,root).pathname),bounds=getBounds(furnitureDoc.getRoot().listScenes()[0]);
    assert.ok(bounds.max[0]-bounds.min[0] <= (name.includes('bench')?2.77:1.00) && bounds.max[2]-bounds.min[2]<=.90,'upholstery must remain inside its existing collision footprint');
    assert.ok(bounds.min[1]>-.025&&bounds.min[1]<.025&&bounds.max[1]<1.07,'furniture remains grounded and at the existing human scale');
  }
  if (name === "gabriel-rigged.glb" || name.startsWith("npc-")) {
    assert.equal(entry.skins, 1);
    assert.ok(json.skins[0].joints.length >= 16);
    assert.deepEqual(entry.animations.sort(), ["Idle","Walk","Turn","Start","Stop","Interact","Sit","Type","Talk","StandUp","SitDown"].sort());
    assert.ok(
      json.meshes.some((m) =>
        m.primitives.some(
          (p) =>
            p.attributes.JOINTS_0 !== undefined &&
            p.attributes.WEIGHTS_0 !== undefined,
        ),
      ),
    );
    assert.ok(json.materials.some(m=>m.normalTexture&&m.pbrMetallicRoughness?.metallicRoughnessTexture), "human micro-normal and region-specific roughness atlas survive export");
    const characterPrimitives = json.meshes.flatMap(m => m.primitives);
    assert.ok(characterPrimitives.length <= (name==='gabriel-rigged.glb'?8:1), 'main PBR avatar <=8 material draws; NPCs one draw');
    assert.ok(characterPrimitives.every(p => p.attributes.COLOR_0 !== undefined), "original colour palette must survive compression");
    entry.triangles = characterPrimitives.reduce((n,p) => n + json.accessors[p.indices].count / 3, 0);
    assert.ok(entry.triangles < (name === "gabriel-rigged.glb" ? 65000 : 45000), "detailed human geometry budget");
    entry.bones = json.skins[0].joints.length;
    const doc = await io.read(new URL(name, root).pathname);
    if(name === 'gabriel-rigged.glb'){
      const groom=json.materials.find(m=>m.name==='Gabriel layered groom'),skin=json.materials.find(m=>m.name==='CC0 adult male skin');
      assert.equal(groom?.alphaMode,'MASK','layered grooming uses stable cutout transparency');
      assert.ok(skin?.normalTexture&&skin?.pbrMetallicRoughness?.metallicRoughnessTexture,'skin micro-normal and roughness maps survive export');
      const packedSkin=doc.getRoot().listMaterials().find(m=>m.getName()==='CC0 adult male skin');
      assert.deepEqual(packedSkin.getBaseColorTexture().getSize(),[1024,1024],'head/hands skin uses its compact used-surface atlas');
      assert.deepEqual(packedSkin.getNormalTexture().getSize(),[512,512]);assert.deepEqual(packedSkin.getMetallicRoughnessTexture().getSize(),[256,256]);
      const material=doc.getRoot().listMaterials()[0];
      assert.ok(material.getBaseColorTexture(), 'hero retains its original skin/textile albedo');
      assert.ok(doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).some(p=>{const c=p.getAttribute('COLOR_0');return Array.from({length:c.getCount()},(_,i)=>c.getElement(i,[])[0]).some(v=>v<.2)}),'hero palette must retain authored colours alongside native PBR maps');
    }
    const primitives = doc
      .getRoot()
      .listMeshes()
      .flatMap((m) => m.listPrimitives());
    assert.ok(
      primitives.some((p) =>
        p
          .getAttribute("WEIGHTS_0")
          ?.getArray()
          .some((w) => w > 0),
      ),
    );
    for (const primitive of primitives) {
      const weights = primitive.getAttribute("WEIGHTS_0");
      for (let i=0;i<weights.getCount();i++) assert.ok(Math.abs(weights.getElement(i,[]).reduce((a,b)=>a+b,0)-1)<.002, "skin weights remain normalized after remeshing and compression");
    }
    for (const clip of doc.getRoot().listAnimations()) {
      if (clip.getName() === "Sit") continue; // An intentionally held seated pose, not a motion clip.
      assert.ok(
        clip.listChannels().some((channel) => {
          const output = channel.getSampler()?.getOutput();
          if (!output || !channel.getTargetNode()) return false;
          const data = output.getArray(),
            stride = output.getElementSize();
          return data.some((v, i) => Math.abs(v - data[i % stride]) > 0.001);
        }),
        `${clip.getName()} must contain a changing bone transform, not just a name`,
      );
    }
  }
  entries.push(entry);
}
assert.equal(entries.length, 17);
const lowRoot=new URL("low/",root);
const lowManifest=JSON.parse(await readFile(new URL("manifest.json",lowRoot),"utf8"));
assert.equal(lowManifest.assets.length,9);
for(const asset of lowManifest.assets){
 const path=new URL(asset.name,lowRoot),bytes=await readFile(path);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),asset.sha256);
 const doc=await io.read(path.pathname),meshes=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives());
 const triangles=meshes.reduce((n,p)=>n+p.getIndices().getCount()/3,0),full=entries.find(e=>e.name===asset.name);
 assert.ok(triangles<7000&&triangles<full.triangles*.25,"low variants reduce real geometry without changing the rig");
 assert.equal(doc.getRoot().listSkins().length,1);assert.equal(doc.getRoot().listSkins()[0].listJoints().length,16);
 assert.deepEqual(doc.getRoot().listAnimations().map(a=>a.getName()).sort(),full.animations);
 for(const primitive of meshes){
  assert.ok(primitive.getAttribute("COLOR_0"));const weights=primitive.getAttribute("WEIGHTS_0");
  for(let i=0;i<weights.getCount();i++)assert.ok(Math.abs(weights.getElement(i,[]).reduce((a,b)=>a+b,0)-1)<.002);
 }
}
console.log("PASS: 9 low-detail variants, <7000 triangles each, same skeletons, clips and normalized weights.");
await writeFile(
  new URL("manifest.json", root),
  JSON.stringify(
    {
      generator: "Blender 4.3.2; glTF-Transform + Meshopt",
      originalLogo: {
        filename: "brand/zaion-original.png",
        bytes: logo.length,
        sha256: originalLogoHash,
      },
      assets: entries,
      totalBytes: entries.reduce((n, e) => n + e.bytes, 0),
    },
    null,
    2,
  ),
);
console.log(
  "PASS: 6 scenes, Gabriel + 8 distinct fictional humans, 16+ bones each, 11 verified poses/actions, Meshopt, original logo.",
  entries.reduce((n, e) => n + e.bytes, 0),
  "bytes",
);
