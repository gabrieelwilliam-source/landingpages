import {chromium,expect} from '@playwright/test';import {mkdir,writeFile} from 'node:fs/promises';
const [url,output,label]=process.argv.slice(2);if(!url||!output||!label)throw Error('URL, output, label required');await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const results=[];
try{
for(const [profile,width,height,quality,sectors] of [['desktop',1440,900,'high',[0,1,2,4,5]],['mobile',390,844,'low',[0,2,5]],['pbr',640,480,'medium',[0,1,2]]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:profile==='mobile',hasTouch:profile==='mobile'}),page=await context.newPage(),errors=[];
 if(profile==='pbr')await page.addInitScript(()=>{const get=WebGL2RenderingContext.prototype.getExtension;WebGL2RenderingContext.prototype.getExtension=function(name){return name==='WEBGL_debug_renderer_info'?null:get.call(this,name)}});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/shader|WebGLProgram|VALIDATE_STATUS/i.test(m.text()))errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto(url);await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});
 const options=page.getByRole('button',{name:'Câmera e ajuda'}),stage=page.locator('.world-stage');
 await options.click();await page.getByLabel('Gráficos',{exact:true}).selectOption(quality);await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await options.click();await page.getByRole('button',{name:'Scroll',exact:true}).click();
 for(const index of sectors){
  if(await options.getAttribute('aria-expanded')!=='true')await options.click();await page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button').nth(index).click();
  await expect(page.locator('.spatial-kicker')).toContainText(`0${index+1}`);await expect.poll(async()=>Number(await stage.getAttribute('data-loaded')),{timeout:30000}).toBeGreaterThanOrEqual(index<5?index+2:6);
  await expect(page.locator('.spatial-progress')).not.toContainText('Em travessia');await page.waitForTimeout(600);
  await page.screenshot({path:`${output}/${label}-${profile}-${index}.png`});results.push({profile,index,width,height,shader:profile==='pbr'?'PBR running on SwiftShader':'software fallback',snapshot:await stage.evaluate(s=>({...s.dataset})),errors:[...errors]});

 }
 await context.close();
}
}finally{await browser.close();await writeFile(`${output}/${label}-browser.json`,JSON.stringify(results,null,2));}
console.log(results.map(r=>({profile:r.profile,index:r.index,calls:r.snapshot.drawCalls,triangles:r.snapshot.triangles,errors:r.errors})));if(results.some(r=>r.errors.length))process.exitCode=1;
