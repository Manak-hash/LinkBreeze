import { redirect } from "next/navigation";
import { getUserCount, getAllThemes, getActiveTheme, seedThemesIfEmpty } from "@/server/queries";
import { getSession } from "@/lib/auth";
import { SetupWizard } from "./setup-wizard";

// Never cache this page — always check fresh state.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const count = await getUserCount();
  const session = await getSession();

  // Once an admin exists, setup is over. If they're logged in, go to
  // dashboard; otherwise send them to login.
  if (count > 0) {
    redirect(session ? "/dashboard" : "/login");
  }

  // Ensure theme presets exist before loading them for the picker.
  await seedThemesIfEmpty();
  const themes = await getAllThemes();
  const activeTheme = await getActiveTheme();

  return (
    <SetupWizard
      defaultUsername={process.env.ADMIN_USERNAME || ""}
      themes={themes}
      activeThemeId={activeTheme?.id ?? null}
    />
  );
}
