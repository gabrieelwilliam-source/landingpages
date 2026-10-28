import {reduceMotion,graphics,options} from './studio-options';
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("office graphic tiers change raster budget and all six interiors render", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("response", r => { if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".spatial-loading")).toHaveCount(0, { timeout: 30000 });
  await expect(page.locator(".world-stage")).toHaveAttribute("data-loaded", "6", { timeout: 30000 });
  const quality = page.getByLabel("Gráficos", { exact: true });
  await graphics(page,"low");
  await expect(page.locator(".world-stage")).toHaveAttribute("data-quality", "low");
  const lowWidth = await page.locator("canvas").evaluate(c => (c as HTMLCanvasElement).width);
  await graphics(page,"high");
  await expect(page.locator(".world-stage")).toHaveAttribute("data-quality", "high");
  await expect.poll(() => page.locator("canvas").evaluate(c => (c as HTMLCanvasElement).width), { timeout: 10000 }).toBeGreaterThan(lowWidth);
  await reduceMotion(page);
  const shots = "test-results/office-review";
  await mkdir(shots, { recursive: true });
  const zones = page.getByRole("navigation", { name: "Atalhos para ambientes" }).getByRole("button");
  for(let i=0;i<6;i++) {
    await zones.nth(i).click();
    await expect(page.locator(".spatial-kicker")).toContainText(`0${i+1}`);
    await expect(page.locator(".spatial-progress")).not.toContainText("Em travessia");
    await page.screenshot({path:`${shots}/office-${i+1}-1440.png`});
  }
  await zones.nth(0).click();
  await expect(page.locator(".spatial-kicker")).toContainText("01");
  await page.getByRole("button", {name:"Caminhar",exact:true}).click();
  const stage=page.locator(".world-stage");
  await stage.focus();
  // Actual browser capture of the face; a 628px drag turns the camera about pi.
  await page.mouse.move(1300,550);await page.mouse.down();
  await page.mouse.move(672,550,{steps:8});await page.mouse.up();
  await expect.poll(async()=>Math.abs(Number(await stage.getAttribute("data-camera-yaw")))).toBeGreaterThan(3);
  await page.screenshot({path:`${shots}/office-character-front.png`});
  await page.getByRole("button",{name:"Recentrar câmera"}).click();
  await page.getByRole("button", {name:"Scroll",exact:true}).click();
  await page.setViewportSize({width:1366,height:768});
  await page.screenshot({path:`${shots}/office-portal-1366.png`});
  await page.setViewportSize({width:390,height:844});
  await options(page,true);await expect(quality).toBeInViewport();await options(page,false);
  await graphics(page,"low");
  await page.screenshot({path:`${shots}/office-portal-390.png`});
  await zones.nth(2).click();
  await expect(page.locator(".spatial-kicker")).toContainText("03");
  await page.screenshot({path:`${shots}/office-studio-390.png`});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
