import * as React from "react";
import { getAllThemes, getActiveTheme, seedThemesIfEmpty } from "@/server/queries";
import { ThemeManager } from "./theme-manager";
import { ThemeTools } from "./theme-tools";

export const dynamic = "force-dynamic";

export default async function ThemePage() {
  // Ensure presets exist, then load.
  await seedThemesIfEmpty();
  const [themes, active] = await Promise.all([getAllThemes(), getActiveTheme()]);

  return (
    <div className="flex flex-col gap-6">
      <ThemeManager themes={themes} activeId={active?.id ?? null} active={active} />
      <ThemeTools themes={themes} />
    </div>
  );
}
