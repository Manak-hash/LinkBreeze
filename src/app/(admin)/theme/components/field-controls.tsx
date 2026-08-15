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
  defaultValue,
  allowRgba = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  allowRgba?: boolean;
}) {
  const [val, setVal] = React.useState(defaultValue || "");
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={allowRgba ? "#000000" : (val?.match(/^#[0-9a-fA-F]{6}$/)?.[0] ?? "#000000")}
          onChange={(e) => setVal(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent"
          disabled={allowRgba}
        />
        <Input
          id={name}
          name={name}
          value={val}
          onChange={(e) => setVal(e.target.value)}
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
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select name={name} defaultValue={defaultValue || undefined}>
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
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  const [on, setOn] = React.useState(defaultValue === "true");
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input type="hidden" name={name} value={on ? "true" : "false"} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

export function SliderField({
  label,
  name,
  defaultValue,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  const numVal = parseInt(defaultValue || "100", 10);
  const [val, setVal] = React.useState(numVal);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {val}
          {unit}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        name={name}
        value={val}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setVal(parseInt(e.target.value, 10))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
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
  defaultValue,
  accept = "image/*",
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: string;
  hint?: string;
}) {
  const [val, setVal] = React.useState(defaultValue ?? "");
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
      const res = await uploadBackgroundMedia(fd);
      if (res.success) {
        setVal(res.url);
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
          value={val}
          onChange={(e) => setVal(e.target.value)}
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
