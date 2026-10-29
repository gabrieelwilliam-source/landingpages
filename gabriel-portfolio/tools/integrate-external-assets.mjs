/** Rebuild only the two reviewed sectors, preserving layout and all humans. */
import {mkdtemp,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join,dirname} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=dirname(dirname(fileURLToPath(import.meta.url))),work=await mkdtemp(join(tmpdir(),'zaion-office-'));
function run(command,args,env={}){const result=spawnSync(command,args,{cwd:root,env:{...process.env,...env},stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)throw Error(`${command} failed (${result.status})`);}
try{
 for(const [kind,name] of [['PALM','fan-palm'],['CHAIR','office-chair']])run(process.execPath,['tools/decode_review_asset.mjs',`tools/vendor/external-office/${name}.glb`,join(work,`${kind}.glb`)]);
 for(const sector of [0,2]){
  run('blender',['-b','--python-exit-code','1','--python','tools/build_office_asset_preview.py'],{OFFICE_OUTPUT:work,OFFICE_PREVIEW_SECTOR:String(sector),REVIEW_PALM:join(work,'PALM.glb'),REVIEW_CHAIR:join(work,'CHAIR.glb')});
  run(process.execPath,['tools/optimize_review_asset.mjs',join(work,`environment-${sector}.glb`),join(work,`ready-${sector}.glb`),'--office']);
 }
 // Promote only after both conversions completed successfully.
 for(const sector of [0,2])await copyFile(join(work,`ready-${sector}.glb`),join(root,`public/models/environment-${sector}.glb`));
}finally{await rm(work,{recursive:true,force:true});}
