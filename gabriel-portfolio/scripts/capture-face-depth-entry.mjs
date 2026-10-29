import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
const folder='docs/virtual-studio/face-depth-20261029',port=3106;
const server=spawn(process.execPath,['scripts/serve-review.mjs','.next-pages',String(port)],{stdio:'ignore'});let browser;
try{
 let ready=false;for(let n=0;n<100;n++){try{ready=(await fetch(`http://127.0.0.1:${port}/`)).ok}catch{}if(ready)break;await new Promise(r=>setTimeout(r,200))}if(!ready)throw Error('Static review server failed');
 await mkdir(folder,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://127.0.0.1:${port}/`);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});await expect(page.locator('.world-stage')).toHaveAttribute('data-rig-bones','16');
  if(mobile)await expect(page.getByRole('button',{name:'Analógico de movimento'})).toBeInViewport();
  await page.screenshot({path:`${folder}/${mobile?'mobile-analog':'office-1440'}.png`});if(!mobile){
   await mkdir(`${folder}/sectors`,{recursive:true});
   await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByLabel('Gráficos',{exact:true}).selectOption('high');await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();
   for(let i=0;i<6;i++){
    const menu=page.getByRole('button',{name:'Câmera e ajuda'});if(await menu.getAttribute('aria-expanded')!=='true')await menu.click();
    await page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button').nth(i).click();
    await expect(page.locator('.spatial-kicker')).toContainText(`0${i+1}`);await expect(page.locator('.spatial-progress')).not.toContainText('Em travessia');
    await expect.poll(async()=>Number(await page.locator('.world-stage').getAttribute('data-npc-count')),{timeout:20000}).toBeGreaterThan(0);
    await page.screenshot({path:`${folder}/sectors/sector-${i+1}-1440.png`});
   }
  }
  if(errors.length)throw Error(errors.join('\n'));await context.close();
 }
 console.log('PASS: final static export, desktop/mobile captures and analog visible.');
}finally{await browser?.close();server.kill('SIGINT')}
