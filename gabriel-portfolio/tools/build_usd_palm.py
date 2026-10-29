"""Build a private GLB from audited OpenUSD interchange; no app/office edits."""
import bpy,sys,json,os
from mathutils import Vector
source=sys.argv[sys.argv.index('--')+1];out=sys.argv[sys.argv.index('--')+2];os.makedirs(out,exist_ok=True);data=json.load(open(source))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
materials={}
for name,fields in data['materials'].items():
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.8
 for key,socket in [('diffuseColor','Base Color'),('roughness','Roughness'),('metallic','Metallic'),('normal','Normal')]:
  value=fields.get(key)
  if not value:continue
  if 'file' not in value:continue
  im=bpy.data.images.load(value['file'],check_existing=True)
  if key!='diffuseColor':im.colorspace_settings.name='Non-Color'
  if max(im.size)>1024:im.scale(max(1,int(im.size[0]*1024/max(im.size))),max(1,int(im.size[1]*1024/max(im.size))))
  im.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
  if key=='normal':
   normal=m.node_tree.nodes.new('ShaderNodeNormalMap');m.node_tree.links.new(tex.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs['Normal'],p.inputs[socket])
  elif key in ['roughness','metallic']:
   split=m.node_tree.nodes.new('ShaderNodeSeparateColor');m.node_tree.links.new(tex.outputs['Color'],split.inputs[0]);m.node_tree.links.new(split.outputs[0],p.inputs[socket])
  else:
   m.node_tree.links.new(tex.outputs['Color'],p.inputs[socket])
   if 'opacity' in fields:m.node_tree.links.new(tex.outputs['Alpha'],p.inputs['Alpha']);m.surface_render_method='DITHERED'
 m.use_backface_culling=False;materials[name]=m
objects=[]
for item in data['meshes']:
 faces=[];cursor=0
 for count in item['counts']:faces.append(item['indices'][cursor:cursor+count]);cursor+=count
 mesh=bpy.data.meshes.new(item['name']);mesh.from_pydata(item['points'],[],faces);mesh.update();obj=bpy.data.objects.new(item['name'],mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(materials[item['material']]);uv=mesh.uv_layers.new(name='SurfaceUV')
 for face,polygon in enumerate(mesh.polygons):
  polygon.use_smooth=True
  for li in polygon.loop_indices:
   interpolation=item['uvInterpolation'];index=li if interpolation=='faceVarying' else mesh.loops[li].vertex_index if interpolation in ['vertex','varying'] else face if interpolation=='uniform' else 0
   uv.data[li].uv=item['uv'][index]
 if item.get('normals'):
  interpolation=item['normalInterpolation'];normals=item['normals'];loop_normals=[]
  for face,polygon in enumerate(mesh.polygons):
   for li in polygon.loop_indices:
    index=li if interpolation=='faceVarying' else mesh.loops[li].vertex_index if interpolation in ['vertex','varying'] else face if interpolation=='uniform' else 0
    loop_normals.append(normals[index])
  mesh.normals_split_custom_set(loop_normals)
 objects.append(obj)
points=[v.co for o in objects for v in o.data.vertices];minimum=Vector(tuple(min(p[k] for p in points) for k in range(3)));maximum=Vector(tuple(max(p[k] for p in points) for k in range(3)))
pot=next(o for o in objects if 'PLANTER' in o.name);centre=Vector(((min(v.co.x for v in pot.data.vertices)+max(v.co.x for v in pot.data.vertices))/2,(min(v.co.y for v in pot.data.vertices)+max(v.co.y for v in pot.data.vertices))/2,minimum.z));size=maximum-minimum;scale=min(3.0/size.z,1.9/size.x,1.9/size.y)
for o in objects:
 for v in o.data.vertices:v.co=(v.co-centre)*scale
 o.data.update()
report={'sourceUnits':data['units'],'sourceDimensionsMetres':list(size),'normalizationScale':scale,'finalDimensionsMetres':[v*scale for v in size],'meshes':len(objects),'materials':len(materials),'triangles':sum(len(o.data.polygons) for o in objects),'licenseStatus':'PENDING'}
open(out+'/palm-build.json','w').write(json.dumps(report,indent=2));bpy.ops.wm.save_as_mainfile(filepath=out+'/palm-editable.blend');bpy.ops.export_scene.gltf(filepath=out+'/palm-raw.glb',export_format='GLB',export_yup=True,export_extras=True)
print('PALM BUILD COMPLETE',report,flush=True)
