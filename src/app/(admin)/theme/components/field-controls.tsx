"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadBackgroundMedia } from "@/server/actions/uploads";
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
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select name={name} value={value} onValueChange={(v) => v !== null && onChange(v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
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
          >
            Auto
          </button>
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
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File too large (max ${maxSizeMb} MB)`);
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
          {uploading ? "Uploading…" : "Upload"}
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
