import bpy, math, os, random
from mathutils import Vector
OUT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'public','models')
os.makedirs(OUT,exist_ok=True)
random.seed(27)
def clean():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for a in list(bpy.data.actions):bpy.data.actions.remove(a)
def mat(name,color,metal=0,rough=.6):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 # Small original texture maps: subtle mineral grain and directional walnut.
 # Packed into GLB; no stock photographs, downloads, or external texture URLs.
 if name in ['Petroleum stone','Mineral concrete','Smoked walnut']:
  m['fallbackBaseColor']=list(color)
  size=128;pixels=[];noise=random.Random(name)
  for y in range(size):
   for x in range(size):
    grain=(math.sin(x*.19+math.sin(y*.07)*2)*.12+noise.uniform(-.04,.04)) if name=='Smoked walnut' else noise.uniform(-.09,.09)+math.sin(x*.14+y*.08)*.025
    values=[max(0,min(1,c*(1+grain))) for c in color]
    pixels.extend([12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055 for c in values]+[1])
  image=bpy.data.images.new(name+' original grain',width=size,height=size);image.pixels=pixels;image.file_format='PNG';image.pack()
  node=m.node_tree.nodes.new('ShaderNodeTexImage');node.image=image;m.node_tree.links.new(node.outputs['Color'],p.inputs['Base Color'])
 if name=='Smoked glazing':
  p.inputs['Alpha'].default_value=.23;m.surface_render_method='DITHERED';m.diffuse_color=(*color,.23)
 return m
def finish(o,name,m,bone=None):
 o.name=name;o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 if bone:o.vertex_groups.new(name=bone).add(list(range(len(o.data.vertices))),1,'REPLACE')
 return o
def ell(name,loc,scale,m,bone=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=8 if max(scale)<.08 else 12 if max(scale)<.12 else 24,ring_count=6 if max(scale)<.08 else 8 if max(scale)<.12 else 16,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,m,bone)
def loft(name,rings,m,bone=None,n=24):
 vs=[];fs=[]
 for x,y,z,rx,ry in rings:
  for j in range(n):
   a=j*math.tau/n;vs.append((x+math.cos(a)*rx,y+math.sin(a)*ry,z))
 for k in range(len(rings)-1):
  for j in range(n):a=k*n+j;b=k*n+(j+1)%n;fs.append((a,b,b+n,a+n))
 fs.extend([tuple(range(n-1,-1,-1)),tuple((len(rings)-1)*n+j for j in range(n))]);mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update();o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);finish(o,name,m,bone)
 sub=o.modifiers.new('Tailored subdivision','SUBSURF');sub.levels=1;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=sub.name);return o
def cube(name,loc,scale,m,bevel=.04,segments=3):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.name=name;o.data.materials.append(m)
 if bevel:
  mod=o.modifiers.new('Crafted edge','BEVEL');mod.width=bevel;mod.segments=segments;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 for p in o.data.polygons:p.use_smooth=False
 return o
def curve(name,points,radius,m):
 d=bpy.data.curves.new(name,'CURVE');d.dimensions='3D';d.bevel_depth=radius;d.bevel_resolution=2;s=d.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
def export(name):
 bpy.ops.object.select_all(action='DESELECT')
 pieces=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
 for o in pieces:o.select_set(True)
 if pieces and name!='gabriel-rigged':
  bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.convert(target='MESH');bpy.ops.object.join()
 if name=='gabriel-rigged':
  bpy.context.view_layer.objects.active=pieces[0];bpy.ops.object.join()
 bpy.ops.export_scene.gltf(filepath=OUT+'/'+name+'.glb',export_format='GLB',export_animations=True,export_skins=True,export_yup=True,export_extras=True)
clean()
skin=mat('Warm skin',(.63,.43,.32),rough=.75);cloth=mat('Midnight cotton',(.025,.035,.045),rough=.92);denim=mat('Charcoal denim',(.06,.07,.085),rough=.88);shoe=mat('Suede',(.025,.027,.03));sole=mat('Rubber sole',(.2,.22,.23));hair=mat('Short hair',(.09,.07,.055));beard=mat('Full beard',(.13,.105,.08));grey=mat('Silver beard strands',(.32,.29,.24));eye=mat('Blue grey iris',(.16,.33,.4),rough=.35);white=mat('Eyes',(.7,.72,.69));black=mat('Pupil',(.008,.012,.016));bronze=mat('Zip',(.3,.25,.16),.7,.38)
loft('Jacket',[(0,0,.9,.16,.105),(0,0,.96,.19,.12),(0,0,1.14,.18,.12),(0,0,1.32,.23,.135),(0,0,1.43,.255,.125),(0,0,1.49,.19,.095),(0,0,1.52,.09,.075)],cloth,'spine')
loft('Trouser seat',[(0,0,.81,.16,.10),(0,0,.92,.18,.115),(0,0,1,.16,.1)],denim,'hips')
ell('Neck',(0,0,1.52),(.075,.075,.105),skin,'head');ell('Head',(0,-.005,1.69),(.127,.113,.178),skin,'head')
for side in [-1,1]:
 x=side*.105
 leg=loft('Tailored trousers',[(x,0,.92,.103,.103),(x,0,.82,.106,.10),(x,.01,.65,.09,.085),(x,.018,.5,.077,.074),(x,0,.36,.073,.068),(x,0,.18,.057,.06),(x,0,.1,.057,.06)],denim)
 thigh=leg.vertex_groups.new(name='thigh'+str(side));shin=leg.vertex_groups.new(name='shin'+str(side))
 for v in leg.data.vertices:
  w=max(0,min(1,(v.co.z-.44)/.14));thigh.add([v.index],w,'REPLACE');shin.add([v.index],1-w,'REPLACE')
 ell('Sneaker',(x,-.055,.075),(.078,.145,.06),shoe,'foot'+str(side));ell('Sole',(x,-.055,.035),(.08,.146,.02),sole,'foot'+str(side))
 ax=side*.265
 sleeve=loft('Jacket sleeve',[(ax,0,1.48,.068,.073),(ax+side*.01,0,1.4,.08,.08),(ax+side*.02,0,1.28,.075,.074),(ax+side*.025,0,1.18,.066,.067),(ax+side*.03,-.005,1.06,.058,.06),(ax+side*.035,-.01,.96,.044,.05)],cloth)
 upper=sleeve.vertex_groups.new(name='arm'+str(side));lower=sleeve.vertex_groups.new(name='forearm'+str(side))
 for v in sleeve.data.vertices:
  w=max(0,min(1,(v.co.z-1.12)/.15));upper.add([v.index],w,'REPLACE');lower.add([v.index],1-w,'REPLACE')
 ell('Palm',(ax+side*.035,-.01,.925),(.043,.034,.065),skin,'hand'+str(side))
 for i in range(4):ell('Finger',(ax+side*.035+(i-1.5)*.018,-.012,.87+abs(i-1.5)*.009),(.009,.018,.035),skin,'hand'+str(side))
 ell('Thumb',(ax+side*.0,-.035,.93),(.017,.02,.037),skin,'hand'+str(side))
 ell('Ear',(side*.126,0,1.69),(.026,.02,.042),skin,'head')
 ell('Eye',(side*.048,-.102,1.718),(.027,.014,.014),white,'head');ell('Iris',(side*.048,-.116,1.718),(.011,.004,.011),eye,'head');ell('Pupil',(side*.048,-.12,1.718),(.005,.002,.006),black,'head')
 ell('Brow',(side*.05,-.103,1.746),(.034,.012,.007),hair,'head')
 ell('Side hair',(side*.109,.02,1.76),(.021,.082,.064),hair,'head')
ell('Occipital hair',(0,.07,1.79),(.115,.055,.064),hair,'head');ell('Nose',(0,-.12,1.676),(.024,.038,.036),skin,'head')
loft('Sculpted long beard',[(0,-.045,1.635,.112,.09),(0,-.069,1.59,.12,.09),(0,-.082,1.53,.115,.085),(0,-.09,1.44,.105,.075),(0,-.09,1.35,.08,.06),(0,-.085,1.30,.035,.025)],beard,'head')
ell('Lower lip',(0,-.165,1.604),(.035,.009,.008),skin,'head')
for i in range(19):
 x=(i-9)*.009;z=1.40+random.uniform(-.04,.05);ell('Beard silver',(x,-.153,z),(.003,.003,.055+random.random()*.025),grey if i%3==0 else beard,'head')
# Coat seams/pocket piping, assigned to the spine, not floating objects.
for x in [-.135,.135]:
 o=ell('Pocket welt',(x,-.118,1.07),(.04,.006,.008),cloth,'spine')
ell('Zip',(0,-.123,1.2),(.003,.004,.23),bronze,'spine')
# True armature and skin modifiers; each mesh binds through named weighted groups.
bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0));rig=bpy.context.object;rig.name='Gabriel_Armature';arm=rig.data;arm.edit_bones.remove(arm.edit_bones[0])
def bone(name,head,tail,parent=None):
 b=arm.edit_bones.new(name);b.head=head;b.tail=tail
 if parent:b.parent=arm.edit_bones[parent]
bone('root',(0,0,0),(0,0,.1));bone('hips',(0,0,.85),(0,0,1),'root');bone('spine',(0,0,1),(0,0,1.48),'hips');bone('head',(0,0,1.48),(0,0,1.87),'spine')
for side in [-1,1]:
 bone('thigh'+str(side),(side*.105,0,.9),(side*.105,.018,.5),'hips');bone('shin'+str(side),(side*.105,.018,.5),(side*.105,0,.1),'thigh'+str(side));bone('foot'+str(side),(side*.105,0,.1),(side*.105,-.18,.06),'shin'+str(side));bone('arm'+str(side),(side*.265,0,1.45),(side*.29,0,1.18),'spine');bone('forearm'+str(side),(side*.29,0,1.18),(side*.3,-.01,.97),'arm'+str(side));bone('hand'+str(side),(side*.3,-.01,.97),(side*.3,-.01,.86),'forearm'+str(side))
bpy.ops.object.mode_set(mode='OBJECT')
for o in list(bpy.context.scene.objects):
 if o.type=='MESH':
  mod=o.modifiers.new('Skinning','ARMATURE');mod.object=rig;o.parent=rig
for name in ['Idle','Walk','Turn']:
 rig.animation_data_create();action=bpy.data.actions.new(name);rig.animation_data.action=action
 for frame in range(1,33):
  phase=(frame-1)/31*math.tau
  for b in rig.pose.bones:
   b.rotation_mode='XYZ';b.rotation_euler=(0,0,0)
   if name=='Walk':
    side=-1 if '-1' in b.name else 1
    if b.name.startswith('thigh'):b.rotation_euler.x=math.sin(phase+side*math.pi/2)*.46
    if b.name.startswith('shin'):b.rotation_euler.x=max(0,math.sin(phase+side*math.pi/2))*.5
    if b.name.startswith('arm'):b.rotation_euler.x=-math.sin(phase+side*math.pi/2)*.3
    if b.name.startswith('forearm'):b.rotation_euler.x=-.15
   if name=='Idle' and b.name=='spine':b.rotation_euler.x=math.sin(phase)*.008
   if name=='Turn' and b.name=='head':b.rotation_euler.z=math.sin(phase)*.22
   b.keyframe_insert('rotation_euler',frame=frame,group=b.name)
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);rig.animation_data.action=None
export('gabriel-rigged')
# Environment construction in Blender: applied bevels, curved surfaces, detailed furniture.
for index in range(6):
 clean();stone=mat('Petroleum stone',(.035,.055,.07),.12,.4);concrete=mat('Mineral concrete',(.16,.17,.16),.04,.72);brass=mat('Brushed bronze',(.4,.25,.09),.72,.32);wood=mat('Smoked walnut',(.065,.035,.022),.1,.65);fabric=mat('Woven fabric',(.055,.068,.075),0,.95);glass=mat('Smoked glazing',(.12,.22,.25),.35,.19);light=mat('Warm architectural light',(.95,.61,.26),0,.25);p=light.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.52,.17,1);p.inputs['Emission Strength'].default_value=2
 # Tiled platform with seams, no endless generic tunnel.
 for x in range(-4,5):
  for y in range(-6,7):cube('Cut stone tile',(x*1.6,y*1.6,-.12),(1.58,1.58,.2),stone,.018,1)
 if index>0:
  centers=[0,24,49,82,112,145];start=-(centers[index]-centers[index-1])+10;length=-10-start;mid=(start-10)/2
  cube('Exterior connecting causeway',(0,mid,-.135),(5.2,length,.18),stone,.025)
  for side in [-1,1]:
   curve('Causeway rail',[(side*2.6,start,.8),(side*2.6,-10,.8)],.025,brass)
   curve('Causeway guiding light',[(side*2.45,start,.02),(side*2.45,-10,.02)],.012,light)
 for x in [-7.1,7.1]:
  cube('Floating plinth',(x,0,.2),(1.3,20,.4),concrete)
  curve('Bronze inlay',[(x-.1,-10,.43),(x-.1,10,.43)],.012,light)
 if index==0:
  # Offset cantilever portal opens towards the sunset; asymmetric supports.
  for x,y,h in [(-6,-2,7),(6,3,6),(-5,8,5)]:cube('Monolithic fin',(x,y,h/2),(.65,2,h),concrete,.09);curve('Fin edge light',[(x+.35,y-1,0.1),(x+.35,y-1,h)],.018,light)
  cube('Cantilever',(0,4,6.8),(15,5,.55),stone,.08)
 elif index==1:
  for i in range(18):
   a=i/18*math.tau;x=math.cos(a)*6.2;y=math.sin(a)*6.2
   if abs(x)<2.2:continue
   cube('Atrium timber lamella',(x,y,2.6),(.18,.3,5.2),wood,.025)
  for j in range(3):
   bpy.ops.mesh.primitive_torus_add(major_radius=4+j*.18,minor_radius=.045,major_segments=64,minor_segments=8,location=(0,0,5.4));o=bpy.context.object;o.data.materials.append(brass)
 elif index==2:
  cube('Studio wall',(-6.8,0,2.7),(.35,20,5.4),wood,.06);cube('Studio canopy',(0,2,5.4),(14,14,.35),stone,.05)
  for y in [-5,1,7]:
   for x in [-4.5,4.5]:
    cube('Walnut desktop',(x,y,.86),(2.6,1.25,.09),wood)
    for dx in [-1,1]:cube('Steel desk leg',(x+dx,y,.42),(.08,.8,.84),brass,.02)
    cube('Monitor frame',(x,y+.18,1.35),(1.45,.075,.84),stone,.04);cube('Monitor glass',(x,y+.13,1.35),(1.33,.014,.73),glass,.025)
    cube('Keyboard',(x,y-.3,.94),(.7,.24,.025),concrete,.015)
 elif index==3:
  # Gallery blades create framed sightlines rather than corridors.
  for x,y in [(-5,-5),(5,0),(-5,5)]:
   cube('Display blade',(x,y,2),(3.8,.22,3.6),stone,.09);cube('Display bronze frame',(x,y-.14,2.2),(3.3,.07,2.1),brass,.035);cube('Display recess',(x,y-.19,2.2),(3.16,.02,1.96),glass,.02)
 elif index==4:
  for x in [-6,6]:cube('Laboratory glazing',(x,0,2.6),(.12,17,5.2),glass,.02)
  cube('Collaboration table',(0,3,.8),(5.2,1.8,.14),wood,.06)
  for i in range(5):cube('Integration module',(-3+i*1.5,7,1.2),(.8,.8,2.4),stone,.09);curve('Module trace',[(-3+i*1.5,6.58,.1),(-3+i*1.5,6.58,2.3)],.012,light)
 else:
  for i in range(4):
   a=i*.25;cube('Terrace step',(0,4+i*1.5,-.08-i*.06),(14+i,1.5,.18),concrete,.025)
  curve('Terrace balustrade',[(-7,-6,.8),(-7,9,.8),(7,9,.8),(7,-6,.8)],.025,brass)
 # Handcrafted lounge seating and architectural planters, sparse, not a hotel forest.
 for x,y in [(-5,-6),(5,6)]:
  cube('Sofa base',(x,y,.28),(2.5,1.2,.3),wood,.1);cube('Upholstered seat',(x,y,.5),(2.45,1.12,.24),fabric,.11);cube('Upholstered back',(x,y+.48,.85),(2.45,.24,.68),fabric,.1)
  for dx in [-1.15,1.15]:cube('Sofa arm',(x+dx,y,.7),(.22,1.13,.56),fabric,.09)
  for j in range(3):cube('Cushion',(x+(j-1)*.76,y,.66),(.72,.84,.13),fabric,.06)
 # Curved signature sculpture; deliberately no lion placed in the architecture.
 if index in [0,1,5]:
  bpy.ops.mesh.primitive_torus_add(major_radius=.65,minor_radius=.09,major_segments=48,minor_segments=12,location=(-4,2,1.7),rotation=(math.pi/2,.3,0));o=bpy.context.object;o.data.materials.append(brass);cube('Sculpture base',(-4,2,.55),(1.4,1.4,1.1),concrete,.08)
 # Modest polygon asset, exported as actual mesh with applied details and materials.
 export('environment-'+str(index))
print('ASSETS COMPLETE')
