import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const world = (p: any) => p.locator(".world-stage");
async function ready(p: any) {
  await expect(p.locator("canvas")).toHaveCount(1);
  await expect(p.locator(".spatial-loading")).toHaveCount(0);
}
test.beforeEach(async ({ page }) => {
  page.on("pageerror", (e) => {
    throw e;
  });
});
for (const width of [360, 390, 1280, 1440])
  test(`six chapters, layout and accessibility ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 900 });
    await page.goto("/");
    await ready(page);
    await expect
      .poll(async () =>
        Number(await world(page).getAttribute("data-rig-bones")),
      )
      .toBeGreaterThan(10);
    expect(
      await page
        .getByRole("navigation", { name: "Atalhos para ambientes" })
        .getByRole("button")
        .count(),
    ).toBe(6);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/final-portal-${width}.png` });
    await page.getByRole("button", { name: "Modo clássico" }).click();
    await expect(page.locator("#inicio")).toBeInViewport();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
test("scroll moves world while avatar and camera stay anchored; guided walking moves avatar", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  const anchor = await world(page).getAttribute("data-avatar-z"),
    camera = await world(page).getAttribute("data-camera-z");
  await page.mouse.move(800, 400);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(async () => Number(await world(page).getAttribute("data-world-z")))
    .toBeGreaterThan(1);
  expect(await world(page).getAttribute("data-avatar-z")).toBe(anchor);
  expect(await world(page).getAttribute("data-camera-z")).toBe(camera);
  await page.mouse.wheel(0, -640);
  await expect(world(page)).toHaveAttribute("data-distance", "0.000", {
    timeout: 10000,
  });
  await page.getByRole("button", { name: "Caminhar", exact: true }).click();
  await expect(world(page)).toHaveAttribute("data-navigation", "walk");
  await world(page).focus();
  await page.keyboard.down("w");
  await expect
    .poll(async () => Number(await world(page).getAttribute("data-avatar-z")))
    .toBeLessThan(-1);
  await expect(world(page)).toHaveAttribute("data-animation", "Walk");
  await page.keyboard.up("w");
});
test("all six architectural destinations, panels, concepts, navigation history and pause", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  await ready(page);
  const buttons = page
    .getByRole("navigation", { name: "Atalhos para ambientes" })
    .getByRole("button");
  for (let i = 0; i < 6; i++) {
    await buttons.nth(i).click();
    await expect(page.locator(".spatial-kicker")).toContainText(`0${i + 1}`);
    await expect(page.locator(".spatial-progress")).not.toContainText(
      "Em travessia",
      { timeout: 10000 },
    );
    await expect
      .poll(async () => Number(await world(page).getAttribute("data-loaded")))
      .toBeGreaterThanOrEqual(i + 1);
    await page.screenshot({ path: `test-results/final-room-${i + 1}.png` });
  }
  await page
    .getByRole("button", { name: "Preparar um projeto", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("canais oficiais");
  await page.keyboard.press("Escape");
  await buttons.nth(3).click();
  await expect(world(page)).toHaveAttribute("data-area", "projetos");
  await page
    .getByRole("button", { name: "Landing de serviço", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Projeto conceitual");
  await expect(
    page.getByRole("link", { name: "Ver projeto conceitual" }),
  ).toHaveAttribute("href", /conceito-landing/);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Pausar exploração" }).click();
  await expect(world(page)).toHaveAttribute("data-paused", "true");
  const d = await world(page).getAttribute("data-distance");
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(250);
  expect(await world(page).getAttribute("data-distance")).toBe(d);
  await page.goto("/?chapter=processo");
  await ready(page);
  await expect(world(page)).toHaveAttribute("data-area", "processo");
  await buttons.nth(5).click();
  await expect(world(page)).toHaveAttribute("data-area", "contato");
  await page.goBack();
  await expect(world(page)).toHaveAttribute("data-area", "processo");
});
test("reduced motion defaults to classic and WebGL failure recovers", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#servicos")).toContainText("Landing pages");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const old = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      t: string,
      ...args: any[]
    ) {
      if (t.startsWith("webgl")) return null;
      return old.apply(this, [t, ...args] as any);
    } as any;
  });
  await page.goto("/");
  await expect(page.locator(".spatial-fallback")).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar no modo clássico" })
    .click();
  await expect(page.locator("canvas")).toHaveCount(0);
});
test("mobile touch moves the world, native contact and reading without JS remain available", async ({
  browser,
}) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:3000");
  await ready(p);
  const z = await world(p).getAttribute("data-avatar-z");
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: 300, y: 480 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: 300, y: 350 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () => Number(await world(p).getAttribute("data-world-z")))
    .toBeGreaterThan(0.3);
  expect(await world(p).getAttribute("data-avatar-z")).toBe(z);
  await ctx.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const page = await plain.newPage();
  await page.goto("http://127.0.0.1:3000");
  await expect(page.locator("#projetos")).toContainText("Conceito");
  await expect(page.locator("#contato")).toContainText("nada será enviado");
  await plain.close();
});
test("record measured animation performance during active scene scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 760 });
  await page.goto("/");
  await ready(page);
  const sample = await page.evaluate(async () => {
    const frames: number[] = [];
    let last = performance.now();
    const start = last;
    const ticker = setInterval(
      () =>
        document.querySelector(".world-stage")?.dispatchEvent(
          new WheelEvent("wheel", {
            deltaY: 100,
            bubbles: true,
            cancelable: true,
          }),
        ),
      180,
    );
    await new Promise<void>((resolve) => {
      function frame(t: number) {
        frames.push(t - last);
        last = t;
        if (t - start < 3000) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
    clearInterval(ticker);
    const sorted = frames.slice().sort((a, b) => a - b);
    return {
      viewport: [innerWidth, innerHeight],
      frames: frames.length,
      elapsedMs: last - start,
      averageFps: (frames.length / (last - start)) * 1000,
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      userAgent: navigator.userAgent,
      jsHeapBytes: (performance as any).memory?.usedJSHeapSize ?? null,
      encodedResourceBytes: performance
        .getEntriesByType("resource")
        .reduce(
          (n, r) => n + (r as PerformanceResourceTiming).encodedBodySize,
          0,
        ),
      drawCalls: document
        .querySelector(".world-stage")
        ?.getAttribute("data-draw-calls"),
      triangles: document
        .querySelector(".world-stage")
        ?.getAttribute("data-triangles"),
    };
  });
  await import("node:fs/promises").then((fs) =>
    fs.writeFile(
      "test-results/performance.json",
      JSON.stringify(sample, null, 2),
    ),
  );
  expect(sample.frames).toBeGreaterThan(0);
});

test("portrait dialogs scroll independently and landscape keeps controls and original logo usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?chapter=servicos");
  await ready(page);
  await page
    .getByRole("button", { name: "Explorar serviços", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const distance = await world(page).getAttribute("data-distance");
  await dialog.hover();
  await page.mouse.wheel(0, 500);
  await expect
    .poll(() => dialog.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await world(page).getAttribute("data-distance")).toBe(distance);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Explorar serviços", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 844, height: 390 });
  await page
    .getByRole("navigation", { name: "Atalhos para ambientes" })
    .getByRole("button")
    .nth(4)
    .click();
  await expect(world(page)).toHaveAttribute("data-area", "processo");
  for (const name of [
    "Modo clássico",
    "Pausar exploração",
    "Scroll",
    "Caminhar",
    "Conhecer o processo",
  ]) {
    await expect(
      page.getByRole("button", { name: new RegExp(`^${name}`) }),
    ).toBeInViewport();
  }
  await page
    .getByRole("button", { name: "Conhecer o processo", exact: true })
    .click();
  const logo = page.getByRole("img", {
    name: "zAIon Automações — logo original",
  });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((img) => (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/final-landscape-dialog.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Fechar painel" }).click();
  await page.getByRole("navigation", { name: "Atalhos para ambientes" }).getByRole("button").nth(5).click();
  await expect(page.getByRole("button", { name: "Preparar resumo local", exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Visitar galeria", exact: true })).toBeInViewport();
  const actions = await page.locator(".destination-actions").boundingBox();
  const footer = await page.locator(".journey-bottom").boundingBox();
  expect(actions!.y + actions!.height).toBeLessThan(footer!.y);
  await page.screenshot({ path: "test-results/final-landscape-contact.png" });
});
