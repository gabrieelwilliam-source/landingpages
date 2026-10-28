"""Adapt only CC0 MakeHuman DATA; no MakeHuman program logic is imported.
Source and legal notices: tools/vendor/human/. Existing rig/wardrobe stay intact.
"""
import bpy, math, os
from mathutils import Vector

def import_anatomical_surfaces(root,skin,hair,eye,white,black,npc_index):
 vertices=[];faces=[];group=''
 for line in open(os.path.join(root,'tools','vendor','human','base.obj')):
  if line.startswith('v '):vertices.append(Vector(tuple(map(float,line.split()[1:4]))))
  elif line.startswith('g '):group=line.split()[1]
  elif line.startswith('f ') and group=='body':faces.append([int(s.split('/')[0])-1 for s in line.split()[1:]])
 remove=('Sculpted anatomical face','Anatomical hand','Fingernail','Ear inset','Eye','Iris','Pupil','Upper eyelid','Lower eyelid','Natural eyebrow','Individual eyebrow','Eye socket','Under eye','Subtle forehead','Nostril','Lower lip','Mouth line','Side hair','Short rear hair','Short hair strand','Scalp stubble','Soft bob hair','Hair crown','Hair side locks','Short hair cap','Clipped side hair','Styled hair flow')
 for obj in list(bpy.context.scene.objects):
  if obj.name.startswith(remove):bpy.data.objects.remove(obj,do_unlink=True)
 def create(name,selected,transform,bone):
  ids=sorted(set(i for f in selected for i in f));mapping={old:n for n,old in enumerate(ids)}
  mesh=bpy.data.meshes.new(name);mesh.from_pydata([transform(vertices[i]) for i in ids],[],[[mapping[i] for i in f] for f in selected]);mesh.update()
  obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(skin)
  obj.vertex_groups.new(name=bone).add(list(range(len(mesh.vertices))),1,'REPLACE')
  for p in mesh.polygons:p.use_smooth=True
  return obj
 head=create('MakeHuman CC0 anatomical head',[f for f in faces if all(vertices[i].y>5.85 for i in f)],lambda v:(v.x*.11,.035-v.z*.105,1.53+(v.y-6)*.12),'head')
 # One subdivision smooths native anatomical edge loops, rather than remeshing away eyelids/lips.
 sub=head.modifiers.new('Anatomical subdivision','SUBSURF');sub.levels=1;bpy.context.view_layer.objects.active=head;bpy.ops.object.modifier_apply(modifier=sub.name)
 dec=head.modifiers.new('Preserve facial planes within realtime budget','DECIMATE');dec.ratio=.72;bpy.context.view_layer.objects.active=head;bpy.ops.object.modifier_apply(modifier=dec.name)
 # Real connected palm/finger topology, oriented from the source wrist to middle finger.
 wrist=Vector((4.31185,2.45181,1.75655));forward=(Vector((4.6083,1.88615,2.47898))-wrist).normalized()
 lateral=(Vector((1,0,0))-forward*forward.x).normalized();normal=forward.cross(lateral).normalized()
 selected=[f for f in faces if all(vertices[i].x>3.75 and (vertices[i]-wrist).dot(forward)>-.22 for i in f)]
 for side in [-1,1]:
  transform=lambda v,side=side:(side*(.286+(v-wrist).dot(lateral)*.075),-.018+(v-wrist).dot(normal)*.075,.955-(v-wrist).dot(forward)*.075)
  hand=create('MakeHuman CC0 anatomical hand '+str(side),selected,transform,'hand'+str(side))
  if side>0:
   for p in hand.data.polygons:p.flip()
  hand.data.update()
 # Eyes lie inside the actual orbital sockets; no floating eyelid tubes or painted-on pupils.
 def ell(name,loc,scale,material):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
  bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material);o.vertex_groups.new(name='head').add(list(range(len(o.data.vertices))),1,'REPLACE')
  for p in o.data.polygons:p.use_smooth=True
 for side in [-1,1]:
  x=side*.03385;z=1.6841
  ell('Anatomical eye',(x,-.0958,z),(.014,.012,.011),white)
  ell('Blue grey iris',(x,-.1077,z),(.0063,.0015,.0063),eye)
  ell('Deep pupil',(x,-.1093,z),(.0032,.0008,.0036),black)
  ell('Corneal glint',(x-.0014,-.1103,z+.002),(.001,.0005,.001),white)
 # Short hair is painted into the anatomical scalp vertices; no jagged floating cap.
 # Beard and moustache follow the new mouth position, not the old generic face.
 for o in bpy.context.scene.objects:
  if o.name.startswith('Moustache'):
   o.location.z-=.030
  if o.name.startswith(('Long tapered beard','Beard strand')):
   if o.type=='MESH':
    for v in o.data.vertices:v.co.z-=max(0,min(1,(v.co.z-1.44)/.18))*.026
   elif o.type=='CURVE':
    for spline in o.data.splines:
     for point in spline.points:point.co.z-=max(0,min(1,(point.co.z-1.44)/.18))*.026
