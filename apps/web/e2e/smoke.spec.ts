import { expect, test } from "@playwright/test";

test("redirige al login sin sesión", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
});

test("no hay scroll horizontal (layout responsive)", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("valida el formulario de registro con mensajes accesibles", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Ana");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("corta");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
});

test("el redirect del login no permite ir a otro dominio", async ({ page }) => {
  await page.goto("/login?redirect=//evil.example");
  await expect(page).toHaveURL(/\/login/);
  expect(new URL(page.url()).searchParams.get("redirect")).toBeNull();
});
