"""Prepare two private chair candidates from the audited isolated FBX import."""
import bpy,sys,json,math,bmesh
from pathlib import Path
from mathutils import Vector,Matrix
out=Path(sys.argv[sys.argv.index('--')+1]).resolve();assert not out.is_relative_to(Path(__file__).resolve().parents[1])
bpy.ops.wm.open_mainfile(filepath=str(out/'chairs-imported.blend'))
choices=[('office-chair','Armchair_279 [7026700]',(.68,.70,.96))]
# Keep all source objects untouched in the saved source .blend.
report=[]
for name,root_name,size in choices:
 root=bpy.data.objects[root_name];meshes=[o for o in root.children_recursive if o.type=='MESH'];points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box];lo=Vector([min(v[k] for v in points) for k in range(3)]);hi=Vector([max(v[k] for v in points) for k in range(3)]);centre=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));scale=Vector([size[k]/(hi[k]-lo[k]) for k in range(3)])
 copies=[]
 for o in meshes:
  copy=o.copy();copy.data=o.data.copy();bpy.context.scene.collection.objects.link(copy);matrix=o.matrix_world.copy();copy.parent=None;copy.matrix_world=Matrix.Identity(4);copy.data.transform(matrix)
  if matrix.determinant()<0:copy.data.flip_normals()
  for v in copy.data.vertices:
   v.co-=centre;v.co.x*=scale.x;v.co.y*=scale.y
   # The imported collection has inconsistent nonuniform object scales.
   # Map the office seat top to the studio's 52cm seated contact height.
   if root_name.startswith('Armchair_154'):
    seat=1.1142-lo.z;v.co.z=v.co.z*.52/seat if v.co.z<=seat else .52+(v.co.z-seat)*(size[2]-.52)/(hi.z-lo.z-seat)
   else:v.co.z*=scale.z
  # Repair fragmented imported face normals and weld coincident geometry.
  bm=bmesh.new();bm.from_mesh(copy.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000005);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(copy.data);bm.free()
  copy.data.normals_split_custom_set([(0,0,0)]*len(copy.data.loops))
  for polygon in copy.data.polygons:polygon.use_smooth=True
  for layer in list(copy.data.uv_layers):copy.data.uv_layers.remove(layer)
  uv=copy.data.uv_layers.new(name='SurfaceUV')
  for polygon in copy.data.polygons:
   axis=max(range(3),key=lambda k:abs(polygon.normal[k]))
   for li in polygon.loop_indices:
    v=copy.data.vertices[copy.data.loops[li].vertex_index].co
    uv.data[li].uv=(v.y*4,v.z*4) if axis==0 else (v.x*4,v.z*4) if axis==1 else (v.x*4,v.y*4)
  copy.data.update();copies.append(copy)
 # Align the upper back with Blender +Y (glTF -Z); desk callers retain yaw.
 top=[v.co for o in copies for v in o.data.vertices if v.co.z>size[2]*.88]
 back=sum(top,Vector())/len(top);angle=math.atan2(back.x,back.y)
 rotation=Matrix.Rotation(angle,4,'Z')
 for o in copies:o.data.transform(rotation)
 # Retain authored upholstery geometry, with original procedural web materials.
 for original in {m for o in copies for m in o.data.materials if m}:
  m=original.copy();source_name=original.name
  for o in copies:
   for slot in o.material_slots:
    if slot.material==original:slot.material=m
  if not m.use_nodes:continue
  p=m.node_tree.nodes.get('Principled BSDF')
  if not p:continue
  metal=source_name=='Material~9';rubber=source_name=='Material~12'
  p.inputs['Metallic'].default_value=.65 if metal else 0;p.inputs['Roughness'].default_value=.38 if metal else .94 if rubber else .88
  color=(.028,.035,.045,1) if metal else (.014,.017,.022,1) if rubber else (.018,.033,.065,1) if source_name=='Material~11' else (.035,.042,.055,1)
  for link in list(p.inputs['Base Color'].links):m.node_tree.links.remove(link)
  p.inputs['Base Color'].default_value=color;m.use_backface_culling=False;m.name='zAIon chair '+('steel' if metal else 'rubber' if rubber else 'navy fabric' if source_name=='Material~11' else 'graphite shell')
  if source_name=='Material~11':
   image=bpy.data.images.new('Original zAIon woven normal',width=128,height=128);image.colorspace_settings.name='Non-Color';pixels=[]
   for y in range(128):
    for x in range(128):
     normal=Vector((math.sin(x*math.pi/2)*.12,math.sin(y*math.pi/2)*.12,1)).normalized();pixels.extend((normal.x*.5+.5,normal.y*.5+.5,normal.z*.5+.5,1))
   image.pixels=pixels;image.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;normal=m.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.3;m.node_tree.links.new(tex.outputs['Color'],normal.inputs['Color']);m.node_tree.links.new(normal.outputs['Normal'],p.inputs['Normal'])
 bpy.ops.object.select_all(action='DESELECT')
 for o in copies:o.select_set(True)
 bpy.context.view_layer.objects.active=copies[0]
 bpy.ops.export_scene.gltf(filepath=str(out/(name+'-raw.glb')),export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
 report.append({'name':name,'sourceRoot':root_name,'sourceDimensions':list(hi-lo),'targetDimensions':size,'orientationCorrectionRadians':angle,'sourceMeshes':len(copies),'sourceTriangles':sum(len(o.data.loop_triangles) for o in copies),'seatTopMetres':round((.7434840202331543-lo.z)*scale.z,3),'licenseStatus':'PENDING'})
 for o in copies:bpy.data.objects.remove(o,do_unlink=True)
(out/'chairs-build.json').write_text(json.dumps(report,indent=2));print(report,flush=True)
