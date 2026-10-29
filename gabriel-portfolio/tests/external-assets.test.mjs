import test from 'node:test';import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
function triangles(doc){return doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0)}
test('converted foliage keeps cutout alpha and packed PBR maps inside its reviewed footprint',async()=>{
 const file=new URL('../tools/vendor/external-office/fan-palm.glb',import.meta.url),doc=await io.read(file.pathname);const m=doc.getRoot().listMaterials().find(m=>m.getName().startsWith('LIVISTONA'));
 assert.ok(m);assert.equal(m.getAlphaMode(),'MASK');assert.equal(m.getDoubleSided(),true);assert.ok(m.getBaseColorTexture()&&m.getNormalTexture()&&m.getMetallicRoughnessTexture());assert.ok(triangles(doc)<6000);assert.ok((await stat(file)).size<300000);
 const {min,max}=getBounds(doc.getRoot().listScenes()[0]);assert.ok(Math.abs(min[1])<.01&&max[1]<1.85);assert.ok(max[0]-min[0]<1.91&&max[2]-min[2]<1.91);
});
test('selected task chair has grounded wheels, human scale, navy fabric and a mobile geometry budget',async()=>{
 const file=new URL('../tools/vendor/external-office/office-chair.glb',import.meta.url),doc=await io.read(file.pathname);assert.ok(triangles(doc)<10000);assert.ok((await stat(file)).size<150000);
 const m=doc.getRoot().listMaterials().find(m=>m.getName()==='zAIon chair navy fabric');assert.ok(m?.getNormalTexture());assert.equal(m.getMetallicFactor(),0);assert.ok(m.getRoughnessFactor()>.8);const c=m.getBaseColorFactor();assert.ok(c[2]>c[0]);
 const {min,max}=getBounds(doc.getRoot().listScenes()[0]);assert.ok(Math.abs(min[1])<.01&&max[1]>.93&&max[1]<.98);assert.ok(max[0]-min[0]<1.0&&max[2]-min[2]<1.0,'fits existing 1.16m padded chair footprint');
});
test('promoted sectors contain the real imported materials and remain self-contained GLBs',async()=>{
 for(const [index,name] of [[0,'LIVISTONA_CHINENSIS_Mat'],[2,'zAIon chair navy fabric']]){
  const file=new URL(`../public/models/environment-${index}.glb`,import.meta.url),data=await readFile(file),doc=await io.read(file.pathname);assert.ok(doc.getRoot().listMaterials().some(m=>m.getName().startsWith(name)));assert.ok(data.length<2*1024*1024);
  const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));assert.ok(json.images.every(i=>i.bufferView!==undefined&&!i.uri),'textures stay packed; no external fetches');
 }
});
