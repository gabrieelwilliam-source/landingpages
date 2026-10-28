import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const folder='docs/virtual-studio/hero-refinement',port=3100;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{stdio:'ignore'});
let browser;
try{
 let available=false;for(let n=0;n<100;n++){try{available=(await fetch(`http://127.0.0.1:${port}`)).ok}catch{}if(available)break;await new Promise(r=>setTimeout(r,200))}if(!available)throw new Error('Servidor de revisão indisponível');
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});await mkdir(folder,{recursive:true});
 const tiers=[];
 for(const tier of (process.argv.includes('--pbr-only')?[]:['auto','low','medium','high'])){
  const page=await browser.newPage({viewport:{width:1000,height:760}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${port}`);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});
  await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByLabel('Gráficos',{exact:true}).selectOption(tier);await page.getByRole('button',{name:'Câmera e ajuda'}).click();
  await expect(page.locator('.world-stage')).toHaveAttribute('data-quality',tier);await page.waitForTimeout(500);
  const measurement=await page.evaluate(async()=>{
   let last=performance.now();const start=last,frames=[];const ticker=setInterval(()=>document.querySelector('.world-stage')?.dispatchEvent(new WheelEvent('wheel',{deltaY:70,bubbles:true,cancelable:true})),180);
   await new Promise(resolve=>{const frame=t=>{frames.push(t-last);last=t;if(t-start<2500)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});clearInterval(ticker);frames.sort((a,b)=>a-b);
   const stage=document.querySelector('.world-stage'),gl=document.querySelector('canvas')?.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');
   return {frames:frames.length,elapsedMs:last-start,averageFps:frames.length/(last-start)*1000,p95FrameMs:frames[Math.floor(frames.length*.95)],renderer:debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'unknown',avatarLod:stage?.getAttribute('data-avatar-lod'),drawCalls:Number(stage?.getAttribute('data-draw-calls')),triangles:Number(stage?.getAttribute('data-triangles'))};
  });tiers.push({quality:tier,...measurement,errors});if(errors.length)throw new Error(errors.join('\n'));await page.close();
 }
 if(tiers.length)await writeFile(`${folder}/performance-tiers.json`,JSON.stringify({viewport:[1000,760],note:'Medições curtas em SwiftShader; cenários não sincronizados, sem comparação controlada nem garantia de FPS em GPU física.',tiers},null,2));
 const page=await browser.newPage({viewport:{width:1000,height:760}});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const original=WebGL2RenderingContext.prototype.getExtension;WebGL2RenderingContext.prototype.getExtension=function(name){return name==='WEBGL_debug_renderer_info'?null:original.call(this,name)}});
 await page.goto(`http://127.0.0.1:${port}`);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});
 await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByLabel('Gráficos',{exact:true}).selectOption('high');await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await page.getByLabel('Distância da câmera',{exact:true}).fill('2.2');await page.getByLabel('Ombro da câmera',{exact:true}).selectOption('0');await page.getByRole('button',{name:'Câmera e ajuda'}).click();
 await page.getByRole('button',{name:'Caminhar',exact:true}).click();await page.mouse.move(900,500);await page.mouse.down();await page.mouse.move(272,450,{steps:8});await page.mouse.up();await expect.poll(async()=>Math.abs(Number(await page.locator('.world-stage').getAttribute('data-camera-yaw')))).toBeGreaterThan(3);
 await page.getByRole('button',{name:'Pausar exploração'}).click();await page.waitForTimeout(700);await page.screenshot({path:`${folder}/character-pbr-software.png`,timeout:60000});
 if(errors.length)throw new Error(errors.join('\n'));await writeFile(`${folder}/pbr-check.json`,JSON.stringify({result:'PASS',test:'PBR path with renderer information hidden; still software WebGL, no physical GPU claim',errors},null,2));console.log(tiers.length?'PASS: four quality tiers measured; PBR character capture saved.':'PASS: PBR character capture saved after hero and ambient-light refinement.');
}finally{await browser?.close();server.kill('SIGTERM')}
