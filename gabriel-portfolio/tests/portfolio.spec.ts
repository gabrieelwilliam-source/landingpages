import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => {
    throw error;
  });
});
const stage = (page: Page) =>
  page.getByRole("region", { name: "Jornada espacial em terceira pessoa" });
async function ready(page: Page) {
  await expect(page.locator(".spatial-loading")).toHaveCount(0, {
    timeout: 15000,
  });
  await expect(page.locator("canvas")).toHaveCount(1);
}
async function distance(page: Page) {
  return Number(await stage(page).getAttribute("data-distance"));
}
for (const width of [360, 768, 1440])
  test(`spatial and classic layout/accessibility at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await ready(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Código em perspectiva.",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/spatial-atrium-${width}.png` });
    await page.getByRole("button", { name: "Modo clássico" }).click();
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("#sobre")).toBeInViewport();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: `test-results/classic-${width}.png`,
      fullPage: true,
    });
  });
test("WASD moves depth and camera, scroll does not drive the world, focus and pause clear input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/");
  await ready(page);
  const region = stage(page);
  await region.focus();
  await page.mouse.wheel(0, 1200);
  expect(await distance(page)).toBe(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  const camera = Number(await region.getAttribute("data-camera-z"));
  await page.keyboard.down("w");
  await expect.poll(() => distance(page)).toBeGreaterThan(1);
  await page.keyboard.up("w");
  await expect
    .poll(async () => Number(await region.getAttribute("data-camera-z")))
    .toBeLessThan(camera - 0.2);
  await page.keyboard.down("d");
  await expect
    .poll(async () => Number(await region.getAttribute("data-x")))
    .toBeGreaterThan(0.2);
  await page.keyboard.up("d");
  await page.keyboard.press("p");
  await expect(
    page.getByRole("button", { name: "Continuar exploração" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(region).toHaveAttribute("data-paused", "true");
  const stopped = await distance(page);
  await page.keyboard.down("w");
  await page.waitForTimeout(250);
  expect(await distance(page)).toBe(stopped);
  await page.keyboard.up("w");
  await page.getByRole("button", { name: "Continuar exploração" }).click();
  await region.focus();
  await page.keyboard.down("s");
  await expect.poll(() => distance(page)).toBeLessThan(stopped - 0.2);
  await page.keyboard.up("s");
  await page.getByRole("button", { name: "Pausar exploração" }).focus();
  const blurStop = await distance(page);
  await page.waitForTimeout(700);
  expect(Math.abs((await distance(page)) - blurStop)).toBeLessThan(0.7);
});
test("two connected rooms, progressive loading, cinematic shortcuts, physical return and preserved context", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/");
  await ready(page);
  await expect(stage(page)).toHaveAttribute("data-loaded", "1");
  expect(
    await page
      .getByRole("navigation", { name: "Atalhos para ambientes" })
      .getByRole("button")
      .count(),
  ).toBe(2);
  await page.getByRole("button", { name: "02 Atelier digital" }).click();
  await expect(stage(page)).toHaveAttribute("data-area", "servicos", {
    timeout: 12000,
  });
  await expect(stage(page)).toHaveAttribute("data-distance", "49.000", {
    timeout: 12000,
  });
  await expect(stage(page)).toHaveAttribute("data-loaded", "2");
  await expect(page.locator(".spatial-editorial h1")).toHaveText(
    "Ideias em construção.",
  );
  await page.waitForTimeout(600);
  await page.screenshot({ path: "test-results/spatial-workshop-900.png" });
  expect(
    Number(await stage(page).getAttribute("data-draw-calls")),
  ).toBeLessThan(180);
  expect(Number(await stage(page).getAttribute("data-triangles"))).toBeLessThan(
    15000,
  );
  await page.getByRole("button", { name: "Modo clássico" }).click();
  await expect(page.locator("#servicos")).toBeInViewport();
  await page.getByRole("button", { name: "Voltar à jornada 3D" }).click();
  await ready(page);
  await expect(stage(page)).toHaveAttribute("data-area", "servicos");
  await stage(page).focus();
  await page.keyboard.down("s");
  await expect(stage(page)).toHaveAttribute("data-area", "sobre", {
    timeout: 25000,
  });
  await page.keyboard.up("s");
  await page.getByRole("button", { name: "01 Átrio de ideias" }).click();
  await expect(stage(page)).toHaveAttribute("data-distance", "4.000", {
    timeout: 12000,
  });
});
test("in-scene panels are real dialogs, keyboard accessible and pause movement", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await expect(
    page.getByRole("button", { name: "Abrir: Conhecer Gabriel", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Abrir: Conhecer Gabriel", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Código com intenção." }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  const before = await distance(page);
  await page.keyboard.press("w");
  expect(await distance(page)).toBe(before);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(stage(page)).toBeFocused();
  await page.getByRole("button", { name: "02 Atelier digital" }).click();
  await expect(stage(page)).toHaveAttribute("data-distance", "49.000", {
    timeout: 12000,
  });
  await page
    .getByRole("button", { name: "Explorar serviços", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Landing pages");
});
test("reduced motion makes cinematic travel immediate; pointer release outside control stops walking", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await ready(page);
  await expect(
    page.getByRole("checkbox", { name: "Movimento reduzido" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "02 Atelier digital" }).click();
  await expect(stage(page)).toHaveAttribute("data-distance", "49.000");
  await expect
    .poll(async () => Number(await stage(page).getAttribute("data-camera-z")))
    .toBeCloseTo(-40.6, 1);
  const forward = page.getByRole("button", { name: "Caminhar para frente" });
  const b = await forward.boundingBox();
  if (!b) throw Error("Missing control");
  await stage(page).focus();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await expect.poll(() => distance(page)).toBeGreaterThan(49.3);
  await page.mouse.move(350, 50);
  await page.mouse.up();
  await page.waitForTimeout(900);
  const stopped = await distance(page);
  await page.waitForTimeout(400);
  expect(Math.abs((await distance(page)) - stopped)).toBeLessThan(0.06);
});
test("contact validates locally and user can type without moving the world", async ({
  page,
}) => {
  await page.goto("/#contato");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.locator("form").getByRole("button").click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByLabel("Seu nome").fill("Pessoa Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("pessoa@example.com");
  await page
    .getByLabel("O que você quer construir?")
    .fill("Quero uma landing page para apresentar meu novo serviço.");
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") sent.push(r.url());
  });
  await page.locator("form").getByRole("button").click();
  await expect(page.getByRole("status")).toContainText("não enviado");
  expect(sent).toEqual([]);
});
test("WebGL unavailable offers complete classic fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".spatial-fallback")).toContainText(
    "3D não está disponível",
    { timeout: 15000 },
  );
  await page
    .getByRole("button", { name: "Continuar no modo clássico" })
    .click();
  await expect(page.locator("#sobre")).toBeInViewport();
  await expect(page.locator("#projetos")).toContainText("Ver conceito");
});
test("classic with JS disabled, concepts, metadata and private photo", async ({
  browser,
  page,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto("http://127.0.0.1:3000/");
  await expect(plain.locator("#servicos")).toContainText("Landing pages");
  await plain
    .locator("#projetos")
    .getByRole("link", { name: "Ver conceito" })
    .first()
    .click();
  await expect(plain.locator("h1")).toHaveText("Landing de serviço");
  await context.close();
  for (const slug of [
    "conceito-landing",
    "conceito-portfolio",
    "conceito-site",
  ]) {
    await page.goto(`/projetos/${slug}`);
    await expect(
      page.getByText("PROJETO CONCEITUAL / SEM CLIENTE REAL"),
    ).toBeVisible();
  }
  expect(
    (await request.get("/public_gabriel_foto_original.jpg")).status(),
  ).toBe(404);
  expect((await request.get("/projetos/inexistente")).status()).toBe(404);
});
test("real mobile touch capture, cancellation and landscape layout", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:3000/");
    await ready(page);
    const forward = page.getByRole("button", { name: "Caminhar para frente" }),
      box = await forward.boundingBox();
    if (!box) throw Error("Missing touch control");
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
    });
    await expect.poll(() => distance(page)).toBeGreaterThan(0.35);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchCancel",
      touchPoints: [],
    });
    await page.waitForTimeout(900);
    const stopped = await distance(page);
    await page.waitForTimeout(300);
    expect(Math.abs((await distance(page)) - stopped)).toBeLessThan(0.08);
    await page.setViewportSize({ width: 844, height: 390 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Modo clássico" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "Pausar exploração" }),
    ).toBeInViewport();
    await page
      .getByRole("button", { name: "Conhecer Gabriel", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
  } finally {
    await context.close();
  }
});
