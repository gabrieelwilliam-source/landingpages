import test from 'node:test';
import assert from 'node:assert/strict';
import {Document} from '@gltf-transform/core';
import sharp from 'sharp';
import {bakeHeroAlbedo} from '../tools/bake-hero-albedo.mjs';

test('mobile albedo retains material tint and shared-material primitives without applying tint twice',async()=>{
 const doc=new Document(),buffer=doc.createBuffer(),image=await sharp({create:{width:1,height:1,channels:4,background:{r:255,g:255,b:255,alpha:.3}}}).png().toBuffer();
 const texture=doc.createTexture().setImage(image).setMimeType('image/png');
 const material=doc.createMaterial().setBaseColorTexture(texture).setBaseColorFactor([.8,.6,.4,.25]);
 const mesh=doc.createMesh();doc.createScene().addChild(doc.createNode().setMesh(mesh));
 for(let n=0;n<2;n++)mesh.addPrimitive(doc.createPrimitive().setMaterial(material)
  .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint16Array([0,1,2])).setBuffer(buffer))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array([0,0,0,1,0,0,0,1,0])).setBuffer(buffer))
  .setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(new Float32Array(6)).setBuffer(buffer))
  .setAttribute('COLOR_0',doc.createAccessor().setType('VEC4').setArray(new Float32Array([.5,.5,.5,.2,.5,.5,.5,.2,.5,.5,.5,.2])).setBuffer(buffer)));
 await bakeHeroAlbedo(doc);
 for(const p of mesh.listPrimitives()){
  const c=p.getAttribute('COLOR_0').getElement(0,[]);for(let k=0;k<3;k++)assert.ok(Math.abs(c[k]-[.4,.3,.2][k])<1e-6);assert.equal(c[3],1,'opaque source alpha must remain opaque in the mask-based mobile material');
 }
 assert.equal(material.getBaseColorTexture(),null);assert.deepEqual(material.getBaseColorFactor(),[1,1,1,1]);
});

test('mobile scalp flattens sparse cutout pixels without losing ordinary groom transparency',async()=>{
 const doc=new Document(),buffer=doc.createBuffer(),image=await sharp({create:{width:2,height:2,channels:4,background:{r:100,g:70,b:45,alpha:0}}}).png().toBuffer();
 const texture=doc.createTexture().setImage(image).setMimeType('image/png'),material=doc.createMaterial('Gabriel layered groom').setBaseColorTexture(texture).setAlphaMode('MASK').setExtras({zaionOpaqueLodTile:2});
 const primitive=doc.createPrimitive().setMaterial(material).setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint16Array([0,1,2,3,4,5])).setBuffer(buffer))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array([0,0,0,1,0,0,0,1,0,2,0,0,3,0,0,2,1,0])).setBuffer(buffer))
  .setAttribute('TEXCOORD_0',doc.createAccessor().setType('VEC2').setArray(new Float32Array([.2,.7,.3,.7,.2,.8,.7,.2,.8,.2,.7,.3])).setBuffer(buffer))
  .setAttribute('COLOR_0',doc.createAccessor().setType('VEC4').setArray(new Float32Array(24).fill(1)).setBuffer(buffer));
 doc.createMesh().addPrimitive(primitive);await bakeHeroAlbedo(doc);
 assert.deepEqual(Array.from(primitive.getIndices().getArray()),[0,1,2],'the scalp shell stays connected while transparent non-scalp cards are removed');
 assert.equal(primitive.getAttribute('COLOR_0').getElement(0,[])[3],1);assert.equal(primitive.getAttribute('COLOR_0').getElement(3,[])[3],0);
});
