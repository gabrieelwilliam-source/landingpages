"""Original Gabriel-only grooming and wardrobe over the licensed CC0 anatomy.
No photo pixels are embedded. Keep the established rig and authored animation contract.
"""
import bpy,math,random
from mathutils import Vector

def smooth(v):
 v=max(0,min(1,v));return v*v*(3-2*v)

def hair_weight(v):
 front=1.775+.023*math.exp(-((abs(v.x)-.065)/.026)**2)
 return max(smooth((v.z-front)/.010),smooth((abs(v.x)-.087)/.015)*smooth((v.z-1.685)/.04),smooth((v.y+.002)/.045)*smooth((v.z-1.69)/.035))

def refine_hero(materials,detail,cube):
 skin,hair,beard,grey,cloth,seam,lining,trim=materials
 rng=random.Random(84031)
 for obj in list(bpy.context.scene.objects):
  if obj.name.startswith(('Long tapered beard','Beard strand','Moustache','Backpack','Jacket front seam','Waist fold')):bpy.data.objects.remove(obj,do_unlink=True)
 head=next(o for o in bpy.context.scene.objects if o.name.startswith('MakeHuman CC0 anatomical head'))
 for v in head.data.vertices:v.co.x*=1.06
 head.data.update()
 for o in bpy.context.scene.objects:
  if o.name.startswith(('Anatomical eye','Blue grey iris','Deep pupil','Corneal glint')):o.location.x*=1.06
 def surface(x,z,offset=.001):
  hit,p,n,face=head.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
  return (x,p.y-offset,z) if hit else (x,-.10,z)
 for side in [-1,1]:
  cx=side*.03385*1.06
  for upper in [True,False]:
   points=[]
   for j in range(9):
    t=-math.pi/2+j*math.pi/8;x=cx+math.sin(t)*.014
    z=1.6841+(math.cos(t)*(.0065 if upper else -.0058))
    points.append(surface(x,z,.0012))
   detail('Soft anatomical eyelid',points,.0008,skin,'head')
 # A front jaw curtain follows cheek/chin contours, with an actual mouth opening.
 # It is deliberately not a solid cone encircling the neck.
 rows=[(1.35,.030,-.105,-.075),(1.365,.054,-.125,-.055),(1.39,.076,-.145,-.030),(1.41,.087,-.155,-.009),(1.46,.100,-.157,.002),(1.51,.104,-.147,.008),(1.55,.103,-.135,.005),(1.58,.099,-.123,-.003),(1.61,.094,-.111,-.018),(1.64,.085,-.094,-.034)]
 rows=[(1.40+(z-1.35)*(.24/.29),w,front,edge) for z,w,front,edge in rows]
 def at(z,t):
  for a,b in zip(rows,rows[1:]):
   if a[0]<=z<=b[0]:
    u=(z-a[0])/(b[0]-a[0]);w=a[1]*(1-u)+b[1]*u;front=a[2]*(1-u)+b[2]*u;edge=a[3]*(1-u)+b[3]*u
    x=math.sin(t)*w;y=front+(edge-front)*(1-math.cos(t))
    hit,skin_point,normal,face=head.ray_cast(Vector((x,-1,z)),Vector((0,1,0)))
    if hit:y=min(y,skin_point.y-.0025)
    return Vector((x,y,z))
  return at(max(rows[0][0],min(rows[-1][0],z)),t)
 n=41;verts=[];faces=[]
 for row in range(11):
  u=row/10
  for j in range(n):
   t=-math.pi/2+j*math.pi/(n-1)
   top=1.574+.066*smooth((abs(math.sin(t))-.25)/.60)
   z=1.40+(top-1.40)*u
   p=at(z,t);p.z-=.010*math.cos(t)**2*(1-u)**2;p.x*=.88 if z<1.53 else 1;p.y-=.014*smooth((1.53-z)/.10);p.y+=.0007*math.sin(j*2.7+z*85);verts.append(p)
 for row in range(10):
  for j in range(n-1):
   a=row*n+j;faces.append((a,a+1,a+1+n,a+n))
 mesh=bpy.data.meshes.new('Contoured beard');mesh.from_pydata(verts,[],faces);mesh.update()
 obj=bpy.data.objects.new('Contoured beard with open mouth',mesh);bpy.context.collection.objects.link(obj);mesh.materials.append(beard);obj.vertex_groups.new(name='head').add(list(range(len(verts))),1,'REPLACE')
 for p in mesh.polygons:p.use_smooth=True
 for j in range(170):
  t=rng.uniform(-1.48,1.48);top=min(rng.uniform(1.52,1.64),1.573+.066*smooth((abs(math.sin(t))-.25)/.60))
  bottom=max(1.402,top-rng.uniform(.065,.19));points=[]
  for k in range(4):
   u=k/3;p=at(top*(1-u)+bottom*u,t+math.sin(u*5+j)*.018)
   p.x*=.88 if p.z<1.53 else 1;p.y-=.014*smooth((1.53-p.z)/.10)
   p.y-=.0018+math.sin(u*8+j)*.001;p.x+=math.sin(j+u*7)*.0008;points.append(p)
  detail('Contoured beard fibre',points,rng.uniform(.00035,.0006),grey if j%6==0 else hair if j%3==0 else beard,'head')
 # Two moustache fans remain above the lips, following the actual facial surface.
 for side in [-1,1]:
  for j in range(34):
   x=side*(.004+j*.00095);points=[]
   for k in range(3):
    u=k/2;points.append(surface(x+side*u*.005,1.612-abs(x)*.16-u*(.005+rng.random()*.002),.0015))
   detail('Natural moustache fibre',points,.00035,grey if j%11==0 else beard,'head')
  for j in range(38):
   x=side*.036+(j-18.5)*.0011;z=1.712+.004*math.cos((j-18.5)/21)
   detail('Groomed eyebrow',[surface(x,z,.001),surface(x+side*.0018,z+.002+rng.random()*.0015,.0015)],.00028,hair,'head')
 # A sub-millimetre scalp shell has an explicit curved, receding hairline.
 # Ray casting conforms it to the anatomical cranium, rather than a floating cap.
 def hairline(t):
  front=1.775+.017*math.exp(-((abs(t)-.7)/.26)**2)
  return front*(1-smooth((abs(t)-.85)/.8))+1.697*smooth((abs(t)-.85)/.8)
 hv=[];hf=[];samples=64;levels=9
 for row in range(levels):
  u=row/(levels-1)
  for j in range(samples):
   t=-math.pi+j*math.tau/samples;z=hairline(t)+(1.824-hairline(t))*u
   origin=Vector((math.sin(t)*.4,-math.cos(t)*.4,z));direction=Vector((-math.sin(t),math.cos(t),0))
   hit,p,nor,face=head.ray_cast(origin,direction)
   if not hit:p=Vector((math.sin(t)*.006,-math.cos(t)*.006,z));nor=Vector((0,0,1))
   hv.append(p+nor*.0007)
 for row in range(levels-1):
  for j in range(samples):
   a=row*samples+j;b=row*samples+(j+1)%samples;hf.append((a,b,b+samples,a+samples))
 me=bpy.data.meshes.new('Close cropped anatomical scalp');me.from_pydata(hv,[],hf);me.update();o=bpy.data.objects.new('Close cropped anatomical scalp',me);bpy.context.collection.objects.link(o);me.materials.append(hair);o.vertex_groups.new(name='head').add(list(range(len(hv))),1,'REPLACE')
 for polygon in me.polygons:polygon.use_smooth=True
 for index in rng.sample(list(range(len(hv))),128):
  p=hv[index];normal=Vector((p.x,p.y,(p.z-1.72))).normalized()
  detail('Close cropped scalp fibre',[p,p+normal*rng.uniform(.0008,.0015)],.0003,grey if rng.random()<.10 else hair,'head')
 # A flatter, rounded fabric backpack and flat webbing replace boxy pads/tubular straps.
 def pack_box(name,loc,size,material,bevel):
  o=cube(name,loc,size,material,bevel,5);o.vertex_groups.new(name='spine').add(list(range(len(o.data.vertices))),1,'REPLACE');return o
 pack_box('Tailored backpack',(0,.165,1.20),(.285,.125,.37),cloth,.045)
 pack_box('Fabric backpack pocket',(0,.232,1.13),(.23,.033,.17),seam,.025)
 for side in [-1,1]:
  points=[(side*.115,.17,1.37),(side*.155,.035,1.455),(side*.158,-.092,1.37),(side*.125,-.13,1.16)]
  vs=[(x+dx,y,z) for x,y,z in points for dx in [-.011,.011]]
  fs=[(i,i+1,i+3,i+2) for i in range(0,6,2)];me=bpy.data.meshes.new('Flat webbing');me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new('Flat woven backpack strap',me);bpy.context.collection.objects.link(o);me.materials.append(cloth);o.vertex_groups.new(name='spine').add(list(range(len(vs))),1,'REPLACE')
  solid=o.modifiers.new('Webbing thickness','SOLIDIFY');solid.thickness=.003;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=solid.name)
  detail('Backpack stitched edge',[(side*.11,.231,1.365),(side*.134,.234,1.28),(side*.12,.234,1.06)],.001,lining,'spine')
 detail('Backpack pocket zipper',[(-.088,.253,1.19),(0,.254,1.195),(.088,.253,1.19)],.0015,trim,'spine')
 pack_box('Zipper pull',(.065,.256,1.178),(.007,.004,.021),trim,.002)
 # Less ballooning at the biceps; folds follow the cloth instead of hard outlines.
 for o in bpy.context.scene.objects:
  if o.name.startswith('Continuous tailored jacket'):
   for v in o.data.vertices:
    if v.co.y<-.055:
     v.co.y-=.003*math.sin(v.co.z*70+abs(v.co.x)*22)*smooth((1.16-v.co.z)/.12)
    v.co.z-=.035*smooth((abs(v.co.x)-.18)/.055)*smooth((v.co.z-1.40)/.06)
    if abs(v.co.x)>.23:
     side=-1 if v.co.x<0 else 1;v.co.x=side*(.27+(abs(v.co.x)-.27)*.87)
  if o.name.startswith('Continuous tailored trousers'):
   for v in o.data.vertices:
    if v.co.z<.82:
     side=-1 if v.co.x<0 else 1;v.co.x=side*(.105+(abs(v.co.x)-.105)*.88)
  if o.name.startswith('Sneaker'):
   for v in o.data.vertices:v.co.z=max(v.co.z,-.027)
  if o.name.startswith('Anatomical eye'):
   o.scale.z*=.80
  if o.name.startswith('Knitted cuff'):
   o.scale.x*=.91;o.scale.y*=.91
 print('HERO REFINEMENT: contoured open-mouth beard, cropped fibres, fitted clothing and flat webbing')

def hero_color(name,v,color):
 if name.startswith('Close cropped anatomical scalp'):
  theta=abs(math.atan2(v.x,-v.y));front=1.775+.017*math.exp(-((theta-.7)/.26)**2);line=front*(1-smooth((theta-.85)/.8))+1.697*smooth((theta-.85)/.8)
  weight=smooth((v.z-line)/.006);grain=.9+.1*math.sin(v.x*431+v.z*315)
  return tuple(s*(1-weight)+h*weight*grain for s,h in zip((.46,.31,.245),(.045,.030,.02)))
 if name.startswith('MakeHuman CC0 anatomical head'):
  hair=hair_weight(v);base=color
  blush=.10*math.exp(-((abs(v.x)-.065)/.035)**2-((v.z-1.65)/.036)**2)
  base=tuple(c*(1-blush)+r*blush for c,r in zip(base,(.48,.22,.17)))
  mouth=math.exp(-((v.x/.033)**4+((v.z-1.592)/.010)**4))*smooth((-v.y-.09)/.023)
  base=tuple(c*(1-mouth*.55)+r*mouth*.55 for c,r in zip(base,(.35,.15,.135)))
  sideburn=smooth((abs(v.x)-.066)/.030)*smooth((1.658-v.z)/.035)*smooth((v.z-1.565)/.035)
  brow=math.exp(-(((abs(v.x)-.038)/.024)**4+((v.z-1.711)/.0045)**2))*smooth((-v.y-.072)/.025)
  moustache=math.exp(-((v.x/.037)**4+((v.z-1.606)/.006)**4))*smooth((-v.y-.08)/.025)
  shade=max(hair,sideburn*.85,brow*.9,moustache*.85)
  return tuple(c*(1-shade)+h*shade for c,h in zip(base,(.048,.032,.022)))
 if 'beard' in name.lower() or 'moustache' in name.lower():
  grain=.87+.13*math.sin(v.x*167+v.z*79)*math.sin(v.z*213)
  return tuple(c*grain for c in color)
 return color
