import { redirect } from "next/navigation";
import { getDefaultPage, getUserCount } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const userCount = await getUserCount();

  // First-run: send to setup wizard.
  if (userCount === 0) {
    redirect("/setup");
  }

  // Multi-page: redirect to the default page's slug.
  const defaultPage = await getDefaultPage();
  redirect(`/${defaultPage.slug}`);
}
