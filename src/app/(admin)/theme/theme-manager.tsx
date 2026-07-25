"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Save, Palette, Copy, Trash2, Eye } from "lucide-react";
import {
  activateTheme,
  customizeActiveTheme,
  duplicateActiveTheme,
  deleteCustomTheme,
} from "@/server/actions/theme";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ThemeManagerProps {
  themes: ThemeRow[];
  activeId: number | null;
  active: ThemeRow | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { id: "inter", label: "Inter", sample: "Aa" },
  { id: "poppins", label: "Poppins", sample: "Aa" },
  { id: "playfair", label: "Playfair Display", sample: "Aa" },
  { id: "jetbrains", label: "JetBrains Mono", sample: "Aa" },
  { id: "space-grotesk", label: "Space Grotesk", sample: "Aa" },
  { id: "dm-sans", label: "DM Sans", sample: "Aa" },
  { id: "lora", label: "Lora", sample: "Aa" },
  { id: "bebas", label: "Bebas Neue", sample: "Aa" },
  { id: "sora", label: "Sora", sample: "Aa" },
  { id: "outfit", label: "Outfit", sample: "Aa" },
];

const BG_TYPES = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
  { value: "radial", label: "Radial" },
  { value: "mesh", label: "Mesh" },
  { value: "aurora", label: "Aurora" },
  { value: "animatedGradient", label: "Animated Gradient" },
  { value: "image", label: "Image" },
  { value: "pattern", label: "Pattern" },
];

const LINK_STYLES = [
  { value: "pill", label: "Pill" },
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "glass", label: "Glass" },
  { value: "outline", label: "Outline" },
  { value: "neon", label: "Neon" },
];

const SHADOW_STRENGTHS = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
];

const HOVER_EFFECTS = [
  { value: "lift", label: "Lift" },
  { value: "scale", label: "Scale" },
  { value: "glow", label: "Glow" },
  { value: "none", label: "None" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function swatchFor(theme: ThemeRow): React.CSSProperties {
  const parts = theme.backgroundValue?.split(",") ?? [];
  if (theme.backgroundType === "solid") return { background: parts[0] || "#0a0820" };
  if (theme.backgroundType === "aurora") return { background: "#0a0820" };
  if (theme.backgroundType === "mesh" || parts.length >= 3) {
    return { background: `linear-gradient(135deg, ${theme.backgroundValue})` };
  }
  return {
    background: `linear-gradient(135deg, ${theme.backgroundValue})`,
  };
}

// ─── Reusable field components ─────────────────────────────────────────────

function ColorField({
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
          value={allowRgba ? undefined : (val?.match(/^#[0-9a-fA-F]{6}$/)?.[0] ?? "#000000")}
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

function SelectField({
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

function ToggleField({
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

function SliderField({
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

// ─── Main component ────────────────────────────────────────────────────────

export function ThemeManager({ themes, activeId, active }: ThemeManagerProps) {
  const [selecting, setSelecting] = React.useState<number | null>(null);
  const [customPending, setCustomPending] = React.useState(false);
  const [customError, setCustomError] = React.useState<string | null>(null);
  const [dupName, setDupName] = React.useState("");
  const [dupPending, setDupPending] = React.useState(false);
  const [delPending, setDelPending] = React.useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const router = useRouter();

  const handleSelect = async (id: number) => {
    setSelecting(id);
    try {
      await activateTheme(id);
      router.refresh();
    } finally {
      setSelecting(null);
    }
  };

  const handleCustom = async (formData: FormData) => {
    setCustomPending(true);
    setCustomError(null);
    try {
      const res = await customizeActiveTheme(formData);
      if (!res.success) {
        setCustomError(res.error);
      } else {
        router.refresh();
      }
    } catch {
      setCustomError("Failed to save theme. Please try again.");
    } finally {
      setCustomPending(false);
    }
  };

  const handleDuplicate = async () => {
    const name = dupName.trim().slice(0, 100);
    if (!name) return;
    setDupPending(true);
    try {
      const res = await duplicateActiveTheme(name);
      if (res.success) {
        setDupName("");
        router.refresh();
      }
    } finally {
      setDupPending(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDelPending(id);
    setDeleteTarget(null);
    try {
      await deleteCustomTheme(id);
      router.refresh();
    } finally {
      setDelPending(null);
    }
  };

  const isCustom = active ? !active.isPreset : false;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Theme</h1>
        <p className="text-sm text-muted-foreground">
          Choose a preset or fully customise your page.
        </p>
      </div>

      {/* ─── Preset Gallery ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {themes.map((theme) => {
          const isActive = theme.id === activeId;
          return (
            <div
              key={theme.id}
              className="group relative overflow-hidden rounded-xl border border-border text-left backdrop-blur-xl transition-all hover:ring-2 hover:ring-ring/50 data-[active=true]:ring-2 data-[active=true]:ring-primary"
              data-active={isActive}
            >
              <button
                onClick={() => handleSelect(theme.id)}
                className="block w-full"
                type="button"
                disabled={selecting === theme.id}
              >
                <div
                  className="flex h-28 items-end p-3"
                  style={{ ...swatchFor(theme), color: theme.textColor ?? "#fff" }}
                >
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm"
                    style={{ background: "rgba(0,0,0,0.25)", color: theme.textColor ?? "#fff" }}
                  >
                    {theme.name}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card p-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Palette className="size-3" />
                    <span className="capitalize">{theme.linkStyle}</span>
                  </div>
                  {isActive ? (
                    <Badge className="border-transparent bg-[var(--aurora-grad)] text-white">
                      <Check className="size-3" /> Active
                    </Badge>
                  ) : selecting === theme.id ? (
                    <span className="text-xs text-muted-foreground">Applying…</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Use</span>
                  )}
                </div>
              </button>
              {/* Delete button for non-preset, non-active custom themes */}
              {!theme.isPreset && !isActive ? (
                <button
                  onClick={() => setDeleteTarget(theme.id)}
                  disabled={delPending === theme.id}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                  title="Delete theme"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
              {!theme.isPreset ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Custom
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ─── Customizer ──────────────────────────────────────────────── */}
      {active ? (
        <>
          <Separator />
          <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Customise &ldquo;{active.name}&rdquo;</CardTitle>
                  <CardDescription>
                    Full control over every visual aspect. Changes apply instantly.
                  </CardDescription>
                </div>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-accent"
                >
                  <Eye className="size-4" />
                  Preview
                </a>
              </div>
            </CardHeader>
            <form action={handleCustom}>
              <CardContent className="flex flex-col gap-6">
                {/* ── Background ── */}
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Background</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SelectField
                      label="Type"
                      name="backgroundType"
                      defaultValue={active.backgroundType}
                      options={BG_TYPES}
                    />
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="backgroundValue" className="text-xs text-muted-foreground">
                        Value (colors separated by commas)
                      </Label>
                      <Input
                        id="backgroundValue"
                        name="backgroundValue"
                        defaultValue={active.backgroundValue ?? ""}
                        placeholder="#1a1530,#2a2150"
                        className="font-mono text-xs"
                      />
                    </div>
                    <SelectField
                      label="Angle"
                      name="backgroundAngle"
                      defaultValue={active.backgroundAngle}
                      options={[
                        { value: "90deg", label: "90° (horizontal)" },
                        { value: "135deg", label: "135° (diagonal)" },
                        { value: "160deg", label: "160° (steep)" },
                        { value: "180deg", label: "180° (vertical)" },
                        { value: "radial", label: "Radial" },
                      ]}
                    />
                    {active.backgroundType === "image" ? (
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="backgroundImageUrl" className="text-xs text-muted-foreground">
                          Image URL
                        </Label>
                        <Input
                          id="backgroundImageUrl"
                          name="backgroundImageUrl"
                          defaultValue={active.backgroundImageUrl ?? ""}
                          placeholder="https://…"
                          className="font-mono text-xs"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ColorField
                      label="Overlay color"
                      name="overlayColor"
                      defaultValue={active.overlayColor}
                    />
                    <SliderField
                      label="Overlay opacity"
                      name="overlayOpacity"
                      defaultValue={active.overlayOpacity ?? "0"}
                      min={0}
                      max={100}
                      unit="%"
                    />
                  </div>
                </section>

                <Separator />

                {/* ── Colors ── */}
                <section className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Colors</h3>
                    <SelectField
                      label=""
                      name="mode"
                      defaultValue={active.mode ?? "dark"}
                      options={[
                        { value: "dark", label: "🌙 Dark" },
                        { value: "light", label: "☀️ Light" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ColorField label="Accent (primary)" name="primaryColor" defaultValue={active.primaryColor} />
                    <ColorField label="Secondary" name="secondaryColor" defaultValue={active.secondaryColor} />
                    <ColorField label="Text" name="textColor" defaultValue={active.textColor} />
                    <ColorField label="Muted text" name="mutedTextColor" defaultValue={active.mutedTextColor} />
                    <ColorField label="Card background" name="cardBackground" defaultValue={active.cardBackground} allowRgba />
                    <ColorField label="Card border" name="cardBorderColor" defaultValue={active.cardBorderColor} allowRgba />
                  </div>
                </section>

                <Separator />

                {/* ── Typography ── */}
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Typography</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {FONT_OPTIONS.map((font) => (
                      <label key={font.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="fontFamily"
                          value={font.id}
                          defaultChecked={active.fontFamily === font.id}
                          className="peer sr-only"
                        />
                        <span
                          className="inline-flex flex-col items-center gap-0.5 rounded-lg border border-border px-3 py-2 text-xs transition-all peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50"
                        >
                          <span className="text-base font-bold">{font.sample}</span>
                          {font.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <SliderField
                      label="Font scale"
                      name="fontScale"
                      defaultValue={active.fontScale ?? "100"}
                      min={80}
                      max={150}
                      unit="%"
                    />
                    <SelectField
                      label="Weight"
                      name="fontWeight"
                      defaultValue={active.fontWeight ?? "500"}
                      options={[
                        { value: "300", label: "Light" },
                        { value: "400", label: "Regular" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                      ]}
                    />
                    <SliderField
                      label="Letter spacing"
                      name="letterSpacing"
                      defaultValue={active.letterSpacing ?? "0"}
                      min={-2}
                      max={5}
                      step={0.5}
                    />
                  </div>
                </section>

                <Separator />

                {/* ── Card Style ── */}
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Card Style</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <SelectField
                      label="Link style"
                      name="linkStyle"
                      defaultValue={active.linkStyle}
                      options={LINK_STYLES}
                    />
                    <SelectField
                      label="Hover effect"
                      name="hoverEffect"
                      defaultValue={active.hoverEffect ?? active.animationType}
                      options={HOVER_EFFECTS}
                    />
                    <SelectField
                      label="Button size"
                      name="buttonSize"
                      defaultValue={active.buttonSize ?? "md"}
                      options={[
                        { value: "sm", label: "Small" },
                        { value: "md", label: "Medium" },
                        { value: "lg", label: "Large" },
                      ]}
                    />
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="radius" className="text-xs text-muted-foreground">
                        Corner radius
                      </Label>
                      <Input
                        id="radius"
                        name="radius"
                        defaultValue={active.radius ?? "auto"}
                        placeholder="auto, 0px, 8px, 9999px"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="borderWidth" className="text-xs text-muted-foreground">
                        Border width
                      </Label>
                      <Input
                        id="borderWidth"
                        name="borderWidth"
                        defaultValue={active.borderWidth ?? "1px"}
                        placeholder="0px, 1px, 2px, 3px"
                        className="font-mono text-xs"
                      />
                    </div>
                    <SelectField
                      label="Shadow"
                      name="shadowStrength"
                      defaultValue={active.shadowStrength ?? "medium"}
                      options={SHADOW_STRENGTHS}
                    />
                  </div>
                </section>

                <Separator />

                {/* ── Layout ── */}
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Layout</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="containerWidth" className="text-xs text-muted-foreground">
                        Container width
                      </Label>
                      <Input
                        id="containerWidth"
                        name="containerWidth"
                        defaultValue={active.containerWidth ?? "540px"}
                        placeholder="480px, 540px, 640px"
                        className="font-mono text-xs"
                      />
                    </div>
                    <SelectField
                      label="Alignment"
                      name="alignment"
                      defaultValue={active.alignment ?? "center"}
                      options={[
                        { value: "left", label: "Left" },
                        { value: "center", label: "Center" },
                        { value: "right", label: "Right" },
                      ]}
                    />
                    <SelectField
                      label="Density"
                      name="density"
                      defaultValue={active.density ?? "normal"}
                      options={[
                        { value: "compact", label: "Compact" },
                        { value: "normal", label: "Normal" },
                        { value: "relaxed", label: "Relaxed" },
                      ]}
                    />
                  </div>
                </section>

                <Separator />

                {/* ── Effects ── */}
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Effects</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ToggleField label="Glow" name="glow" defaultValue={active.glow ?? "false"} />
                    <ToggleField label="Noise texture" name="noise" defaultValue={active.noise ?? "false"} />
                    <ColorField label="Glow color" name="glowColor" defaultValue={active.glowColor} />
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="blur" className="text-xs text-muted-foreground">
                        Glass blur
                      </Label>
                      <Input
                        id="blur"
                        name="blur"
                        defaultValue={active.blur ?? "12px"}
                        placeholder="0px, 8px, 12px, 20px"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  <SelectField
                    label="Reveal animation"
                    name="animationType"
                    defaultValue={active.animationType ?? "lift"}
                    options={[
                      { value: "lift", label: "Lift (rise up)" },
                      { value: "scale", label: "Scale (grow in)" },
                      { value: "none", label: "None" },
                    ]}
                  />
                </section>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {customError ? (
                  <p className="w-full text-xs text-destructive">{customError}</p>
                ) : null}
                <div className="flex w-full items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {isCustom
                      ? "Editing a custom theme"
                      : "Editing a preset — duplicate it first to keep changes separate"}
                  </p>
                  <Button type="submit" disabled={customPending}>
                    <Save className="size-4" />
                    {customPending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* ─── Duplicate ───────────────────────────────────────────── */}
          <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Duplicate theme</CardTitle>
              <CardDescription>
                Save a copy of &ldquo;{active.name}&rdquo; as a new custom theme you can edit freely.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Input
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
                placeholder={`${active.name} (copy)`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleDuplicate();
                  }
                }}
                maxLength={100}
              />
              <Button onClick={handleDuplicate} disabled={dupPending || !dupName.trim()}>
                <Copy className="size-4" />
                {dupPending ? "Copying…" : "Duplicate"}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Delete confirmation dialog — replaces native confirm() */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete this custom theme?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The theme will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={delPending !== null}
              onClick={() => { if (deleteTarget !== null) handleDelete(deleteTarget); }}
            >
              {delPending !== null ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
