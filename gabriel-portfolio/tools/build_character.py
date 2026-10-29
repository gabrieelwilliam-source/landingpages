"""Original Gabriel character refinement. The private portrait is reference only.
Reuses the existing 16-bone contract and Idle / Walk / Turn animation names.
CC0 MakeHuman anatomical head/hands are adapted; no portrait pixels are embedded.
"""
import bpy, math, random, os, sys
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source=open(os.path.join(ROOT,'tools','build_assets.py')).read()
exec(source.split('\nclean()\nskin=')[0])
npc_index=int(sys.argv[sys.argv.index('--npc')+1]) if '--npc' in sys.argv else None
if '--output' in sys.argv:
 OUT=os.path.abspath(sys.argv[sys.argv.index('--output')+1]);os.makedirs(OUT,exist_ok=True)
clean();random.seed(2810+(npc_index or 0))
skin=mat('Skin warm neutral',(.40,.265,.205),rough=.82)
skin_shadow=mat('Skin detail',(.30,.18,.135),rough=.86)
lip=mat('Natural lip',(.32,.135,.12),rough=.82)
cloth=mat('Technical navy hoodie',(.018,.030,.065),rough=.94)
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
 oval('Eye',(side*.043,-.093,1.698),(.019,.008,.008),white,'head',16,10)
 oval('Iris',(side*.043,-.102,1.698),(.0074,.0025,.0074),eye,'head',12,8)
 oval('Pupil',(side*.043,-.105,1.698),(.0038,.0018,.0046),black,'head',10,8)
 oval('Eye catchlight',(side*.043-.002,-.1065,1.701),(.0018,.0008,.0018),white,'head',8,6)
 detail('Upper eyelid',[(side*.043-.022,-.102,1.698),(side*.043-.011,-.108,1.708),(side*.043+.008,-.108,1.709),(side*.043+.022,-.102,1.699)],.003,skin,'head')
 detail('Lower eyelid',[(side*.043-.020,-.101,1.695),(side*.043,-.108,1.687),(side*.043+.019,-.102,1.695)],.002,skin,'head')
 detail('Natural eyebrow',[(side*.043-.029,-.096,1.726),(side*.043-.005,-.105,1.732),(side*.043+.026,-.095,1.726)],.004,hair,'head')
 # Receding hair around the sides and back, not a thick helmet cap.
 oval('Side hair',(side*.099,.018,1.745),(.015,.061,.054),hair,'head',12,8)
# Sculpted facial planes blend into the head, rather than attaching visible primitives.
for side in [-1,1]:
 oval('Cheek plane',(side*.062,-.057,1.657),(.036,.023,.033),skin,'head',20,12)
 oval('Brow ridge',(side*.044,-.066,1.724),(.034,.022,.011),skin,'head',20,10)
 oval('Nose wing',(side*.019,-.119,1.648),(.012,.017,.012),skin,'head',16,10)
 for j in range(14):
  x=side*.043+(j-6.5)*.0035
  detail('Individual eyebrow hair',[(x,-.108,1.728),(x+side*.002,-.110,1.734+math.sin(j*.22)*.002)],.0007,hair,'head')
 detail('Eye socket crease',[(side*.043-.021,-.098,1.714),(side*.043,-.101,1.719),(side*.043+.023,-.095,1.713)],.0007,skin_shadow,'head')
 detail('Under eye contour',[(side*.043-.017,-.098,1.682),(side*.043,-.099,1.679),(side*.043+.019,-.094,1.685)],.00065,skin_shadow,'head')
oval('Chin plane',(0,-.057,1.562),(.065,.038,.031),skin,'head',20,12)
for j in range(2):
 detail('Subtle forehead crease',[(-.055,-.082,1.752+j*.014),(0,-.091,1.755+j*.014),(.055,-.082,1.752+j*.014)],.0005,skin_shadow,'head')
shape('Nose bridge',[(0,-.118,1.637,.022,.011),(0,-.131,1.651,.021,.018),(0,-.117,1.676,.012,.012),(0,-.100,1.716,.009,.008)],skin,'head',16)
for side in [-1,1]:oval('Nostril',(side*.013,-.14,1.641),(.005,.003,.003),skin_shadow,'head',8,6)
oval('Lower lip',(0,-.113,1.603),(.029,.007,.005),lip,'head',16,8)
detail('Mouth line',[(-.026,-.118,1.608),(0,-.121,1.606),(.026,-.118,1.608)],.0016,skin_shadow,'head')
shape('Long tapered beard',[(0,-.075,1.37,.038,.024),(0,-.081,1.405,.058,.042),(0,-.073,1.45,.079,.056),(0,-.062,1.50,.090,.067),(0,-.044,1.54,.105,.076),(0,-.026,1.59,.105,.074),(0,-.009,1.628,.100,.060)],beard,'head',24)
for side in [-1,1]:
 detail('Moustache',[(side*.007,-.145,1.633),(side*.025,-.138,1.625),(side*.04,-.121,1.611)],.008,beard,'head')
for j in range(220):
 x=random.uniform(-.085,.085);top=random.uniform(1.51,1.60);bottom=random.uniform(1.39,1.45)
 # Thin, varied strands follow the volume rather than floating below the jaw.
 endx=x*.45+random.uniform(-.009,.009)
 detail('Beard strand',[(x,-.116-abs(x)*.08,top),(x*.88+math.sin(j)*.003,-.134-random.random()*.004,1.505),(x*.65,-.129,1.455),(endx,-.102,bottom)],.0004,grey if j%9==0 else hair if j%3==0 else beard,'head')
oval('Short rear hair',(0,.069,1.76),(.092,.039,.061),hair,'head',20,10)
for j in range(55):
 a=random.uniform(.1,math.pi-.1);x=math.cos(a)*.094;y=.01+math.sin(a)*.083;z=random.uniform(1.75,1.795)
 detail('Short hair strand',[(x,y,z),(x*.97,y*.98,z+.009)],.0007,grey if j%12==0 else hair,'head')
for j in range(95):
 a=random.uniform(0,math.tau);r=random.uniform(.28,1);x=math.cos(a)*.084*r;y=.02+math.sin(a)*.073*r
 z=1.823-.050*r*r
 if y<-.015 and abs(x)>.045:continue
 detail('Scalp stubble',[(x,y,z),(x+.001,y+.001,z+.0035)],.00045,grey if j%8==0 else hair,'head')
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

# Continuous organic surfaces replace visibly separate sleeve/torso and limb shells.
def continuous_surface(names,title,material,voxel,ratio,assignment):
 pieces=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.split('.')[0] in names]
 bpy.ops.object.select_all(action='DESELECT')
 for o in pieces:o.select_set(True)
 bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join();o=bpy.context.object;o.name=title
 remesh=o.modifiers.new('Continuous tailored volume','REMESH');remesh.mode='VOXEL';remesh.voxel_size=voxel;remesh.use_smooth_shade=True
 bpy.ops.object.modifier_apply(modifier=remesh.name)
 smooth=o.modifiers.new('Relaxed surface','SMOOTH');smooth.factor=.4;smooth.iterations=3;bpy.ops.object.modifier_apply(modifier=smooth.name)
 decimate=o.modifiers.new('Optimized organic topology','DECIMATE');decimate.ratio=ratio;bpy.ops.object.modifier_apply(modifier=decimate.name)
 o.data.materials.clear();o.data.materials.append(material)
 o.vertex_groups.clear()
 groups={}
 for v in o.data.vertices:
  for name,weight in assignment(v.co).items():
   if weight<=0:continue
   if name not in groups:groups[name]=o.vertex_groups.new(name=name)
   groups[name].add([v.index],weight,'REPLACE')
 for polygon in o.data.polygons:polygon.use_smooth=True
 return o
clamp=lambda n:max(0,min(1,n))
def jacket_weights(v):
 side=-1 if v.x<0 else 1
 arm=clamp((abs(v.x)-.18)/.075)*clamp((1.50-v.z)/.10)
 lower=clamp((1.24-v.z)/.16)
 return {'spine':1-arm,'arm'+str(side):arm*(1-lower),'forearm'+str(side):arm*lower}
def trouser_weights(v):
 side=-1 if v.x<0 else 1;leg=clamp((.95-v.z)/.12);lower=clamp((.60-v.z)/.15)
 return {'hips':1-leg,'thigh'+str(side):leg*(1-lower),'shin'+str(side):leg*lower}
continuous_surface({'Hoodie body','Sleeve'},'Continuous tailored jacket',cloth,.012,.45,jacket_weights)
continuous_surface({'Pelvis','Trousers'},'Continuous tailored trousers',denim,.011,.40,trouser_weights)
continuous_surface({'Anatomical head','Neck','Nose bridge','Ear','Cheek plane','Brow ridge','Nose wing','Chin plane'},'Sculpted anatomical face',skin,.0038,.46 if npc_index is None else .32,lambda v:{'head':1})
for side in [-1,1]:
 # Different names per side let remeshing preserve two independently weighted hands.
 for o in bpy.context.scene.objects:
  if o.type=='MESH' and o.name.split('.')[0] in ['Palm','Finger','Thumb'] and o.location.x*side>0:o.name='Hand volume '+str(side)
 continuous_surface({'Hand volume '+str(side)},'Anatomical hand '+str(side),skin,.0028,.34,lambda v,side=side:{'hand'+str(side):1})
 for j in range(4):
  x=side*.286+(j-1.5)*.014
  oval('Fingernail',(x,-.032,.855+abs(j-1.5)*.007),(.0045,.0018,.008),skin_shadow,'hand'+str(side),8,6)
# Gentle asymmetry and cloth folds sculpted into the actual surface.
for o in bpy.context.scene.objects:
 if o.name.startswith(('Continuous tailored jacket','Continuous tailored trousers')):
  for v in o.data.vertices:
   if v.co.y<-.045:
    amplitude=.0022 if 'jacket' in o.name else .0015
    v.co.y+=amplitude*math.sin(v.co.z*125+v.co.x*31)*math.sin(v.co.x*17)
for o in bpy.context.scene.objects:
 if o.name.startswith('Long tapered beard'):
  for v in o.data.vertices:
   wave=math.sin(v.co.x*170+v.co.z*69)*.0016
   v.co.y+=wave
# Original fictional cast: varied skin, tailoring and hairstyles, never the moodboard face.
if npc_index is not None:
 palettes=[((.43,.26,.18),(.035,.045,.06)),((.26,.13,.075),(.16,.09,.055)),((.32,.20,.14),(.045,.09,.13)),((.49,.32,.24),(.14,.11,.09)),((.17,.09,.055),(.04,.12,.13)),((.38,.23,.16),(.085,.09,.12)),((.53,.36,.27),(.16,.18,.20)),((.23,.135,.075),(.12,.07,.10))]
 skin_color,cloth_color=palettes[npc_index]
 for material,color in [(skin,skin_color),(skin_shadow,tuple(c*.72 for c in skin_color)),(cloth,cloth_color),(seam,tuple(c*1.25 for c in cloth_color))]:
  material.diffuse_color=(*color,1);material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*color,1)
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(('Long tapered beard','Beard strand','Moustache','Backpack','Rolled hood','Folded hood','Short hair strand','Side hair','Short rear hair','Scalp stubble')):bpy.data.objects.remove(o,do_unlink=True)
 if npc_index in [0,1,3]:
  oval('Soft bob hair',(0,.055,1.69),(.124,.086,.145),hair,'head',20,12)
  oval('Hair crown',(0,.015,1.79),(.108,.095,.055),hair,'head',20,12)
  for side in [-1,1]:oval('Hair side locks',(side*.107,-.005,1.65),(.022,.04,.11),hair,'head',12,10)
 else:
  oval('Short hair cap',(0,.012,1.787),(.106,.094,.045),hair,'head',20,10)
  for side in [-1,1]:oval('Clipped side hair',(side*.102,.015,1.74),(.012,.057,.053),hair,'head',12,8)
 for j in range(32):
  a=j*math.tau/32
  if npc_index in [0,1,3]:
   detail('Styled hair flow',[(math.cos(a)*.103,.025+math.sin(a)*.077,1.80),(math.cos(a)*.124,.05+math.sin(a)*.08,1.73),(math.cos(a)*.113,.05+math.sin(a)*.071,1.60+math.sin(j)*.009)],.0013,hair,'head')
  else:
   detail('Styled hair flow',[(math.cos(a)*.04,.012+math.sin(a)*.035,1.825),(math.cos(a)*.101,.012+math.sin(a)*.09,1.795)],.0014,hair,'head')
 # A lapel collar distinguishes professional jackets from Gabriel's hoodie.
 for side in [-1,1]:detail('Tailored lapel',[(side*.045,-.085,1.48),(side*.09,-.124,1.34),(side*.025,-.133,1.23)],.009,lining,'spine')
sys.path.insert(0,os.path.join(ROOT,'tools'))
from import_human import import_anatomical_surfaces
import_anatomical_surfaces(ROOT,skin,hair,eye,white,black,npc_index)
if npc_index is None:
 from native_avatar import native_head,native_wardrobe
 native_head(ROOT)
 from refine_hero import refine_hero,hero_color
 for material,color in [(skin,(.46,.31,.245)),(cloth,(.032,.052,.086)),(seam,(.055,.078,.108)),(lining,(.09,.11,.14)),(beard,(.057,.038,.024)),(grey,(.25,.22,.175))]:
  material.diffuse_color=(*color,1)
 refine_hero((skin,hair,beard,grey,cloth,seam,lining,trim),detail,cube)
 native_wardrobe(ROOT)
 from refine_face_depth import refine_face_depth
 refine_face_depth()
 from groom_avatar import groom_avatar
 groom_avatar(ROOT)
 from bake_skin_atlas import bake_skin_atlas
 bake_skin_atlas()
# Convert detailed curves and bind them to the appropriate deforming bone.
for o in list(bpy.context.scene.objects):
 if o.type=='CURVE':
  bone_name=o['skinBone'];bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
  o.vertex_groups.new(name=bone_name).add(list(range(len(o.data.vertices))),1,'REPLACE')
# Bake material colours into the geometry: shared skinned legacy palette, no portrait texture.
surface=bpy.data.materials.new('Gabriel original vertex palette');surface.use_nodes=True
p=surface.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.86
vc=surface.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='SurfaceColor';surface.node_tree.links.new(vc.outputs['Color'],p.inputs['Base Color'])
# Original procedural micro-surface atlas. Native skin and clothing retain their separate licensed materials.
size=256;rough=[];normal=[];noise=random.Random(804)
roughness=[.72,.92,.86,.28,.90,.48,.88,.76]
for y in range(size):
 for x in range(size):
  tile=(x//64)+(y//128)*4
  grain=noise.uniform(-1,1)
  weave=math.sin(x*math.pi*.5)*math.sin(y*math.pi*.5)
  value=roughness[tile]+grain*.018
  rough.extend((value,value,value,1))
  amount=.035 if tile in [1,2,6] else .014 if tile==0 else .004
  normal.extend((.5+amount*(weave if tile in [1,2] else grain),.5+amount*noise.uniform(-1,1),1,1))
for title,data in [('roughness',rough),('normal',normal)]:
 image=bpy.data.images.new('Original human '+title+' atlas',width=size,height=size);image.colorspace_settings.name='Non-Color';image.pixels=data;image.pack()
 tex=surface.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
 if title=='roughness':surface.node_tree.links.new(tex.outputs['Color'],p.inputs['Roughness'])
 else:
  bump=surface.node_tree.nodes.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.45
  surface.node_tree.links.new(tex.outputs['Color'],bump.inputs['Color']);surface.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal'])
if npc_index is None:
 from human_albedo import add_human_albedo
 add_human_albedo(surface)
heroMouth=next((obj.get('mouthZ',1.592) for obj in bpy.context.scene.objects if obj.name.startswith('MakeHuman CC0 anatomical head')),1.592)
for o in list(bpy.context.scene.objects):
 if o.type!='MESH':continue
 if o.get('preservePBR'):
  if o.data.uv_layers.active:o.data.uv_layers.active.name='SurfaceUV'
  continue
 original=o.data.materials[0]
 color=original.diffuse_color[:3]
 tile=0 if original in [skin,skin_shadow,lip] else 3 if original in [eye,white,black] else 4 if original in [hair,beard,grey] else 5 if original==trim else 2 if original==denim else 6 if original in [shoe,sole] else 1
 uv=o.data.uv_layers.active or o.data.uv_layers.new(name='SurfaceUV')
 uv.name='SurfaceUV'
 for polygon in o.data.polygons:
  axis=max(range(3),key=lambda k:abs(polygon.normal[k]))
  for li in polygon.loop_indices:
   co=o.matrix_world@o.data.vertices[o.data.loops[li].vertex_index].co
   u,v=((co.y,co.z) if axis==0 else (co.x,co.z) if axis==1 else (co.x,co.y))
   if npc_index is None and o.name.startswith(('Contoured beard','Natural moustache fibre')):
    mouth=heroMouth
    u=max(0,min(1,(co.x+.12)/.24));v=max(0,min(1,(co.z-(1.385+mouth-1.592))/.235))
    uv.data[li].uv=((.03+u*.94)/4,(1+.03+v*.94)/2)
   elif npc_index is None and o.name.startswith('MakeHuman CC0 anatomical head'):
    u=(math.atan2(co.x,-co.y)+math.pi)/math.tau;v=max(0,min(1,(co.z-1.50)/.34))
    uv.data[li].uv=((3+.03+u*.94)/4,(1+.03+v*.94)/2)
   else:uv.data[li].uv=((tile%4+.03+(u*18%1)*.94)/4,(tile//4+.03+(v*18%1)*.94)/2)
 if npc_index is not None and o.vertex_groups.get('head'):
  width=[.93,1.0,1.05,.95,1.03,1.0,1.08,.98][npc_index]
  o.location.x*=width
  for v in o.data.vertices:v.co.x*=width
 layer=o.data.color_attributes.new(name='SurfaceColor',type='FLOAT_COLOR',domain='CORNER')
 for loop in o.data.loops:
  v=o.data.vertices[loop.vertex_index].co
  variation=1+math.sin(v.x*43+v.z*29)*.025
  if o.name.startswith('MakeHuman CC0 anatomical head'):
   mouth=math.exp(-((v.x/.033)**4+((v.z-1.592)/.012)**4))*max(0,min(1,(-v.y-.090)/.025))
   color=tuple(a*(1-mouth*.5)+b*mouth*.5 for a,b in zip(original.diffuse_color[:3],(.34,.16,.14)))
   smooth=lambda value:max(0,min(1,value))**2*(3-2*max(0,min(1,value)))
   side_hair=smooth((v.z-1.73)/.035)*max(smooth((v.y+.018)/.025),smooth((abs(v.x)-.075)/.012))
   top_hair=smooth((v.z-1.795)/.027)*smooth((v.y+.04)/.03)
   if npc_index is not None:
    top_hair=smooth((v.z-1.755)/.025)
    side_hair=max(side_hair,smooth((v.z-1.68)/.04)*smooth((v.y+.005)/.025))
   brow=math.exp(-(((abs(v.x)-.034)/.023)**4+((v.z-1.710)/.0038)**2))*smooth((-v.y-.072)/.025)
   hair_weight=min(1,max(side_hair,top_hair,brow*.9))
   hair_color=[(.026,.018,.014),(.065,.028,.012),(.012,.015,.019),(.10,.065,.024)][(npc_index or 0)%4]
   color=tuple(c*(1-hair_weight)+h*hair_weight for c,h in zip(color,hair_color))
  if npc_index is None:color=hero_color(o.name,v,original.diffuse_color[:3] if o.name.startswith('MakeHuman CC0 anatomical head') else color)
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
for name in ['Idle','Walk','Turn','Start','Stop','Interact','Sit','Type','Talk','StandUp','SitDown']:
 rig.animation_data_create();action=bpy.data.actions.new(name);rig.animation_data.action=action
 for frame in range(1,33):
  phase=(frame-1)/31*math.tau
  for b in rig.pose.bones:
   b.rotation_mode='XYZ';b.rotation_euler=(0,0,0);b.location=(0,0,0)
   if name in ['Walk','Start','Stop']:
    side=-1 if '-1' in b.name else 1
    u=((frame-1)/31+(0 if side<0 else .5))%1
    if u<.5:foot_y=-.2875+u*1.15;lift=0
    else:
     swing=(u-.5)*2;foot_y=.2875*(1-2*(swing*swing*(3-2*swing)));lift=.075*math.sin(swing*math.pi)
    hip=-.060+.003*math.cos(phase*2)
    down=.8+hip-lift;reach=min(.799,max(.30,math.hypot(foot_y,down)))
    knee=2*math.acos(reach/.8);thigh=math.atan2(foot_y,down)-knee/2
    if b.name.startswith('thigh'):b.rotation_euler.x=thigh
    if b.name.startswith('shin'):b.rotation_euler.x=knee
    if b.name.startswith('foot'):b.rotation_euler.x=-thigh-knee
    if b.name.startswith('arm'):b.rotation_euler.x=-math.sin(phase+side*math.pi/2)*.22
    if b.name.startswith('forearm'):b.rotation_euler.x=-.15
    if b.name=='hips':b.location.y=hip
    if b.name=='spine':
     b.rotation_euler.z=math.sin(phase)*.008
     b.rotation_euler.y=math.sin(phase)*.035
   if name in ['Start','Stop']:
    amount=(frame-1)/31 if name=='Start' else 1-(frame-1)/31
    for axis in range(3):b.rotation_euler[axis]*=amount
    if b.name=='hips':b.location.y*=amount
   seated=name in ['Sit','Type'] or (name=='Talk' and npc_index is not None and npc_index in [1,5,7]) or name in ['StandUp','SitDown']
   amount=(1-(frame-1)/31) if name=='StandUp' else (frame-1)/31 if name=='SitDown' else 1
   if seated:
    if b.name=='hips':
     b.location.y=-.25*amount
     # Root follows the collision-checked lateral chair exit in npcRoutine.
     if name in ['StandUp','SitDown']:b.location.z=0
    if b.name.startswith('thigh'):b.rotation_euler.x=(-1.43 if npc_index in [1,7] else -1.20)*amount
    if b.name.startswith('shin'):b.rotation_euler.x=(1.43 if npc_index in [1,7] else 1.20)*amount
    if b.name.startswith('arm'):b.rotation_euler.x=-.35*amount
    if b.name.startswith('forearm'):b.rotation_euler.x=(-.95+math.sin(phase+(1 if '-1' in b.name else 0))*.045)*amount
   if name=='Type':
    if b.name=='hips':b.location.z=.18
    if b.name=='spine':b.rotation_euler.x=.22
    if b.name.startswith('arm'):b.rotation_euler.x=-.85
    if b.name.startswith('forearm'):b.rotation_euler.x=-.70+math.sin(phase+(1 if '-1' in b.name else 0))*.045
   if name=='Talk':
    if b.name=='head':b.rotation_euler.y=math.sin(phase)*.11
    if b.name=='forearm1':b.rotation_euler.x=-.7+math.sin(phase)*.14
   if name=='Interact':
    if b.name=='arm1':b.rotation_euler.x=-.4*math.sin(phase/2)
    if b.name=='forearm1':b.rotation_euler.x=-.7*math.sin(phase/2)
    if b.name=='head':b.rotation_euler.x=math.sin(phase)*.05
   if name=='Idle' and b.name=='spine':b.rotation_euler.x=math.sin(phase)*.007
   if name=='Turn' and b.name=='head':b.rotation_euler.y=math.sin(phase)*.20
   b.keyframe_insert('rotation_euler',frame=frame,group=b.name)
   if b.name=='hips':b.keyframe_insert('location',frame=frame,group=b.name)
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);rig.animation_data.action=None
export('gabriel-rigged' if npc_index is None else 'npc-'+str(npc_index))
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
