"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QrCode, Download, RotateCcw, Save } from "lucide-react";
import { updatePageAction } from "@/server/actions/pages";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { defaultQrStyle, type QrStyle } from "@/lib/qr-style";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const SIZE_PRESETS = [256, 512, 1024] as const;

function QrCard({
  pageId,
  slug,
  initialStyle,
  avatarAvailable,
  faviconAvailable,
  themePresets,
}: {
  pageId?: number;
  slug: string;
  initialStyle: QrStyle;
  avatarAvailable: boolean;
  faviconAvailable: boolean;
  themePresets: string[];
}) {
  const t = useTranslations("settings.qr");
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [saved, setSaved] = React.useState(false);
  const [style, setStyle] = React.useState<QrStyle>(initialStyle);
  const [previewSrc, setPreviewSrc] = React.useState("");

  // Debounced preview — the QR endpoint is rate-limited (30/min), so color
  // drags must settle before a request fires.
  React.useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({
        slug,
        format: "svg",
        fg: style.fg,
        bg: style.bg,
        logo: style.logo,
        size: "320",
      });
      setPreviewSrc(`/api/qr?${params.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  }, [slug, style.fg, style.bg, style.logo]);

  const set = (patch: Partial<QrStyle>) => setStyle((s) => ({ ...s, ...patch }));

  const dirty = JSON.stringify(style) !== JSON.stringify(initialStyle);

  const downloadUrl = (format: "svg" | "png") => {
    const params = new URLSearchParams({
      slug,
      format,
      fg: style.fg,
      bg: style.bg,
      logo: style.logo,
      size: String(style.size),
      download: "1",
    });
    return `/api/qr?${params.toString()}`;
  };

  const handleSave = () => {
    if (!pageId) return;
    const fd = new FormData();
    fd.set("pageId", String(pageId));
    fd.set("qrSettings", JSON.stringify(style));
    startTransition(async () => {
      await updatePageAction(fd);
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const logoOptions: { value: QrStyle["logo"]; label: string; enabled: boolean; hint?: string }[] = [
    { value: "none", label: "None", enabled: true },
    {
      value: "avatar",
      label: "Avatar",
      enabled: avatarAvailable,
      hint: avatarAvailable ? undefined : "Set an avatar in Profile first",
    },
    {
      value: "favicon",
      label: "Favicon",
      enabled: faviconAvailable,
      hint: faviconAvailable ? undefined : "Set a favicon in Appearance first",
    },
  ];

  return (
    <FormField label={t("styleLabel")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl border border-border p-3" style={{ backgroundColor: style.bg }}>
          {previewSrc ? (
            <Image
              key={previewSrc}
              src={previewSrc}
              alt={t("previewAlt")}
              width={176}
              height={176}
              unoptimized
              className="size-44"
            />
          ) : (
            <div className="flex size-44 items-center justify-center text-muted-foreground">
              <QrCode className="size-8" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">{t("codeColor")}<span className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.fg}
                  onChange={(e) => set({ fg: e.target.value })}
                  className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  aria-label={t("colorLabel")}
                />
                <code className="text-xs text-foreground">{style.fg}</code>
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">{t("backgroundColor")}<span className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.bg}
                  onChange={(e) => set({ bg: e.target.value })}
                  className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  aria-label={t("bgLabel")}
                />
                <code className="text-xs text-foreground">{style.bg}</code>
              </span>
            </label>
            {themePresets.length > 0 ? (
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">{t("themeColors")}<span className="flex gap-1.5">
                  {themePresets.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      title={`Use ${hex} for the code`}
                      onClick={() => set({ fg: hex })}
                      className="size-8 rounded border border-border"
                      style={{ backgroundColor: hex }}
                      aria-label={`Use theme color ${hex}`}
                    />
                  ))}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{t("centerLogo")}</span>
            <div className="flex flex-wrap gap-2">
              {logoOptions.map((opt) => (
                <label
                  key={opt.value}
                  title={opt.hint}
                  className={
                    "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors " +
                    (opt.enabled ? "hover:bg-muted " : "cursor-not-allowed opacity-50 ") +
                    (style.logo === opt.value
                      ? "border-violet bg-violet/10 text-lavender"
                      : "border-border")
                  }
                >
                  <input
                    type="radio"
                    name="qr-logo"
                    className="sr-only"
                    disabled={!opt.enabled}
                    checked={style.logo === opt.value}
                    onChange={() => opt.enabled && set({ logo: opt.value })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{t("logoHint")}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">{t("exportSize")}</span>
            <div className="flex gap-2">
              {SIZE_PRESETS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set({ size: s })}
                  className={
                    "rounded-lg border px-2.5 py-1.5 text-sm transition-colors hover:bg-muted " +
                    (style.size === s
                      ? "border-violet bg-violet/10 text-lavender"
                      : "border-border")
                  }
                >
                  {t("px", { num: s })}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={downloadUrl("svg")}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" />{t("svg")}</a>
            <a
              href={downloadUrl("png")}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" />{t("png")}</a>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStyle(defaultQrStyle())}
              className="gap-2"
            >
              <RotateCcw className="size-4" />{t("reset")}</Button>
            {pageId ? (
              <Button type="button" onClick={handleSave} disabled={pending || !dirty} className="gap-2">
                <Save className="size-4" />
                {pending ? t("saving") : saved ? t("savedBang") : t("saveStyle")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </FormField>
  );
}

export { QrCard };
export { HEX_RE };
