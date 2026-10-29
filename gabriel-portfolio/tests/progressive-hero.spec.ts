import {test,expect} from '@playwright/test';
import {graphics} from './studio-options';
test('mobile starts and walks while the full PBR hero is still downloading',async({browser})=>{
 test.setTimeout(90000);
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);let requested=false;
 try{
  const page=await context.newPage();
  await page.route(/\/models\/gabriel-rigged\.glb(?:\?|$)/,async route=>{requested=true;await gate;if(!page.isClosed())await route.continue();});
  await page.goto('http://127.0.0.1:3000/');
  await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});
  const stage=page.locator('.world-stage');await expect(stage).toHaveAttribute('data-avatar-lod','low');expect(requested).toBe(true);
  await expect(stage).toHaveAttribute('data-rig-bones','16');
  const stick=page.getByRole('button',{name:'Analógico de movimento'}),box=(await stick.boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2,cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-34}]});
  await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(.4);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await graphics(page,'high');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-34}]});
  const beforeUpgrade=Number(await stage.getAttribute('data-distance'));release();
  await expect(stage).toHaveAttribute('data-avatar-lod','high',{timeout:30000});
  await expect(stage).toHaveAttribute('data-animation','Walk');
  await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(beforeUpgrade+.3);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(stage).toHaveAttribute('data-animation','Idle');
  await expect(stage).toHaveAttribute('data-rig-bones','16');
 }finally{release();await context.close();}
});
