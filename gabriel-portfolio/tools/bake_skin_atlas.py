"""Reproject the licensed skin onto only the head/hands used by the avatar.

Cycles bakes the existing material; no personal-image pixels, new asset or paid
service. Keep vertex colours and weights separate to avoid multiplying them twice.
"""
import bpy

def bake_skin_atlas():
 parts=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0].name=='CC0 adult male skin']
 head=next(o for o in parts if o.name.startswith('MakeHuman CC0 anatomical head'))
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:
  o.select_set(True);o.data.uv_layers.active.name='SourceSkinUV'
 bpy.context.view_layer.objects.active=head;bpy.ops.object.join()
 material=head.data.materials[0];nodes=material.node_tree.nodes;links=material.node_tree.links;bsdf=nodes.get('Principled BSDF')
 source_uv=nodes.new('ShaderNodeUVMap');source_uv.uv_map='SourceSkinUV'
 for node in list(nodes):
  if node.type=='TEX_IMAGE' and not node.inputs['Vector'].is_linked:links.new(source_uv.outputs['UV'],node.inputs['Vector'])
  if node.type=='NORMAL_MAP':node.uv_map='SourceSkinUV'
 head.data.uv_layers.new(name='SkinAtlasUV');head.data.uv_layers.active_index=1
 for layer in head.data.uv_layers:layer.active_render=layer.name=='SkinAtlasUV'
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
 bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.008,area_weight=.7,scale_to_bounds=True)
 bpy.ops.object.mode_set(mode='OBJECT')
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=1
 baked={}
 for kind,size in [('COLOR',1024),('NORMAL',512),('ROUGHNESS',256)]:
  image=bpy.data.images.new('CC0 skin atlas '+kind,width=size,height=size,alpha=True)
  image.colorspace_settings.name='sRGB' if kind=='COLOR' else 'Non-Color'
  target=nodes.new('ShaderNodeTexImage');target.image=image;nodes.active=target
  options={'type':'DIFFUSE','pass_filter':{'COLOR'}} if kind=='COLOR' else {'type':kind}
  bpy.ops.object.bake(**options,use_clear=True,margin=8,uv_layer='SkinAtlasUV')
  image.pack();nodes.remove(target);baked[kind]=image
 # Disconnect only after every source pass was baked, including the tangent normal.
 for node in list(nodes):
  if node.type in {'TEX_IMAGE','NORMAL_MAP','UVMAP'}:nodes.remove(node)
 for kind,socket in [('COLOR','Base Color'),('ROUGHNESS','Roughness')]:
  tex=nodes.new('ShaderNodeTexImage');tex.image=baked[kind];links.new(tex.outputs['Color'],bsdf.inputs[socket])
 tex=nodes.new('ShaderNodeTexImage');tex.image=baked['NORMAL'];normal=nodes.new('ShaderNodeNormalMap');normal.uv_map='SurfaceUV';normal.inputs['Strength'].default_value=1
 links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],bsdf.inputs['Normal'])
 head.data.uv_layers.remove(head.data.uv_layers['SourceSkinUV']);head.data.uv_layers.active.name='SurfaceUV';head.data.uv_layers.active.active_render=True
 print('SKIN ATLAS: existing skin reprojected to 1024 albedo, 512 normal, 256 roughness; same geometry, weights and colours')
