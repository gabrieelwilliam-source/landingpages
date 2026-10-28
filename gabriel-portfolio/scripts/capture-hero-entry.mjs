import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const folder='docs/virtual-studio/hero-refinement',port=3106;
const server=spawn(process.execPath,['scripts/serve-review.mjs','.next-pages',String(port)],{stdio:'ignore'});let browser;
try{
 let ready=false;for(let n=0;n<100;n++){try{ready=(await fetch(`http://127.0.0.1:${port}/`)).ok}catch{}if(ready)break;await new Promise(r=>setTimeout(r,200))}if(!ready)throw Error('Static review server failed');
 await mkdir(folder,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://127.0.0.1:${port}/`);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});await expect(page.locator('.world-stage')).toHaveAttribute('data-rig-bones','16');
  if(mobile)await expect(page.getByRole('button',{name:'Analógico de movimento'})).toBeInViewport();
  await page.screenshot({path:`${folder}/${mobile?'mobile-analog':'office-1440'}.png`});if(errors.length)throw Error(errors.join('\n'));await context.close();
 }
 console.log('PASS: final static export, desktop/mobile captures and analog visible.');
}finally{await browser?.close();server.kill('SIGINT')}
