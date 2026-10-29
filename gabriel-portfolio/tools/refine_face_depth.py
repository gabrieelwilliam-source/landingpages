"""Small original sculpt adjustments over the existing licensed CC0 anatomy.

Reference is visual only: no portrait pixel, inferred scan or new skeleton.
The compact skin atlas is baked after this step; original UVs/weights survive.
"""
import bpy, math

def smooth(v):
 v=max(0,min(1,v));return v*v*(3-2*v)

def refine_face_depth():
 head=next(o for o in bpy.context.scene.objects if o.name.startswith('MakeHuman CC0 anatomical head'))
 mouth=float(head.get('mouthZ',1.597));brow=float(head.get('browZ',1.716))
 for vertex in head.data.vertices:
  p=vertex.co;x=abs(p.x);front=smooth((-p.y-.045)/.045)
  nose=math.exp(-((p.x/.027)**4+((p.z-(mouth+.050))/.028)**4))*front
  # Broader alar base and a quieter bridge, without shifting the fitted eyeballs.
  p.x*=1+.11*nose;p.y+=.0028*nose
  cheek=math.exp(-(((x-.065)/.031)**2+((p.z-(mouth+.061))/.027)**2))*front
  p.x+=(1 if p.x>0 else -1)*.0014*cheek;p.y-=.0014*cheek
  brow_volume=math.exp(-(((x-.037)/.032)**4+((p.z-brow)/.015)**2))*front
  p.y+=.0018*brow_volume
 head.data.update()
 colors=head.data.color_attributes.get('SurfaceColor')
 for loop in head.data.loops:
  p=head.data.vertices[loop.vertex_index].co;x=abs(p.x)
  front=smooth((-p.y+.015)/.045)
  line=1.675*(1-front)+(1.775+.018*math.exp(-((x-.065)/.025)**2))*front
  scalp=smooth((p.z-line+.002)/.016)*.95
  cheek_line=mouth+.006+.071*smooth((x-.021)/.077)
  beard=smooth((cheek_line-p.z)/.024)*smooth((-p.y+.015)/.07)
  if x<.037 and abs(p.z-(mouth+.004))<.012:beard=0
  t=(x-.010)/.055
  brow_line=brow+.002+.003*math.sin(math.pi*max(0,min(1,t)))-.004*max(0,min(1,t))
  brow_shadow=math.exp(-((p.z-brow_line)/.0065)**2)*smooth(t/.13)*smooth((1-t)/.17)*front*.86
  moustache=math.exp(-((p.x/.038)**6+((p.z-(mouth+.014))/.009)**4))*front*.90
  shade=max(beard*.88,brow_shadow,moustache)
  # Keep the hair root shadow soft; opaque solid outlines cannot feather like hair.
  root=tuple(1-shade+tone*shade for tone in (.17,.13,.10))
  colors.data[loop.index].color=(*(value*(1-scalp)+tone*scalp for value,tone in zip(root,(.06,.05,.04))),1)
 for obj in bpy.context.scene.objects:
  if obj.name.startswith('CC0 fitted blue grey eyes'):
   bsdf=obj.data.materials[0].node_tree.nodes.get('Principled BSDF')
   bsdf.inputs['Roughness'].default_value=.34;bsdf.inputs['Specular IOR Level'].default_value=.32
 print('FACE DEPTH: subtle nose/cheek/brow sculpt; soft scalp/beard roots, existing UVs and eye fit preserved')
