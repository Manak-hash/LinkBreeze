"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { demoBlock } from "@/lib/demo";
import { getDefaultPage, getPageById, createLink, updatePage } from "@/server/queries";
import {
  extractFromUrl,
  extractFromFileContent,
  type ImportedLink,
} from "@/lib/migration-wizard";
import { rateLimit } from "@/lib/rate-limit";

export interface ImportPreviewResult {
  success: boolean;
  error?: string;
  links?: ImportedLink[];
  socialLinks?: ImportedLink[];
  profileName?: string;
  profileBio?: string;
  profileAvatar?: string;
  platform?: string;
}

export async function importPreviewUrl(
  prevState: ImportPreviewResult | null,
  formData: FormData,
): Promise<ImportPreviewResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };

  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const rl = rateLimit("import-url", 1, 30_000);
  if (!rl.ok) {
    return { success: false, error: "Please wait 30 seconds between imports" };
  }

  const url = String(formData.get("url") || "").trim();
  if (!url) return { success: false, error: "URL is required" };

  try {
    const result = await extractFromUrl(url);
    return {
      success: true,
      links: result.links,
      socialLinks: result.socialLinks,
      profileName: result.profileName,
      profileBio: result.profileBio,
      profileAvatar: result.profileAvatar,
      platform: result.platform,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch the page",
    };
  }
}

export async function importPreviewFile(
  prevState: ImportPreviewResult | null,
  formData: FormData,
): Promise<ImportPreviewResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };

  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "File is required" };
  }

  // 5 MB limit on uploaded files.
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "File too large (max 5 MB)" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["html", "htm", "json", "txt"].includes(ext || "")) {
    return { success: false, error: "Only HTML and JSON files are supported" };
  }

  try {
    const content = await file.text();
    const result = extractFromFileContent(content, file.name);
    return {
      success: true,
      links: result.links,
      socialLinks: result.socialLinks,
      profileName: result.profileName,
      profileBio: result.profileBio,
      profileAvatar: result.profileAvatar,
      platform: result.platform,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to parse the file",
    };
  }
}

export interface ConfirmImportResult {
  success: boolean;
  error?: string;
  importedCount?: number;
  socialCount?: number;
}

export async function confirmImport(
  prevState: ConfirmImportResult | null,
  formData: FormData,
): Promise<ConfirmImportResult> {
  const demo = demoBlock();
  if (demo) return { success: false, error: demo };

  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const pageIdRaw = formData.get("pageId");
  const pageId = pageIdRaw ? Number(pageIdRaw) : undefined;
  const page = pageId ? await getPageById(pageId) : await getDefaultPage();
  if (!page) return { success: false, error: "Target page not found" };

  // Parse the selected links from the form.
  const linksJson = String(formData.get("links") || "[]");
  const socialJson = String(formData.get("socialLinks") || "[]");

  let linksToImport: ImportedLink[];
  let socialToImport: ImportedLink[];
  try {
    linksToImport = JSON.parse(linksJson);
    socialToImport = JSON.parse(socialJson);
  } catch {
    return { success: false, error: "Invalid import data" };
  }

  // Filter to only selected links.
  const selectedLinks = linksToImport.filter((l) => l.selected && l.url && l.title);
  const selectedSocial = socialToImport.filter((l) => l.selected && l.url);

  let importedCount = 0;

  // Import page links.
  for (const link of selectedLinks) {
    await createLink({
      title: link.title.slice(0, 100),
      url: link.url,
      pageId: page.id,
      type: link.type || "url",
      description: link.description?.slice(0, 200),
      imageUrl: link.imageUrl,
    });
    importedCount++;
  }

  // Merge social links into the page's socialLinks array.
  let socialCount = 0;
  if (selectedSocial.length > 0) {
    let existingSocial: { platform: string; url: string }[] = [];
    try {
      existingSocial = JSON.parse(page.socialLinks || "[]");
    } catch {
      existingSocial = [];
    }

    // Add new social links (avoid duplicates by platform).
    const existingPlatforms = new Set(existingSocial.map((s) => s.platform));
    for (const social of selectedSocial) {
      if (social.platform && !existingPlatforms.has(social.platform)) {
        existingSocial.push({
          platform: social.platform,
          url: social.url,
        });
        existingPlatforms.add(social.platform);
        socialCount++;
      }
    }

    await updatePage(page.id, {
      socialLinks: JSON.stringify(existingSocial),
    });
  }

  revalidatePath("/links");
  revalidatePath("/profile");
  revalidatePath(`/${page.slug}`);

  return {
    success: true,
    importedCount,
    socialCount,
  };
}
