import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const output=process.argv[2];if(!output)throw Error('Pass review output directory');await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[],chairs=process.argv.includes('--chairs');
for(const [mode,width,height] of (chairs?[['office',1280,900],['chaircompare',1440,1000],['office',390,844]]:[['raw',1280,900],['high',1280,900],['low',1280,900],['compare',1440,1000],['low',390,844]])){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(`http://127.0.0.1:8094/?mode=${mode}`);await page.waitForFunction(()=>window.review?.ready,{},{timeout:60000});await page.waitForFunction(()=>window.review?.benchmark,{},{timeout:60000});
 await page.screenshot({path:`${output}/palm-${mode}-${width}.png`});results.push({mode,width,height,...await page.evaluate(()=>{const {renderer,...data}=window.review;return data}),errors});await page.close();
}
await browser.close();await writeFile(`${output}/${chairs?'chair-':''}browser-results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));if(results.some(r=>r.errors.length))process.exitCode=1;
