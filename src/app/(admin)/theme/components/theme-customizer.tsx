"use client";

import * as React from "react";
import { Save } from "lucide-react";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeLivePreview } from "./theme-live-preview";
import {
  BackgroundSection,
  ColorsSection,
  TypographySection,
  CardStyleSection,
  LayoutSection,
  EffectsSection,
  ProfileSection,
} from "./theme-customizer-sections";

/** Shape of the controlled customizer state (strings, matching the form fields). */
export type CustomizerState = {
  backgroundType: string;
  backgroundValue: string;
  backgroundAngle: string;
  backgroundImageUrl: string;
  backgroundFit: string;
  backgroundPosition: string;
  overlayColor: string;
  overlayOpacity: string; // 0–100 (slider scale)
  primaryColor: string;
  secondaryColor: string;
  cardBackground: string;
  cardBorderColor: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  fontScale: string;
  fontWeight: string;
  letterSpacing: string;
  linkStyle: string;
  animationType: string;
  radius: string;
  buttonSize: string;
  borderWidth: string;
  shadowStrength: string;
  hoverEffect: string;
  containerWidth: string;
  alignment: string;
  density: string;
  glow: string;
  glowColor: string;
  blur: string;
  noise: string;
  avatarShape: string;
  avatarBorder: string;
  avatarFloat: string;
  profileLayout: string;
  textAnimation: string;
};

function stateFromTheme(active: ThemeRow): CustomizerState {
  return {
    backgroundType: active.backgroundType ?? "gradient",
    backgroundValue: active.backgroundValue ?? "",
    backgroundAngle: active.backgroundAngle ?? "135deg",
    backgroundImageUrl: active.backgroundImageUrl ?? "",
    backgroundFit: active.backgroundFit ?? "cover",
    backgroundPosition: active.backgroundPosition ?? "50% 50%",
    overlayColor: active.overlayColor ?? "#000000",
    // Normalize legacy 0–1 rows to the 0–100 slider scale.
    overlayOpacity: normalizeOverlayScale(active.overlayOpacity),
    primaryColor: active.primaryColor ?? "#533fd6",
    secondaryColor: active.secondaryColor ?? "#a78bfa",
    cardBackground: active.cardBackground ?? "",
    cardBorderColor: active.cardBorderColor ?? "",
    textColor: active.textColor ?? "#eceafe",
    mutedTextColor: active.mutedTextColor ?? "",
    fontFamily: active.fontFamily ?? "inter",
    fontScale: active.fontScale ?? "100",
    fontWeight: active.fontWeight ?? "500",
    letterSpacing: active.letterSpacing ?? "0",
    linkStyle: active.linkStyle ?? "glass",
    animationType: active.animationType ?? "lift",
    radius: active.radius ?? "auto",
    buttonSize: active.buttonSize ?? "md",
    borderWidth: active.borderWidth ?? "1px",
    shadowStrength: active.shadowStrength ?? "medium",
    hoverEffect: active.hoverEffect ?? "lift",
    containerWidth: active.containerWidth ?? "540px",
    alignment: active.alignment ?? "center",
    density: active.density ?? "normal",
    glow: active.glow ?? "false",
    glowColor: active.glowColor ?? "#533fd6",
    blur: active.blur ?? "12px",
    noise: active.noise ?? "false",
    avatarShape: active.avatarShape ?? "circle",
    avatarBorder: active.avatarBorder ?? "solid",
    avatarFloat: active.avatarFloat ?? "false",
    profileLayout: active.profileLayout ?? "classic",
    textAnimation: active.textAnimation ?? "none",
  };
}

/** Legacy rows stored 0–1 fractions; the slider works on 0–100. */
function normalizeOverlayScale(raw: string | null | undefined): string {
  if (!raw) return "0";
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return "0";
  return String(Math.round(num <= 1 ? num * 100 : num));
}

const TABS = [
  { id: "background", label: "Background" },
  { id: "typography", label: "Typography" },
  { id: "links", label: "Links" },
  { id: "profile", label: "Profile" },
  { id: "effects", label: "Effects" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ThemeCustomizer({
  active,
  onCustomize,
  customPending,
  customError,
  isCustom,
  onFork,
  forkPending,
}: {
  active: ThemeRow;
  onCustomize: (formData: FormData) => void;
  customPending: boolean;
  customError: string | null;
  isCustom: boolean;
  onFork: (name: string, formData: FormData) => void;
  forkPending: boolean;
}) {
  const [state, setState] = React.useState<CustomizerState>(() => stateFromTheme(active));
  const [forkOpen, setForkOpen] = React.useState(false);
  const [forkName, setForkName] = React.useState("");
  const [tab, setTab] = React.useState<TabId>("background");

  // Remount fields on theme switch (controlled state re-initialises).
  const [themeKey, setThemeKey] = React.useState(active.id);
  if (active.id !== themeKey) {
    setThemeKey(active.id);
    setState(stateFromTheme(active));
  }

  const set = (patch: Partial<CustomizerState>) => setState((s) => ({ ...s, ...patch }));

  const dirty = React.useMemo(() => {
    const initial = stateFromTheme(active);
    return Object.keys(initial).some(
      (k) => initial[k as keyof CustomizerState] !== state[k as keyof CustomizerState],
    );
  }, [state, active]);

  const formData = React.useCallback(() => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(state)) fd.set(k, v);
    fd.set("themeId", String(active.id));
    return fd;
  }, [state, active.id]);

  const handleSave = () => {
    if (!dirty) return;
    if (isCustom) {
      onCustomize(formData());
    } else {
      setForkName(`${active.name} (copy)`);
      setForkOpen(true);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle>Customise &ldquo;{active.name}&rdquo;</CardTitle>
          <CardDescription>
            Every change previews live. Changes apply on save.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-6 px-6 pb-4 xl:flex-row">
          {/* Vertical tab rail (horizontal strip below xl) */}
          <nav
            aria-label="Customizer sections"
            className="flex shrink-0 gap-1 overflow-x-auto pb-1 xl:w-40 xl:flex-col xl:pb-0"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id}
                className={`flex shrink-0 items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? "bg-[var(--aurora-grad)] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Fields area */}
          <div className="min-w-0 flex-1">
            {tab === "background" ? (
              <>
                <BackgroundSection s={state} set={set} />
                <div className="mt-6">
                  <ColorsSection s={state} set={set} />
                </div>
              </>
            ) : null}
            {tab === "typography" ? <TypographySection s={state} set={set} /> : null}
            {tab === "links" ? (
              <>
                <CardStyleSection s={state} set={set} />
                <div className="mt-6">
                  <LayoutSection s={state} set={set} />
                </div>
              </>
            ) : null}
            {tab === "profile" ? <ProfileSection s={state} set={set} /> : null}
            {tab === "effects" ? <EffectsSection s={state} set={set} /> : null}
          </div>

          {/* Theme visualizer — sticky on wide screens */}
          <div className="mx-auto w-full shrink-0 xl:sticky xl:top-20 xl:w-[268px]">
            <ThemeLivePreview state={state} />
          </div>
        </div>
        <CardFooter className="flex flex-col gap-2">
          {customError ? (
            <p className="w-full text-xs text-destructive">{customError}</p>
          ) : null}
          <div className="flex w-full items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isCustom
                ? "Editing a custom theme"
                : "Preset — saving creates your own copy"}
            </p>
            <Button type="button" onClick={handleSave} disabled={customPending || forkPending || !dirty}>
              <Save className="size-4" />
              {customPending || forkPending ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Fork dialog: saving a preset prompts for a copy name first */}
      <Dialog open={forkOpen} onOpenChange={setForkOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Save as your own theme?</DialogTitle>
            <DialogDescription>
              &ldquo;{active.name}&rdquo; is a shared preset — changing it would
              restyle every page using that preset. Save your customisations as a
              new theme instead.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={forkName}
            onChange={(e) => setForkName(e.target.value)}
            placeholder="New theme name"
            maxLength={100}
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setForkOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={forkPending || !forkName.trim()}
              onClick={() => onFork(forkName.trim().slice(0, 100), formData())}
            >
              {forkPending ? "Creating…" : "Create & save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
