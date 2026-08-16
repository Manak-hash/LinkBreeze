"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorField, SelectField, ToggleField, SliderField, MediaUrlField } from "./field-controls";
import { FocalPointPicker, FitPicker } from "./focal-point-picker";
import type { CustomizerState } from "./theme-customizer";
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
  AVATAR_SHAPES,
  AVATAR_BORDERS,
  PROFILE_LAYOUTS,
  TEXT_ANIMATIONS,
} from "../theme-constants";

export type SetFn = (patch: Partial<CustomizerState>) => void;

export function BackgroundSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  const type = s.backgroundType;
  const showAngle =
    type === "gradient" ||
    type === "animatedGradient" ||
    type === "radial" ||
    // video: angle shapes the fallback gradient shown when the video can't load
    type === "video";
  // video: colors define the fallback gradient behind/around the video
  const showValue = type !== "image" && type !== "gif";
  const showMedia = type === "image" || type === "gif" || type === "video";
  const showOverlay = type === "image" || type === "gif" || type === "video";
  const isVideo = type === "video";
  const fit = (["cover", "contain", "tile"].includes(s.backgroundFit)
    ? s.backgroundFit
    : "cover") as "cover" | "contain" | "tile";

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Background</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Type"
          name="backgroundType"
          value={s.backgroundType}
          onChange={(v) => set({ backgroundType: v })}
          options={BG_TYPES}
        />
        {showValue ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="backgroundValue" className="text-xs text-muted-foreground">
              Colors (comma-separated)
            </Label>
            <Input
              id="backgroundValue"
              name="backgroundValue"
              value={s.backgroundValue}
              onChange={(e) => set({ backgroundValue: e.target.value })}
              placeholder={type === "solid" ? "#1a1530" : "#1a1530,#2a2150"}
              className="font-mono text-xs"
            />
          </div>
        ) : null}
        {showAngle ? (
          <SelectField
            label="Angle"
            name="backgroundAngle"
            value={s.backgroundAngle}
            onChange={(v) => set({ backgroundAngle: v })}
            options={BACKGROUND_ANGLES}
          />
        ) : null}
      </div>

      {showMedia ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {type === "image" ? (
              <MediaUrlField
                label="Image URL"
                name="backgroundImageUrl"
                value={s.backgroundImageUrl}
                onChange={(v) => set({ backgroundImageUrl: v })}
                accept="image/*"
                hint="Max 2 MB. JPG, PNG, WebP."
              />
            ) : null}
            {type === "gif" ? (
              <MediaUrlField
                label="Animated GIF URL"
                name="backgroundImageUrl"
                value={s.backgroundImageUrl}
                onChange={(v) => set({ backgroundImageUrl: v })}
                accept="image/gif"
                hint="Max 2 MB. Keep loops short — big GIFs are heavy for mobile visitors."
              />
            ) : null}
            {type === "video" ? (
              <MediaUrlField
                label="Video URL (.mp4 / .webm)"
                name="backgroundImageUrl"
                value={s.backgroundImageUrl}
                onChange={(v) => set({ backgroundImageUrl: v })}
                accept="video/mp4,video/webm"
                maxSizeMb={5}
                hint="Max 5 MB, muted autoplay loop. Fallback: your background colors paint the page when the video can't load."
              />
            ) : null}
          </div>

          {s.backgroundImageUrl ? (
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_200px]">
              <FocalPointPicker
                imageUrl={s.backgroundImageUrl}
                isVideo={isVideo}
                fit={fit}
                value={s.backgroundPosition}
                onChange={(v) => set({ backgroundPosition: v })}
              />
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                  How the media fills the page
                </Label>
                <FitPicker
                  value={fit}
                  onChange={(v) => set({ backgroundFit: v })}
                  allowTile={!isVideo}
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Drag the dot to set the focal point — the part that stays
                  visible when screens crop it.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Upload media or paste a URL to unlock display controls (fit and focal point).
            </p>
          )}
        </div>
      ) : null}

      {showOverlay ? (
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            label="Overlay color"
            name="overlayColor"
            value={s.overlayColor}
            onChange={(v) => set({ overlayColor: v })}
          />
          <SliderField
            label="Overlay opacity"
            name="overlayOpacity"
            value={parseInt(s.overlayOpacity, 10) || 0}
            onChange={(v) => set({ overlayOpacity: String(v) })}
            min={0}
            max={100}
            unit="%"
          />
        </div>
      ) : null}
      {type === "aurora" ? (
        <p className="text-[11px] text-muted-foreground">
          Aurora is driven by your colors: accent (primary) and secondary tint the
          moving blobs, and the first background color sets the base.
        </p>
      ) : null}
    </section>
  );
}

export function ColorsSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Colors</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ColorField label="Accent (primary)" name="primaryColor" value={s.primaryColor} onChange={(v) => set({ primaryColor: v })} />
        <ColorField label="Secondary" name="secondaryColor" value={s.secondaryColor} onChange={(v) => set({ secondaryColor: v })} />
        <ColorField label="Text" name="textColor" value={s.textColor} onChange={(v) => set({ textColor: v })} />
        <ColorField label="Muted text" name="mutedTextColor" value={s.mutedTextColor} onChange={(v) => set({ mutedTextColor: v })} />
        <ColorField label="Card background" name="cardBackground" value={s.cardBackground} onChange={(v) => set({ cardBackground: v })} allowRgba />
        <ColorField label="Card border" name="cardBorderColor" value={s.cardBorderColor} onChange={(v) => set({ cardBorderColor: v })} allowRgba />
      </div>
    </section>
  );
}

export function TypographySection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Typography</h3>
      <div className="flex flex-wrap gap-1.5">
        {FONT_OPTIONS.map((font) => (
          <label key={font.id} className="cursor-pointer">
            <input
              type="radio"
              name="fontFamily"
              value={font.id}
              checked={s.fontFamily === font.id}
              onChange={() => set({ fontFamily: font.id })}
              className="peer sr-only"
            />
            <span
              style={{ fontFamily: `var(--lb-font-${font.id}, sans-serif)` }}
              className="inline-flex flex-col items-center gap-0.5 rounded-lg border border-border px-3 py-2 text-xs transition-colors peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50"
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
          value={parseInt(s.fontScale, 10) || 100}
          onChange={(v) => set({ fontScale: String(v) })}
          min={80}
          max={150}
          unit="%"
        />
        <SelectField
          label="Weight"
          name="fontWeight"
          value={s.fontWeight}
          onChange={(v) => set({ fontWeight: v })}
          options={FONT_WEIGHTS}
        />
        <SliderField
          label="Letter spacing"
          name="letterSpacing"
          value={parseFloat(s.letterSpacing) || 0}
          onChange={(v) => set({ letterSpacing: String(v) })}
          min={-2}
          max={5}
          step={0.5}
        />
      </div>
    </section>
  );
}

export function CardStyleSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Card Style</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Link style"
          name="linkStyle"
          value={s.linkStyle}
          onChange={(v) => set({ linkStyle: v })}
          options={LINK_STYLES}
        />
        <SelectField
          label="Hover effect"
          name="hoverEffect"
          value={s.hoverEffect}
          onChange={(v) => set({ hoverEffect: v })}
          options={HOVER_EFFECTS}
        />
        <SelectField
          label="Button size"
          name="buttonSize"
          value={s.buttonSize}
          onChange={(v) => set({ buttonSize: v })}
          options={BUTTON_SIZES}
        />
        <SliderField
          label="Corner radius"
          name="radius"
          value={s.radius === "auto" ? "auto" : parseInt(s.radius, 10) || 0}
          onChange={(v) => set({ radius: v === "auto" ? "auto" : `${v}px` })}
          min={0}
          max={32}
          unit="px"
          autoValue="auto"
        />
        <SliderField
          label="Border width"
          name="borderWidth"
          value={parseInt(s.borderWidth, 10) || 0}
          onChange={(v) => set({ borderWidth: `${v}px` })}
          min={0}
          max={4}
          step={1}
          unit="px"
        />
        <SelectField
          label="Shadow"
          name="shadowStrength"
          value={s.shadowStrength}
          onChange={(v) => set({ shadowStrength: v })}
          options={SHADOW_STRENGTHS}
        />
      </div>
      {s.linkStyle === "glass" || s.linkStyle === "neon" ? (
        <SliderField
          label="Glass blur"
          name="blur"
          value={parseInt(s.blur, 10) || 0}
          onChange={(v) => set({ blur: `${v}px` })}
          min={0}
          max={30}
          unit="px"
        />
      ) : null}
    </section>
  );
}

export function LayoutSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Layout</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SliderField
          label="Container width"
          name="containerWidth"
          value={parseInt(s.containerWidth, 10) || 540}
          onChange={(v) => set({ containerWidth: `${v}px` })}
          min={420}
          max={720}
          step={10}
          unit="px"
        />
        <SelectField
          label="Alignment"
          name="alignment"
          value={s.alignment}
          onChange={(v) => set({ alignment: v })}
          options={ALIGNMENTS}
        />
        <SelectField
          label="Density"
          name="density"
          value={s.density}
          onChange={(v) => set({ density: v })}
          options={DENSITIES}
        />
      </div>
      <SelectField
        label="Profile layout"
        name="profileLayout"
        value={s.profileLayout}
        onChange={(v) => set({ profileLayout: v })}
        options={PROFILE_LAYOUTS}
      />
      {s.profileLayout === "hero" || s.profileLayout === "banner" ? (
        <p className="text-[11px] text-muted-foreground">
          Set the banner image on the Profile page (Banner image field). Hero and
          Banner layouts use it as the cover.
        </p>
      ) : null}
    </section>
  );
}

export function EffectsSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Effects</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ToggleField label="Glow" name="glow" checked={s.glow === "true"} onChange={(v) => set({ glow: v ? "true" : "false" })} />
        <ToggleField label="Noise texture" name="noise" checked={s.noise === "true"} onChange={(v) => set({ noise: v ? "true" : "false" })} />
        <ColorField label="Glow color" name="glowColor" value={s.glowColor} onChange={(v) => set({ glowColor: v })} />
        <SelectField
          label="Reveal animation"
          name="animationType"
          value={s.animationType}
          onChange={(v) => set({ animationType: v })}
          options={REVEAL_ANIMATIONS}
        />
      </div>
    </section>
  );
}

export function ProfileSection({ s, set }: { s: CustomizerState; set: SetFn }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Profile</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SelectField
          label="Avatar shape"
          name="avatarShape"
          value={s.avatarShape}
          onChange={(v) => set({ avatarShape: v })}
          options={AVATAR_SHAPES}
        />
        <SelectField
          label="Avatar border"
          name="avatarBorder"
          value={s.avatarBorder}
          onChange={(v) => set({ avatarBorder: v })}
          options={AVATAR_BORDERS}
        />
        <ToggleField
          label="Floating avatar"
          name="avatarFloat"
          checked={s.avatarFloat === "true"}
          onChange={(v) => set({ avatarFloat: v ? "true" : "false" })}
        />
        <SelectField
          label="Display name animation"
          name="textAnimation"
          value={s.textAnimation}
          onChange={(v) => set({ textAnimation: v })}
          options={TEXT_ANIMATIONS}
        />
      </div>
    </section>
  );
}
