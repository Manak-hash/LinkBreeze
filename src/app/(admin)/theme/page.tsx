import {
  getAllThemes,
  getActiveTheme,
  getThemeById,
  seedThemesIfEmpty,
  getAllPages,
  getDefaultPage,
  getAllCustomFonts,
} from "@/server/queries";
import type { CustomFontMeta } from "@/lib/custom-fonts";
import { ThemeManager } from "./theme-manager";

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

  const [themes, active, fontRows] = await Promise.all([
    getAllThemes(),
    getActiveTheme(),
    getAllCustomFonts(),
  ]);

  // Uploaded fonts (#82) — serialisable metadata for the client customizer.
  const customFonts: CustomFontMeta[] = fontRows.map((f) => ({
    id: f.id,
    name: f.name,
    family: f.family,
    filename: f.filename,
    url: f.url,
    sizeBytes: f.sizeBytes,
    format: f.format,
  }));

  // The theme the customizer edits: the page's own theme when set, else the
  // globally active theme. This is what the public page renders for this
  // page, so this is what "Customise" and "Duplicate" must target.
  const pageTheme = activePage?.themeId
    ? await getThemeById(activePage.themeId)
    : null;
  const effective = pageTheme ?? active;

  return (
    <div className="flex flex-col gap-8">
      <ThemeManager
        themes={themes}
        activeId={active?.id ?? null}
        active={effective}
        pageId={activePage?.id}
        pageThemeId={activePage?.themeId ?? null}
        customFonts={customFonts}
      />
    </div>
  );
}
