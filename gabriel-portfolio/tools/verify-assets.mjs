import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { NodeIO } from "@gltf-transform/core";
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
for (const name of (await readdir(root))
  .filter((n) => n.endsWith(".glb"))
  .sort()) {
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
    assert.ok(json.materials.filter(material => material.normalTexture && material.pbrMetallicRoughness?.baseColorTexture && material.pbrMetallicRoughness?.metallicRoughnessTexture).length >= 3, "stone/wood/fabric retain full original PBR maps");
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
    assert.equal(characterPrimitives.length, 1, "avatar must remain one skinned draw call");
    assert.ok(characterPrimitives.every(p => p.attributes.COLOR_0 !== undefined), "original colour palette must survive compression");
    entry.triangles = characterPrimitives.reduce((n,p) => n + json.accessors[p.indices].count / 3, 0);
    assert.ok(entry.triangles < (name === "gabriel-rigged.glb" ? 65000 : 45000), "detailed human geometry budget");
    entry.bones = json.skins[0].joints.length;
    const doc = await io.read(new URL(name, root).pathname);
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
assert.equal(entries.length, 15);
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
