"use client";

import * as React from "react";
import { localizeActionError } from "@/lib/action-error-i18n";
import { Upload, FileType, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import type { Messages } from "@/locales/en";
import {
  uploadBackgroundMedia,
  uploadCustomFont,
  deleteCustomFontAction,
} from "@/server/actions/uploads";
import type { CustomFontMeta } from "@/lib/custom-fonts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ColorField({
  label,
  name,
  value,
  onChange,
  allowRgba = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  allowRgba?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value?.match(/^#[0-9a-fA-F]{6}$/)?.[0] ?? "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
          disabled={allowRgba}
        />
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={allowRgba ? "rgba(20,17,46,0.55)" : "#533fd6"}
          className="flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: keyof Messages["theme"] & string }>;
}) {
  const t = useTranslations("theme");
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select name={name} value={value} onValueChange={(v) => v !== null && onChange(v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.label)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ToggleField({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Slider + numeric readout that emits a CSS value ("12px") while the state
 * stays numeric. Optional `auto` mode emits the sentinel "auto" (radius).
 */
export function SliderField({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  autoValue,
}: {
  label: string;
  name: string;
  value: number | "auto";
  onChange: (v: number | "auto") => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** When set, an extra "Auto" chip emits this sentinel value. */
  autoValue?: string;
}) {
  const t = useTranslations("theme");
  const isAuto = autoValue !== undefined && value === autoValue;
  const numVal = typeof value === "number" ? value : min;
  const emit = (n: number) => onChange(n);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {isAuto ? "Auto" : `${numVal}${unit}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {autoValue !== undefined ? (
          <button
            type="button"
            onClick={() => onChange(isAuto ? min : (autoValue as never))}
            className={
              "shrink-0 rounded-md border px-2 py-1 text-[11px] transition-colors " +
              (isAuto
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted")
            }
          >{t("auto")}</button>
        ) : null}
        <input
          type="range"
          aria-label={label}
          name={name}
          value={isAuto ? min : numVal}
          min={min}
          max={max}
          step={step}
          onChange={(e) => emit(parseInt(e.target.value, 10))}
          disabled={isAuto}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary data-[disabled]:opacity-40"
        />
        <input type="hidden" name={name} value={isAuto ? autoValue : `${numVal}${unit}`} />
      </div>
    </div>
  );
}

/**
 * URL field with an inline upload button (background images / videos / GIFs).
 * Uploads go through uploadBackgroundMedia (2 MB image / 5 MB video caps).
 */
export function MediaUrlField({
  label,
  name,
  value,
  onChange,
  accept = "image/*",
  hint,
  maxSizeMb = 2,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  accept?: string;
  hint?: string;
  /** Client-side pre-check; the server re-validates regardless. */
  maxSizeMb?: number;
}) {
  const t = useTranslations("theme");
  const tErr = useTranslations("errors");
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(tErr("fileTooLargeMb", { mb: maxSizeMb }));
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadBackgroundMedia(fd);
      if (res.success) {
        onChange(res.url);
      } else {
        setError(localizeActionError(tErr, res.error));
      }
    } catch {
      setError(tErr("uploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload"
          className="flex-1 font-mono text-xs"
        />
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
          <Upload className="size-3.5" />
          {uploading ? t("uploading") : t("uploadMedia")}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * Font upload control (#82). Uploads a woff/woff2 via uploadCustomFont,
 * shows the uploaded font library below with delete (with confirm dialog
 * listing themes that will fall back to Inter).
 */
export function FontUploadField({
  fonts,
  onUploaded,
  onDeleted,
  themes,
}: {
  fonts: CustomFontMeta[];
  onUploaded: (font: CustomFontMeta) => void;
  onDeleted: () => void;
  /** All themes — used to count which reference each uploaded font. */
  themes: { id: number; name: string; fontFamily: string | null }[];
}) {
  const t = useTranslations("theme");
  const tErr = useTranslations("errors");
  const [uploading, setUploading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CustomFontMeta | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(tErr("fileTooLarge2"));
      e.target.value = "";
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (name.trim()) fd.append("name", name.trim());
      const res = await uploadCustomFont(fd);
      if (res.success) {
        onUploaded(res.font);
        setName("");
      } else {
        setError(localizeActionError(tErr, res.error));
      }
    } catch {
      setError(tErr("uploadFailed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteCustomFontAction(deleteTarget.id);
      if (res.success) {
        setDeleteTarget(null);
        onDeleted();
      } else {
        setDeleteError(localizeActionError(tErr, res.error));
      }
    } catch {
      setDeleteError("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/50 p-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-muted-foreground">
          Your fonts (woff2 / woff, max 2 MB)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("displayNameOptional")}
            maxLength={60}
            className="flex-1"
          />
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted">
            <Upload className="size-3.5" />
            {uploading ? t("uploading") : t("uploadFont")}
            <input
              type="file"
              accept=".woff2,.woff,font/woff2,font/woff"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
        <p className="text-[11px] text-muted-foreground">{t("onlyUploadFontsYouHaveTheLicenseToUseUpl")}</p>
      </div>

      {fonts.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {fonts.map((f) => {
            const users = themes.filter((t) => t.fontFamily === `custom:${f.id}`);
            return (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
              >
                <FileType className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <span
                    className="block truncate text-xs font-medium"
                    style={{ fontFamily: `'${f.family}', sans-serif` }}
                  >
                    {f.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {f.format} · {t("kb", { num: (f.sizeBytes / 1024).toFixed(0) })}
                    {users.length > 0
                      ? t("usedByThemes", { count: users.length })
                      : ""}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(f)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Delete ${f.name}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-xs font-medium">
            {t("deleteFontTitle", { name: deleteTarget.name })}
          </p>
          {(() => {
            const users = themes.filter((t) => t.fontFamily === `custom:${deleteTarget.id}`);
            return users.length > 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {t("themesUseIt", { count: users.length, names: users.map((t) => t.name).join(", ") })}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">{t("noThemesUseThisFont")}</p>
            );
          })()}
          {deleteError ? (
            <p className="text-[11px] text-destructive">{deleteError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              size="sm"
              onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
            >{t("cancel")}</Button>
            <Button
              variant="destructive"
              type="button"
              size="sm"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? t("deleting") : t("deleteFont")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
