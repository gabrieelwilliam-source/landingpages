"""Original fitted scalp and layered beard grooming. No reference-image pixels.

One shared RGBA atlas/material, skin-bound geometry, deterministic seed. Hair cards
break up the silhouette; a connected undercoat preserves it in the mobile LOD.
"""
import bpy, math, os, numpy as np
from mathutils import Vector

def smooth(v):
 v=max(0,min(1,v));return v*v*(3-2*v)

def atlas(root):
 size=512;rng=np.random.default_rng(77311)
 v,u=np.mgrid[0:1:complex(size),0:1:complex(size)]
 image=np.ones((size*2,size*2,4),dtype=np.float32)
 phase=u+.028*np.sin(v*26+u*20)+.008*np.sin(v*76+u*31)
 fibre=.5+.5*np.sin(phase*math.tau*77)
 clump=.5+.5*np.sin((u+.025*np.sin(v*13))*math.tau*11)
 silver=np.maximum(0,(np.sin((phase+.007)*math.tau*29)-.75)/.25)*.35
 noise=rng.uniform(-.012,.012,u.shape)
 for channel,(brown,grey) in enumerate(zip((.13,.105,.085),(.40,.39,.36))):
  image[:size,:size,channel]=(brown*(1-silver)+grey*silver)*(.72+.17*fibre+.11*clump)+noise
 # Fine bundles: feathered root and tips, with separate filaments inside each card.
 bundle=.5+.5*np.sin((u+.045*np.sin(v*18+u*11))*math.tau*9)
 alpha=np.clip((bundle-.23)*2.2,0,1)*np.sin(math.pi*u)**.55
 alpha*=np.clip(v/.13,0,1)*np.clip((1-v)/.12,0,1)
 wisp_silver=(np.floor(u*9)%5==1).astype(np.float32)*.55
 for channel,(brown,grey) in enumerate(zip((.12,.095,.073),(.38,.37,.34))):
  image[:size,size:,channel]=(brown*(1-wisp_silver)+grey*wisp_silver)*(.8+.2*bundle)
 image[:size,size:,3]=alpha
 # Very short scalp hair, a fine irregular stubble instead of a solid shiny cap.
 grain=rng.uniform(0,1,u.shape);stubble=.78+.22*grain
 for channel,value in enumerate((.092,.078,.065)):
  image[size:,:size,channel]=value*stubble+np.where(grain>.985,.09,0)
 # Real short hair detail from the licensed CC0 brow image; crop one feathered brow.
 source=bpy.data.images.load(os.path.join(root,'tools/vendor/native-human/eyebrow001.png'),check_existing=True)
 pixels=np.asarray(source.pixels[:],dtype=np.float32).reshape(source.size[1],source.size[0],4)
 crop=pixels[252:367,6:506]
 yy,xx=np.mgrid[0:crop.shape[0]-1:complex(size),0:crop.shape[1]-1:complex(size)]
 x0=np.floor(xx).astype(int);y0=np.floor(yy).astype(int);x1=np.minimum(x0+1,crop.shape[1]-1);y1=np.minimum(y0+1,crop.shape[0]-1)
 wx=(xx-x0)[:,:,None];wy=(yy-y0)[:,:,None]
 strip=(crop[y0,x0]*(1-wx)+crop[y0,x1]*wx)*(1-wy)+(crop[y1,x0]*(1-wx)+crop[y1,x1]*wx)*wy
 strip[:,:,:3]*=1.45
 strip[:,:,3]=np.clip(strip[:,:,3]*4,0,1)
 image[size:,size:,:]=strip
 im=bpy.data.images.new('Layered grooming and CC0 short-hair atlas',width=size*2,height=size*2,alpha=True)
 im.pixels.foreach_set(np.clip(image,0,1).ravel());im.pack()
 m=bpy.data.materials.new('Gabriel layered groom');m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.82
 p.inputs['Specular IOR Level'].default_value=.28
 tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im
 m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color']);m.node_tree.links.new(tex.outputs['Alpha'],p.inputs['Alpha'])
 m.surface_render_method='DITHERED';m.use_backface_culling=False
 return m

def groom_avatar(root):
 from native_avatar import create
 head=next(o for o in bpy.context.scene.objects if o.name.startswith('MakeHuman CC0 anatomical head'))
 mouth=float(head.get('mouthZ',1.597));brow=float(head.get('browZ',1.716));mat=atlas(root)
 # Small original micro-normal/roughness maps preserve the licensed skin UVs.
 skin=head.data.materials[0];nodes=skin.node_tree.nodes;links=skin.node_tree.links;bsdf=nodes.get('Principled BSDF')
 rng_skin=np.random.default_rng(6682);height=rng_skin.uniform(0,1,(1024,1024)).astype(np.float32)
 height=(height+np.roll(height,1,0)+np.roll(height,1,1))/3
 normal=np.ones((1024,1024,4),dtype=np.float32)
 normal[:,:,0]=.5+(np.roll(height,1,1)-np.roll(height,-1,1))*.065
 normal[:,:,1]=.5+(np.roll(height,1,0)-np.roll(height,-1,0))*.065
 image=bpy.data.images.new('Original subtle skin micro normal',width=1024,height=1024);image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(normal.ravel());image.pack()
 tex=nodes.new('ShaderNodeTexImage');tex.image=image;bump=nodes.new('ShaderNodeNormalMap');bump.inputs['Strength'].default_value=.30
 links.new(tex.outputs['Color'],bump.inputs['Color']);links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
 rough=np.ones((512,512,4),dtype=np.float32);value=.68+rng_skin.uniform(-.035,.035,(512,512))
 for channel in range(3):rough[:,:,channel]=value
 image=bpy.data.images.new('Original subtle skin roughness',width=512,height=512);image.colorspace_settings.name='Non-Color';image.pixels.foreach_set(rough.ravel());image.pack()
 tex=nodes.new('ShaderNodeTexImage');tex.image=image;links.new(tex.outputs['Color'],bsdf.inputs['Roughness'])
 for o in list(bpy.context.scene.objects):
  if o.name.startswith(('Contoured beard','Natural moustache','CC0 close-cropped hair','CC0 fitted eyebrow','Close cropped anatomical scalp','Close cropped scalp fibre','Groomed eyebrow')):
   bpy.data.objects.remove(o,do_unlink=True)
 def tile(u,v,index):return ((index%2+.015+u*.97)/2,(index//2+.015+v*.97)/2)
 def mesh(name,points,uv,faces,alphas=None):
  obj=create(name,points,uv,faces,mat,lambda i:{'head':1})
  if alphas:
   attr=obj.data.color_attributes['SurfaceColor']
   for loop in obj.data.loops:attr.data[loop.index].color=(1,1,1,alphas[loop.vertex_index])
  return obj
 def skin_point(x,z,offset=.003):
  hit,p,n,f=head.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
  return Vector((x,p.y-offset if hit else -.095,z))
 def beard(t,progress):
  s=math.sin(t);root_z=mouth-.012+.076*smooth((abs(s)-.15)/.75)
  bottom=mouth-.18+.025*abs(s)**1.7+.002*math.sin(s*17)
  width=.105*(1-progress)+.065*progress+.018*math.sin(progress*math.pi)
  root=skin_point(.105*s,root_z)
  tip_y=-.118+.102*(1-math.cos(t))
  p=Vector((width*s,root.y*(1-progress)+tip_y*progress-.025*math.sin(progress*math.pi),root_z*(1-progress)+bottom*progress))
  p.y+=.0015*math.sin(t*24+progress*19)
  if p.z>mouth-.055:
   surface=skin_point(p.x,p.z,.004);p.y=min(p.y,surface.y)
  return p
 # Connected rounded undercoat: less conical, with a feather fringe layered above it.
 points=[];uv=[];faces=[];cols=48;rows=12
 for row in range(rows+1):
  progress=row/rows
  for col in range(cols+1):
   t=-1.52+3.04*col/cols;points.append(beard(t,progress));uv.append(tile(col/cols,1-progress,0))
 for row in range(rows):
  for col in range(cols):
   a=row*(cols+1)+col;faces.append([(i,i) for i in (a,a+1,a+cols+2,a+cols+1)])
 mesh('Rounded beard undercoat',points,uv,faces)
 # Curved ribbons follow the undercoat. Irregular lengths and tips break its outline.
 rng=np.random.default_rng(5410)
 for j in range(88):
  t=-1.50+3*j/87+rng.uniform(-.012,.012);start=rng.uniform(-.035,.04);end=rng.uniform(.88,1.055);width=rng.uniform(.0025,.0048)
  points=[];uv=[];faces=[];segments=6
  for k in range(segments+1):
   v=k/segments;progress=start*(1-v)+end*v;p=beard(t+.014*math.sin(v*7+j),progress)
   p.y-=.0025+.002*math.sin(v*math.pi);p.x+=.0008*math.sin(j+v*15)
   for side in [-1,1]:points.append(p+Vector((side*width*(.75+.25*math.sin(v*math.pi)),0,0)));uv.append(tile((side+1)/2,1-v,1))
  for k in range(segments):
   a=k*2;faces.append([(i,i) for i in (a,a+1,a+3,a+2)])
  mesh('Layered beard wisp '+str(j),points,uv,faces)
 # Fuller fitted moustache and brows, with visible feathered ends.
 for side in [-1,1]:
  for kind in ['moustache','eyebrow']:
   points=[];uv=[];faces=[];segments=14
   for j in range(segments+1):
    t=j/segments
    x=side*(.0005+t*.038) if kind=='moustache' else side*(.011+t*.052)
    z=mouth+.015-.004*t if kind=='moustache' else brow-.004+.003*math.sin(t*math.pi)-.002*t
    half=(.014 if kind=='moustache' else .0078)*math.sin(math.pi*(.07+.86*t))
    for band in range(5):
     delta=half*(band/2-1);points.append(skin_point(x,z+delta,.004));uv.append(tile(t,band/4,3))
   for j in range(segments):
    for band in range(4):
     a=j*5+band;faces.append([(i,i) for i in (a,a+1,a+6,a+5)])
   mesh('Fitted feathered '+kind+str(side),points,uv,faces)
 # Clip the actual anatomical scalp along a curved receding hairline. No cap/skin overlap.
 def hairline(p):
  front=smooth((-p.y+.015)/.045)
  line=1.675*(1-front)+(1.775+.018*math.exp(-((abs(p.x)-.065)/.025)**2))*front
  ear=smooth((abs(p.x)-.10)/.015)*smooth((.055-p.y)/.04)
  return max(line,1.765*ear+line*(1-ear))
 points=[];uv=[];faces=[];alphas=[];head.data.calc_loop_triangles()
 for triangle in head.data.loop_triangles:
  polygon=[head.data.vertices[i].co.copy() for i in triangle.vertices];clipped=[]
  for a,b in zip(polygon,polygon[1:]+polygon[:1]):
   fa=a.z-hairline(a);fb=b.z-hairline(b)
   if fa>=0:clipped.append(a)
   if (fa>=0)!=(fb>=0):clipped.append(a+(b-a)*(fa/(fa-fb)))
  if len(clipped)<3:continue
  ids=[]
  for p in clipped:
   distance=p.z-hairline(p);normal=(p-Vector((0,.025,1.69))).normalized();q=p+normal*.001
   ids.append(len(points));points.append(q);uv.append(tile((math.atan2(p.x,-p.y)/math.tau+.5),max(0,min(1,(p.z-1.66)/.18)),2));alphas.append(smooth((distance+.0003)/.0015))
  for j in range(1,len(ids)-1):faces.append([(i,i) for i in (ids[0],ids[j],ids[j+1])])
 mesh('Fitted close-cropped scalp',points,uv,faces,alphas)
 print('GROOM: clipped anatomical scalp, rounded undercoat, 88 layered wisps and fitted brows/moustache; one shared RGBA material')
