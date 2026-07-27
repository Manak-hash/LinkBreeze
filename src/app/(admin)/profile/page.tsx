import { getAllPages, getDefaultPage, type SocialLink } from "@/server/queries";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  // Resolve active page.
  const allPages = await getAllPages();
  let activePage;
  if (pageParam) {
    activePage = allPages.find((p) => p.id === Number(pageParam));
  }
  if (!activePage) {
    activePage = (await getDefaultPage()) ?? allPages[0];
  }

  let socialLinks: SocialLink[] = [];
  try {
    socialLinks = JSON.parse(activePage?.socialLinks || "[]");
  } catch {
    socialLinks = [];
  }

  return (
    <ProfileForm
      pageId={activePage?.id}
      profile={
        activePage
          ? {
              displayName: activePage.title,
              bio: activePage.bio,
              badgeText: activePage.badgeText ?? "",
              avatarUrl: activePage.avatarUrl ?? "",
              socialLinks,
            }
          : null
      }
    />
  );
}
