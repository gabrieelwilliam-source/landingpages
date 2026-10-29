import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';import sharp from 'sharp';import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const [before,after,out]=process.argv.slice(2);if(!out)throw Error('before models dir, after models dir, output JSON required');await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const results=[];
for(let i=0;i<6;i++){
 const pair=[];
 for(const root of [before,after]){
  const path=`${root}/environment-${i}.glb`,data=await readFile(path),doc=await io.read(path);const primitives=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives());const light=doc.getRoot().listMaterials().find(m=>m.getExtras().zaionIndirectLight).getEmissiveTexture();const stats=await sharp(light.getImage()).stats();
  pair.push({bytes:data.length,triangles:primitives.reduce((n,p)=>n+p.getIndices().getCount()/3,0),primitives:primitives.length,bounds:getBounds(doc.getRoot().listScenes()[0]),lightmapSize:light.getSize(),irradianceChannelMeans:stats.channels.map(c=>c.mean),sha256:createHash('sha256').update(data).digest('hex')});
 }
 assert.equal(pair[0].triangles,pair[1].triangles,`sector ${i} geometry changed`);assert.equal(pair[0].primitives,pair[1].primitives,`sector ${i} draw structure changed`);assert.deepEqual(pair[0].bounds,pair[1].bounds,`sector ${i} bounds changed`);assert.deepEqual(pair[0].lightmapSize,pair[1].lightmapSize);results.push({sector:i,before:pair[0],after:pair[1]});
}
await writeFile(out,JSON.stringify(results,null,2));console.log(results.map(r=>({sector:r.sector,triangles:r.after.triangles,bytesDelta:r.after.bytes-r.before.bytes,lightmapMeanBefore:r.before.irradianceChannelMeans[0],lightmapMeanAfter:r.after.irradianceChannelMeans[0]})));
