// LOD removes disconnected grooming fibres instead of spending triangles on sub-pixel hairs.
// Weld positions only for connectivity analysis; actual UVs, weights and topology stay untouched.
export function stripHeroMicrogeometry(doc) {
 let removed=0;
 for(const mesh of doc.getRoot().listMeshes())for(const primitive of mesh.listPrimitives()){
  if(/close-cropped hair|fitted eyebrow/.test(primitive.getMaterial()?.getName()||''))continue;
  const positions=heroPhysicalPositions(doc,primitive),count=positions.length/3;
  const indices=primitive.getIndices(),triangles=indices.getArray();
  const parent=Int32Array.from({length:count},(_,i)=>i),find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i},join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[a]=b};
  const welded=new Map();for(let i=0;i<count;i++){const key=[0,1,2].map(k=>Math.round(positions[i*3+k]*100000)).join(',');if(welded.has(key))join(i,welded.get(key));else welded.set(key,i);}
  for(let i=0;i<triangles.length;i+=3){join(triangles[i],triangles[i+1]);join(triangles[i],triangles[i+2]);}
  const groups=new Map();for(let i=0;i<triangles.length;i+=3){const root=find(triangles[i]);let group=groups.get(root);if(!group){group={tris:0,min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};groups.set(root,group);}group.tris++;for(let j=0;j<3;j++)for(let k=0;k<3;k++){const value=positions[triangles[i+j]*3+k];group.min[k]=Math.min(group.min[k],value);group.max[k]=Math.max(group.max[k],value);}}
  const omit=new Set();for(const [root,g] of groups){const height=(g.min[1]+g.max[1])/2,eyes=height>1.635&&height<1.75&&Math.abs((g.min[0]+g.max[0])/2)<.08;const mouth=height>1.595&&height<1.635&&Math.abs((g.min[0]+g.max[0])/2)<.05;if(height>1.28&&!eyes&&!mouth&&g.tris<190&&Math.max(...g.max.map((v,k)=>v-g.min[k]))<.22)omit.add(root);}
  const kept=[];for(let i=0;i<triangles.length;i+=3){if(omit.has(find(triangles[i]))){removed++;continue;}kept.push(triangles[i],triangles[i+1],triangles[i+2]);}
  primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(kept)).setBuffer(indices.getBuffer()));indices.dispose();
 }
 console.log('Hero LOD: removed',removed,'micro-fibre triangles; preserved beard/scalp silhouettes and eyes');
}

export function heroPhysicalPositions(doc,primitive){
 const accessor=primitive.getAttribute('POSITION'),count=accessor.getCount(),positions=new Float64Array(count*3);
  const skin=doc.getRoot().listSkins()[0],bind=skin.getInverseBindMatrices().getElement(0,[]),joint=skin.listJoints()[0].getWorldMatrix(),matrix=Array(16).fill(0);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)matrix[c*4+r]+=joint[k*4+r]*bind[c*4+k];
  for(let i=0;i<count;i++){const v=accessor.getElement(i,[]);for(let k=0;k<3;k++)positions[i*3+k]=matrix[k]*v[0]+matrix[4+k]*v[1]+matrix[8+k]*v[2]+matrix[12+k];}
 return positions;
}

// Face and scalp use their own error budget; whole-body simplification erases eyelids/nose.
export function splitHeroFace(doc,primitive,region='face'){
 const positions=heroPhysicalPositions(doc,primitive),indices=primitive.getIndices(),face=[],body=[];
 const array=indices.getArray();
 for(let i=0;i<array.length;i+=3){const t=[array[i],array[i+1],array[i+2]];
  const facial=t.every(v=>region==='face'?positions[v*3+1]>1.40&&(positions[v*3+2]>.025||positions[v*3+1]>1.76):positions[v*3+1]<.17||(positions[v*3+1]>.80&&positions[v*3+1]<.98&&Math.abs(positions[v*3])>.235));
  (facial?face:body).push(...t);
 }
 const facePrimitive=primitive.clone();
 primitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(body)).setBuffer(indices.getBuffer()));
 facePrimitive.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(face)).setBuffer(indices.getBuffer()));
 return facePrimitive;
}
