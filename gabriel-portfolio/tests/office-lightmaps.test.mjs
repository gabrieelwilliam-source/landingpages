import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {applyOfficeLightmap} from '../src/lib/office-lightmaps.mjs';

for(const channel of [0,1,2])test(`marked glTF irradiance preserves UV${channel}, colour space and PBR maps without self-emission`,()=>{
 const light=new T.Texture();light.channel=channel;light.colorSpace=T.SRGBColorSpace;
 const normal=new T.Texture(),ao=new T.Texture(),m=new T.MeshStandardMaterial({emissive:0xffffff,emissiveMap:light,normalMap:normal,aoMap:ao});m.userData.zaionIndirectLight=true;
 assert.equal(applyOfficeLightmap(m),true);assert.equal(m.lightMap,light);assert.equal(m.lightMap.channel,channel);assert.equal(m.lightMap.colorSpace,T.SRGBColorSpace);
 assert.equal(m.emissiveMap,null);assert.equal(m.emissive.getHex(),0);assert.equal(m.normalMap,normal);assert.equal(m.aoMap,ao);assert.equal(m.lightMapIntensity,Math.PI);
 assert.equal(applyOfficeLightmap(m),true);assert.equal(m.lightMapIntensity,Math.PI,'re-registering must not multiply the irradiance twice');
});
test('real screen and fixture emission remains unchanged',()=>{
 const tex=new T.Texture(),m=new T.MeshStandardMaterial({emissive:0x204080,emissiveMap:tex});
 assert.equal(applyOfficeLightmap(m),false);assert.equal(m.emissiveMap,tex);assert.equal(m.emissive.getHex(),0x204080);assert.equal(m.lightMap,null);
});
