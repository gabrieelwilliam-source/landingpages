"""Bake static floor contact occlusion, retaining the authored metre-scale PBR UVs.
Original scene data only. One 512px map per sector; no runtime postprocessing.
"""
import bpy

def bake_floor_ao():
 floor=bpy.data.objects['Continuous floor slab']
 material=floor.data.materials[0].copy();material.name='Floor stone with baked contact occlusion';floor.data.materials[0]=material
 uv=floor.data.uv_layers.new(name='FloorAO')
 points=[floor.matrix_world@v.co for v in floor.data.vertices];xmin=min(v.x for v in points);xmax=max(v.x for v in points);ymin=min(v.y for v in points);ymax=max(v.y for v in points)
 for polygon in floor.data.polygons:
  for li in polygon.loop_indices:
   v=points[floor.data.loops[li].vertex_index]
   uv.data[li].uv=((v.x-xmin)/(xmax-xmin),(v.y-ymin)/(ymax-ymin)) if polygon.normal.z>.9 else (2+(v.x-xmin)/(xmax-xmin),2+(v.y-ymin)/(ymax-ymin))
 image=bpy.data.images.new('Baked floor contact AO',width=512,height=512);image.colorspace_settings.name='Non-Color'
 nodes=material.node_tree.nodes;links=material.node_tree.links;output=nodes.get('Material Output');previous=output.inputs['Surface'].links[0].from_socket
 target=nodes.new('ShaderNodeTexImage');target.image=image;nodes.active=target
 ao=nodes.new('ShaderNodeAmbientOcclusion');ao.inputs['Distance'].default_value=1.25;ao.samples=32;ao.only_local=False
 emission=nodes.new('ShaderNodeEmission');links.new(ao.outputs['Color'],emission.inputs['Color']);links.new(emission.outputs[0],output.inputs['Surface'])
 bpy.ops.object.select_all(action='DESELECT');floor.select_set(True);bpy.context.view_layer.objects.active=floor
 floor.data.uv_layers.active_index=len(floor.data.uv_layers)-1
 for layer in floor.data.uv_layers:layer.active_render=layer.name=='FloorAO'
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16
 nodes.active=target
 bpy.ops.object.bake(type='EMIT',use_clear=True,margin=4,uv_layer='FloorAO')
 links.new(previous,output.inputs['Surface']);nodes.remove(ao);nodes.remove(emission);image.pack()
 group=bpy.data.node_groups.get('glTF Material Output')
 if not group:
  group=bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree');group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat');group.nodes.new('NodeGroupInput');group.nodes.new('NodeGroupOutput')
 settings=nodes.new('ShaderNodeGroup');settings.node_tree=group
 coords=nodes.new('ShaderNodeUVMap');coords.uv_map='FloorAO';links.new(coords.outputs['UV'],target.inputs['Vector']);links.new(target.outputs['Color'],settings.inputs['Occlusion'])
 floor.data.uv_layers.active_index=0
 for layer in floor.data.uv_layers:layer.active_render=layer.name=='SurfaceUV'
 print('FLOOR AO BAKED',round(min(list(image.pixels)[::4]),3),round(max(list(image.pixels)[::4]),3))
