import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,weld,join,prune,simplify,textureCompress,meshopt,getBounds} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';import {writeFile,readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const input=process.argv[2],output=process.argv[3],low=process.argv.includes('--low'),office=process.argv.includes('--office');if(!input||!output)throw Error('input and output paths required');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});const doc=await io.read(input);
for(const m of doc.getRoot().listMaterials()){
 if(/LIVISTONA/.test(m.getName()))m.setAlphaMode('MASK').setAlphaCutoff(.4).setDoubleSided(true);
 if(/^(LIVISTONA_CHINENSIS|PLANTER_BOTTOM_CROSS)_Mat/.test(m.getName()))m.setMetallicFactor(0);
 if(m.getName().startsWith('Floor stone'))m.setOcclusionStrength(.72);
}
await doc.transform(dedup(),weld(),join(),prune(),simplify({simplifier:MeshoptSimplifier,ratio:office?.7:low?.055:.18,error:office?.003:low?.006:.002,lockBorder:false}),textureCompress({encoder:sharp,targetFormat:'webp',resize:low?[512,512]:[1024,1024],quality:85}),meshopt({encoder:MeshoptEncoder,level:'high'}));
for(const material of doc.getRoot().listMaterials())if(material.getExtras().zaionIndirectLight)material.setExtras({...material.getExtras(),zaionLightmapUV:material.getEmissiveTextureInfo().getTexCoord()});
await io.write(output,doc);const bytes=await readFile(output);const report={inputBytes:(await readFile(input)).length,outputBytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),triangles:doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((s,p)=>s+p.getIndices().getCount()/3,0),materials:doc.getRoot().listMaterials().map(m=>({name:m.getName(),alpha:m.getAlphaMode(),doubleSided:m.getDoubleSided(),normal:!!m.getNormalTexture(),roughnessMap:!!m.getMetallicRoughnessTexture()})),textures:doc.getRoot().listTextures().map(t=>({size:t.getSize(),mime:t.getMimeType()})),bounds:getBounds(doc.getRoot().listScenes()[0]),licenseStatus:'PENDING',published:false};await writeFile(output+'.json',JSON.stringify(report,null,2));console.log(report);
