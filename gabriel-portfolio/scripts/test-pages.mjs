import http from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const root = resolve(".next-pages");
const prefix = "/landingpages/gabriel";
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".json": "application/json",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    assert.ok(url.pathname.startsWith(prefix + "/"));
    let file = resolve(
      root,
      "." + decodeURIComponent(url.pathname.slice(prefix.length)),
    );
    assert.ok(file === root || file.startsWith(root + "/"));
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    res.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  await mkdir("test-results", { recursive: true });
  for (const width of [360, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(origin + prefix + "/");
    await expect(page.locator(".spatial-loading")).toHaveCount(0, {
      timeout: 15000,
    });
    await expect(page.locator("canvas")).toHaveCount(1);
    await expect
      .poll(async () =>
        Number(
          await page.locator(".world-stage").getAttribute("data-rig-bones"),
        ),
      )
      .toBeGreaterThanOrEqual(16);
    if (width === 360) {
      for (const name of [
        "gabriel-rigged",
        ...Array.from({ length: 6 }, (_, i) => `environment-${i}`),
      ]) {
        const asset = await page.request.get(
          `${origin}${prefix}/models/${name}.glb`,
        );
        assert.equal(asset.status(), 200);
        assert.equal((await asset.body()).toString("ascii", 0, 4), "glTF");
      }
      const logo = await page.request.get(
        `${origin}${prefix}/brand/zaion-original.png`,
      );
      assert.equal(logo.status(), 200);
      const { createHash } = await import("node:crypto");
      assert.equal(
        createHash("sha256")
          .update(await logo.body())
          .digest("hex"),
        "fb2edb7999b9c5c35d54ec16a25661650905683a231abbe8d261f04e398b99cc",
      );
    }
    await page.getByRole("checkbox", { name: "Movimento reduzido" }).check();
    await page.getByRole("button", { name: "Scroll", exact: true }).click();
    await expect(page.locator(".world-stage")).toHaveAttribute(
      "data-navigation",
      "scroll",
    );
    await page.locator(".world-stage").focus();
    await page.keyboard.press("PageDown");
    await expect(page.locator(".world-stage")).toHaveAttribute(
      "data-distance",
      "8.400",
    );
    await page.getByRole("button", { name: "Caminhar", exact: true }).click();
    await expect(page.locator(".world-stage")).toHaveAttribute(
      "data-navigation",
      "walk",
    );
    await page.locator(".world-stage").focus();
    await page.keyboard.press("j");
    await expect(page.locator(".world-stage")).not.toHaveAttribute("data-camera-yaw", "0.000");
    await page.keyboard.press("r");
    await expect(page.locator(".world-stage")).toHaveAttribute("data-camera-yaw", "0.000");
    await page.getByRole("button", { name: "03 Atelier digital" }).click();
    await expect(page.locator(".world-stage")).toHaveAttribute(
      "data-area",
      "servicos",
    );
    await expect(page.locator(".spatial-editorial h1")).toContainText(
      "Do conceito à interface",
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page
      .getByRole("navigation", { name: "Atalhos para ambientes" })
      .getByRole("button")
      .nth(3)
      .click();
    await expect(page.locator(".world-stage")).toHaveAttribute(
      "data-area",
      "projetos",
    );
    await expect(page.locator(".spatial-editorial h1")).toContainText(
      "Possibilidades",
    );
    await page.getByRole("button", { name: "Modo clássico" }).click();
    await page.getByLabel("Seu nome", { exact: true }).fill("Teste da exportação");
    await page.getByLabel("E-mail", { exact: true }).fill("export@example.invalid");
    await page.getByLabel("O que você quer construir?").fill("Validar o resumo local na exportação estática.");
    await page.locator("#contato").getByRole("button", { name: "Preparar resumo local", exact: true }).click();
    await expect(page.getByLabel("Resumo do projeto")).toHaveValue(/Teste da exportação/);
    await page.getByRole("button", { name: "Voltar à jornada 3D" }).click();
    await expect(page.locator(".spatial-loading")).toHaveCount(0, { timeout: 15000 });
    await page.getByRole("navigation", { name: "Atalhos para ambientes" }).getByRole("button").nth(5).click();
    await expect(page.locator(".world-stage")).toHaveAttribute("data-area", "contato");
    await page.getByRole("button", { name: "Preparar um projeto", exact: true }).click();
    await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue("Teste da exportação");
    await page.screenshot({ path: `test-results/pages-contact-${width}.png` });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Modo clássico" }).click();
    await page.locator("#projetos").getByRole("button", {name:"Portfólios",exact:true}).click();
    await expect(page.locator("#projetos .project-card")).toHaveCount(1);
    await expect(page.locator("#projetos .project-card h3")).toHaveText("Portfólio editorial");
    await page.locator("#projetos").getByRole("button", {name:"Todos",exact:true}).click();
    await page
      .locator("#projetos")
      .getByRole("link", { name: "Ver conceito" })
      .first()
      .click();
    await page.waitForURL("**/projetos/conceito-landing/");
    assert.ok(
      (await page.locator("h1").textContent()).includes("Landing de serviço"),
    );
    await page.getByRole("link", { name: "Voltar aos projetos" }).click();
    await page.waitForURL("**/#projetos");
    const icon = await page.locator('link[rel="icon"]').getAttribute("href");
    assert.equal(icon, prefix + "/favicon.svg");
    assert.equal((await page.request.get(origin + icon)).status(), 200);
    await page
      .locator(".topbar")
      .getByRole("link", { name: "Gabriel" })
      .click();
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: `test-results/pages-${width}.png` });
    assert.deepEqual(errors, []);
    console.log(
      `PASS: static Pages, ${width}px; navigation, assets, both input modes, 3D rooms, classic mode, favicon, no runtime errors`,
    );
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
