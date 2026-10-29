import sharp from 'sharp';
// Bake the licensed native and original albedo into LOD colours; no texture memory on low.
// Sparse scalp pixels flatten into an opaque vertex-colour shell in the LOD;
// carrying their per-pixel holes into topology would defeat border simplification.
export async function bakeHeroAlbedo(doc){
 const textures=new Map(doc.getRoot().listMaterials().map(m=>[m,{texture:m.getBaseColorTexture(),factor:[...m.getBaseColorFactor()]}]));
 for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
  const {texture,factor}=textures.get(p.getMaterial()),uv=p.getAttribute('TEXCOORD_0'),colors=p.getAttribute('COLOR_0');if(!texture||!uv||!colors)continue;
  const {data,info}=await sharp(texture.getImage()).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const linear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4,result=new Float32Array(colors.getCount()*4);
  for(let i=0;i<colors.getCount();i++){const t=uv.getElement(i,[]),c=colors.getElement(i,[]);const x=Math.min(info.width-1,Math.max(0,Math.round(t[0]*(info.width-1)))),y=Math.min(info.height-1,Math.max(0,Math.round(t[1]*(info.height-1)))),offset=(y*info.width+x)*4;for(let k=0;k<3;k++)result[i*4+k]=c[k]*factor[k]*linear(data[offset+k]/255);const tile=Math.floor(t[0]*2)+2*Math.floor(t[1]*2),opaqueLod=p.getMaterial().getExtras().zaionOpaqueLodTile===tile;result[i*4+3]=p.getMaterial().getAlphaMode()==='OPAQUE'?1:(c[3]??1)*factor[3]*(opaqueLod?1:data[offset+3]/255);}
  if(p.getMaterial().getAlphaMode()==='MASK'){const old=p.getIndices(),input=old.getArray(),kept=[];for(let i=0;i<input.length;i+=3)if((result[input[i]*4+3]+result[input[i+1]*4+3]+result[input[i+2]*4+3])/3>=.5)kept.push(input[i],input[i+1],input[i+2]);p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(kept)).setBuffer(old.getBuffer()));}
  p.setAttribute('COLOR_0',doc.createAccessor().setType('VEC4').setArray(result).setBuffer(colors.getBuffer()));p.getMaterial().setBaseColorTexture(null).setBaseColorFactor([1,1,1,1]);
 }
}
