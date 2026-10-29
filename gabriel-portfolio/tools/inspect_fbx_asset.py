"""Inventory an isolated FBX collection; sources and output stay outside public/."""
import bpy,sys,json
from pathlib import Path
from mathutils import Vector
source=Path(sys.argv[sys.argv.index('--')+1]).resolve();out=Path(sys.argv[sys.argv.index('--')+2]).resolve();out.mkdir(parents=True,exist_ok=True)
assert not out.is_relative_to(Path(__file__).resolve().parents[1]),'Private output required'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.fbx(filepath=str(source))
report={'source':source.name,'unitSystem':bpy.context.scene.unit_settings.system,'unitScale':bpy.context.scene.unit_settings.scale_length,'objects':[],'materials':[],'images':[],'licenseStatus':'PENDING'}
for o in bpy.context.scene.objects:
 entry={'name':o.name,'type':o.type,'parent':o.parent.name if o.parent else None,'location':list(o.location),'scale':list(o.scale),'customProperties':{k:str(o[k])[:500] for k in o.keys() if k!='_RNA_UI'}}
 if o.type=='MESH':
  o.data.calc_loop_triangles();points=[o.matrix_world@Vector(v) for v in o.bound_box]
  entry.update(vertices=len(o.data.vertices),triangles=len(o.data.loop_triangles),materials=[m.name if m else None for m in o.data.materials],uvLayers=[u.name for u in o.data.uv_layers],bounds={'min':[min(v[k] for v in points) for k in range(3)],'max':[max(v[k] for v in points) for k in range(3)]})
 report['objects'].append(entry)
for m in bpy.data.materials:
 report['materials'].append({'name':m.name,'diffuseColor':list(m.diffuse_color),'images':[n.image.name for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image] if m.use_nodes else []})
for i in bpy.data.images:
 report['images'].append({'name':i.name,'dimensions':list(i.size),'packed':bool(i.packed_file),'path':i.filepath,'hasData':i.has_data})
(out/'chairs-inventory.json').write_text(json.dumps(report,indent=2));bpy.ops.wm.save_as_mainfile(filepath=str(out/'chairs-imported.blend'))
print('FBX INVENTORY',len(report['objects']),'objects',len(report['materials']),'materials',len(report['images']),'images',flush=True)
