import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {simplify,meshopt,prune,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const root=new URL('../public/models/',import.meta.url);const output=new URL('low/',root);await mkdir(output,{recursive:true});
const names=['gabriel-rigged',...Array.from({length:8},(_,i)=>'npc-'+i)],entries=[];
for(const name of names){
 const doc=await io.read(new URL(name+'.glb',root).pathname);
 // Distant models omit micro-surface atlases and their UV seams, retaining vertex colours and skinning.
 for(const material of doc.getRoot().listMaterials())material.setNormalTexture(null).setMetallicRoughnessTexture(null).setRoughnessFactor(.86);
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){primitive.setAttribute('TEXCOORD_0',null);primitive.setAttribute('TANGENT',null)}
 await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:name==='gabriel-rigged'?.08:.14,error:.015,lockBorder:false}),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
 const primitives=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives());
 const triangles=primitives.reduce((n,p)=>n+p.getIndices().getCount()/3,0);
 assert.ok(triangles<7000,`${name}: LOD budget ${triangles}`);
 const path=new URL(name+'.glb',output);await io.write(path.pathname,doc);
 const bytes=await readFile(path);entries.push({name:name+'.glb',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles});
 console.log(name,triangles,'triangles',bytes.length,'bytes');
}
await writeFile(new URL('manifest.json',output),JSON.stringify({purpose:'Original low detail character variants; same rigs and authored clips',assets:entries},null,2)+'\n');
