"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { localizeActionError } from "@/lib/action-error-i18n";
import {
  ImagePositionPicker,
  pickerValueFrom,
  type ImagePositionPickerValue,
} from "@/components/admin/image-position-picker";
import { createAutosaver, useSavedAction } from "@/hooks/use-saved-action";
import { uploadOgImage } from "@/server/actions/uploads";
import { updatePageAction } from "@/server/actions/pages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * OG image card (Settings → General, per page).
 *
 * - Auto mode: the dynamic /<slug>/opengraph-image route renders a card that
 *   follows the page's theme (background type, colors, avatar).
 * - Custom mode: an uploaded image is served directly as og:image, with the
 *   shared ImagePositionPicker for fit/focus/zoom (adjustment-only columns —
 *   non-destructive; crawlers scale the file themselves).
 *
 * Autosaved through the same tri-state updatePageAction contract as the rest
 * of the tab: mode/url fields ride the main GeneralTab form via hidden
 * inputs; the adjustment columns save through a dedicated autosaver (the
 * picker's onChange fires per pointermove — same shape as profile-form).
 */

export interface OgImageCardProps {
  pageId: number;
  slug: string;
  initialMode: string | null;
  initialUrl: string | null;
  initialFit: string | null;
  initialPosX: number | null;
  initialPosY: number | null;
  initialZoom: number | null;
  /**
   * Cache-buster for the preview URLs: a server-computed hash of every page
   * input the card renders (theme, title, bio, avatar, og fields). Any change
   * to any of them re-fetches the preview without a manual reload.
   */
  previewVersion: string;
}

export function OgImageCard({
  pageId,
  slug,
  initialMode,
  initialUrl,
  initialFit,
  initialPosX,
  initialPosY,
  initialZoom,
  previewVersion,
}: OgImageCardProps) {
  const t = useTranslations("settings.ogImage");
  const tErr = useTranslations("errors");
  const savedAction = useSavedAction();

  // Controlled mode/url: toggles must save immediately (switch IS the
  // action, like SearchVisibilityCard), while the URL rides uploads.
  const [mode, setMode] = React.useState(initialMode === "custom" ? "custom" : "auto");
  const [ogUrl, setOgUrl] = React.useState(initialUrl || "");
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Picker state mirrors the adjustment columns; persisted via its own
  // debounced autosaver (600ms — one server action per drag, not per move).
  const [adj, setAdj] = React.useState<ImagePositionPickerValue>(() =>
    pickerValueFrom(initialFit, initialPosX, initialPosY, initialZoom),
  );
  const [adjOpen, setAdjOpen] = React.useState(false);
  // The autosaver is memoized once and must not touch refs during render
  // (react-hooks/refs): `run` is a stable useCallback on the hook's memoized
  // API, so depending on savedAction itself keeps the identity stable.
  const adjAutosaver = React.useMemo(
    () =>
      createAutosaver((fd: FormData) => {
        void savedAction.run(updatePageAction, fd);
      }, 600),
    [savedAction],
  );
  React.useEffect(() => () => adjAutosaver.cancel(), [adjAutosaver]);

  const buildAdjFormData = React.useCallback(
    (v: ImagePositionPickerValue): FormData => {
      const fd = new FormData();
      fd.set("pageId", String(pageId));
      // Present-but-empty = reset (NULL); tri-state contract of the action.
      fd.set("ogImageFit", v.fit);
      fd.set("ogImagePosX", String(v.posX));
      fd.set("ogImagePosY", String(v.posY));
      fd.set("ogImageZoom", String(v.zoom));
      return fd;
    },
    [pageId],
  );

  const saveMode = React.useCallback(
    (nextMode: "auto" | "custom", url: string) => {
      const fd = new FormData();
      fd.set("pageId", String(pageId));
      fd.set("ogImageMode", nextMode);
      // Present-empty clears the URL (back to auto rendering).
      fd.set("ogImageUrl", url);
      void savedAction.run(updatePageAction, fd);
    },
    [pageId, savedAction],
  );

  const handleToggle = (next: "auto" | "custom") => {
    if (next === mode) return;
    setMode(next);
    // Switching to custom with no upload yet just saves the mode; the
    // public page falls back to auto until an image exists.
    saveMode(next, next === "custom" ? ogUrl : ogUrl);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadOgImage(fd);
      if (res.success) {
        setOgUrl(res.url);
        setAdj(pickerValueFrom(null, null, null, null));
        setAdjOpen(true);
        // A fresh upload pairs with custom mode — save both in one action.
        saveMode("custom", res.url);
        setMode("custom");
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

  const removeImage = () => {
    setOgUrl("");
    setMode("auto");
    setAdjOpen(false);
    saveMode("auto", "");
  };

  // Live preview: auto → the dynamic renderer; custom → the uploaded file
  // drawn with the picked adjustment (what crawlers will approximate).
  // Both bust their cache through the page-input hash, so theme, title, bio,
  // or avatar changes re-fetch the card without a manual reload.
  const previewSrc =
    mode === "custom" && ogUrl
      ? `${ogUrl}?v=${previewVersion}`
      : `/${slug}/opengraph-image?v=${previewVersion}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Mode toggle */}
        <div role="radiogroup" aria-label={t("modeAria")} className="grid grid-cols-2 gap-1.5 sm:max-w-sm">
          {(["auto", "custom"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => handleToggle(m)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                mode === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {m === "auto" ? t("modeAuto") : t("modeCustom")}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "auto" ? t("autoHint") : t("customHint")}
        </p>

        {/* Live 1200x630 preview */}
        <div className="overflow-hidden rounded-xl border border-border" style={{ aspectRatio: "1200 / 630", maxWidth: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- live OG preview of an arbitrary upload/rendered route */}
          <img
            src={previewSrc}
            alt={t("previewAlt")}
            className="h-full w-full object-cover"
            style={
              mode === "custom" && ogUrl
                ? {
                    objectFit: adj.fit === "contain" ? "contain" : "cover",
                    objectPosition: `${adj.posX * 100}% ${adj.posY * 100}%`,
                    ...(adj.zoom > 1
                      ? { transform: `scale(${adj.zoom})`, transformOrigin: `${adj.posX * 100}% ${adj.posY * 100}%` }
                      : {}),
                  }
                : undefined
            }
          />
        </div>

        {/* Upload row (custom mode) */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted">
            {uploading ? t("uploading") : t("upload")}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.webp,.avif,image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          {ogUrl ? (
            <>
              <button
                type="button"
                onClick={() => setAdjOpen((v) => !v)}
                className="text-sm font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("adjustPosition")}
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="text-sm font-medium text-destructive underline-offset-2 hover:underline"
              >
                {t("remove")}
              </button>
            </>
          ) : null}
        </div>
        {error ? (
          <span className="text-xs text-destructive" role="alert">
            {error}
          </span>
        ) : null}

        {/* Position picker (adjustment-only persistence) */}
        {ogUrl && adjOpen ? (
          <div className="rounded-xl border border-border p-3">
            <ImagePositionPicker
              surface="og"
              src={ogUrl}
              value={adj}
              onChange={(v) => {
                setAdj(v);
                adjAutosaver.schedule(buildAdjFormData(v));
              }}
            />
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">{t("crawlerCacheHint")}</p>
      </CardContent>
    </Card>
  );
}
