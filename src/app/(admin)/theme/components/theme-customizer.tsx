"use client";

import { Save } from "lucide-react";
import type { ThemeRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ColorField, SelectField, ToggleField, SliderField } from "./field-controls";
import {
  FONT_OPTIONS,
  BG_TYPES,
  LINK_STYLES,
  SHADOW_STRENGTHS,
  HOVER_EFFECTS,
  BACKGROUND_ANGLES,
  FONT_WEIGHTS,
  BUTTON_SIZES,
  ALIGNMENTS,
  DENSITIES,
  REVEAL_ANIMATIONS,
  MODE_OPTIONS,
} from "../theme-constants";

// ─── Section sub-components ────────────────────────────────────────────────

function BackgroundSection({ active }: { active: ThemeRow }) {
  return (
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
          options={BACKGROUND_ANGLES}
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
  );
}

function ColorsSection({ active }: { active: ThemeRow }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Colors</h3>
        <SelectField
          label=""
          name="mode"
          defaultValue={active.mode ?? "dark"}
          options={MODE_OPTIONS}
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
  );
}

function TypographySection({ active }: { active: ThemeRow }) {
  return (
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
              className="inline-flex flex-col items-center gap-0.5 rounded-lg border border-border px-3 py-2 text-xs transition-[border-color,background-color] peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50"
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
          options={FONT_WEIGHTS}
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
  );
}

function CardStyleSection({ active }: { active: ThemeRow }) {
  return (
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
          options={BUTTON_SIZES}
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
  );
}

function LayoutSection({ active }: { active: ThemeRow }) {
  return (
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
          options={ALIGNMENTS}
        />
        <SelectField
          label="Density"
          name="density"
          defaultValue={active.density ?? "normal"}
          options={DENSITIES}
        />
      </div>
    </section>
  );
}

function EffectsSection({ active }: { active: ThemeRow }) {
  return (
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
        options={REVEAL_ANIMATIONS}
      />
    </section>
  );
}

// ─── Main customizer component ─────────────────────────────────────────────

interface ThemeCustomizerProps {
  active: ThemeRow;
  onCustomize: (formData: FormData) => void;
  customPending: boolean;
  customError: string | null;
  isCustom: boolean;
}

export function ThemeCustomizer({
  active,
  onCustomize,
  customPending,
  customError,
  isCustom,
}: ThemeCustomizerProps) {
  return (
    <>
      <Separator />
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Customise &ldquo;{active.name}&rdquo;</CardTitle>
          <CardDescription>
            Full control over every visual aspect. Changes apply on save.
          </CardDescription>
        </CardHeader>
        <form action={onCustomize}>
          <CardContent>
            <Tabs defaultValue="background" className="gap-4">
              <TabsList>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
              </TabsList>
              <TabsContent value="background">
                <BackgroundSection active={active} />
                <div className="mt-4">
                  <ColorsSection active={active} />
                </div>
              </TabsContent>
              <TabsContent value="typography">
                <TypographySection active={active} />
              </TabsContent>
              <TabsContent value="links">
                <CardStyleSection active={active} />
                <div className="mt-4">
                  <LayoutSection active={active} />
                </div>
              </TabsContent>
              <TabsContent value="effects">
                <EffectsSection active={active} />
              </TabsContent>
            </Tabs>
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
    </>
  );
}
