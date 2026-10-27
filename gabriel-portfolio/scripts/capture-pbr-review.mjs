// Supplementary renderer-path check: software Chromium, renderer-info extension hidden.
// This exercises PBR/probe/materials without claiming a physical GPU benchmark.
import { spawn } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const port = 3100;
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let serverOutput = "";
server.stdout.on("data", (x) => {
  serverOutput += x;
});
server.stderr.on("data", (x) => {
  serverOutput += x;
});
let browser;
try {
  let available = false;
  for (let i = 0; i < 100; i++) {
    try {
      available = (await fetch(`http://127.0.0.1:${port}`)).ok;
    } catch {
      /* starting */
    }
    if (available) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!available)
    throw new Error("Review server did not start: " + serverOutput);
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.getExtension;
    WebGL2RenderingContext.prototype.getExtension = function (name) {
      if (name === "WEBGL_debug_renderer_info") return null;
      return original.call(this, name);
    };
  });
  await page.goto(`http://127.0.0.1:${port}`, { timeout: 60000 });
  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 60000 });
  await expect(page.locator(".spatial-loading")).toHaveCount(0, {
    timeout: 60000,
  });
  await expect
    .poll(async () =>
      Number(await page.locator(".world-stage").getAttribute("data-rig-bones")),
    )
    .toBeGreaterThanOrEqual(16);
  await page.getByRole("button", { name: "Pausar exploração" }).click();
  await mkdir("docs/redesign", { recursive: true });
  await page.screenshot({
    path: "docs/redesign/pbr-portal-software.png",
    timeout: 60000,
  });
  await expect(page.locator(".spatial-fallback")).toHaveCount(0);
  if (errors.length) throw new Error(errors.join("\n"));
  await writeFile(
    "docs/redesign/pbr-check.json",
    JSON.stringify(
      {
        result: "PASS",
        viewport: [1440, 900],
        test: "Renderer info extension unavailable; PBR/probe/textured GLB scene loads without JS errors",
        renderer:
          "Headless Chromium software WebGL; NOT a physical GPU measurement",
        image: "pbr-portal-software.png",
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: PBR path loads with renderer-info extension unavailable. Actual software capture saved; no hardware-performance claim.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
