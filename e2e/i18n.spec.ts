import { expect, test } from "@playwright/test";

/**
 * i18n smoke: the lb_locale cookie must switch the admin UI to French/Spanish
 * end to end (proxy → x-lb-locale header → request config → provider).
 * Public pages stay English by design (Latin slugs, shared chrome).
 */
const BASE = process.env.BASE_URL || "http://localhost:3010";

test.describe("admin UI locale (fr)", () => {
  test("login screen renders in French when lb_locale=fr", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "fr",
        url: BASE,
      },
    ]);

    await page.goto("/login");

    // lang attribute on the admin shell (set by the admin layout)
    await expect(page.locator('[lang="fr"]').first()).toBeVisible();

    // translated labels (keys from src/locales/fr.ts)
    await expect(
      page.getByRole("button", { name: "Se connecter" }),
    ).toBeVisible();
    await expect(page.getByText("Nom d'utilisateur")).toBeVisible();
    await expect(page.getByText("Mot de passe")).toBeVisible();
  });

  test("unknown locale value falls back to English", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "xx",
        url: BASE,
      },
    ]);

    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: "Sign in" }),
    ).toBeVisible();
  });
});

test.describe("admin UI locale (es)", () => {
  test("login screen renders in Spanish when lb_locale=es", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "es",
        url: BASE,
      },
    ]);

    await page.goto("/login");

    await expect(page.locator('[lang="es"]').first()).toBeVisible();

    // translated labels (keys from src/locales/es.ts)
    await expect(
      page.getByRole("button", { name: "Iniciar sesión" }),
    ).toBeVisible();
    await expect(page.getByText("Nombre de usuario")).toBeVisible();
    await expect(page.getByText("Contraseña")).toBeVisible();
  });
});
