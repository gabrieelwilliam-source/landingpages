import {stripHeroMicrogeometry,splitHeroFace,heroPhysicalPositions} from './strip-hero-microgeometry.mjs';
import {bakeHeroAlbedo} from './bake-hero-albedo.mjs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {simplify,meshopt,prune,weld,join,simplifyPrimitive,joinPrimitives,compactPrimitive} from '@gltf-transform/functions';
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
 let heroEyes=null;
 if(name==='gabriel-rigged'){
  await bakeHeroAlbedo(doc);
  stripHeroMicrogeometry(doc);
  // A fitted buzz cut survives on the scalp colours when hair cards are removed.
  const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};
  for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives())if(primitive.getMaterial()?.getName()==='CC0 adult male skin'){
   const xyz=heroPhysicalPositions(doc,primitive),colors=primitive.getAttribute('COLOR_0');
   for(let i=0;i<colors.getCount();i++){
    const x=xyz[i*3],height=xyz[i*3+1],front=smooth((xyz[i*3+2]+.015)/.045),line=1.675*(1-front)+(1.775+.018*Math.exp(-(((Math.abs(x)-.065)/.025)**2)))*front;
    const mask=smooth((height-line)/.010),c=colors.getElement(i,[]);for(let k=0;k<3;k++)c[k]=c[k]*(1-mask)+[.012,.009,.007][k]*mask;
    const browLine=1.712+.002*Math.sin((Math.abs(x)-.011)/.052*Math.PI),brow=smooth(1-Math.abs(height-browLine)/.006)*smooth((Math.abs(x)-.007)/.008)*smooth((.075-Math.abs(x))/.012)*smooth((xyz[i*3+2]-.065)/.03)*.8;
    for(let k=0;k<3;k++)c[k]=c[k]*(1-brow)+[.04,.032,.025][k]*brow;colors.setElement(i,c);
   }
  }
  // Retain the iris/sclera topology: generic face simplification erases the pupil.
  for(const mesh of doc.getRoot().listMeshes())for(const primitive of [...mesh.listPrimitives()]){
   const materialName=primitive.getMaterial()?.getName()||'';
   if(/iris/.test(materialName))heroEyes=primitive;
   else if(/close-cropped hair/.test(materialName)){mesh.removePrimitive(primitive);primitive.dispose();}
  }
  const lowMaterial=doc.createMaterial('Hero vertex-colour mobile material').setMetallicFactor(0).setRoughnessFactor(.86).setAlphaMode('MASK').setAlphaCutoff(.5).setDoubleSided(true);
  for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives())p.setMaterial(p===heroEyes?lowMaterial.clone().setName('Protected iris topology'):lowMaterial);
  await doc.transform(join());
 }
 // Distant models omit micro-surface atlases and their UV seams, retaining vertex colours and skinning.
 for(const material of doc.getRoot().listMaterials())material.setNormalTexture(null).setMetallicRoughnessTexture(null).setRoughnessFactor(.86);
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){primitive.setAttribute('TEXCOORD_0',null);primitive.setAttribute('TANGENT',null)}
 if(name==='gabriel-rigged'){for(const mesh of doc.getRoot().listMeshes()){const pieces=mesh.listPrimitives().filter(p=>p.getMaterial().getName()!=='Protected iris topology');if(pieces.length>1){const merged=joinPrimitives(pieces);for(const p of pieces){mesh.removePrimitive(p);p.dispose()}mesh.addPrimitive(merged)}}}
 // Close authored UV seams after colour baking, before border-preserving reduction.
 if(name==='gabriel-rigged')for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
  const position=primitive.getAttribute('POSITION'),normal=primitive.getAttribute('NORMAL'),color=primitive.getAttribute('COLOR_0'),joints=primitive.getAttribute('JOINTS_0'),weights=primitive.getAttribute('WEIGHTS_0'),groups=new Map();
  for(let i=0;i<position.getCount();i++){
   const key=[...position.getElement(i,[]),...joints.getElement(i,[]),...weights.getElement(i,[])].map(v=>Math.round(v*1e6)).join(',');let group=groups.get(key);if(!group){group=[];groups.set(key,group)}group.push(i);
  }
  for(const indices of groups.values())if(indices.length>1){
   const n=[0,0,0],c=[0,0,0,0];for(const i of indices){const nn=normal.getElement(i,[]),cc=color.getElement(i,[]);for(let k=0;k<3;k++)n[k]+=nn[k];for(let k=0;k<4;k++)c[k]+=cc[k];}
   const length=Math.hypot(...n)||1;for(let k=0;k<3;k++)n[k]/=length;for(let k=0;k<4;k++)c[k]/=indices.length;for(const i of indices){normal.setElement(i,n);color.setElement(i,c);}
  }
 }
 await doc.transform(weld());
 if(name==='gabriel-rigged'){
  for(const mesh of doc.getRoot().listMeshes()){
   heroEyes=mesh.listPrimitives().find(p=>p.getMaterial().getName()==='Protected iris topology');
   for(const body of [...mesh.listPrimitives()].filter(p=>p!==heroEyes)){
   const face=splitHeroFace(doc,body),ends=splitHeroFace(doc,body,'extremities');compactPrimitive(body);compactPrimitive(face);compactPrimitive(ends);
   simplifyPrimitive(face,{simplifier:MeshoptSimplifier,ratio:.24,error:.004,lockBorder:true});
   simplifyPrimitive(ends,{simplifier:MeshoptSimplifier,ratio:.12,error:.006,lockBorder:true});
   simplifyPrimitive(body,{simplifier:MeshoptSimplifier,ratio:.04,error:.025,lockBorder:true});
   console.log("Hero LOD region budgets",face.getIndices().getCount()/3,ends.getIndices().getCount()/3,body.getIndices().getCount()/3);
   heroEyes?.setMaterial(body.getMaterial());
   const merged=joinPrimitives([body,face,ends,...(heroEyes?[heroEyes]:[])]);if(heroEyes)mesh.removePrimitive(heroEyes);mesh.removePrimitive(body).addPrimitive(merged);body.dispose();face.dispose();ends.dispose();heroEyes?.dispose();
  }
  }
 }else await doc.transform(simplify({simplifier:MeshoptSimplifier,ratio:.14,error:.015,lockBorder:false}));
 await doc.transform(prune(),meshopt({encoder:MeshoptEncoder,level:'high'}));
 const primitives=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives());
 const triangles=primitives.reduce((n,p)=>n+p.getIndices().getCount()/3,0);
 assert.ok(triangles<7000,`${name}: LOD budget ${triangles}`);
 const path=new URL(name+'.glb',output);await io.write(path.pathname,doc);
 const bytes=await readFile(path);entries.push({name:name+'.glb',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles});
 console.log(name,triangles,'triangles',bytes.length,'bytes');
}
await writeFile(new URL('manifest.json',output),JSON.stringify({purpose:'Original low detail character variants; same rigs and authored clips',assets:entries},null,2)+'\n');
