async function jump(page,index){const button=page.getByRole('button',{name:'Câmera e ajuda'});if(await button.getAttribute('aria-expanded')!=='true')await button.click();await page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button').nth(index).click();}
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {cpus} from 'node:os';
import {chromium,expect} from '@playwright/test';
const output=process.argv[2]||'docs/virtual-studio/professional-polish/baseline',port=3120;
await mkdir(output,{recursive:true});
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{stdio:'ignore'});let browser;
try{
 let alive=false;for(let n=0;n<100;n++){try{alive=(await fetch(`http://127.0.0.1:${port}`)).ok}catch{}if(alive)break;await new Promise(r=>setTimeout(r,200))}if(!alive)throw new Error('Audit server failed');
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});const profiles=[];
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.addInitScript(()=>{
   window.__studioAudit={lcp:null,allocations:new Map()};
   new PerformanceObserver(list=>{const e=list.getEntries().at(-1);if(e)window.__studioAudit.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
   const proto=WebGL2RenderingContext.prototype,bind=proto.bindTexture,active=proto.activeTexture,image=proto.texImage2D,storage=proto.texStorage2D,del=proto.deleteTexture,mip=proto.generateMipmap;
   let slot=33984;const bindings=new Map(),alloc=window.__studioAudit.allocations;
   const current=target=>bindings.get(slot+':'+(target>=34069&&target<=34074?34067:target));
   proto.activeTexture=function(value){slot=value;return active.call(this,value)};
   proto.bindTexture=function(target,value){bindings.set(slot+':'+target,value);return bind.call(this,target,value)};
   proto.texImage2D=function(...args){const tex=current(args[0]);if(tex){const source=args[5],w=args.length>=9?args[3]:source?.width,h=args.length>=9?args[4]:source?.height;if(w&&h){const entry=alloc.get(tex)||{levels:new Map(),mips:false};entry.levels.set(args[0]+':'+args[1],w*h*(args[7]===5126?16:args[7]===5131?8:4));alloc.set(tex,entry)}}return image.apply(this,args)};
   proto.texStorage2D=function(target,levels,format,width,height){const tex=current(target);if(tex){const sizes=new Map();for(let l=0;l<levels;l++)sizes.set(target+':'+l,Math.max(1,width>>l)*Math.max(1,height>>l)*4);alloc.set(tex,{levels:sizes,mips:false})}return storage.call(this,target,levels,format,width,height)};
   proto.generateMipmap=function(target){const tex=current(target);if(alloc.has(tex))alloc.get(tex).mips=true;return mip.call(this,target)};
   proto.deleteTexture=function(texture){alloc.delete(texture);return del.call(this,texture)};
  });
  await page.goto(`http://127.0.0.1:${port}`);await expect(page.locator('canvas')).toHaveCount(1,{timeout:60000});await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:60000});await expect(page.locator('.world-stage')).toHaveAttribute('data-rig-bones','16');
  const sceneReadyMs=await page.evaluate(()=>performance.now());await page.screenshot({path:`${output}/entry-${viewport.width}.png`});
  const stages=[];
  for(const quality of ['auto','low','medium','high']){
   const menu=page.getByRole('button',{name:'Câmera e ajuda'});await menu.click();await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await page.getByLabel('Gráficos',{exact:true}).selectOption(quality);await menu.click();
   await jump(page,0);
   await expect(page.locator('.world-stage')).toHaveAttribute('data-distance','0.000');
   await menu.click();await page.getByRole('checkbox',{name:'Movimento reduzido'}).uncheck();await menu.click();
   const sample=await page.evaluate(async()=>{
    const intervals=[];let last=performance.now();const start=last,ticker=setInterval(()=>document.querySelector('.world-stage')?.dispatchEvent(new WheelEvent('wheel',{deltaY:60,bubbles:true,cancelable:true})),180);
    await new Promise(resolve=>{const frame=t=>{intervals.push(t-last);last=t;if(t-start<2200)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)});clearInterval(ticker);intervals.sort((a,b)=>a-b);
    const gl=document.querySelector('canvas')?.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info'),stage=document.querySelector('.world-stage');
    return {frames:intervals.length,elapsedMs:last-start,averageFps:intervals.length/(last-start)*1000,p95FrameMs:intervals[Math.floor(intervals.length*.95)],drawCalls:Number(stage?.getAttribute('data-draw-calls')),triangles:Number(stage?.getAttribute('data-triangles')),textureCount:window.__studioAudit.allocations.size,estimatedTextureBytes:[...window.__studioAudit.allocations.values()].reduce((sum,a)=>sum+[...a.levels.values()].reduce((s,n)=>s+n,0)*(a.mips?4/3:1),0),jsHeapBytes:performance.memory?.usedJSHeapSize||null,lcpMs:window.__studioAudit.lcp,resourceBytes:performance.getEntriesByType('resource').reduce((s,r)=>s+r.encodedBodySize,0),renderer:debug?String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):'unknown',dpr:devicePixelRatio,raster:[document.querySelector('canvas').width,document.querySelector('canvas').height]};
   });stages.push({quality,...sample});
  }
  await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await page.getByLabel('Gráficos',{exact:true}).selectOption('high');await page.getByRole('button',{name:'Câmera e ajuda'}).click();
  const cameras=[];
  for(const index of (viewport.width>700?[0,1,2,3,4,5]:[0,2])){
   await jump(page,index);await expect(page.locator('.spatial-kicker')).toContainText(`0${index+1}`);await expect(page.locator('.spatial-progress')).not.toContainText('Em travessia');
   await page.screenshot({path:`${output}/sector-${index+1}-${viewport.width}.png`});cameras.push({sector:index+1,...await page.locator(".world-stage").evaluate(el=>Object.fromEntries([...el.attributes].filter(a=>/^data-(camera|distance|area)/.test(a.name)).map(a=>[a.name,a.value]))) });
  }
  profiles.push({viewport,sceneReadyMs,cameras,stages,errors});if(errors.length)throw new Error(errors.join('\n'));await context.close();
 }
 await writeFile(`${output}/metrics.json`,JSON.stringify({cpu:cpus()[0]?.model,hostThreads:cpus().length,profiles,method:'Short active-scroll RAF samples, local cold page then warm tier changes. Texture allocation estimate from WebGL API calls, not driver VRAM; LCP measures DOM content, not completion of 3D scene. Headless SwiftShader is not a physical desktop/mobile GPU.'},null,2));console.log('PASS: baseline/final cameras, desktop/mobile tiers, LCP, texture allocation estimate and resources recorded.');
}finally{await browser?.close();server.kill('SIGTERM')}
