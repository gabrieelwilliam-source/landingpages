import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {simplify,meshopt,prune} from '@gltf-transform/functions';
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
 await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:name==='gabriel-rigged'?.14:.20,error:.015,lockBorder:false}),prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
 const primitives=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives());
 const triangles=primitives.reduce((n,p)=>n+p.getIndices().getCount()/3,0);
 assert.ok(triangles<7000,`${name}: LOD budget ${triangles}`);
 const path=new URL(name+'.glb',output);await io.write(path.pathname,doc);
 const bytes=await readFile(path);entries.push({name:name+'.glb',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles});
 console.log(name,triangles,'triangles',bytes.length,'bytes');
}
await writeFile(new URL('manifest.json',output),JSON.stringify({purpose:'Original low detail character variants; same rigs and authored clips',assets:entries},null,2)+'\n');
