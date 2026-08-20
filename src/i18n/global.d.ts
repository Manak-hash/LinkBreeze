import type { Messages } from "@/locales/en";

/**
 * Makes `useTranslations('nav')` keys typed against locales/en.ts.
 * Picked up automatically via the `paths` in tsconfig type acquisition.
 */
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}

export {};
