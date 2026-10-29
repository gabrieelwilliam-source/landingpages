import test from 'node:test';
import assert from 'node:assert/strict';
import {Document} from '@gltf-transform/core';
import {stripHeroMicrogeometry} from '../tools/strip-hero-microgeometry.mjs';

test('mobile grooming removes separate brow hairs while retaining the beard silhouette, iris and lips',()=>{
 const doc=new Document(),buffer=doc.createBuffer(),joint=doc.createNode();
 doc.createSkin().addJoint(joint).setInverseBindMatrices(doc.createAccessor().setType('MAT4').setArray(new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])).setBuffer(buffer));
 const mesh=doc.createMesh(),groom=doc.createMaterial('Gabriel layered groom'),eye=doc.createMaterial('CC0 bluegreen iris and sclera'),skin=doc.createMaterial('CC0 adult male skin');
 function primitive(material,positions,indices){const p=doc.createPrimitive().setMaterial(material).setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer)).setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));mesh.addPrimitive(p);return p;}
 const positions=[],indices=[],columns=22,rows=6;
 for(let row=0;row<=rows;row++)for(let col=0;col<=columns;col++)positions.push(-.09+.18*col/columns,1.40+.18*row/rows,.10);
 for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){const a=row*(columns+1)+col;indices.push(a,a+1,a+columns+1,a+1,a+columns+2,a+columns+1);}
 const silhouetteCount=indices.length,hair=positions.length/3;positions.push(.03,1.717,.105,.0302,1.717,.105,.031,1.722,.105);indices.push(hair,hair+1,hair+2);
 const beard=primitive(groom,positions,indices),iris=primitive(eye,[.03,1.68,.11,.033,1.68,.11,.031,1.684,.11],[0,1,2]),lip=primitive(skin,[-.01,1.61,.10,.01,1.61,.10,0,1.615,.10],[0,1,2]);
 stripHeroMicrogeometry(doc);
 assert.equal(beard.getIndices().getCount(),silhouetteCount,'connected beard silhouette must survive after the isolated hair is removed');
 assert.equal(iris.getIndices().getCount(),3,'small iris topology remains protected');assert.equal(lip.getIndices().getCount(),3,'small lip topology remains protected');
});
