import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async({page})=>{page.on('pageerror',error=>{throw error})});
for(const width of [360,768,1440])test(`layout and accessibility at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.screenshot({path:`test-results/leitura-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'◈ Explorar',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.screenshot({path:`test-results/explorar-${width}.png`,fullPage:true});
});
test('movement, collisions, jump, checkpoints, pause and context',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Explorar interativamente'}).click();const game=page.getByRole('region',{name:'Percurso jogável'});await game.focus();
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(1400);await page.keyboard.up('ArrowRight');
 const x=()=>page.locator('.walker').evaluate(e=>parseFloat((e as HTMLElement).style.left));
 expect(await x()).toBeCloseTo(322,0);
 await page.keyboard.press('Space');await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.up('d');expect(await x()).toBeGreaterThan(400);await expect(page.locator('.scene-copy')).toContainText('Do conceito à interface');
 await page.getByRole('button',{name:'04 Processo'}).click();await expect(page.locator('.scene-copy')).toContainText('Clareza em cada etapa');
 await page.getByRole('button',{name:'Pausar',exact:true}).click();const before=await x();await game.focus();await page.keyboard.down('d');await page.waitForTimeout(200);await page.keyboard.up('d');expect(await x()).toBe(before);
 await page.getByRole('button',{name:'☷ Leitura',exact:true}).click();await expect(page.locator('#processo')).toBeInViewport();
 await page.getByRole('button',{name:'◈ Explorar',exact:true}).click();await expect(page.locator('.scene-copy')).toContainText('Clareza em cada etapa');
});
test('local contact validates without network submission',async({page})=>{
 await page.goto('/#contato');const form=page.locator('form');await form.getByRole('button').click();await expect(page.getByRole('status')).toHaveCount(0);
 await page.getByLabel('Seu nome').fill('Pessoa Teste');await page.getByLabel('E-mail',{exact:true}).fill('pessoa@example.com');await page.getByLabel('O que você quer construir?').fill('Quero uma landing page para apresentar meu novo serviço.');
 const sent:string[]=[];page.on('request',r=>{if(r.method()==='POST')sent.push(r.url())});await form.getByRole('button').click();await expect(page.getByRole('status')).toContainText('não enviado');expect(sent).toEqual([]);
});
test('concept cases, 404, metadata and no photo exposure',async({page,request})=>{
 for(const slug of ['conceito-landing','conceito-portfolio','conceito-site']){await page.goto(`/projetos/${slug}`);await expect(page.getByText('PROJETO CONCEITUAL / SEM CLIENTE REAL')).toBeVisible();expect((await new AxeBuilder({page}).analyze()).violations).toEqual([])}
 expect((await request.get('/projetos/inexistente')).status()).toBe(404);expect((await request.get('/public_gabriel_foto_original.jpg')).status()).toBe(404);
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('lang','pt-BR');await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content',/Gabriel/);
});
test('reduced motion and touch controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:360,height:800});await page.goto('/');await page.getByRole('button',{name:'Explorar interativamente'}).click();
 const right=page.getByRole('button',{name:'Andar à direita'});await right.scrollIntoViewIfNeeded();const box=await right.boundingBox();if(!box)throw new Error('Controle ausente');await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(200);await page.mouse.move(350,20);await page.mouse.up();
 expect(await page.locator('.walker').evaluate(e=>parseFloat((e as HTMLElement).style.left))).toBeGreaterThan(40);
 expect(await page.locator('.avatar-body').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
});
test('reading and concept content work with JavaScript disabled',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:3000/');await expect(page.locator('#servicos')).toContainText('Landing pages');await page.locator('#projetos').getByRole('link',{name:'Ver conceito'}).first().click();await expect(page.getByRole('heading',{level:1})).toHaveText('Landing de serviço');await context.close();
});
