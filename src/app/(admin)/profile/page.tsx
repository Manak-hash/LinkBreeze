import { getProfile, type SocialLink } from "@/server/queries";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();

  let socialLinks: SocialLink[] = [];
  try {
    socialLinks = JSON.parse(profile?.socialLinks || "[]");
  } catch {
    socialLinks = [];
  }

  return (
    <ProfileForm
      profile={
        profile
          ? {
              displayName: profile.displayName,
              bio: profile.bio,
              badgeText: profile.badgeText ?? "",
              avatarUrl: profile.avatarUrl ?? "",
              socialLinks,
            }
          : null
      }
    />
  );
}
