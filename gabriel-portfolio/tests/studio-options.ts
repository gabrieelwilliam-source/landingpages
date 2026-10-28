import type {Page} from '@playwright/test';
export async function options(page:Page,show:boolean){
 const button=page.getByRole('button',{name:'Câmera e ajuda'});
 if((await button.getAttribute('aria-expanded')==='true')!==show)await button.click();
}
export async function reduceMotion(page:Page){await options(page,true);await page.getByRole('checkbox',{name:'Movimento reduzido'}).check();await options(page,false);}
export async function graphics(page:Page,value:string){await options(page,true);await page.getByLabel('Gráficos',{exact:true}).selectOption(value);await options(page,false);}
export async function jump(page:Page,index:number){await options(page,true);await page.getByRole('navigation',{name:'Atalhos para ambientes'}).getByRole('button').nth(index).click();}
export async function area(page:Page){const button=page.locator('.area-disclosure');if(await button.getAttribute('aria-expanded')!=='true')await button.click();}
