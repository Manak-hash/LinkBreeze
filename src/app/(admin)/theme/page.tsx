import {
  getAllThemes,
  getActiveTheme,
  seedThemesIfEmpty,
  getAllPages,
  getDefaultPage,
} from "@/server/queries";
import { ThemeManager } from "./theme-manager";
import { ThemeTools } from "./theme-tools";

export const dynamic = "force-dynamic";

export default async function ThemePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Ensure presets exist, then load.
  await seedThemesIfEmpty();

  const { page: pageParam } = await searchParams;

  // Resolve active page.
  const [allPages, defaultPage] = await Promise.all([
    getAllPages(),
    getDefaultPage(),
  ]);
  let activePage;
  if (pageParam) {
    activePage = allPages.find((p) => p.id === Number(pageParam));
  }
  if (!activePage) {
    activePage = defaultPage ?? allPages[0];
  }

  const [themes, active] = await Promise.all([getAllThemes(), getActiveTheme()]);

  return (
    <div className="flex flex-col gap-6">
      <ThemeManager
        themes={themes}
        activeId={active?.id ?? null}
        active={active}
        pageId={activePage?.id}
        pageThemeId={activePage?.themeId ?? null}
      />
      <ThemeTools themes={themes} />
    </div>
  );
}
