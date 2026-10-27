import http from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
const root=resolve('.next-pages');const prefix='/landingpages/gabriel';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.txt':'text/plain','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');assert.ok(url.pathname.startsWith(prefix+'/'));
  let file=resolve(root,'.'+decodeURIComponent(url.pathname.slice(prefix.length)));assert.ok(file===root||file.startsWith(root+'/'));
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));
 }catch{res.statusCode=404;res.end('Not found')}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined});
try{
 await mkdir('test-results',{recursive:true});
 for(const width of [360,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(origin+prefix+'/');await page.getByRole('button',{name:'Explorar interativamente'}).click();await page.getByRole('button',{name:'03 Projetos'}).click();
  await expect(page.locator('.scene-copy')).toContainText('Ideias que podem ganhar forma');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'☷ Leitura',exact:true}).click();
  await page.locator('#projetos').getByRole('link',{name:'Ver conceito'}).first().click();
  await page.waitForURL('**/projetos/conceito-landing/');assert.ok((await page.locator('h1').textContent()).includes('Landing de serviço'));
  await page.getByRole('link',{name:'Voltar aos projetos'}).click();await page.waitForURL('**/#projetos');
  const icon=await page.locator('link[rel="icon"]').getAttribute('href');assert.equal(icon,prefix+'/favicon.svg');
  assert.equal((await page.request.get(origin+icon)).status(),200);
  await page.locator('.topbar').getByRole('link',{name:'Gabriel'}).click();await page.evaluate(()=>document.activeElement?.blur());await page.screenshot({path:`test-results/pages-${width}.png`});
  assert.deepEqual(errors,[]);console.log(`PASS: static Pages, ${width}px; navigation, assets, exploration, favicon, no runtime errors`);await page.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}
