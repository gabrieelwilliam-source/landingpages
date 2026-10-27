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
  }
  if (name === "gabriel-rigged.glb") {
    assert.equal(entry.skins, 1);
    assert.ok(json.skins[0].joints.length >= 16);
    assert.deepEqual(entry.animations.sort(), ["Idle", "Turn", "Walk"]);
    assert.ok(
      json.meshes.some((m) =>
        m.primitives.some(
          (p) =>
            p.attributes.JOINTS_0 !== undefined &&
            p.attributes.WEIGHTS_0 !== undefined,
        ),
      ),
    );
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
    for (const clip of doc.getRoot().listAnimations()) {
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
assert.equal(entries.length, 7);
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
  "PASS: 6 scenes, skinned human, 16+ bones, Idle/Walk/Turn, Meshopt compression, original logo checksum.",
  entries.reduce((n, e) => n + e.bytes, 0),
  "bytes",
);
