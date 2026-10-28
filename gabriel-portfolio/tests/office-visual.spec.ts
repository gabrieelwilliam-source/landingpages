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
  await quality.selectOption("low");
  await expect(page.locator(".world-stage")).toHaveAttribute("data-quality", "low");
  const lowWidth = await page.locator("canvas").evaluate(c => (c as HTMLCanvasElement).width);
  await quality.selectOption("high");
  await expect(page.locator(".world-stage")).toHaveAttribute("data-quality", "high");
  await expect.poll(() => page.locator("canvas").evaluate(c => (c as HTMLCanvasElement).width), { timeout: 10000 }).toBeGreaterThan(lowWidth);
  await page.getByRole("checkbox", { name: "Movimento reduzido" }).check();
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
  await page.setViewportSize({width:1366,height:768});
  await page.screenshot({path:`${shots}/office-portal-1366.png`});
  await page.setViewportSize({width:390,height:844});
  await expect(quality).toBeInViewport();
  await quality.selectOption("low");
  await page.screenshot({path:`${shots}/office-portal-390.png`});
  await zones.nth(2).click();
  await expect(page.locator(".spatial-kicker")).toContainText("03");
  await page.screenshot({path:`${shots}/office-studio-390.png`});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
