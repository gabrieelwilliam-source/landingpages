"""Adapt licensed human DATA and clothing to the project's existing 16-bone rig.
Original fitting/retarget code. No MakeHuman application code imported.
"""
import bpy,os,json,math
from mathutils import Vector

def read_obj(path):
 vertices=[];uvs=[];faces=[];groups=[];group=''
 for line in open(path):
  p=line.split()
  if not p:continue
  if p[0]=='v':vertices.append(Vector(tuple(map(float,p[1:4]))))
  elif p[0]=='vt':uvs.append(tuple(map(float,p[1:3])))
  elif p[0]=='g':group=p[1]
  elif p[0]=='f':faces.append([(int(s.split('/')[0])-1,int(s.split('/')[1])-1 if '/' in s and s.split('/')[1] else 0) for s in p[1:]]);groups.append(group)
 return vertices,uvs,faces,groups

def data(root):
 folder=os.path.join(root,'tools','vendor','native-human');base,uv,faces,groups=read_obj(os.path.join(root,'tools','vendor','human','base.obj'));shaped=[v.copy() for v in base]
 for filename in ['caucasian-male-young.target','universal-male-young-averagemuscle-averageweight.target']:
  for line in open(os.path.join(folder,filename)):
   p=line.split()
   if len(p)==4 and p[0].isdigit():shaped[int(p[0])]+=Vector(tuple(map(float,p[1:])))
 return folder,base,shaped,uv,faces,groups

def fitted(folder,name,base,shaped):
 path=os.path.join(folder,name);rows=[];active=False;scales=[1,1,1]
 for line in open(path):
  p=line.split()
  if not p or p[0].startswith('#'):continue
  if p[0] in ['x_scale','y_scale','z_scale']:
   axis=['x_scale','y_scale','z_scale'].index(p[0]);a,b=int(p[1]),int(p[2]);scales[axis]=abs(shaped[a][axis]-shaped[b][axis])/float(p[3])
  elif p[0]=='verts':active=True
  elif active and p[0].isdigit():
   if len(p)==1:rows.append(shaped[int(p[0])].copy())
   elif len(p)==9:rows.append(sum((shaped[int(p[i])]*float(p[i+3]) for i in range(3)),Vector())+Vector(tuple(float(p[6+i])*scales[i] for i in range(3))))
  elif active and p[0] in ['delete_verts','weights','boneweights_file']:break
 return rows

def canonical(v):return Vector((v.x*.11,.035-v.z*.105,1.53+(v.y-6)*.12))
def material(name,texture,rough=.8,normal=None,factor=(1,1,1)):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=rough;p.inputs['Base Color'].default_value=(*factor,1)
 image=bpy.data.images.load(texture,check_existing=True)
 limit=2048 if 'skin' in name else 512 if any(s in name for s in ['iris','hair','eyebrow']) else 1024
 if max(image.size)>limit:image.scale(limit,limit)
 image.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
 if any(s in name for s in ['iris','hair','eyebrow']):
  m.node_tree.links.new(tex.outputs['Alpha'],p.inputs['Alpha']);m.surface_render_method='DITHERED'
 if normal:
  im=bpy.data.images.load(normal,check_existing=True);im.colorspace_settings.name='Non-Color';im.scale(512,512);im.pack();tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;n=m.node_tree.nodes.new('ShaderNodeNormalMap');n.inputs['Strength'].default_value=.45;m.node_tree.links.new(tex.outputs['Color'],n.inputs['Color']);m.node_tree.links.new(n.outputs['Normal'],p.inputs['Normal'])
 return m

def create(name,vertices,uvs,faces,mat,weights):
 ids=sorted(set(i for f in faces for i,t in f));remap={v:i for i,v in enumerate(ids)};me=bpy.data.meshes.new(name);me.from_pydata([vertices[i] for i in ids],[],[[remap[i] for i,t in f] for f in faces]);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);me.materials.append(mat);o['preservePBR']=True
 layer=me.uv_layers.new(name='AuthoredUV')
 for polygon,face in zip(me.polygons,faces):
  polygon.use_smooth=True
  for li,(_,t) in zip(polygon.loop_indices,face):layer.data[li].uv=uvs[t]
 for index,old in enumerate(ids):
  for bone,weight in weights(old).items():
   if weight<=0:continue
   g=o.vertex_groups.get(bone) or o.vertex_groups.new(name=bone);g.add([index],weight,'REPLACE')
 colors=me.color_attributes.new(name='SurfaceColor',type='FLOAT_COLOR',domain='CORNER')
 for c in colors.data:c.color=(1,1,1,1)
 me.color_attributes.active_color=colors;me.color_attributes.render_color_index=0
 return o

def native_head(root):
 folder,base,shaped,uv,faces,groups=data(root)
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(('MakeHuman CC0 anatomical head','Anatomical eye','Blue grey iris','Deep pupil','Corneal glint')):bpy.data.objects.remove(o,do_unlink=True)
 selected=[f for f,g in zip(faces,groups) if g=='body' and all(base[i].y>5.85 for i,t in f)]
 headpoints=[shaped[i] for f in selected for i,t in f]
 low=min(v.y for v in headpoints);high=max(v.y for v in headpoints);width=max(v.x for v in headpoints)-min(v.x for v in headpoints);depth=max(v.z for v in headpoints)-min(v.z for v in headpoints)
 head_transform=lambda v:Vector((v.x*.242/width,.032-v.z*.22/depth,1.50+(v.y-low)*.335/(high-low)))
 headmat=material('CC0 adult male skin',os.path.join(folder,'young_lightskinned_male_diffuse.png'),.70)
 head=create('MakeHuman CC0 anatomical head',[head_transform(v) for v in shaped],uv,selected,headmat,lambda i:{'head':1})
 def landmark(target):
  index=min(range(len(base)),key=lambda i:(canonical(base[i])-Vector(target)).length_squared)
  return head_transform(shaped[index])
 head['mouthZ']=landmark((0,-.12,1.592)).z
 head['browZ']=landmark((.034,-.10,1.712)).z
 # A neutral closed-lip rest expression, preserving the authored skin UVs.
 mouth=float(head['mouthZ'])
 for vertex in head.data.vertices:
  q=vertex.co;weight=math.exp(-((q.x/.043)**4+((q.z-mouth)/.023)**4))*max(0,min(1,(-q.y-.07)/.035))
  q.z-=.30*(q.z-mouth)*weight
 head.data.update()
 sub=head.modifiers.new('Adult facial contours','SUBSURF');sub.levels=1;bpy.context.view_layer.objects.active=head;bpy.ops.object.modifier_apply(modifier=sub.name)
 dec=head.modifiers.new('Realtime facial topology','DECIMATE');dec.ratio=.60;bpy.ops.object.modifier_apply(modifier=dec.name)
 v,uv,faces,groups=read_obj(os.path.join(folder,'high-poly.obj'));fit=fitted(folder,'high-poly.mhclo',base,shaped)
 positions=[head_transform(p) for p in fit]
 for p in positions:p.x*=1.06
 create('CC0 fitted blue grey eyes',positions,uv,faces,material('CC0 bluegreen iris and sclera',os.path.join(folder,'bluegrey-eye-adapted.png'),.28),lambda i:{'head':1})
 print('NATIVE HEAD: adult male macro anatomy, authored UV skin, fitted eye meshes')

def native_wardrobe(root):
 folder,base,shaped,uv,faces,groups=data(root);rig=json.load(open(os.path.join(folder,'default.mhskel')))
 def joint(name):return canonical(sum((shaped[i] for i in rig['joints'][name]),Vector())/len(rig['joints'][name]))
 def clamp(v):return max(0,min(1,v))
 def smooth(v):v=clamp(v);return v*v*(3-2*v)
 def bone_map(p,a,b,c,d):
  axis=(b-a).normalized();target=(d-c).normalized();along=(p-a).dot(axis);side=p-a-axis*along
  return c+target*along*((d-c).length/(b-a).length)+axis.rotation_difference(target)@side
 bones={}
 for side in [-1,1]:
  suffix='L' if side>0 else 'R'
  bones[side]=[joint('upperarm01.'+suffix+'____head'),joint('lowerarm01.'+suffix+'____head'),joint('wrist.'+suffix+'____head'),joint('upperleg01.'+suffix+'____head'),joint('lowerleg01.'+suffix+'____head'),joint('lowerleg02.'+suffix+'____tail')]
 def pose(v,kind):
  p=canonical(v);side=-1 if v.x<0 else 1;s,e,w,h,k,a=bones[side]
  if kind=='hoodie':
   influence=smooth((abs(v.x)-1.25)/.75)*smooth((v.y-1.3)/.8)*smooth((s.z+.035-p.z)/.07);t=(p-s).dot(e-s)/(e-s).length_squared;lower=smooth((t-.70)/.60)
   ts=Vector((side*.254,0,1.44));te=Vector((side*.28,0,1.18));tw=Vector((side*.286,-.018,.97))
   q=bone_map(p,s,e,ts,te)*(1-lower)+bone_map(p,e,w,te,tw)*lower
   p.z-=.03*smooth((v.y-5.3)/.8)*smooth((.4-v.z)/.8)
   return p*(1-influence)+q*influence,{'spine':1-influence,'arm'+str(side):influence*(1-lower),'forearm'+str(side):influence*lower}
  t=(p-h).dot(k-h)/(k-h).length_squared;lower=smooth((t-.75)/.5);amount=smooth((1.0-v.y)/1.2)
  th=Vector((side*.105,0,.9));tk=Vector((side*.105,.018,.5));ta=Vector((side*.105,0,.1))
  q=bone_map(p,h,k,th,tk)*(1-lower)+bone_map(p,k,a,tk,ta)*lower
  return p*(1-amount)+q*amount,{'hips':1-amount,'thigh'+str(side):amount*(1-lower),'shin'+str(side):amount*lower}
 remove=('Continuous tailored jacket','Continuous tailored trousers','Knitted cuff','Pocket welt','Elbow fold','Folded hood','Rolled hood rim','Trouser knee fold','Jacket zipper','Groomed eyebrow','Soft anatomical eyelid','Close cropped anatomical scalp','Close cropped scalp fibre')
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(remove):bpy.data.objects.remove(o,do_unlink=True)
 for kind,obj,mhclo,tex in [('hoodie','ladieshoodiedown1.obj','elvs_hooded_sweat_jacket1.mhclo','hoodietex1.png'),('pants','male_casualsuit01.obj','male_casualsuit01.mhclo','male_casualsuit01_diffuse.png')]:
  v,uv,faces,groups=read_obj(os.path.join(folder,obj));fit=fitted(folder,mhclo,base,shaped)
  if kind=='pants':faces=[f for f in faces if all(fit[i].y<1.7 for i,t in f)]
  posed=[pose(p,kind) for p in fit]
  if kind=='hoodie':
   for p,weights in posed:
    drape=smooth((p.z-1.43)/.10)*smooth((p.y+.06)/.08)*smooth((weights.get('spine',0)-.4)/.5)*smooth((abs(p.x)-.105)/.15)
    p.z-=.035*drape;p.x*=1-.055*drape;p.y+=.010*drape
  mat=material('Elvaerwyn hooded sweatshirt (CC BY)' if kind=='hoodie' else 'MakeHuman CC0 tailored jeans',os.path.join(folder,tex),.94,os.path.join(folder,'normalshoodie.png') if kind=='hoodie' else None)
  create('Licensed fitted '+kind,[p for p,w in posed],uv,faces,mat,lambda i:posed[i][1])
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(('Sneaker','Sole','Shoe side seam','Shoe lace')):bpy.data.objects.remove(o,do_unlink=True)
 verts,uvs,fs,gs=read_obj(os.path.join(folder,'shoes05.obj'));points=fitted(folder,'shoes05.mhclo',base,shaped);coords=[];sides=[]
 for v in points:
  side=-1 if v.x<0 else 1;suffix='L' if side>0 else 'R';s=joint('foot.'+suffix+'____head');e=joint('foot.'+suffix+'____tail')
  rotation=(e-s).normalized().rotation_difference(Vector((0,-.18,-.04)).normalized())
  coords.append(Vector((side*.105,0,.1))+rotation@(canonical(v)-s));sides.append(side)
 for side in [-1,1]:
  floor=min(q.z for q,t in zip(coords,sides) if t==side)
  for q,t in zip(coords,sides):
   if t==side:q.z+=.012-floor
 fs=[f for f in fs if all(coords[i].z<.18 for i,t in f)]
 create('CC0 fitted sneakers',coords,uvs,fs,material('CC0 white textile sneakers',os.path.join(folder,'shoes05_diffuse.png'),.88),lambda i:{'foot'+str(sides[i]):1})
 head=next(o for o in bpy.context.scene.objects if o.name.startswith('MakeHuman CC0 anatomical head'))
 # Match the hands to the same authored skin UVs, retaining their proven geometry/pose.
 hand_base,hand_uv,hand_faces,hand_groups=read_obj(os.path.join(root,'tools','vendor','human','base.obj'))
 wrist=Vector((4.31185,2.45181,1.75655));forward=(Vector((4.6083,1.88615,2.47898))-wrist).normalized();lateral=(Vector((1,0,0))-forward*forward.x).normalized();normal=forward.cross(lateral).normalized()
 selected=[f for f,g in zip(hand_faces,hand_groups) if g=='body' and all(hand_base[i].x>3.75 and (hand_base[i]-wrist).dot(forward)>-.22 for i,t in f)]
 for o in list(bpy.context.scene.objects):
  if o.name.startswith('MakeHuman CC0 anatomical hand'):bpy.data.objects.remove(o,do_unlink=True)
 for side in [-1,1]:
  coords=[Vector((side*(.286+(v-wrist).dot(lateral)*.075),-.018+(v-wrist).dot(normal)*.075,.955-(v-wrist).dot(forward)*.075)) for v in hand_base]
  fs=[list(reversed(f)) for f in selected] if side>0 else selected
  create('MakeHuman CC0 UV textured hand '+str(side),coords,hand_uv,fs,head.data.materials[0],lambda i,side=side:{'hand'+str(side):1})
 colors=head.data.color_attributes.get('SurfaceColor')
 mouth=float(head.get('mouthZ',1.592))
 for loop in head.data.loops:
  q=head.data.vertices[loop.vertex_index].co;line=mouth+.010+.070*smooth((abs(q.x)-.025)/.075)
  mask=smooth((line-q.z)/.025)*smooth((-q.y+.015)/.07)
  if abs(q.x)<.036 and abs(q.z-(mouth+.005))<.012:mask=0
  moustache=math.exp(-((q.x/.041)**4+((q.z-(mouth+.020))/.009)**4))*smooth((-q.y+.015)/.05)
  mask=max(mask,moustache*.95)
  front=smooth((-q.y+.015)/.045);hairline=1.675*(1-front)+(1.775+.018*math.exp(-((abs(q.x)-.065)/.025)**2))*front
  mask=max(mask,smooth((q.z-hairline)/.010)*.93)
  colors.data[loop.index].color=(*(1-mask+tone*mask for tone in (.14,.105,.075)),1)
 for o in bpy.context.scene.objects:
  if o.name.startswith(('Contoured beard','Natural moustache fibre','Groomed eyebrow')):
   dz=float(head.get('browZ',1.712))-1.712 if o.name.startswith('Groomed eyebrow') else float(head.get('mouthZ',1.592))-1.592
   if o.type=='MESH':
    for v in o.data.vertices:
     v.co.z+=dz
     if o.name.startswith('Contoured beard') and v.co.z>mouth-.055:
      hit,p,n,f=head.ray_cast(Vector((v.co.x,-1,v.co.z)),Vector((0,1,0)))
      if hit:v.co.y=min(v.co.y,p.y-.007)
   elif o.type=='CURVE':
    for spline in o.data.splines:
     for point in spline.points:point.co.z+=dz
 print('FACE LANDMARKS',mouth,head.get('browZ'))
 print('NATIVE WARDROBE: authored cloth topology, barycentric morph fitting, bone-space retargeting')
