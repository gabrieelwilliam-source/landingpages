import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

async function ready(page: any) {
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".spatial-loading")).toHaveCount(0,{timeout:15000});
}

test("orbit, camera-relative walking, pause, reset and accessible project filters", async ({page}) => {
  test.setTimeout(90000);
  page.on("pageerror",error=>{throw error});
  await page.setViewportSize({width:1440,height:900});
  await page.goto("/?chapter=servicos");
  await ready(page);
  await page.getByRole("checkbox",{name:"Movimento reduzido"}).check();
  await page.getByRole("button",{name:"Caminhar",exact:true}).click();
  const stage=page.locator(".world-stage");
  const distance=await stage.getAttribute("data-distance");
  await page.mouse.move(900,480);await page.mouse.down();
  await page.mouse.move(1060,540,{steps:6});await page.mouse.up();
  await expect.poll(async()=>Math.abs(Number(await stage.getAttribute("data-camera-yaw")))).toBeGreaterThan(.5);
  expect(await stage.getAttribute("data-distance")).toBe(distance);
  await expect.poll(async()=>Number(await stage.getAttribute("data-camera-pitch"))).toBeGreaterThan(.1);
  await mkdir("test-results/camera-gallery",{recursive:true});
  await page.screenshot({path:"test-results/camera-gallery/orbit-desktop.png"});
  await stage.focus();await page.keyboard.press("r");
  await expect(stage).toHaveAttribute("data-camera-yaw","0.000");
  await expect(stage).toHaveAttribute("data-camera-pitch","0.000");
  for(let i=0;i<3;i++)await page.keyboard.press("l");
  await page.keyboard.down("w");
  try {await expect.poll(async()=>Number(await stage.getAttribute("data-x"))).toBeGreaterThan(.15);}
  finally {await page.keyboard.up("w");}
  await page.getByRole("button",{name:"Pausar exploração"}).click();
  const yaw=await stage.getAttribute("data-camera-yaw");
  await stage.focus();await page.keyboard.press("j");
  expect(await stage.getAttribute("data-camera-yaw")).toBe(yaw);
  await expect(page.getByRole("button",{name:"Recentrar câmera"})).toBeDisabled();
  await page.getByRole("navigation",{name:"Atalhos para ambientes"}).getByRole("button").nth(3).click();
  await expect(stage).toHaveAttribute("data-area","projetos");
  await expect(stage).toHaveAttribute("data-camera-yaw","0.000");
  const open=page.locator(".spatial-editorial").getByRole("button",{name:/^Filtrar projetos/});
  await open.click();
  const modal=page.getByRole("dialog");
  await modal.getByRole("button",{name:"Portfólios",exact:true}).click();
  await expect(modal.locator(".project-card")).toHaveCount(1);
  await expect(modal.locator(".project-card h3")).toHaveText("Portfólio editorial");
  await expect(modal.getByRole("status")).toHaveText("1 projeto conceitual");
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:"test-results/camera-gallery/gallery-dialog.png"});
  await page.keyboard.press("Escape");await expect(open).toBeFocused();
  await page.getByRole("button",{name:"Modo clássico"}).click();
  const gallery=page.locator("#projetos");
  await gallery.getByRole("button",{name:"Landing pages",exact:true}).click();
  await expect(gallery.locator(".project-card")).toHaveCount(1);
  await expect(gallery.locator(".project-card h3")).toHaveText("Landing de serviço");
  await gallery.getByRole("button",{name:"Todos",exact:true}).click();
  await expect(gallery.locator(".project-card")).toHaveCount(3);
});

test("touch orbits without moving the visitor and reset is available on mobile",async({browser})=>{
  test.setTimeout(60000);
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{
    const page=await context.newPage();await page.goto("http://127.0.0.1:3000/?chapter=servicos");await ready(page);
    await page.getByRole("button",{name:"Caminhar",exact:true}).click();
    const stage=page.locator(".world-stage"),before=await stage.getAttribute("data-distance");
    const cdp=await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:300,y:470}]});
    await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:215,y:540}]});
    await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await expect.poll(async()=>Math.abs(Number(await stage.getAttribute("data-camera-yaw")))).toBeGreaterThan(.2);
    expect(await stage.getAttribute("data-distance")).toBe(before);
    await mkdir("test-results/camera-gallery",{recursive:true});
    await page.screenshot({path:"test-results/camera-gallery/orbit-mobile.png"});
    const reset=page.getByRole("button",{name:"Recentrar câmera"});await expect(reset).toBeInViewport();await reset.click();
    await expect(stage).toHaveAttribute("data-camera-yaw","0.000");
  }finally{await context.close();}
});
