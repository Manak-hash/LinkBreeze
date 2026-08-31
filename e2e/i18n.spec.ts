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

test.describe("admin UI locale (de)", () => {
  test("login screen renders in German when lb_locale=de", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "de",
        url: BASE,
      },
    ]);

    await page.goto("/login");

    await expect(page.locator('[lang="de"]').first()).toBeVisible();

    // translated labels (keys from src/locales/de.ts)
    await expect(
      page.getByRole("button", { name: "Anmelden" }),
    ).toBeVisible();
    await expect(page.getByText("Benutzername")).toBeVisible();
    await expect(page.getByText("Passwort")).toBeVisible();
  });
});

test.describe("admin UI locale (zh)", () => {
  test("login screen renders in Chinese when lb_locale=zh", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "zh",
        url: BASE,
      },
    ]);

    await page.goto("/login");

    await expect(page.locator('[lang="zh-Hans"]').first()).toBeVisible();

    // translated labels (keys from src/locales/zh.ts)
    await expect(
      page.getByRole("button", { name: "登录" }),
    ).toBeVisible();
    await expect(page.getByText("用户名")).toBeVisible();
    await expect(page.getByText("密码")).toBeVisible();
  });
});

test.describe("admin UI locale (ar)", () => {
  test("login screen renders in Arabic (RTL) when lb_locale=ar", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "lb_locale",
        value: "ar",
        url: BASE,
      },
    ]);

    await page.goto("/login");

    await expect(page.locator('[lang="ar"]').first()).toBeVisible();

    // RTL: the admin shell sets dir=rtl for Arabic
    await expect(page.locator('[dir="rtl"]').first()).toBeVisible();

    // translated labels (keys from src/locales/ar.ts)
    await expect(
      page.getByRole("button", { name: "تسجيل الدخول" }),
    ).toBeVisible();
    await expect(page.getByText("اسم المستخدم")).toBeVisible();
    await expect(page.getByText("كلمة المرور")).toBeVisible();
  });
});
