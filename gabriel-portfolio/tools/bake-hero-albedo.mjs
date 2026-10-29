import sharp from 'sharp';
// Bake the original procedural albedo into LOD colours; no texture memory on low.
export async function bakeHeroAlbedo(doc){
 for(const mesh of doc.getRoot().listMeshes())for(const p of mesh.listPrimitives()){
  const texture=p.getMaterial()?.getBaseColorTexture(),uv=p.getAttribute('TEXCOORD_0'),colors=p.getAttribute('COLOR_0');if(!texture||!uv||!colors)continue;
  const {data,info}=await sharp(texture.getImage()).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const linear=x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4,result=new Float32Array(colors.getCount()*4);
  for(let i=0;i<colors.getCount();i++){const t=uv.getElement(i,[]),c=colors.getElement(i,[]);const x=Math.min(info.width-1,Math.max(0,Math.round(t[0]*(info.width-1)))),y=Math.min(info.height-1,Math.max(0,Math.round(t[1]*(info.height-1)))),offset=(y*info.width+x)*4;for(let k=0;k<3;k++)result[i*4+k]=c[k]*linear(data[offset+k]/255);result[i*4+3]=c[3]??1;}
  p.setAttribute('COLOR_0',doc.createAccessor().setType('VEC4').setArray(result).setBuffer(colors.getBuffer()));p.getMaterial().setBaseColorTexture(null);
 }
}
