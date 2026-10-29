"""Original, connected office interiors. Blender metres; Y maps to glTF -Z.
No external textures or reference photographs are embedded in the assets.
Run: blender -b --python tools/build_office.py
"""
import bpy, math, os, random, json, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
# Reuse geometry utilities only; preserve the existing skinned Gabriel asset.
source=open(os.path.join(os.path.dirname(__file__),'build_assets.py')).read()
exec(source.split('\nclean()\nskin=')[0])
PLAN=json.load(open(os.path.join(os.path.dirname(__file__),'..','src','data','office-plan.json')))
CENTRES=PLAN['referenceCentres'];EDGES=list(PLAN['referenceBoundaries']);SCALE=PLAN['depthScale'];EDGES[0]=-PLAN['entranceDepth']/SCALE
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if os.environ.get('OFFICE_OUTPUT'):OUT=os.environ['OFFICE_OUTPUT'];os.makedirs(OUT,exist_ok=True)
colliders=[]
camera_obstacles=[]
furniture=[]
seat_spots=[]
fixtures=[]

def furnishing(fn):
 def wrapped(x,y,*args,**kwargs):
  anchor=kwargs.pop('_anchor',y);before=set(bpy.context.scene.objects)
  result=fn(x,y,*args,**kwargs)
  for obj in set(bpy.context.scene.objects)-before:obj['depthAnchor']=anchor
  return result
 return wrapped


def cylinder(name,loc,r,depth,material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=depth,location=loc)
 return finish(bpy.context.object,name,material)

def texture_material(name,color,kind):
 material=mat(name,color,rough=.32 if kind=='marble' else .38 if kind=='stone' else .66)
 p=material.node_tree.nodes.get('Principled BSDF')
 size=256; pixels=[]; rough=[]; rng=random.Random(name)
 for y in range(size):
  for x in range(size):
   if kind=='fabric':
    grain=math.sin(x*1.55)*math.cos(y*1.55)*.07+rng.uniform(-.025,.025)
   elif kind=='wood':
    grain=math.sin(x*.32+math.sin(y*.03)*1.8)*.12+math.sin(x*1.5+y*.006)*.05+rng.uniform(-.025,.025)
   else:
    vein=abs(math.sin(x*.024+y*.036+math.sin(y*.057+x*.019)*1.2+math.sin(x*.05-y*.035)*.6+math.sin(x*.13+y*.11)*.12))
    grain=(max(0,1-vein*(15 if kind=='marble' else 24))*(4.5 if kind=='marble' else .015))+rng.uniform(-.018,.018)
   rgb=[max(0,min(1,c*(1+grain))) for c in color]
   pixels.extend([12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055 for c in rgb]+[1])
   v=(.66+grain*.8+rng.uniform(-.018,.018)) if kind=='stone' else (.92+grain*.1) if kind=='fabric' else .68+grain*.15
   rough.extend([v,v,v,1])
 for title,data,socket in [('surface',pixels,'Base Color'),('roughness',rough,'Roughness')]:
  image=bpy.data.images.new(name+' '+title,width=size,height=size);image.pixels=data;image.pack()
  if title=='roughness': image.colorspace_settings.name='Non-Color'
  node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
  material.node_tree.links.new(node.outputs['Color'],p.inputs[socket])
 # Tangent-space micro-normal map from the same original procedural height field.
 normal_pixels=[]
 for y in range(size):
  for x in range(size):
   a=pixels[(y*size+(x+1)%size)*4];b=pixels[(y*size+(x-1)%size)*4]
   c=pixels[(((y+1)%size)*size+x)*4];d=pixels[(((y-1)%size)*size+x)*4]
   nx=(b-a)*(.8 if kind=='wood' else 3.5 if kind=='stone' else .35);ny=(d-c)*(3.5 if kind=='stone' else .35)
   v=Vector((nx,ny,1)).normalized();normal_pixels.extend((v.x*.5+.5,v.y*.5+.5,v.z*.5+.5,1))
 image=bpy.data.images.new(name+' micro normal',width=size,height=size);image.colorspace_settings.name='Non-Color';image.pixels=normal_pixels;image.pack()
 node=material.node_tree.nodes.new('ShaderNodeTexImage');node.image=image
 normal=material.node_tree.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.4
 material.node_tree.links.new(node.outputs['Color'],normal.inputs['Color']);material.node_tree.links.new(normal.outputs['Normal'],p.inputs['Normal'])
 return material

@furnishing
def chair(x,y,angle=0):
 before=set(bpy.context.scene.objects)
 # Five-spoke swivel base, upholstered shell, armrests, seat seams.
 parts=[]
 def part(n,loc,scale,m,b=.04):
  o=cube(n,(x+loc[0],y+loc[1],loc[2]),scale,m,b,2);parts.append(o);return o
 cylinder('Chair gas lift',(x,y,.29),.038,.48,metal)
 for k in range(5):
  a=k*math.tau/5
  curve('Chair spoke',[(x,y,.13),(x+math.cos(a)*.31,y+math.sin(a)*.31,.08)],.018,metal)
  wheel=cylinder('Caster',(x+math.cos(a)*.31,y+math.sin(a)*.31,.06),.045,.035,metal);wheel.rotation_euler.x=math.pi/2
 part('Stitched seat',(0,0,.52),(.58,.58,.14),fabric,.07)
 # A continuously curved ergonomic shell, with lumbar support and a visible rear spine.
 vertices=[];faces=[];cols=16;rows=14
 for row in range(rows+1):
  v=row/rows;z=.60+v*.69;width=.255+.045*math.sin(v*math.pi)
  for col in range(cols+1):
   t=col/cols*2-1;vertices.append((x+t*width,y+.23+.045*t*t-.055*math.sin(v*math.pi),z))
 for row in range(rows):
  for col in range(cols):
   a=row*(cols+1)+col;faces.append((a,a+1,a+cols+2,a+cols+1))
 mesh=bpy.data.meshes.new('Ergonomic woven chair shell');mesh.from_pydata(vertices,[],faces);mesh.update()
 shell=bpy.data.objects.new('Ergonomic chair back',mesh);bpy.context.collection.objects.link(shell);mesh.materials.append(fabric)
 for polygon in mesh.polygons:polygon.use_smooth=True
 solid=shell.modifiers.new('Molded shell thickness','SOLIDIFY');solid.thickness=.04;bpy.context.view_layer.objects.active=shell;bpy.ops.object.modifier_apply(modifier=solid.name)
 curve('Chair rear spine',[(x,y+.28,.35),(x,y+.31,.78),(x,y+.29,1.20)],.025,metal)

 for dx in [-.34,.34]:
  part('Arm support',(dx,0,.65),(.035,.035,.28),metal,.01)
  part('Armrest',(dx,-.03,.78),(.07,.35,.055),fabric,.025)
 # Rotate every new part, including lumbar structure, curves and wheels.
 for o in set(bpy.context.scene.objects)-before:
  dx=o.location.x-x;dy=o.location.y-y
  o.location.x=x+dx*math.cos(angle)-dy*math.sin(angle)
  o.location.y=y+dx*math.sin(angle)+dy*math.cos(angle)
  o.rotation_euler.z+=angle

@furnishing
def desk(x,y):
 cube('Solid walnut desk',(x,y,.79),(2.6,1.25,.095),wood,.045)
 for dx in [-1.05,1.05]:
  cube('Desk steel trestle',(x+dx,y,.39),(.055,.92,.78),metal,.012)
 cube('Monitor frame',(x,y+.22,1.31),(1.45,.07,.84),metal,.035)
 cube('Monitor screen',(x,y+.173,1.31),(1.33,.014,.73),screen,.012)
 cylinder('Monitor neck',(x,y+.23,1.01),.025,.28,metal)
 cube('Monitor foot',(x,y+.23,.86),(.4,.26,.025),metal,.01)
 cube('Keyboard',(x,y-.48,.86),(.62,.21,.024),keys,.012)
 for i in range(9):
  for j in range(3):cube('Key cap',(x-.26+i*.064,y-.54+j*.053,.879),(.05,.038,.009),metal,.002,1)
 ell('Mouse',(x+.5,y-.47,.89),(.065,.1,.025),metal)
 cylinder('Ceramic cup',(x-.92,y-.25,.96),.07,.2,ivory)
 cube('Desk writing pad',(x-.72,y-.15,.86),(.35,.42,.012),linen,.008,1)
 if y>0:
  cube('Desk notebook',(x+.86,y-.16,.875),(.32,.40,.026),fabric,.008)
  curve('Desk pen',[(x+.8,y-.26,.897),(x+.91,y-.03,.897)],.005,brass)
 chair(x,y-1.2,math.pi)
 curve('Task lamp',[(x+1,y+.35,.85),(x+1,y+.35,1.6),(x+.55,y+.35,1.73)],.018,brass)
 cube('Task lamp shade',(x+.55,y+.35,1.71),(.35,.1,.045),glow,.02)

@furnishing
def sofa(x,y):
 # Real licensed upholstery is loaded once and shared across rooms by the runtime.
 kind='lounge-chair' if index==1 and x>0 else 'lounge-bench'
 width=.96 if kind=='lounge-chair' else 2.73
 furniture.append({'asset':kind,'area':index,'x':x,'d':round((CENTRES[index]+y)*SCALE,3),'sourceD':CENTRES[index]+y,'yaw':0,'width':width,'depth':.86,'seatHeight':.48})
 proxy=cube('Lounge plinth',(x,y,.515),(width,.86,1.03),linen,0);proxy['physicsOnly']=True

@furnishing
def plant(x,y,height=2.9):
 cylinder('Stone planter',(x,y,.3),.4,.6,concrete)
 cylinder('Soil',(x,y,.61),.36,.02,soil)
 curve('Tree trunk',[(x,y,.5),(x+.07,y,1.4),(x-.08,y+.05,height-.3)],.036,wood)
 vertices=[]; faces=[]
 for j in range(420):
  a=random.random()*math.tau; h=random.uniform(height-1.6,height); r=math.sqrt(random.random())*.95*math.sqrt(max(.05,1-((h-height+.8)/.85)**2))
  px=x+math.cos(a)*r;py=y+math.sin(a)*r
  if j%22==0:curve('Tree branch',[(x,y,h-.35),(px,py,h)],.011,wood)
  length=random.uniform(.11,.24); w=length*.32
  start=len(vertices)
  vertices.extend([(px,py,h),(px+math.cos(a)*length*.5-math.sin(a)*w,py+math.sin(a)*length*.5+math.cos(a)*w,h+.04),(px+math.cos(a)*length,py+math.sin(a)*length,h+.07),(px+math.cos(a)*length*.5+math.sin(a)*w,py+math.sin(a)*length*.5-math.cos(a)*w,h+.04)])
  vertices.append((px+math.cos(a)*length*.5,py+math.sin(a)*length*.5,h+.095))
  faces.extend([(start,start+1,start+4),(start+1,start+2,start+4),(start+2,start+3,start+4),(start+3,start,start+4)])
 mesh=bpy.data.meshes.new('Leaf clusters');mesh.from_pydata(vertices,[],faces);mesh.update()
 obj=bpy.data.objects.new('Olive foliage',mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(leaf)

@furnishing
def pendant(x,y,length=2.6):
 # Two ceiling anchors and load-bearing cables; never at the avatar's head height.
 for dx in [-length*.34,length*.34]:
  cylinder('Pendant ceiling mount',(x+dx,y,5.615),.035,.04,metal)
  curve('Pendant suspension cable',[(x+dx,y,5.595),(x+dx,y,4.84)],.0045,metal)
 cube('Suspended luminaire',(x,y,4.81),(length,.075,.065),metal,.012)
 cube('Diffuser',(x,y,4.772),(length-.08,.045,.012),glow,.004)
 fixtures.append({'area':index,'x':x,'d':round((CENTRES[index]+y)*SCALE,3),'bottom':4.766,'top':4.843,'ceiling':5.61,'suspensions':2})

for index in ([int(os.environ['OFFICE_PREVIEW_SECTOR'])] if os.environ.get('OFFICE_PREVIEW_SECTOR') else range(6)):
 clean();random.seed(280+index)
 stone=texture_material('Honed graphite limestone',(.105,.11,.12),'stone')
 wood=texture_material('Quarter sawn walnut',(.11,.055,.026),'wood')
 concrete=mat('Warm mineral plaster',(.22,.235,.26),rough=.9)
 navy=mat('zAIon deep navy architectural lacquer',(.012,.027,.075),rough=.52)
 royal=mat('zAIon royal blue accent',(.018,.075,.36),.15,.46)
 ceiling=mat('Graphite acoustic ceiling',(.055,.065,.075),rough=.95)
 skyline=mat('Distant blue stone',(.045,.065,.085),rough=.9)
 ivory=mat('Ivory ceramic',(.63,.59,.5),rough=.55)
 metal=mat('Blackened steel',(.028,.035,.043),.65,.35)
 brass=mat('Satin bronze',(.31,.205,.085),.65,.43)
 fabric=texture_material('Midnight woven upholstery',(.055,.085,.105),'fabric')
 linen=texture_material('Sand boucle upholstery',(.38,.32,.24),'fabric')
 keys=mat('Keyboard aluminium',(.18,.2,.22),.6,.45)
 glass=mat('Office clear glazing',(.18,.28,.32),.15,.2)
 glass.diffuse_color=(.13,.22,.30,.09);p=glass.node_tree.nodes.get('Principled BSDF');p.inputs['Alpha'].default_value=.09;glass.surface_render_method='DITHERED'
 leaf=mat('Olive foliage',(.075,.12,.055),rough=.95);leaf.use_backface_culling=False
 soil=mat('Soil',(.025,.019,.012))
 glow=mat('Architectural warm diffuser',(.9,.62,.28),rough=.5)
 p=glow.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.64,.32,1);p.inputs['Emission Strength'].default_value=.75
 screen=mat('Monitor idle display',(.025,.07,.09),.1,.4)
 p=screen.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(.015,.07,.1,1);p.inputs['Emission Strength'].default_value=.5
 d=CENTRES[index];lo=EDGES[index]-d;hi=EDGES[index+1]-d;mid=(lo+hi)/2;length=hi-lo
 # One uninterrupted building envelope, aligned at exact sector boundaries.
 cube('Continuous floor slab',(0,mid,-.15),(17,length,.25),stone,.015,1)
 # Large quiet stone slabs; avoid the small repeated checker pattern.
 for y in range(math.ceil(lo/4),math.floor(hi/4)+1):
  cube('Flush floor expansion seam',(0,y*4,-.017),(16.4,.008,.008),metal,0)
 cube('Walnut wall backing',(-8.35,mid,2.8),(.18,length,5.6),wood,.015)
 cube('Floating ceiling',(0,mid,5.7),(17,length,.18),ceiling,.015)
 for side in [-1,1]:
  cube('Ceiling perimeter reveal',(side*7.65,mid,5.57),(.045,length,.045),glow,.006,1)
  cube('Skirting',(side*8.14,mid,.09),(.08,length,.18),metal,.01,1)
 # Full-height window facade, bronze mullions, no opaque panels in the view corridor.
 for y in range(math.floor(lo/3),math.ceil(hi/3)):
  lower=max(lo,y*3); upper=min(hi,y*3+3); cy=(lower+upper)/2; h=upper-lower
  if h>.02:cube('Panoramic facade glass',(8.3,cy,2.85),(.025,h-.035,5.45),glass,0)
  if lo<y*3<hi:cube('Facade mullion',(8.24,y*3,2.85),(.10,.055,5.5),brass,.008,1)
 for y in [lo,hi]:
  cube('Structural ceiling rib',(0,y,5.35),(16.4,.3,.5),metal,.025)
  for side in [-1,1]:cube('Structural column',(side*7.9,y,2.65),(.24,.34,5.3),metal,.025)
 # Each functional area has its own side bay and visual threshold.
 if index in [1,2,3,4,5]:
  for side in [-1,1]:
   cube('Side bay clear glass return',(side*5.2,lo+.05,2.15),(5.6,.035,4.3),glass,0)
   cube('Glazing lower safety band',(side*5.2,lo+.025,.95),(5.6,.018,.025),brass,0)
   cube('Glazing top frame',(side*5.2,lo+.05,4.3),(5.6,.065,.055),metal,.005)
   cube('Side bay bronze vertical',(side*2.38,lo-.07,2.15),(.025,.025,4.15),brass,.004,1)
 if index in [2,4]:
  cube('Central acoustic ceiling cloud',(0,mid,5.37),(5.7,min(length-1,8),.16),fabric,.10)
 # Finely spaced walnut fins on the interior wall.
 for j in range(int(length/.48)):
  cube('Walnut acoustic fin',(-8.19,lo+.24+j*.48,2.9),(.11,.065,4.9),wood,.008,1)
 for side in [-1,1]:
  curve('Floor wayfinding inlay',[(side*2.6,lo,.018),(side*2.6,hi,.018)],.008,brass)
 # Recessed ceiling coffers: restrained bronze lines and dark walnut baffles.
 for x in [-6.4,6.4]:
  cube('Ceiling walnut baffle',(x,mid,5.54),(.075,length,.24),wood,.008,1)
 # Different ceiling rhythms mark the sectors without an endless ladder of gold bars.
 if index in [0,3,5]:
  cube('Ceiling architectural frame',(0,mid,5.52),(14.9,.08,.10),metal,.01)
 if index==1:
  canopy=cylinder('Lounge acoustic canopy',(-4.6,1.5,5.35),2.15,.13,fabric);canopy.scale.y=1.2
  for dx in [-1.2,1.2]:
   for dy in [-1,1]:curve('Canopy load cable',[(-4.6+dx,1.5+dy,5.61),(-4.6+dx,1.5+dy,5.415)],.0045,metal)
 # Flush woven rugs anchor lounge areas without changing navigation footprints.
 if index in [0,1,5]:
  rx,ry=(5.2,3) if index==0 else ((-5,1) if index==1 else (-5.1,4))
  cube('Woven lounge rug',(rx,ry,.007),(3.7,3.7,.018),fabric,.018,1)
  for side in [-1,1]:
   cube('Rug stitched border',(rx+side*1.75,ry,.018),(.025,3.45,.006),linen,0)
 if index==0:
  marble=texture_material('Reception dark veined marble',(.027,.030,.034),'marble')
  cube('Reception stone counter',(-4.9,3,.5),(3.8,1.3,1.0),marble,.12)
  cube('Reception walnut top',(-4.9,3,1.05),(3.95,1.4,.08),wood,.05)
  cube('Reception recessed warm light',(-4.9,2.34,.12),(3.4,.025,.025),glow,.006,1)
  curve('Reception bronze reveal',[(-6.6,2.32,.75),(-3.2,2.32,.75)],.014,brass)
  sofa(5.2,4);plant(6.9,7,3.5);plant(-6.7,-1,3)
  cylinder('Coffee table',(5.2,2,.36),.66,.09,wood);cylinder('Coffee pedestal',(5.2,2,.19),.18,.3,metal)
  pendant(-4.9,3);pendant(4.8,3,1.8)
  cube('Reception workstation',(-6.12,3.28,1.30),(.62,.06,.38),metal,.025)
  cylinder('Reception monitor stand',(-6.12,3.28,1.13),.025,.18,metal)
  chair(-4.9,4.15,_anchor=3)
  # Feature panel is offset: the long view through the office remains open.
  cube('Brand navy feature',(-5.5,5.9,2.6),(4.5,.22,4.5),navy,.04)
  for x in [-7.65,-3.35]:
   cube('Reception indirect brand light',(x,5.76,2.6),(.035,.035,4.05),glow,.008)
  cube('Reception navy fascia',(-4.9,2.335,.53),(3.45,.025,.55),navy,.035)
 elif index==1:
  sofa(-5,2);sofa(5,-3)
  for x,y in [(-5,0),(5,-5)]:
   cylinder('Lounge low table',(x,y,.36),.7,.09,wood);cylinder('Lounge table pedestal',(x,y,.18),.18,.3,metal)
   pendant(x,y,1.6)
  plant(-6.9,8,3.6);plant(6.7,5,3)
  cube('Library shelving',(-6.7,-5,1.7),(1.9,.5,3.4),metal,.025)
  for z in [.5,1.25,2,2.75]:
   cube('Walnut shelf',(-6.7,-5,z),(1.9,.7,.06),wood,.02)
   for k in range(7):cube('Design reference book',(-7.45+k*.21,-5,z+.19),(.12,.35,.32),ivory if k%3 else brass,.007)
 elif index==2:
  for y in [-5,1,7]:
   for x in [-4.5,4.5]:
    if y==1 and x<0:continue
    desk(x,y)
    if (y==1 and x>0) or (y==7 and x<0):
     cube('Design tablet',(x+.8,y-.12,.91),(.45,.32,.035),royal,.02)
   pendant(-4.5,y,2.4)
   if y!=1:pendant(4.5,y,1.8)
  plant(-6.9,10,3.4);plant(6.9,-8,3)
  cube('Studio pinboard',(-7.9,0,2.5),(.1,5,1.9),fabric,.02)
 elif index==3:
  for x,y in [(-5,-5),(5,0),(-5,5)]:
   cube('Gallery freestanding stone display',(x,y,1.9),(3.8,.25,3.5),stone,.06)
   cube('Gallery bronze frame',(x,y-.15,2.2),(3.3,.065,2.1),brass,.025)
   cube('Gallery screen',(x,y-.19,2.2),(3.16,.02,1.96),screen,.01)
   cube('Gallery picture light',(x,y-.12,3.7),(3.1,.14,.05),glow,.012)
  sofa(5,8);plant(-6.8,-8,3.3);plant(6.9,11,3)
 elif index==4:
  cube('AI lab blue feature',(-8.05,mid,2.5),(.12,length-.7,4.65),navy,.015)
  for y in [-6,0,6]:
   cube('AI royal blue architecture',(-7.96,y,2.5),(.05,.16,4.3),royal,.015)
  for x in [-4.8,4.8]:
   desk(x,-3);desk(x,5)
   pendant(x,0,3)
  for x in [-6,6]:
   cube('Lab vertical presentation panel',(x,9,1.75),(1.35,.18,3.5),metal,.04)
   cube('Lab luminous interface',(x,8.89,2.1),(1.1,.03,2.35),screen,.02)
  plant(6.9,-8,3.2)
 else:
  # Meeting table offset from the central circulation route.
  cube('Meeting table',(4.7,3,.8),(3.2,4.7,.13),wood,.15)
  for y in [1.4,3,4.6]:
   chair(2.45,y,math.pi/2);chair(6.95,y,-math.pi/2)
  for y in [1.8,4.3]:pendant(4.7,y,2.6)
  sofa(-5.1,5);plant(-6.8,8,3.4);plant(6.9,-4,3.3)
  cube('Meeting screen stone surround',(4.7,9,2.4),(4.2,.23,3.8),navy,.04)
  cube('Meeting screen',(4.7,8.85,2.4),(3.5,.03,2),screen,.025)
 if index==0:
  cube('Entrance facade glass',(0,lo,2.85),(16.5,.025,5.45),glass,0)
  for x in [-1.05,1.05]:cube('Entrance door frame',(x,lo-.02,1.25),(.05,.07,2.5),metal,.005)
 if index==5:
  cube('Meeting inner glass',(1.65,4.5,2.1),(.035,11.5,4.2),glass,0)
  cube('Meeting glass rail',(1.65,4.5,4.22),(.065,11.5,.05),metal,.004)
  for y in [-1.25,4.5,10.25]:cube('Meeting glass mullion',(1.65,y,2.1),(.065,.065,4.2),metal,.005)
  cube('End facade glazing',(0,hi,2.85),(16.5,.025,5.45),glass,0)
  for x in range(-8,9,2):cube('End facade mullion',(x,hi-.03,2.85),(.055,.10,5.5),brass,.008,1)
 # Compress the circulation, preserving the dimensions of furniture and people.
 source_d=d;d*=SCALE
 for obj in bpy.context.scene.objects:
  source_y=obj.location.y
  if obj.name.startswith(('Reception stone counter','Reception walnut top','Reception recessed','Reception bronze reveal','Reception navy fascia','Reception workstation','Reception monitor stand')):obj['depthAnchor']=3
  if 'depthAnchor' in obj:obj.location.y+=obj['depthAnchor']*(SCALE-1)
  else:obj.location.y*=SCALE;obj.scale.y*=SCALE
  if obj.name.startswith('Chair gas lift'):seat_spots.append({'x':round(obj.location.x,3),'d':round(d+obj.location.y,3),'sourceD':round(source_d+source_y,3)})
 bpy.context.view_layer.update()
 # Triplanar-style metre UV projection, baked to ordinary glTF UVs.
 for obj in bpy.context.scene.objects:
  if obj.type!='MESH' or not any(m.node_tree and any(n.type=='TEX_IMAGE' for n in m.node_tree.nodes) for m in obj.data.materials):continue
  uv=obj.data.uv_layers.active or obj.data.uv_layers.new(name='SurfaceUV')
  uv.name='SurfaceUV'
  for polygon in obj.data.polygons:
   axis=max(range(3),key=lambda k:abs(polygon.normal[k]))
   for loop_index in polygon.loop_indices:
    v=obj.matrix_world@obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
    u,vv=((v.y+d,v.z) if axis==0 else (v.x,v.z) if axis==1 else (v.x,v.y+d))
    uv.data[loop_index].uv=(u*.48,vv*.48)
 from office_ao import bake_floor_ao
 bake_floor_ao()
 # Camera-only overhead obstacles have a bottom height, allowing movement underneath.
 for obj in bpy.context.scene.objects:
  if obj.type=='MESH' and obj.name.startswith(('Suspended luminaire','Monitor frame','Reception workstation')):
   camera_obstacles.append({'name':obj.name,'x':round(obj.location.x,3),'d':round(d+obj.location.y,3),'w':round(obj.dimensions.x/2+.28,3),'h':round(obj.dimensions.y/2+.28,3),'bottom':round(obj.location.z-obj.dimensions.z/2,3),'top':round(obj.location.z+obj.dimensions.z/2,3)})
 # Export the same furniture footprints used by the movement engine.
 for o in bpy.context.scene.objects:
  if o.type=='MESH' and o.name.startswith(('Solid walnut desk','Lounge plinth','Reception stone counter','Gallery freestanding','Meeting table','Stone planter','Chair gas lift','Library shelving','Lab vertical','Brand navy feature','Meeting screen stone surround','Side bay clear glass return','Meeting inner glass')):
   colliders.append({'name':o.name,'x':round(o.location.x,3),'d':round(d+o.location.y,3),'w':round((o.dimensions.x/2 if o.name.startswith(('Side bay','Meeting inner glass')) else max(.3,o.dimensions.x/2))+.28,3),'h':round((o.dimensions.y/2 if o.name.startswith(('Side bay','Meeting inner glass')) else max(.3,o.dimensions.y/2))+.28,3),'top':1.30 if o.name.startswith('Chair gas lift') else round(o.location.z+o.dimensions.z/2,3)})
 for obj in list(bpy.context.scene.objects):
  if obj.get('physicsOnly'):bpy.data.objects.remove(obj,do_unlink=True)
 export('environment-'+str(index))
if os.environ.get('OFFICE_PREVIEW_SECTOR'):raise SystemExit(0)
with open(os.path.join(ROOT,'src','data','office-layout.json'),'w') as f:
 json.dump({'halfWidth':PLAN['halfWidth'],'length':PLAN['referenceLength']*SCALE,'centres':[round(v*SCALE,3) for v in CENTRES],'boundaries':[round(v*SCALE,3) for v in EDGES],'depthScale':SCALE,'colliders':colliders,'cameraCeiling':4.65,'cameraObstacles':camera_obstacles,'furniture':furniture,'seats':seat_spots,'fixtures':fixtures},f,indent=2)
# Generate actual actor positions from the source layout and physical seat anchors.
actors=json.load(open(os.path.join(ROOT,'tools','studio-actors-source.json')))
for actor in actors:
 old=actor['d'];new=old*SCALE
 if actor['seat']:
  matching=[v for v in seat_spots if abs(v['x']-actor['x'])<.15 and abs(v['sourceD']-old)<.15]
  lounges=[v for v in furniture if abs(v['x']-actor['x'])<1.25 and abs(v['sourceD']-old)<.4]
  if matching:new=matching[0]['d']
  elif lounges:new=lounges[0]['d']+(old-lounges[0]['sourceD'])
 actor['d']=round(new,3)
 actor['route']=[[x,round(new+(depth-old)*SCALE,3)] for x,depth in actor['route']]
with open(os.path.join(ROOT,'src','data','studio-actors.json'),'w') as f:json.dump(actors,f,ensure_ascii=False,indent=2)
print('CONNECTED OFFICE COMPLETE; 72m physical layout, supported fixtures, shared CC0 furnishings')
