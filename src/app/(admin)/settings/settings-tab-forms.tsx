"use client";

import * as React from "react";
import { localizeActionError } from "@/lib/action-error-i18n";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { LanguageCard } from "./language-card";

// ── Favicon upload (used in Appearance tab) ──────────────────────────────

function FaviconUpload({
  faviconUrl,
  onUpload,
}: {
  faviconUrl: string;
  onUpload: (url: string) => void;
}) {
  const t = useTranslations("settings.appearance");
  const tErr = useTranslations("errors");
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
        setError(localizeActionError(tErr, res.error));
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
      label={t("favicon")}
      htmlFor="faviconUpload"
      hint={t("faviconHint")}
    >
      <div className="flex flex-wrap items-center gap-3">
        {faviconUrl ? (
          <Image
            src={faviconUrl}
            alt={t("currentFavicon")}
            width={32}
            height={32}
            unoptimized
            className="size-8 rounded border border-border object-contain"
          />
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
          {uploading ? t("uploading") : t("uploadFavicon")}
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
  privacyPolicy: string;
}

export function GeneralTab({
  pageId,
  slug,
  title,
  description,
  footerText,
  privacyPolicy,
}: GeneralTabProps) {
  const t = useTranslations("settings.general");
  const tCommon = useTranslations("common");
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
    <div className="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <FormField
            label={t("pageSlug")}
            htmlFor="slug"
            required
            hint={t.rich("slugHintRich", { slug: slug || "u", code: (chunk) => <code>{chunk}</code> })}
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
                aria-label={t("viewPublicPage")}
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </FormField>

          <FormField label={t("pageTitle")} htmlFor="title">
            <Input
              id="title"
              name="title"
              defaultValue={title}
              maxLength={120}
              placeholder={t("pageTitlePlaceholder")}
            />
          </FormField>

          <FormField label={t("seoDescription")} htmlFor="description">
            <Input
              id="description"
              name="description"
              defaultValue={description}
              maxLength={300}
              placeholder={t("seoPlaceholder")}
            />
          </FormField>

          <FormField label={t("footerText")} htmlFor="footerText">
            <Input
              id="footerText"
              name="footerText"
              defaultValue={footerText}
              maxLength={200}
              placeholder={t("footerPlaceholder")}
            />
          </FormField>

          <FormField
            label={t("privacyPolicy")}
            htmlFor="privacyPolicy"
            hint={t.rich("privacyHintRich", { slug, code: (chunk) => <code>{chunk}</code>, strong: (chunk) => <strong>{chunk}</strong>, em: (chunk) => <em>{chunk}</em> })}
          >
            <textarea
              id="privacyPolicy"
              name="privacyPolicy"
              defaultValue={privacyPolicy}
              maxLength={20000}
              placeholder={t("privacyPlaceholder")}
              className="min-h-[160px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              spellCheck={false}
            />
          </FormField>
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />
            {pending ? t("saving") : t("saveGeneral")}
          </Button>
          {saved ? <span className="text-sm text-muted-foreground">{tCommon("saved")}</span> : null}
        </CardFooter>
      </form>
    </Card>
    <LanguageCard />
    </div>
  );
}

// ── Integration Tab ──────────────────────────────────────────────────────

interface IntegrationTabProps {
  pageId?: number;
  slug: string;
  analyticsScript: string;
  consentText: string | null;
  emailCapture: boolean;
}

export function IntegrationTab({
  pageId,
  slug,
  analyticsScript,
  consentText,
  emailCapture,
}: IntegrationTabProps) {
  const t = useTranslations("settings.integration");
  const tInt = t;
  const tCommon = useTranslations("common");
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const [emailEnabled, setEmailEnabled] = React.useState(emailCapture);
  const { reload: reloadPreview } = usePreview();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    formData.set("emailCapture", emailEnabled ? "on" : "off");
    if (pageId) {
      formData.set("pageId", String(pageId));
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
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {pageId ? null : (
            <input type="hidden" name="slug" value={slug} />
          )}

          <FormField
            label={t("analyticsScript")}
            htmlFor="analyticsScript"
            hint={tInt.rich("analyticsHintRich", { code: (chunk) => <code>{chunk}</code> })}
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
            label={t("emailCapture")}
            hint={tInt.rich("emailCaptureHintRich", {})}
          >
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              {emailEnabled ? t("enabled") : t("disabled")}
            </label>
          </FormField>

          {emailEnabled ? (
          <FormField
            label={t("consentText")}
            htmlFor="consentText"
            hint={tInt.rich("consentHintRich", { em: (chunk) => <em>{chunk}</em> })}
          >
            <Input
              id="consentText"
              name="consentText"
              defaultValue={consentText || ""}
              maxLength={500}
              placeholder={t("consentPlaceholder")}
            />
          </FormField>
          ) : null}
        </CardContent>
        <CardFooter className="gap-3">
          <Button type="submit" disabled={pending}>
            <Save className="size-4" />
            {pending ? t("saving") : t("saveIntegration")}
          </Button>
          {saved ? <span className="text-sm text-muted-foreground">{tCommon("saved")}</span> : null}
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
  const t = useTranslations("settings.appearance");
  const tInt = useTranslations("settings.integration");
  const tCommon = useTranslations("common");
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
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          {themes.length > 0 ? (
            <FormField label={t("activeTheme")}>
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
            label={tInt("customCss")}
            htmlFor="customCss"
            hint={tInt.rich("customCssHintRich", { code: (chunk) => <code>{chunk}</code> })}
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
            {pending ? t("saving") : t("saveAppearance")}
          </Button>
          {saved ? <span className="text-sm text-muted-foreground">{tCommon("saved")}</span> : null}
        </CardFooter>
      </form>
    </Card>
  );
}
