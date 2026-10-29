"""Sector-only asset assembly; never rewrites layout, actors or public models.
OFFICE_OUTPUT must be outside the application. OFFICE_PREVIEW_SECTOR: 0 or 2.
REVIEW_PALM / REVIEW_CHAIR point to plain, decoded GLBs. The result is reviewed
before explicitly promoting an environment GLB to public/models/.
"""
import os
from pathlib import Path
path=Path(__file__).with_name('build_office.py');output=Path(os.environ['OFFICE_OUTPUT']).resolve()
assert not output.is_relative_to(path.parent.parent.resolve()),'Output must stay outside the application'
sector=os.environ.get('OFFICE_PREVIEW_SECTOR');assert sector in ['0','2']
asset=Path(os.environ['REVIEW_PALM' if sector=='0' else 'REVIEW_CHAIR']).resolve();assert asset.is_file()
source=path.read_text()
helper='''
def import_review_asset(filepath,x,y,angle=0):
 before=set(bpy.context.scene.objects)
 bpy.ops.import_scene.gltf(filepath=filepath)
 imported=set(bpy.context.scene.objects)-before
 for obj in imported:
  if obj.type!='MESH':continue
  matrix=obj.matrix_world.copy();obj.parent=None;obj.data.transform(matrix)
  obj.matrix_world.identity();obj.location=(x,y,0);obj.rotation_euler.z=angle
  obj['preserveReviewUV']=True
 for obj in imported:
  if obj.type!='MESH':bpy.data.objects.remove(obj,do_unlink=True)

'''
a=source.index('@furnishing\ndef chair(');b=source.index('@furnishing\ndef desk(',a)
original=source[a:b].replace('def chair(', 'def original_chair(',1)
source=source[:a]+helper+original+'''@furnishing
def chair(x,y,angle=0):
 if index!=2:return original_chair(x,y,angle)
 import_review_asset(os.environ['REVIEW_CHAIR'],x,y,angle)
 # Existing navigation uses the same 0.58m padded chair radius and seat anchor.
 proxy=cylinder('Chair gas lift',(x,y,.29),.038,.48,metal)
 proxy['physicsOnly']=True

'''+source[b:]
a=source.index('@furnishing\ndef plant(');b=source.index('@furnishing\ndef pendant(',a)
original=source[a:b].replace('def plant(', 'def original_plant(',1)
source=source[:a]+original+'''@furnishing
def plant(x,y,height=2.9):
 if index!=0 or x<0:return original_plant(x,y,height)
 import_review_asset(os.environ['REVIEW_PALM'],x,y)
 # Retain the original collision proxy; the real pot fits within it.
 proxy=cylinder('Stone planter',(x,y,.3),.4,.6,concrete)
 proxy['physicsOnly']=True

'''+source[b:]
needle="  if obj.type!='MESH':continue\n  uv=obj.data.uv_layers.active";assert source.count(needle)==1
source=source.replace(needle,"  if obj.type!='MESH' or obj.get('preserveReviewUV'):continue\n  uv=obj.data.uv_layers.active")
exec(compile(source,str(path),'exec'),{'__file__':str(path),'__name__':'__main__'})
