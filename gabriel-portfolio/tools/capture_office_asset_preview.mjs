/** Compare one private room replacement through the unmodified application. */
import {chromium,expect} from '@playwright/test';import {writeFile,mkdir} from 'node:fs/promises';
const root=process.argv[2];if(!root)throw Error('Artifact directory required');await mkdir(root+'/review',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
try{
for(const width of [1440,390])for(const version of ['before','after']){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});let intercepted=0;
 if(version==='before'&&process.env.OFFICE_BEFORE_MODELS)await page.route(/\/models\/environment-[02]\.glb/,async route=>{const index=new URL(route.request().url()).pathname.match(/environment-(\d)/)[1];await route.fulfill({path:process.env.OFFICE_BEFORE_MODELS+'/environment-'+index+'.glb',contentType:'model/gltf-binary'});});
 if(version==='after')await page.route(/\/models\/environment-[02]\.glb/,async route=>{const index=new URL(route.request().url()).pathname.match(/environment-(\d)/)[1];intercepted++;await route.fulfill({path:root+'/office-preview/environment-'+index+'-optimized.glb',contentType:'model/gltf-binary'});});
 await page.goto(process.env.OFFICE_REVIEW_URL||'http://127.0.0.1:8095/landingpages/gabriel/');await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});const stage=page.locator('.world-stage');
 await expect.poll(async()=>Number(await stage.getAttribute('data-loaded')),{timeout:60000}).toBeGreaterThanOrEqual(2);
 const options=page.getByRole('button',{name:'Câmera e ajuda'});await options.click();await page.getByLabel('Gráficos',{exact:true}).selectOption(width<600?'low':'high');await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await options.click();
 await page.getByRole('button',{name:'Scroll',exact:true}).click();await expect(stage).toHaveAttribute('data-navigation','scroll');await page.waitForTimeout(750);
 await page.screenshot({path:`${root}/review/office-${version}-${width}.png`});
 const snapshot=await stage.evaluate(s=>({...s.dataset}));
 await options.click();await page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button').nth(2).click();await expect(page.locator('.spatial-kicker')).toContainText('03');await page.waitForTimeout(500);await page.screenshot({path:`${root}/review/studio-${version}-${width}.png`});const studio=await stage.evaluate(s=>({...s.dataset}));
 await page.getByRole('button',{name:'Caminhar',exact:true}).click();await expect(stage).toHaveAttribute('data-navigation','walk');await stage.focus();await page.keyboard.press('j');await expect(stage).not.toHaveAttribute('data-camera-yaw','0.000');
 await page.getByRole('button',{name:'Scroll',exact:true}).click();await expect(stage).toHaveAttribute('data-navigation','scroll');
 const classic=page.getByRole('button',{name:/Modo clássico/});await classic.click();await expect(page.locator('canvas')).toHaveCount(0);
 if(errors.length)throw Error(JSON.stringify(errors));if(version==='after'&&intercepted!==2)throw Error('Private model route did not load both sectors');results.push({width,version,intercepted,snapshot,studio,errors});await context.close();
}
}finally{await browser.close();await writeFile(root+'/review/office-browser-results.json',JSON.stringify(results,null,2));}
console.log(results.map(({width,version,snapshot,errors})=>({width,version,drawCalls:snapshot.drawCalls,triangles:snapshot.triangles,errors})));
