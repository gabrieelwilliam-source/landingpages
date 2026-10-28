import {reduceMotion,graphics} from './studio-options';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir} from 'node:fs/promises';
async function ready(page:any){await expect(page.locator('.spatial-loading')).toHaveCount(0,{timeout:30000});await expect(page.locator('canvas')).toHaveCount(1);await expect.poll(async()=>Number(await page.locator('.world-stage').getAttribute('data-npcs-loaded')),{timeout:20000}).toBeGreaterThan(0);}
const states=async(page:any)=>JSON.parse(await page.locator('.world-stage').getAttribute('data-npc-states')||'[]');
test('fictional receptionist animates, pauses and opens a useful keyboard interaction',async({page})=>{
 test.setTimeout(90000);await page.goto('/');await ready(page);const stage=page.locator('.world-stage');
 const initial=(await states(page)).find((n:any)=>n.id==='recepcao');expect(initial.clip).toBe('Type');
 await expect.poll(async()=>((await states(page)).find((n:any)=>n.id==='recepcao')?.time||0)).toBeGreaterThan(initial.time+.2);
 await page.getByRole('button',{name:'Pausar exploração'}).click();await expect(stage).toHaveAttribute('data-paused','true');
 const frozen=await stage.getAttribute('data-npc-states');await page.waitForTimeout(650);expect(await stage.getAttribute('data-npc-states')).toBe(frozen);
 await page.getByRole('button',{name:'Continuar exploração'}).click();await expect(stage).toHaveAttribute('data-paused','false');
 await expect(stage).toHaveAttribute('data-nearby','npc-recepcao');await stage.focus();await page.keyboard.press('e');
 const dialog=page.getByRole('dialog');await expect(dialog).toContainText('Lia');await expect(dialog).toContainText('PERSONAGEM FICTÍCIO');await expect(dialog.getByRole('button',{name:'Visita guiada',exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await mkdir('test-results/full-studio',{recursive:true});await page.screenshot({path:'test-results/full-studio/reception-dialog.png'});
 await page.keyboard.press('Escape');await expect(stage).toBeFocused();await expect(stage).toHaveAttribute('data-paused','false');
});
test('all six sectors have a scripted interaction and render real inhabited interiors',async({page})=>{
 test.setTimeout(180000);await page.setViewportSize({width:1440,height:900});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto('/');await ready(page);await reduceMotion(page);await graphics(page,'high');
 await mkdir('test-results/full-studio',{recursive:true});const zones=page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button');
 for(let i=0;i<6;i++){
  await zones.nth(i).click();await expect(page.locator('.spatial-kicker')).toContainText(`0${i+1}`);await expect(page.locator('.spatial-progress')).not.toContainText('Em travessia');
  await expect.poll(async()=>Number(await page.locator('.world-stage').getAttribute('data-npc-count')),{timeout:20000}).toBeGreaterThan(0);
  await page.screenshot({path:`test-results/full-studio/sector-${i+1}-1440.png`});
  await page.locator('.studio-area-assistant').click();await expect(page.getByRole('dialog')).toContainText('ORIENTAÇÃO ROTEIRIZADA LOCAL');
  await page.keyboard.press('Escape');
 }
 await page.setViewportSize({width:390,height:844});await zones.nth(0).click();await expect(page.locator('.spatial-kicker')).toContainText('01');await page.screenshot({path:'test-results/full-studio/reception-390.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('all four automation demos change local state and never send requests',async({page})=>{
 test.setTimeout(90000);const posts:string[]=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});await page.goto('/?chapter=processo');await ready(page);
 await page.locator('.studio-area-assistant').click();const demo=page.getByRole('region',{name:'Simulador local de automações'});
 for(const kind of ['clinic','property','salon','marketing']){
  await demo.getByLabel('Área da demonstração').selectOption(kind);await demo.getByLabel('Exemplo',{exact:true}).selectOption({index:1});
  await demo.getByRole('button',{name:'Iniciar simulação',exact:true}).click();await expect(demo.getByRole('status')).toContainText('Etapa 1 concluída');
  await demo.getByRole('button',{name:'Avançar etapa'}).click();await demo.getByRole('button',{name:'Avançar etapa'}).click();await expect(demo.getByRole('status')).toContainText('Nenhum dado foi enviado');
  await expect(demo.getByRole('button',{name:'Avançar etapa'})).toBeDisabled();await demo.getByRole('button',{name:'Reiniciar simulação'}).click();await expect(demo.getByRole('status')).toHaveText('Pronto para simular.');
 }
 expect(posts).toEqual([]);
});
test('distance, shoulder and obstacle-aware reconnect preserve anchored reversible scroll',async({page})=>{
 test.setTimeout(90000);await page.goto('/?chapter=servicos');await ready(page);await reduceMotion(page);await page.getByRole('button',{name:'Caminhar',exact:true}).click();
 const stage=page.locator('.world-stage');await page.getByRole('button',{name:'Câmera e ajuda'}).click();
 await page.getByLabel('Distância da câmera',{exact:true}).fill('8');await page.getByLabel('Ombro da câmera',{exact:true}).selectOption('1.2');await expect(stage).toHaveAttribute('data-camera-distance','8');await expect(stage).toHaveAttribute('data-camera-shoulder','1.2');
 await page.getByRole('button',{name:'Câmera e ajuda'}).click();await stage.focus();await page.keyboard.down('d');
 try{await expect.poll(async()=>Number(await stage.getAttribute('data-x'))).toBeGreaterThan(1.3);}finally{await page.keyboard.up('d');}
 await page.getByRole('button',{name:'Scroll',exact:true}).click();await expect(stage).toHaveAttribute('data-reconnecting','true');await expect(stage).toHaveAttribute('data-reconnecting','false',{timeout:20000});await expect(stage).toHaveAttribute('data-navigation','scroll');
 const avatar=await stage.getAttribute('data-avatar-z'),distance=Number(await stage.getAttribute('data-distance'));
 await page.mouse.move(900,500);await page.mouse.wheel(0,500);await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(distance+.5);expect(await stage.getAttribute('data-avatar-z')).toBe(avatar);
 await page.mouse.wheel(0,-500);await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeLessThan(distance+.5);expect(await stage.getAttribute('data-avatar-z')).toBe(avatar);
});
test('briefing assistant preserves an existing draft and the classic mode exposes the same content',async({page})=>{
 test.setTimeout(90000);await page.goto('/?chapter=contato');await ready(page);await page.locator('.studio-area-assistant').click();const dialog=page.getByRole('dialog');
 await dialog.getByLabel('O que você quer construir?').fill('Texto existente que precisa ser preservado.');await dialog.getByLabel('Tipo de projeto').selectOption('Automação');await dialog.getByRole('button',{name:'Adicionar ao rascunho'}).click();await expect(dialog.getByLabel('O que você quer construir?')).toHaveValue(/Texto existente.*\n\nProjeto: Automação/);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Modo clássico'}).click();await expect(page.locator('#contato').getByLabel('O que você quer construir?')).toHaveValue(/Texto existente/);
 const cast=page.getByRole('region',{name:'Equipe virtual demonstrativa'});await cast.getByText('Rui · Laboratório virtual',{exact:true}).click();await cast.getByRole('link',{name:'Executar simulação local'}).click();await expect(page.locator('#zaion').getByRole('region',{name:'Simulador local de automações'})).toBeVisible();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});
test('close reception view and real touch interaction remain usable on mobile',async({page,browser})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1440,height:900});await page.goto('/');await ready(page);
 await reduceMotion(page);await graphics(page,'high');await page.getByRole('button',{name:'Caminhar',exact:true}).click();
 await page.getByRole('button',{name:'Câmera e ajuda'}).click();await page.getByLabel('Distância da câmera',{exact:true}).fill('3.8');await page.getByLabel('Ombro da câmera',{exact:true}).selectOption('0');await page.getByRole('button',{name:'Câmera e ajuda'}).click();
 const stage=page.locator('.world-stage');await stage.focus();await page.keyboard.down('a');try{await expect.poll(async()=>Number(await stage.getAttribute('data-x'))).toBeLessThan(-1.5);}finally{await page.keyboard.up('a');}
 await page.keyboard.down('w');try{await expect.poll(async()=>Number(await stage.getAttribute('data-distance'))).toBeGreaterThan(1.8);}finally{await page.keyboard.up('w');}
 for(let i=0;i<4;i++)await page.keyboard.press('j');await expect.poll(async()=>Number(await stage.getAttribute('data-camera-yaw'))).toBeGreaterThan(.7);
 await mkdir('test-results/full-studio',{recursive:true});await page.screenshot({path:'test-results/full-studio/reception-close-1440.png'});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{const mobile=await context.newPage();await mobile.goto('http://127.0.0.1:3000/');await ready(mobile);await mobile.getByRole('button',{name:/Conversar com Lia/}).tap();await expect(mobile.getByRole('dialog')).toContainText('Lia');await mobile.screenshot({path:'test-results/full-studio/reception-touch-dialog.png'});await mobile.getByRole('button',{name:'Fechar painel'}).tap();await expect(mobile.getByRole('dialog')).toHaveCount(0);}finally{await context.close();}
});

test('quality swaps actual skinned LODs and preserves the active rig',async({page})=>{
 test.setTimeout(60000);await page.goto('/');await ready(page);const stage=page.locator('.world-stage');
 await reduceMotion(page);
 await graphics(page,'low');await expect(stage).toHaveAttribute('data-avatar-lod','low',{timeout:20000});
 const light=Number(await stage.getAttribute('data-triangles'));await graphics(page,'high');
 await expect(stage).toHaveAttribute('data-avatar-lod','high');await expect.poll(async()=>Number(await stage.getAttribute('data-triangles'))).toBeGreaterThan(light+10000);
 await expect(stage).toHaveAttribute('data-rig-bones','16');await graphics(page,'medium');await expect(stage).toHaveAttribute('data-avatar-lod','high');
});

test('advanced options stay in a secondary menu on desktop and mobile',async({page})=>{
 test.setTimeout(60000);
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.goto('/');await ready(page);
  await expect(page.getByLabel('Gráficos',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('checkbox',{name:'Movimento reduzido'})).toHaveCount(0);
  await page.getByRole('button',{name:'Câmera e ajuda'}).click();
  await expect(page.getByLabel('Gráficos',{exact:true})).toBeInViewport();
  await expect(page.getByRole('checkbox',{name:'Movimento reduzido'})).toBeInViewport();
  await page.getByRole('button',{name:'Câmera e ajuda'}).click();
  await expect(page.getByLabel('Gráficos',{exact:true})).toHaveCount(0);
 }
});
test('a nearby development monitor opens the existing project demonstration',async({page})=>{
 test.setTimeout(60000);await page.goto('/?chapter=servicos');await ready(page);await reduceMotion(page);
 await page.getByRole('button',{name:'Caminhar',exact:true}).click();const stage=page.locator('.world-stage');await stage.focus();
 await page.keyboard.down('d');try{await expect.poll(async()=>Number(await stage.getAttribute('data-x'))).toBeGreaterThan(2.25);}finally{await page.keyboard.up('d');}
 await expect(stage).toHaveAttribute('data-nearby',/workstation-/);await stage.focus();await page.keyboard.press('e');
 const link=page.getByRole('dialog').getByRole('link',{name:'Abrir demonstração do projeto'});await expect(link).toBeVisible();
 await link.click();await expect(page).toHaveURL(/projetos\/conceito-portfolio/);await expect(page.locator('h1')).toContainText('Portfólio editorial');
});

test('detailed characters remain inspectable with the closer collision-aware camera',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1440,height:900});await page.goto('/');await ready(page);await reduceMotion(page);await graphics(page,'high');
 await page.getByRole('button',{name:'Caminhar',exact:true}).click();await page.getByRole('button',{name:'Câmera e ajuda'}).click();
 await page.getByLabel('Distância da câmera',{exact:true}).fill('2.2');await page.getByLabel('Ombro da câmera',{exact:true}).selectOption('0');await page.getByRole('button',{name:'Câmera e ajuda'}).click();
 const stage=page.locator('.world-stage');await expect(stage).toHaveAttribute('data-camera-distance','2.2');
 await page.mouse.move(1300,550);await page.mouse.down();await page.mouse.move(672,500,{steps:8});await page.mouse.up();
 await expect.poll(async()=>Math.abs(Number(await stage.getAttribute('data-camera-yaw')))).toBeGreaterThan(3);
 await page.getByRole('button',{name:'Pausar exploração'}).click();await page.waitForTimeout(400);
 await page.screenshot({path:'test-results/full-studio/character-detail-high.png'});
 await graphics(page,'low');await expect(stage).toHaveAttribute('data-avatar-lod','low');await page.screenshot({path:'test-results/full-studio/character-detail-low.png'});
 await expect(stage).toHaveAttribute('data-rig-bones','16');
});
