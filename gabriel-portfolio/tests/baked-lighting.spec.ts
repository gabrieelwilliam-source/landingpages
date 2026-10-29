import {test,expect} from '@playwright/test';
import {graphics,jump} from './studio-options';
for(const pbr of [false,true])test(`baked indirect UV maps survive ${pbr?'PBR shader':'software fallback'}, quality and room loading`,async({page})=>{
 test.setTimeout(120000);await page.setViewportSize({width:640,height:480});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE.WebGLProgram|VALIDATE_STATUS|shader error/i.test(m.text()))errors.push(m.text());});
 if(pbr)await page.addInitScript(()=>{const original=WebGL2RenderingContext.prototype.getExtension;WebGL2RenderingContext.prototype.getExtension=function(this:WebGL2RenderingContext,name:string){return name==='WEBGL_debug_renderer_info'?null:Reflect.apply(original,this,[name])} as typeof original});
 await page.goto('/');await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});
 const stage=page.locator('.world-stage');await expect.poll(async()=>Number(await stage.getAttribute('data-baked-lightmaps')),{timeout:30000}).toBeGreaterThan(0);
 await graphics(page,'low');await expect(stage).toHaveAttribute('data-quality','low');await expect(stage).toHaveAttribute('data-rig-bones','16');
 const initial=Number(await stage.getAttribute('data-baked-lightmaps'));await jump(page,5);await expect(page.locator('.spatial-kicker')).toContainText('06');
 await expect.poll(async()=>Number(await stage.getAttribute('data-baked-lightmaps')),{timeout:30000}).toBeGreaterThan(initial);
 await expect(stage).toHaveAttribute('data-avatar-lod','low');expect(errors).toEqual([]);
});
