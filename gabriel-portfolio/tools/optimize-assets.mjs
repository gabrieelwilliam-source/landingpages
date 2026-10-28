import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  weld,
  join,
  prune,
  meshopt,
  simplify,
  textureCompress,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
const dir = new URL("../public/models", import.meta.url).pathname;
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
for (const name of await readdir(dir)) {
  if (!name.endsWith(".glb") || (process.env.OFFICE_ONLY === "true" && !name.startsWith("environment-")) || (process.env.CHARACTER_ONLY === "true" && name !== "gabriel-rigged.glb") || (process.env.CAST_ONLY === "true" && !name.startsWith("npc-"))) continue;
  const path = dir + "/" + name,
    old = (await stat(path)).size;
  const doc = await io.read(path);
  await doc.transform(
    dedup(),
    weld(),
    join(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp", quality: 85 }),
    ...((name.startsWith("environment") || name.startsWith("npc-"))
      ? [
          simplify({
            simplifier: MeshoptSimplifier,
            ratio: name.startsWith("npc-") ? 0.65 : 0.7,
            error: 0.003,
            lockBorder: false,
          }),
        ]
      : []),
    meshopt({ encoder: MeshoptEncoder, level: "high" }),
  );
  await io.write(path, doc);
  console.log(
    name,
    old,
    "->",
    (await stat(path)).size,
    "skins",
    doc.getRoot().listSkins().length,
    "animations",
    doc
      .getRoot()
      .listAnimations()
      .map((a) => a.getName()),
  );
}
