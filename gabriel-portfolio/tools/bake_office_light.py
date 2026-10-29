"""Cycles CPU indirect-light bake for existing static office surfaces.

The glTF emissive slot transports the RGB lightmap, explicitly marked in extras.
The runtime moves it to lightMap, so it is never displayed as self-illumination.
Original metre UVs, normal/roughness maps and the floor AO are retained.
"""
import bpy, math, os, time, numpy as np
from mathutils import Vector

def bake_office_light(sector):
 started=time.monotonic();scene=bpy.context.scene
 prefixes=('Continuous floor','Walnut wall backing','Floating ceiling','Walnut acoustic fin','Ceiling walnut baffle','Central acoustic ceiling cloud','Lounge acoustic canopy','Woven lounge rug','Solid walnut desk','Reception stone counter','Reception walnut top','Reception navy fascia','Brand navy feature','Meeting table','Gallery freestanding','Studio pinboard','AI lab blue feature','Meeting screen stone surround')
 targets=[o for o in scene.objects if o.type=='MESH' and o.name.startswith(prefixes) and not o.get('physicsOnly')]
 bpy.ops.object.select_all(action='DESELECT')
 for obj in targets:obj.select_set(True)
 bpy.context.view_layer.objects.active=targets[0];bpy.ops.object.join();obj=bpy.context.object
 originals=list(obj.data.materials);copies={}
 for index,original in enumerate(originals):
  if original not in copies:
   m=original.copy();m.name=original.name+' | indirect bake';m['zaionIndirectLight']=True;m['zaionLightmapUV']=2
   source=m.node_tree.nodes.new('ShaderNodeUVMap');source.uv_map='SurfaceUV'
   for node in list(m.node_tree.nodes):
    if node.type=='TEX_IMAGE' and not node.inputs['Vector'].is_linked:m.node_tree.links.new(source.outputs['UV'],node.inputs['Vector'])
    if node.type=='NORMAL_MAP' and not node.uv_map:node.uv_map='SurfaceUV'
   copies[original]=m
  obj.data.materials[index]=copies[original]
 uv=obj.data.uv_layers.new(name='BakedIndirectUV');obj.data.uv_layers.active_index=len(obj.data.uv_layers)-1
 for layer in obj.data.uv_layers:layer.active_render=layer.name=='BakedIndirectUV'
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.004,area_weight=1,scale_to_bounds=True)
 bpy.ops.object.mode_set(mode='OBJECT')
 size=int(os.environ.get('OFFICE_LIGHTMAP_SIZE','512'));samples=int(os.environ.get('OFFICE_LIGHTMAP_SAMPLES','128'))
 image=bpy.data.images.new('Static indirect sector '+str(sector),width=size,height=size,alpha=False);image.colorspace_settings.name='sRGB'
 for m in copies.values():
  target=m.node_tree.nodes.new('ShaderNodeTexImage');target.image=image;m.node_tree.nodes.active=target
 # A common sunset direction and actual pendant positions; no purchased HDRI.
 world=bpy.data.worlds.new('Office bake sky');world.use_nodes=True
 bg=world.node_tree.nodes.get('Background');bg.inputs['Color'].default_value=(.24,.29,.38,1);bg.inputs['Strength'].default_value=.35;scene.world=world
 lights=[]
 def light(name,kind,loc,energy,color):
  data=bpy.data.lights.new(name,kind);data.energy=energy;data.color=color;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;lights.append(o);return o
 sun=light('Bake sunset','SUN',(20,4,8),2.0,(1,.72,.48));sun.rotation_euler=Vector((-20,-4,-8)).to_track_quat('-Z','Y').to_euler();sun.data.angle=.12
 for fixture in list(scene.objects):
  if fixture.type=='MESH' and fixture.name.startswith('Suspended luminaire'):
   lamp=light('Bake pendant','AREA',(fixture.location.x,fixture.location.y,4.70),230,(1,.73,.46));lamp.data.shape='RECTANGLE';lamp.data.size=max(.8,fixture.dimensions.x);lamp.data.size_y=.28
 # Soft warm bounce near the reception feature, baked without adding runtime lamps.
 if sector==0:
  lamp=light('Bake reception wash','AREA',(-5.5,3.7,3.8),110,(1,.70,.40));lamp.data.shape='RECTANGLE';lamp.data.size=3.4;lamp.data.size_y=.7;lamp.rotation_euler=Vector((0,1,-.65)).to_track_quat('-Z','Y').to_euler()
 scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=samples;scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=3;scene.cycles.glossy_bounces=2;scene.cycles.transparent_max_bounces=8
 bpy.context.view_layer.objects.active=obj;obj.select_set(True)
 bpy.ops.object.bake(type='DIFFUSE',pass_filter={'INDIRECT'},use_clear=True,margin=3,uv_layer='BakedIndirectUV')
 # Filter low-frequency irradiance in scene-linear space, not the material detail maps.
 pixels=np.asarray(image.pixels[:],dtype=np.float32).reshape(size,size,4)
 for axis in [0,1]:
  padded=np.pad(pixels,[(2,2) if n==axis else (0,0) for n in range(3)],mode='edge');filtered=np.zeros_like(pixels)
  for offset,weight in enumerate([1,4,6,4,1]):
   region=[slice(None)]*3;region[axis]=slice(offset,offset+size);filtered+=padded[tuple(region)]*(weight/16)
  pixels=filtered
 image.pixels.foreach_set(pixels.ravel());image.update();image.pack()
 for m in copies.values():
  nodes=m.node_tree.nodes;links=m.node_tree.links;tex=next(n for n in nodes if n.type=='TEX_IMAGE' and n.image==image)
  coords=nodes.new('ShaderNodeUVMap');coords.uv_map='BakedIndirectUV';links.new(coords.outputs['UV'],tex.inputs['Vector'])
  p=nodes.get('Principled BSDF');links.new(tex.outputs['Color'],p.inputs['Emission Color']);p.inputs['Emission Strength'].default_value=1
 for layer in obj.data.uv_layers:layer.active_render=layer.name=='SurfaceUV'
 obj.data.uv_layers.active_index=0
 for lamp in lights:bpy.data.objects.remove(lamp,do_unlink=True)
 values=list(image.pixels)[::4]
 print('INDIRECT BAKE',sector,size,samples,'range',round(min(values),4),round(max(values),4),'seconds',round(time.monotonic()-started,2),flush=True)
