"""Original Gabriel character refinement. The private portrait is reference only.
Reuses the existing 16-bone contract and Idle / Walk / Turn animation names.
No portrait pixels or third-party character assets are embedded.
"""
import bpy, math, random, os, sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source=open(os.path.join(ROOT,'tools','build_assets.py')).read()
exec(source.split('\nclean()\nskin=')[0])
clean();random.seed(2810)
skin=mat('Skin warm neutral',(.40,.265,.205),rough=.82)
skin_shadow=mat('Skin detail',(.30,.18,.135),rough=.86)
lip=mat('Natural lip',(.32,.135,.12),rough=.82)
cloth=mat('Technical charcoal hoodie',(.035,.046,.060),rough=.94)
seam=mat('Raised cloth seams',(.065,.078,.093),rough=.95)
lining=mat('Hood lining',(.095,.11,.12),rough=.98)
denim=mat('Graphite trousers',(.048,.059,.073),rough=.95)
shoe=mat('Charcoal suede',(.035,.04,.045),rough=.9)
sole=mat('Warm grey sole',(.30,.31,.29),rough=.92)
hair=mat('Short brown hair',(.025,.018,.014),rough=.96)
beard=mat('Beard chestnut',(.040,.026,.018),rough=.98)
grey=mat('Beard silver',(.18,.16,.14),rough=.96)
eye=mat('Blue grey eyes',(.13,.28,.34),rough=.4)
white=mat('Sclera',(.55,.55,.50),rough=.6)
black=mat('Deep pupil',(.007,.011,.013),rough=.8)
trim=mat('Muted metal trim',(.20,.22,.23),.4,.6)

def shape(name,rings,material,bone=None,n=20):
 vertices=[];faces=[]
 for x,y,z,rx,ry in rings:
  for j in range(n):
   a=j*math.tau/n;vertices.append((x+math.cos(a)*rx,y+math.sin(a)*ry,z))
 for k in range(len(rings)-1):
  for j in range(n):a=k*n+j;b=k*n+(j+1)%n;faces.append((a,b,b+n,a+n))
 faces += [tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+j for j in range(n))]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o)
 finish(o,name,material,bone)
 sub=o.modifiers.new('Tailored surface','SUBSURF');sub.levels=1
 bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sub.name)
 return o

def oval(name,loc,scale,material,bone=None,segments=16,rings=10):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
 o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(o,name,material,bone)

def detail(name,points,radius,material,bone):
 o=curve(name,points,radius,material);o.data.bevel_resolution=0;o['skinBone']=bone
 return o

def weighted_box(name,loc,scale,material,bone,bevel=.02):
 o=cube(name,loc,scale,material,bevel,2);o.vertex_groups.new(name=bone).add(list(range(len(o.data.vertices))),1,'REPLACE');return o

shape('Hoodie body',[(0,0,.94,.16,.105),(0,0,1.01,.185,.125),(0,0,1.12,.19,.13),(0,0,1.30,.21,.125),(0,.008,1.40,.237,.12),(0,.012,1.46,.215,.105),(0,.008,1.50,.11,.073)],cloth,'spine',24)
shape('Pelvis',[(0,0,.84,.155,.10),(0,0,.94,.175,.12),(0,0,1.0,.16,.11)],denim,'hips',20)
oval('Neck',(0,0,1.51),(.066,.065,.095),skin,'head')
shape('Anatomical head',[(0,-.005,1.53,.064,.067),(0,-.008,1.57,.090,.080),(0,-.003,1.63,.108,.096),(0,0,1.70,.111,.102),(0,.007,1.76,.102,.091),(0,.012,1.805,.068,.060),(0,.012,1.827,.009,.008)],skin,'head',32)
for side in [-1,1]:
 x=side*.105
 leg=shape('Trousers',[(x,0,.95,.088,.098),(x,0,.84,.095,.10),(x,.006,.68,.080,.082),(x,.012,.54,.066,.070),(x,.003,.40,.064,.065),(x,0,.20,.052,.057),(x,0,.11,.052,.055)],denim,n=18)
 thigh=leg.vertex_groups.new(name='thigh'+str(side));shin=leg.vertex_groups.new(name='shin'+str(side))
 for v in leg.data.vertices:
  w=max(0,min(1,(v.co.z-.46)/.15));thigh.add([v.index],w,'REPLACE');shin.add([v.index],1-w,'REPLACE')
 oval('Sneaker',(x,-.055,.080),(.073,.14,.055),shoe,'foot'+str(side))
 oval('Sole',(x,-.055,.035),(.076,.142,.022),sole,'foot'+str(side))
 detail('Shoe side seam',[(x-side*.065,-.12,.085),(x-side*.068,-.02,.095),(x-side*.065,.03,.09)],.002,seam,'foot'+str(side))
 for j in range(3):detail('Shoe lace',[(x-.035,-.105+j*.023,.116),(x+.035,-.1+j*.023,.116)],.002,lining,'foot'+str(side))
 ax=side*.254
 sleeve=shape('Sleeve',[(ax-side*.018,0,1.49,.018,.025),(ax-side*.006,0,1.47,.052,.060),(ax,0,1.44,.065,.070),(ax+side*.012,0,1.36,.072,.073),(ax+side*.022,-.002,1.24,.063,.065),(ax+side*.027,-.012,1.15,.060,.060),(ax+side*.032,-.015,1.04,.050,.052),(ax+side*.032,-.018,.96,.042,.044)],cloth,n=18)
 upper=sleeve.vertex_groups.new(name='arm'+str(side));lower=sleeve.vertex_groups.new(name='forearm'+str(side))
 for v in sleeve.data.vertices:
  w=max(0,min(1,(v.co.z-1.12)/.16));upper.add([v.index],w,'REPLACE');lower.add([v.index],1-w,'REPLACE')
 oval('Knitted cuff',(ax+side*.032,-.018,.97),(.044,.045,.03),seam,'forearm'+str(side),12,8)
 oval('Palm',(ax+side*.032,-.018,.913),(.034,.028,.057),skin,'hand'+str(side),12,8)
 for j in range(4):oval('Finger',(ax+side*.032+(j-1.5)*.014,-.02,.863+abs(j-1.5)*.007),(.007,.013,.027),skin,'hand'+str(side),8,6)
 oval('Thumb',(ax+side*.005,-.037,.922),(.013,.018,.033),skin,'hand'+str(side),10,6)
 detail('Elbow fold',[(ax-side*.035,-.047,1.14),(ax,-.067,1.12),(ax+side*.035,-.043,1.13)],.002,seam,'forearm'+str(side))
 oval('Ear',(side*.113,.002,1.675),(.019,.019,.037),skin,'head',12,8)
 oval('Ear inset',(side*.122,-.012,1.675),(.009,.005,.022),skin_shadow,'head',10,8)
 oval('Eye',(side*.043,-.093,1.698),(.021,.010,.009),white,'head',16,10)
 oval('Iris',(side*.043,-.102,1.698),(.0074,.0025,.0074),eye,'head',12,8)
 oval('Pupil',(side*.043,-.105,1.698),(.0038,.0018,.0046),black,'head',10,8)
 oval('Eye catchlight',(side*.043-.002,-.1065,1.701),(.0018,.0008,.0018),white,'head',8,6)
 detail('Upper eyelid',[(side*.043-.022,-.102,1.698),(side*.043-.011,-.108,1.708),(side*.043+.008,-.108,1.709),(side*.043+.022,-.102,1.699)],.0026,skin_shadow,'head')
 detail('Lower eyelid',[(side*.043-.020,-.101,1.695),(side*.043,-.108,1.687),(side*.043+.019,-.102,1.695)],.002,skin,'head')
 detail('Natural eyebrow',[(side*.043-.029,-.096,1.726),(side*.043-.005,-.105,1.732),(side*.043+.026,-.095,1.726)],.004,hair,'head')
 # Receding hair around the sides and back, not a thick helmet cap.
 oval('Side hair',(side*.099,.018,1.745),(.015,.061,.054),hair,'head',12,8)
shape('Nose bridge',[(0,-.118,1.637,.022,.011),(0,-.131,1.651,.021,.018),(0,-.117,1.676,.012,.012),(0,-.100,1.716,.009,.008)],skin,'head',16)
for side in [-1,1]:oval('Nostril',(side*.013,-.14,1.641),(.005,.003,.003),skin_shadow,'head',8,6)
oval('Lower lip',(0,-.113,1.603),(.029,.007,.005),lip,'head',16,8)
detail('Mouth line',[(-.026,-.118,1.608),(0,-.121,1.606),(.026,-.118,1.608)],.0016,skin_shadow,'head')
shape('Long tapered beard',[(0,-.075,1.30,.022,.019),(0,-.081,1.345,.048,.038),(0,-.073,1.40,.070,.052),(0,-.062,1.47,.090,.067),(0,-.044,1.54,.105,.076),(0,-.026,1.59,.105,.074),(0,-.009,1.628,.100,.060)],beard,'head',24)
for side in [-1,1]:
 detail('Moustache',[(side*.007,-.145,1.633),(side*.025,-.138,1.625),(side*.04,-.121,1.611)],.008,beard,'head')
for j in range(240):
 x=random.uniform(-.085,.085);top=random.uniform(1.49,1.59);bottom=random.uniform(1.32,1.44)
 # Thin, varied strands follow the volume rather than floating below the jaw.
 endx=x*.45+random.uniform(-.009,.009)
 detail('Beard strand',[(x,-.116-abs(x)*.08,top),(x*.78,-.135,1.455),(endx,-.102,bottom)],.00055,grey if j%9==0 else hair if j%3==0 else beard,'head')
oval('Short rear hair',(0,.069,1.76),(.092,.039,.061),hair,'head',20,10)
for j in range(55):
 a=random.uniform(.1,math.pi-.1);x=math.cos(a)*.094;y=.01+math.sin(a)*.083;z=random.uniform(1.75,1.795)
 detail('Short hair strand',[(x,y,z),(x*.97,y*.98,z+.009)],.0007,grey if j%12==0 else hair,'head')
oval('Folded hood',(0,.065,1.445),(.13,.095,.07),cloth,'spine',20,12)
# Soft hood, tailored seams, pockets and an original technical backpack.
detail('Rolled hood rim',[(math.cos(a)*.115,.015+math.sin(a)*.10,1.49-math.sin(a)*.04) for a in [j*math.pi/16 for j in range(17)]],.025,lining,'spine')
for side in [-1,1]:
 detail('Jacket front seam',[(side*.18,-.07,1.39),(side*.145,-.113,1.22),(side*.14,-.115,1.05)],.002,seam,'spine')
 detail('Pocket welt',[(side*.06,-.129,1.10),(side*.15,-.109,1.04)],.003,seam,'spine')
 detail('Waist fold',[(side*.02,-.126,1.005),(side*.09,-.133,1.022),(side*.17,-.094,1.01)],.002,seam,'spine')
 detail('Trouser knee fold',[(side*.105-.045,-.052,.56),(side*.105,-.064,.55),(side*.105+.045,-.052,.57)],.0015,seam,'thigh'+str(side))
detail('Jacket zipper',[(0,-.13,1.01),(0,-.133,1.22),(0,-.10,1.46)],.0025,trim,'spine')
weighted_box('Backpack body',(0,.17,1.19),(.31,.16,.41),cloth,'spine',.065)
weighted_box('Backpack front pocket',(0,.264,1.12),(.25,.048,.20),seam,'spine',.035)
for side in [-1,1]:
 detail('Backpack shoulder strap',[(side*.14,.16,1.40),(side*.17,.03,1.47),(side*.17,-.10,1.38),(side*.13,-.13,1.15)],.016,cloth,'spine')
 detail('Backpack piping',[(side*.135,.25,1.35),(side*.15,.25,1.17),(side*.12,.27,1.04)],.0025,lining,'spine')
detail('Backpack zip',[(-.105,.294,1.20),(0,.296,1.21),(.105,.294,1.20)],.0018,trim,'spine')

# Convert detailed curves and bind them to the appropriate deforming bone.
for o in list(bpy.context.scene.objects):
 if o.type=='CURVE':
  bone_name=o['skinBone'];bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
  o.vertex_groups.new(name=bone_name).add(list(range(len(o.data.vertices))),1,'REPLACE')
# Bake material colours into the geometry: one skinned draw call, no portrait texture.
surface=bpy.data.materials.new('Gabriel original vertex palette');surface.use_nodes=True
p=surface.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.86
vc=surface.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='SurfaceColor';surface.node_tree.links.new(vc.outputs['Color'],p.inputs['Base Color'])
for o in list(bpy.context.scene.objects):
 if o.type!='MESH':continue
 color=o.data.materials[0].diffuse_color[:3]
 layer=o.data.color_attributes.new(name='SurfaceColor',type='FLOAT_COLOR',domain='CORNER')
 for loop in o.data.loops:
  v=o.data.vertices[loop.vertex_index].co
  variation=1+math.sin(v.x*43+v.z*29)*.025
  layer.data[loop.index].color=(*(max(0,min(1,c*variation)) for c in color),1)
 o.data.color_attributes.active_color=layer;o.data.color_attributes.render_color_index=0
 o.data.materials.clear();o.data.materials.append(surface)
# Keep the established skeleton contract.
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='Gabriel_Armature';arm=rig.data;arm.edit_bones.remove(arm.edit_bones[0])
def bone(name,head,tail,parent=None):
 b=arm.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=arm.edit_bones[parent]
bone('root',(0,0,0),(0,0,.1));bone('hips',(0,0,.85),(0,0,1),'root');bone('spine',(0,0,1),(0,0,1.48),'hips');bone('head',(0,0,1.48),(0,0,1.85),'spine')
for side in [-1,1]:
 bone('thigh'+str(side),(side*.105,0,.9),(side*.105,.018,.5),'hips');bone('shin'+str(side),(side*.105,.018,.5),(side*.105,0,.1),'thigh'+str(side));bone('foot'+str(side),(side*.105,0,.1),(side*.105,-.18,.06),'shin'+str(side));bone('arm'+str(side),(side*.254,0,1.44),(side*.28,0,1.18),'spine');bone('forearm'+str(side),(side*.28,0,1.18),(side*.286,-.018,.97),'arm'+str(side));bone('hand'+str(side),(side*.286,-.018,.97),(side*.286,-.018,.86),'forearm'+str(side))
bpy.ops.object.mode_set(mode='OBJECT')
for o in list(bpy.context.scene.objects):
 if o.type=='MESH':o.parent=rig;mod=o.modifiers.new('Skinning','ARMATURE');mod.object=rig
for name in ['Idle','Walk','Turn']:
 rig.animation_data_create();action=bpy.data.actions.new(name);rig.animation_data.action=action
 for frame in range(1,33):
  phase=(frame-1)/31*math.tau
  for b in rig.pose.bones:
   b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
   if name=='Walk':
    side=-1 if '-1' in b.name else 1
    if b.name.startswith('thigh'):b.rotation_euler.x=math.sin(phase+side*math.pi/2)*.43
    if b.name.startswith('shin'):b.rotation_euler.x=max(0,math.sin(phase+side*math.pi/2))*.45
    if b.name.startswith('arm'):b.rotation_euler.x=-math.sin(phase+side*math.pi/2)*.25
    if b.name.startswith('forearm'):b.rotation_euler.x=-.12
    if b.name=='hips':b.location.y=.012*(1-math.cos(phase*2))
    if b.name=='spine':b.rotation_euler.z=math.sin(phase)*.008
   if name=='Idle' and b.name=='spine':b.rotation_euler.x=math.sin(phase)*.007
   if name=='Turn' and b.name=='head':b.rotation_euler.y=math.sin(phase)*.20
   b.keyframe_insert('rotation_euler',frame=frame,group=b.name)
   if b.name=='hips':b.keyframe_insert('location',frame=frame,group=b.name)
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);rig.animation_data.action=None
export('gabriel-rigged')
if '--preview' in sys.argv:
 for track in rig.animation_data.nla_tracks:track.mute=True
 for b in rig.pose.bones:b.rotation_euler=(0,0,0);b.location=(0,0,0)
 bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.device='CPU';bpy.context.scene.cycles.samples=24;bpy.context.scene.cycles.use_denoising=False
 bpy.context.scene.world.color=(.18,.18,.18)
 bpy.context.scene.render.resolution_x=720;bpy.context.scene.render.resolution_y=900;bpy.context.scene.render.resolution_percentage=100
 def point_at(obj,target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
 for loc,energy,size in [((-3,-4,5),500,4),((3,-1,3),250,3),((0,3,4),600,3)]:
  bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=energy;o.data.shape='DISK';o.data.size=size;point_at(o,(0,0,1.2))
 bpy.ops.object.camera_add(location=(2,-4,2.0));camera=bpy.context.object;camera.data.lens=75;point_at(camera,(0,0,1.03));bpy.context.scene.camera=camera
 bpy.context.scene.render.filepath='/tmp/gabriel-refined-preview.png';bpy.ops.render.render(write_still=True)
print('CHARACTER COMPLETE: original vertex palette, skinned mesh, 16 bones, Idle/Walk/Turn')
