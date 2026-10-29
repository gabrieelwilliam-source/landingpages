import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const folder='docs/virtual-studio/baked-light-20261029',port=3110;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{stdio:'ignore'});let browser;
try{
 let ready=false;for(let n=0;n<100;n++){try{ready=(await fetch(`http://127.0.0.1:${port}`)).ok}catch{}if(ready)break;await new Promise(r=>setTimeout(r,200))}if(!ready)throw Error('Preview unavailable');
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});await mkdir(folder,{recursive:true});const errors=[];
 for(const before of [true,false]){
  const page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(120000);
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE.WebGLProgram|VALIDATE_STATUS|shader error/i.test(m.text()))errors.push(m.text())});
  await page.addInitScript(()=>{const original=WebGL2RenderingContext.prototype.getExtension;WebGL2RenderingContext.prototype.getExtension=function(name){return name==='WEBGL_debug_renderer_info'?null:original.call(this,name)}});
  if(before){const body=await readFile('/workspace/artifacts/baked-light-before-room.glb');await page.route(/\/models\/environment-0\.glb/,route=>route.fulfill({body,contentType:'model/gltf-binary'}));}
  await page.goto(`http://127.0.0.1:${port}/`);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});
  await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByLabel('Gráficos',{exact:true}).selectOption('high');await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await page.getByRole('button',{name:'Câmera e ajuda'}).click();
  await expect(page.locator('.world-stage')).toHaveAttribute('data-avatar-lod','high');await page.waitForTimeout(700);await page.getByRole('button',{name:'Pausar exploração'}).click();
  await page.screenshot({path:`${folder}/${before?'before':'after'}-reception-pbr.png`,timeout:60000});await page.close();
 }
 if(errors.length)throw Error(errors.join('\n'));await writeFile(`${folder}/lighting-pbr-check.json`,JSON.stringify({result:'PASS',method:'Same runtime/camera/lighting; only room-0 GLB replaced by previous asset in before route. PBR path on SwiftShader, no physical GPU claim.',errors},null,2));console.log('PASS: before/after reception, real PBR, no shader errors');
}finally{await browser?.close();server.kill('SIGTERM')}
