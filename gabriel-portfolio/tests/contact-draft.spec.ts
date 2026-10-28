import {area} from './studio-options';
import { test, expect } from "@playwright/test";

test("contact draft survives panels and mode changes, clears explicitly and never sends", async ({ page }) => {
  test.setTimeout(60000); // Three full WebGL lifecycles on the software test renderer.
  const outgoing: string[] = [];
  page.on("request", request => {
    if (request.method() !== "GET") outgoing.push(request.method() + " " + request.url());
  });
  await page.goto("/?chapter=contato");
  await expect(page.locator(".spatial-loading")).toHaveCount(0, { timeout: 15000 });
  await area(page);await page.getByRole("button", { name: "Preparar um projeto", exact: true }).click();
  await page.getByLabel("Seu nome", { exact: true }).fill("Pessoa Teste");
  await page.getByLabel("E-mail", { exact: true }).fill("teste@example.invalid");
  await page.getByLabel("O que você quer construir?").fill("Uma demonstração local de site institucional.");
  await page.getByRole("button", { name: "Preparar resumo local", exact: true }).last().click();
  await expect(page.getByLabel("Resumo do projeto")).toContainText("Pessoa Teste");
  await page.keyboard.press("Escape");
  await area(page);await page.getByRole("button", { name: "Preparar um projeto", exact: true }).click();
  await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue("Pessoa Teste");
  await page.getByRole("button", { name: "Ler no modo clássico" }).click();
  await expect(page.getByLabel("E-mail", { exact: true })).toHaveValue("teste@example.invalid");
  await page.getByRole("button", { name: "Voltar à jornada 3D" }).click();
  await expect(page.locator(".spatial-loading")).toHaveCount(0, { timeout: 15000 });
  await area(page);await page.getByRole("button", { name: "Preparar um projeto", exact: true }).click();
  await expect(page.getByLabel("O que você quer construir?")).toHaveValue("Uma demonstração local de site institucional.");
  await page.screenshot({ path: "test-results/contact-draft-desktop.png" });
  await page.getByRole("button", { name: "Limpar rascunho" }).click();
  await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue("");
  await page.getByLabel("Seu nome", { exact: true }).fill("Descartar ao recarregar");
  await page.reload();
  await expect(page.locator(".spatial-loading")).toHaveCount(0, { timeout: 15000 });
  await area(page);await page.getByRole("button", { name: "Preparar um projeto", exact: true }).click();
  await expect(page.getByLabel("Seu nome", { exact: true })).toHaveValue("");
  expect(outgoing).toEqual([]);
});
