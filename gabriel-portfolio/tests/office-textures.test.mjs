import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {prepareOfficeTextures} from '../src/lib/office-textures.mjs';
import {applyOfficeLightmap} from '../src/lib/office-lightmaps.mjs';

test('texture filtering preserves colour management, tiled detail UVs and independent baked light UVs',()=>{
 const detail=new T.Texture();detail.colorSpace=T.SRGBColorSpace;detail.wrapS=T.RepeatWrapping;detail.repeat.set(4,7);detail.offset.set(.1,.2);
 const normal=new T.Texture();normal.channel=0;
 const light=new T.Texture();light.channel=2;light.colorSpace=T.SRGBColorSpace;
 const m=new T.MeshStandardMaterial({map:detail,normalMap:normal,emissiveMap:light});m.userData.zaionIndirectLight=true;
 prepareOfficeTextures(m,8);applyOfficeLightmap(m);
 assert.equal(m.map,detail);assert.equal(m.normalMap,normal);assert.equal(m.lightMap,light);assert.equal(m.emissiveMap,null);
 assert.equal(detail.colorSpace,T.SRGBColorSpace);assert.equal(normal.colorSpace,T.NoColorSpace);assert.equal(light.channel,2);
 assert.deepEqual(detail.repeat.toArray(),[4,7]);assert.deepEqual(detail.offset.toArray(),[.1,.2]);assert.equal(detail.wrapS,T.RepeatWrapping);
 assert.equal(light.anisotropy,8);assert.equal(m.lightMapIntensity,Math.PI);
 const versions=[detail.version,normal.version,light.version];prepareOfficeTextures(m,8);assert.deepEqual([detail.version,normal.version,light.version],versions,'shared maps must not trigger repeated GPU uploads');
});
test('mobile and software filtering respect the actual hardware budget',()=>{
 const m=new T.MeshStandardMaterial({map:new T.Texture()});prepareOfficeTextures(m,2);assert.equal(m.map.anisotropy,2);
 prepareOfficeTextures(m,1);assert.equal(m.map.anisotropy,1);prepareOfficeTextures(m,32);assert.equal(m.map.anisotropy,8);
});
