import {modularSofa} from './modular-sofa.mjs';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,join,prune,simplify,textureCompress,meshopt,getBounds} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const output=new URL('../public/models/furniture/',import.meta.url);await mkdir(output,{recursive:true});const assets=[];
for(const kind of ['lounge-chair','lounge-bench']){
 const doc=await io.read(new URL('vendor/furniture/SheenChair.glb',import.meta.url).pathname);
 doc.getRoot().listExtensionsUsed().filter(e=>e.extensionName==='KHR_materials_variants').forEach(e=>e.dispose());
 for(const m of doc.getRoot().listMaterials()){
  if(m.getName().includes('fabric'))m.setBaseColorFactor(kind==='lounge-chair'?[.025,.055,.14,1]:[.54,.49,.41,1]).setMetallicFactor(0).setRoughnessFactor(.86);
  if(m.getName().includes('wood'))m.setBaseColorFactor([.08,.042,.022,1]).setMetallicFactor(0).setRoughnessFactor(.65);
  for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo(),m.getMetallicRoughnessTextureInfo()]){
   const transform=info?.getExtension('KHR_texture_transform');if(transform){const [x,y]=transform.getScale();transform.setScale([x*1.15,y*1.5])}
  }
 }
 const scene=doc.getRoot().listScenes()[0];
 if(kind==='lounge-bench')modularSofa(doc);
 else{
  const wrapper=doc.createNode('zAIon adapted CC0 upholstered seating').setScale([1.15,1.5,1.5]).setTranslation([0,.00011,0]);
  for(const node of [...scene.listChildren()]){scene.removeChild(node);wrapper.addChild(node)}scene.addChild(wrapper);
 }
 await doc.transform(dedup(),weld(),join(),prune(),simplify({simplifier:MeshoptSimplifier,ratio:kind==='lounge-chair'?.17:.075,error:.001,lockBorder:false}),textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:88}),meshopt({encoder:MeshoptEncoder,level:'high'}));
 const file=new URL(kind+'.glb',output);await io.write(file.pathname,doc);const b=await readFile(file);const triangles=doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0);
 assets.push({name:kind+'.glb',triangles,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),bounds:getBounds(scene),source:'Wayfair LLC / Eric Chadwick, SheenChair, CC0',adaptation:kind==='lounge-chair'?'Scale, navy palette, dielectric wood/fabric, UV density, 512px WebP and Meshopt':'Three separate licensed upholstery seats, original rounded arms/pillows and supported walnut base; cream palette, UV density, 512px WebP and Meshopt'});console.log(kind,triangles,b.length);
}
await writeFile(new URL('manifest.json',output),JSON.stringify({assets},null,2)+'\n');
