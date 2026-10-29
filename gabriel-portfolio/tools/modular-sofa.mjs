// CC0 SheenChair upholstery in three separate seats; original rounded arms,
// cushions and supported wood base. No stretched single-chair silhouette.
import {Matrix4,Quaternion,Vector3,Euler,CylinderGeometry} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {transformPrimitive} from '@gltf-transform/functions';

export function modularSofa(doc){
 const root=doc.getRoot(),scene=root.listScenes()[0],buffer=root.listBuffers()[0];
 const fabric=root.listMaterials().find(m=>m.getName().includes('fabric'));
 const source=root.listMeshes().find(m=>m.listPrimitives().some(p=>p.getMaterial()===fabric));
 const wood=root.listMaterials().find(m=>m.getName().includes('wood')).clone().setName('Sofa walnut base').setOcclusionTexture(null);
 const arms=fabric.clone().setName('Sofa rounded upholstery').setOcclusionTexture(null);
 const mesh=doc.createMesh('Three-seat upholstered sofa');
 for(const x of [-.80,0,.80])for(const original of source.listPrimitives()){
  const p=original.clone();for(const semantic of p.listSemantics()){const attribute=p.getAttribute(semantic);p.setAttribute(semantic,attribute.clone().setArray(attribute.getArray().slice()));}
  const matrix=new Matrix4().compose(new Vector3(x,.00011,0),new Quaternion(),new Vector3(.96,1.5,1.5));
  transformPrimitive(p,matrix.toArray());mesh.addPrimitive(p);
 }
 function add(geometry,material,position,rotation=[0,0,0]){
  geometry.applyMatrix4(new Matrix4().compose(new Vector3(...position),new Quaternion().setFromEuler(new Euler(...rotation)),new Vector3(1,1,1)));
  const p=doc.createPrimitive().setMaterial(material);
  for(const [source,semantic] of [['position','POSITION'],['normal','NORMAL'],['uv','TEXCOORD_0']]){
   const a=geometry.getAttribute(source);p.setAttribute(semantic,doc.createAccessor().setType(a.itemSize===2?'VEC2':'VEC3').setArray(new Float32Array(a.array)).setBuffer(buffer));
  }
  const indices=geometry.index?.array||Uint32Array.from({length:geometry.getAttribute('position').count},(_,i)=>i);
  p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));mesh.addPrimitive(p);geometry.dispose();
 }
 for(const side of [-1,1]){
  add(new RoundedBoxGeometry(.18,.45,.79,3,.065),arms,[side*1.275,.59,0]);
  add(new RoundedBoxGeometry(.32,.34,.12,3,.05),arms,[side*.95,.66,-.13],[-.16,0,side*-.12]);
 }
 add(new RoundedBoxGeometry(2.58,.64,.14,3,.065),arms,[0,.66,-.34]);
 add(new RoundedBoxGeometry(2.60,.12,.67,2,.035),wood,[0,.31,0]);
 for(const x of [-1.13,1.13])for(const z of [-.26,.26])add(new CylinderGeometry(.028,.04,.26,12),wood,[x,.13,z]);
 for(const n of [...scene.listChildren()])scene.removeChild(n);
 scene.addChild(doc.createNode('Modular cream lounge sofa').setMesh(mesh));
 return scene;
}
