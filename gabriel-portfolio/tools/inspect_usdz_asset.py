"""Read USD with free OpenUSD into a neutral Blender interchange. No publication."""
from pathlib import Path
import sys,json,hashlib,zipfile
from pxr import Usd,UsdGeom,UsdShade
source=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(source) as z:
 assert z.testzip() is None
 for name in z.namelist():
  target=(out/'source'/name).resolve();assert target.is_relative_to((out/'source').resolve());target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(name))
layer=next((out/'source').glob('*.usdc'));stage=Usd.Stage.Open(str(layer));cache=UsdGeom.XformCache();units=UsdGeom.GetStageMetersPerUnit(stage);axis=str(UsdGeom.GetStageUpAxis(stage))
result={'source':source.name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size,'units':units,'upAxis':axis,'metadata':dict(stage.GetRootLayer().customLayerData),'licenseStatus':'PENDING','materials':{},'meshes':[]}
for prim in stage.Traverse():
 if not prim.IsA(UsdGeom.Mesh):continue
 m=UsdGeom.Mesh(prim);matrix=cache.GetLocalToWorldTransform(prim)
 def convert(p):
  p=matrix.Transform(p);return [float(p[0])*units,-float(p[2])*units,float(p[1])*units] if axis=='Y' else [float(x)*units for x in p]
 points=[convert(p) for p in m.GetPointsAttr().Get()];counts=list(m.GetFaceVertexCountsAttr().Get());indices=list(m.GetFaceVertexIndicesAttr().Get());uv=UsdGeom.PrimvarsAPI(prim).GetPrimvar('st0')
 if not uv:uv=UsdGeom.PrimvarsAPI(prim).GetPrimvar('st')
 material=UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()[0];name=material.GetPrim().GetName();shader=UsdShade.Shader(material.ComputeSurfaceSource()[0])
 if name not in result['materials']:
  properties={}
  for key in ['diffuseColor','metallic','roughness','normal','opacity']:
   field=shader.GetInput(key)
   if not field:continue
   conn=field.GetConnectedSource()
   if conn:
    texture=UsdShade.Shader(conn[0].GetPrim()).GetInput('file').Get()
    if texture:
     target=(layer.parent/texture.path).resolve();assert target.is_relative_to(layer.parent.resolve());assert target.exists();properties[key]={'file':str(target),'channel':str(conn[1])}
   else:
    value=field.Get();properties[key]={'value':list(value) if hasattr(value,'__len__') and not isinstance(value,str) else value}
  result['materials'][name]=properties
 # Preserve authored shading; averaging across leaf folds changes their appearance.
 normal_matrix=matrix.GetInverse().GetTranspose();normals=[]
 for n in m.GetNormalsAttr().Get() or []:
  n=normal_matrix.TransformDir(n).GetNormalized()
  normals.append([float(n[0]),-float(n[2]),float(n[1])] if axis=='Y' else [float(x) for x in n])
 result['meshes'].append({'name':prim.GetName(),'points':points,'counts':counts,'indices':indices,'normals':normals,'normalInterpolation':str(m.GetNormalsInterpolation()),'uv':[[float(x),float(y)] for x,y in uv.ComputeFlattened()] if uv else [],'uvInterpolation':str(uv.GetInterpolation()) if uv else None,'material':name,'doubleSided':bool(m.GetDoubleSidedAttr().Get())})
(out/'palm-interchange.json').write_text(json.dumps(result));print('USD read:',len(result['meshes']),'meshes;',sum(len(m['counts']) for m in result['meshes']),'faces; materials',list(result['materials']))
