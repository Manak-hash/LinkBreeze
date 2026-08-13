"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, ExternalLink } from "lucide-react";
import { updateSettings } from "@/server/actions/settings";
import { updatePageAction } from "@/server/actions/pages";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePreview } from "@/components/admin/PreviewPane";

// ── Favicon upload (used in Appearance tab) ──────────────────────────────

function FaviconUpload({
  faviconUrl,
  onUpload,
}: {
  faviconUrl: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { uploadFavicon } = await import("@/server/actions/uploads");
      const res = await uploadFavicon(fd);
      if (res.success) {
        onUpload(res.url);
      } else {
        setError(res.error);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <FormField
      label="Favicon"
      htmlFor="faviconUpload"
      hint="Upload .ico, .png, .svg, .gif or .webp (max 1 MB)."
    >
      <div className="flex flex-wrap items-center gap-3">
        {faviconUrl ? (
          <Image
            src={faviconUrl}
            alt="Current favicon"
            width={32}
            height={32}
            unoptimized
            className="size-8 rounded border border-border object-contain"
          />
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
          {uploading ? "Uploading…" : "Upload favicon"}
          <input
            type="file"
            accept=".ico,.png,.svg,.gif,.webp,image/x-icon,image/png,image/svg+xml,image/gif,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    </FormField>
  );
}

interface GeneralTabProps {
  pageId?: number;
  slug: string;
  title: string;
  description: string;
  footerText: string;
  analyticsScript: string;
  privacyPolicy: string;
}

export function GeneralTab({
  pageId,
  slug,
  title,
  description,
  footerText,
  analyticsScript,
  privacyPolicy,
}: GeneralTabProps) {
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const { reload: reloadPreview } = usePreview();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    if (pageId) {
      formData.set("pageId", String(pageId));
      formData.set("seoTitle", formData.get("title") as string);
      formData.set("seoDescription", formData.get("description") as string);
      startTransition(async () => {
        await updatePageAction(formData);
        router.refresh();
        reloadPreview();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
      return;
    }
    startTransition(async () => {
      await updateSettings(formData);
      router.refresh();
      reloadPreview();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>
          Page slug, SEO metadata and analytics configuration.
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <FormField
            label="Page slug"
            htmlFor="slug"
            required
            hint={<>Your public page lives at <code>/{slug || "u"}</code></>}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input
                id="slug"
                name="slug"
                defaultValue={slug}
                required
                pattern="^[a-zA-Z0-9_\-]+$"
                maxLength={64}
                className="max-w-48"
              />
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="View public page"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </FormField>

          <FormField label="Page title (SEO)" htmlFor="title">
            <Input
              id="title"
              name="title"
              defaultValue={title}
              maxLength={120}
              placeholder="Jane Doe — Links"
            />
          </FormField>

          <FormField label="SEO description" htmlFor="description">
            <Input
              id="description"
              name="description"
              defaultValue={description}
              maxLength={300}
              placeholder="All my links in one place"
            />
          </FormField>

          <FormField label="Footer text (optional)" htmlFor="footerText">
            <Input
              id="footerText"
              name="footerText"
              defaultValue={footerText}
              maxLength={200}
              placeholder="© 2026 Jane Doe"
            />
          </FormField>

          <FormField
            label="Analytics script (optional)"
            htmlFor="analyticsScript"
            hint={<>Paste a <code>{"<script>"}</code> snippet for Plausible, Umami, Matomo, Google Analytics, etc. Add the provider domain to <code>EXTRA_SCRIPT_SRC</code> in your .env so CSP allows it to load.</>}
          >
            <textarea
              id="analyticsScript"
              name="analyticsScript"
              defaultValue={analyticsScript}
              maxLength={2000}
              placeholder={'<script defer data-domain="example.com" src="https://plausible.io/js/script.js"></script>'}
              className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              spellCheck={false}
            />
          </FormField>

          <FormField
            label="Privacy policy (optional)"
            htmlFor="privacyPolicy"
            hint={<>Leave empty to auto-generate from your page settings. Visitors can always access it at <code>/{slug}/privacy</code>. Supports Markdown (headings, lists, <strong>bold</strong>, <em>italic</em>, <code>code</code>).</>}
          >
            <textarea
              id="privacyPolicy"
              name="privacyPolicy"
              defaultValue={privacyPolicy}
              maxLength={20000}
              placeholder={"# Privacy Policy\n\nThis page uses privacy-respecting analytics..."}
              className="min-h-[160px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              spellCheck={false}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />
            {pending ? "Saving…" : "Save general settings"}
          </Button>
          {saved ? <span className="text-sm text-muted-foreground">Saved!</span> : null}
        </CardFooter>
      </form>
    </Card>
  );
}

// ── Appearance Tab ───────────────────────────────────────────────────────

interface AppearanceTabProps {
  pageId?: number;
  customCss: string;
  faviconUrl: string;
  themes: ThemeRow[];
  activeThemeId: number | null;
}

export function AppearanceTab({
  pageId,
  customCss,
  faviconUrl: initialFaviconUrl,
  themes,
  activeThemeId,
}: AppearanceTabProps) {
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const { reload: reloadPreview } = usePreview();
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = React.useState<string>(
    activeThemeId ? String(activeThemeId) : "",
  );
  const [faviconUrl, setFaviconUrl] = React.useState(initialFaviconUrl);

  const handleFaviconUploaded = (url: string) => {
    setFaviconUrl(url);
    reloadPreview();
  };

  const handleSubmit = (formData: FormData) => {
    if (pageId) {
      formData.set("pageId", String(pageId));
      if (selectedTheme) formData.set("themeId", selectedTheme);
      startTransition(async () => {
        await updatePageAction(formData);
        router.refresh();
        reloadPreview();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
      return;
    }
    if (selectedTheme) formData.set("activeThemeId", selectedTheme);
    startTransition(async () => {
      await updateSettings(formData);
      router.refresh();
      reloadPreview();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Theme selection, favicon and custom CSS.
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {themes.length > 0 ? (
            <FormField label="Active theme">
              <div className="flex flex-wrap gap-2">
                {themes.map((t) => {
                  const isActive =
                    selectedTheme === String(t.id) ||
                    (!selectedTheme && t.id === activeThemeId);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(String(t.id))}
                      className={
                        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted " +
                        (isActive ? "border-violet bg-violet/10 text-lavender" : "border-border")
                      }
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </FormField>
          ) : null}

          <input type="hidden" name="faviconUrl" value={faviconUrl} />

          <FaviconUpload faviconUrl={faviconUrl} onUpload={handleFaviconUploaded} />

          <FormField
            label="Custom CSS (optional)"
            htmlFor="customCss"
            hint={<>Raw CSS injected into a <code>{"<style>"}</code> tag on your public page.</>}
          >
            <textarea
              id="customCss"
              name="customCss"
              defaultValue={customCss}
              maxLength={10000}
              placeholder={"/* Custom styles for your public page */\n:root { --accent: #533fd6; }"}
              className="min-h-[160px] w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 font-mono text-xs leading-relaxed transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              spellCheck={false}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />
            {pending ? "Saving…" : "Save appearance"}
          </Button>
          {saved ? <span className="text-sm text-muted-foreground">Saved!</span> : null}
        </CardFooter>
      </form>
    </Card>
  );
}
