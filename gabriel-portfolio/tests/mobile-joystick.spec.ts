import {test,expect} from '@playwright/test';
import {graphics} from './studio-options';
import {mkdir} from 'node:fs/promises';

for(const landscape of [false,true])test(`mobile analog moves proportionally and stops on release (${landscape?'landscape':'portrait'})`,async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({viewport:landscape?{width:844,height:390}:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:3000/');await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});
    const stage=page.locator('.world-stage'),stick=page.getByRole('button',{name:'Analógico de movimento'});
    await expect(stage).toHaveAttribute('data-navigation','walk');await expect(stick).toBeInViewport();
    await graphics(page,'low');
    const box=(await stick.boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2;
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-box.width*.29,id:1}]});
    await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(.7);
    await expect(stage).toHaveAttribute('data-animation','Walk');await expect(stage).toHaveAttribute('data-camera-yaw','0.000');
    await mkdir('test-results/mobile-joystick',{recursive:true});await page.screenshot({path:`test-results/mobile-joystick/analog-${landscape?'landscape':'portrait'}.png`});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await expect(stick).toHaveAttribute('data-active','false');
    await expect(stage).toHaveAttribute('data-animation','Idle',{timeout:10000});
    const stopped=Number(await stage.getAttribute('data-distance'));await page.waitForTimeout(500);
    expect(Math.abs(Number(await stage.getAttribute('data-distance'))-stopped)).toBeLessThan(.03);
    expect(errors).toEqual([]);
  }finally{await context.close();}
});

test('two fingers steer and look independently; cancel, pause and mode changes release movement',async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    const page=await context.newPage();await page.goto('http://127.0.0.1:3000/');await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});await graphics(page,'low');
    const stage=page.locator('.world-stage'),stick=page.getByRole('button',{name:'Analógico de movimento'}),box=(await stick.boundingBox())!;
    const x=box.x+box.width/2,y=box.y+box.height/2,held={x,y:y-34,id:1};
    const cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[held]});
    await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(.3);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held,{x:300,y:440,id:2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[held,{x:250,y:465,id:2}]});
    await expect.poll(async()=>Math.abs(Number(await stage.getAttribute('data-camera-yaw')))).toBeGreaterThan(.15);
    const walking=Number(await stage.getAttribute('data-distance'));
    await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(walking+.2);
    await expect(stick).toHaveAttribute('data-active','true');
    await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    await expect(stick).toHaveAttribute('data-active','false');await expect(stage).toHaveAttribute('data-animation','Idle',{timeout:10000});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[held]});
    await page.getByRole('button',{name:'Pausar exploração'}).click();await expect(stick).toBeDisabled();
    await page.getByRole('button',{name:'Continuar exploração'}).click();
    const paused=await stage.getAttribute('data-distance');await page.waitForTimeout(500);expect(await stage.getAttribute('data-distance')).toBe(paused);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await page.getByRole('button',{name:'Scroll',exact:true}).click();await expect(stick).toHaveCount(0);
    await page.getByRole('button',{name:'Caminhar',exact:true}).click();await expect(stick).toHaveAttribute('data-active','false');
    const returned=await stage.getAttribute('data-distance');await page.waitForTimeout(500);expect(await stage.getAttribute('data-distance')).toBe(returned);
  }finally{await context.close();}
});
