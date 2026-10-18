"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { imageAdjustmentStyle, resolveObjectFit } from "@/lib/image-adjustments";

/**
 * ImagePositionPicker — Spec: Image-Positioning.
 *
 * ONE shared admin component reused at all three upload surfaces (avatar,
 * banner, background image). Renders the REAL frame the public page will
 * use (shape/ratio per surface), with:
 *  - drag to set the focus point (posX/posY, 0–1) — the media visually
 *    slides under the crop window so what you see IS the adjustment
 *  - slider AND mouse-wheel for zoom (1–3; never for video)
 *  - fit toggle cover/contain
 *  - live X/Y readout + reset
 *
 * Non-destructive: only emits adjustment metadata; the file is untouched.
 * `onChange` fires on every move (parent debounces persistence).
 */

export interface ImagePositionPickerValue {
  fit: "cover" | "contain";
  posX: number; // 0–1
  posY: number; // 0–1
  zoom: number; // 1–3
}

export type ImageSurface = "avatar" | "banner" | "background" | "og";

// Larger frames than the first cut: a 160px avatar preview made precise
// dragging impossible. Banner shows at a taller ratio than the public
// 4:1 slot because a 60px-tall drag surface was unusable — the public
// crop math is ratio-independent (percent-based object-position).
const SURFACE_FRAME: Record<ImageSurface, { aspect: string; rounded: string; width: number }> = {
  avatar: { aspect: "1 / 1", rounded: "rounded-full", width: 260 },
  banner: { aspect: "3 / 1", rounded: "rounded-xl", width: 460 },
  background: { aspect: "9 / 14", rounded: "rounded-xl", width: 300 },
  // OG images render at 1200x630 (~1.9:1); the picker window mirrors it.
  og: { aspect: "1200 / 630", rounded: "rounded-xl", width: 460 },
};

export function ImagePositionPicker({
  surface,
  src,
  isVideo = false,
  value,
  onChange,
}: {
  surface: ImageSurface;
  src: string;
  /** Background VIDEO: fit + position only (no zoom/crop of video). */
  isVideo?: boolean;
  value: ImagePositionPickerValue;
  onChange: (v: ImagePositionPickerValue) => void;
}) {
  const t = useTranslations("settings.appearance");
  const frame = SURFACE_FRAME[surface];
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const { fit, posX, posY, zoom } = value;
  const allowZoom = !isVideo;

  // The media renders with the adjustment style; the frame's overflow clip
  // is the crop window — what you see IS the crop.
  const mediaStyle: React.CSSProperties = {
    ...imageAdjustmentStyle({ fit, posX, posY, zoom: allowZoom ? zoom : 1 }),
    transform: allowZoom && zoom > 1 ? `scale(${zoom})` : undefined,
  };

  const applyFromEvent = React.useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      onChange({
        ...value,
        posX: Math.round(nx * 100) / 100,
        posY: Math.round(ny * 100) / 100,
      });
    },
    [onChange, value],
  );

  React.useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      applyFromEvent(e.clientX, e.clientY);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, applyFromEvent]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    let nx = posX;
    let ny = posY;
    switch (e.key) {
      case "ArrowLeft": nx = Math.max(0, posX - step); break;
      case "ArrowRight": nx = Math.min(1, posX + step); break;
      case "ArrowUp": ny = Math.max(0, posY - step); break;
      case "ArrowDown": ny = Math.min(1, posY + step); break;
      default: return;
    }
    e.preventDefault();
    onChange({ ...value, posX: Math.round(nx * 100) / 100, posY: Math.round(ny * 100) / 100 });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Crop window — mirrors the public surface's ratio/shape. Drag
          anywhere inside; the focus dot follows the pointer. */}
      <div
        ref={ref}
        role="application"
        aria-label={t("positionPickerAria")}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          e.preventDefault();
          setDragging(true);
          applyFromEvent(e.clientX, e.clientY);
        }}
        onWheel={(e) => {
          if (!allowZoom) return;
          e.preventDefault();
          const next = Math.min(3, Math.max(1, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
          onChange({ ...value, zoom: Math.round(next * 10) / 10 });
        }}
        className={`relative mx-auto cursor-grab overflow-hidden border border-border bg-muted/40 select-none active:cursor-grabbing ${
          frame.rounded
        } ${dragging ? "ring-2 ring-primary" : ""}`}
        style={{ aspectRatio: frame.aspect, width: frame.width, maxWidth: "100%" }}
      >
        {isVideo ? (
          <video
            aria-hidden
            src={src}
            autoPlay
            muted
            loop
            playsInline
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={mediaStyle}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- live adjustment preview of an arbitrary upload/URL
          <img
            aria-hidden
            src={src}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={mediaStyle}
          />
        )}
        {/* Focus dot — pinned where the pointer (or arrows) placed it */}
        <div
          aria-hidden
          className="pointer-events-none absolute z-10"
          style={{ left: `${posX * 100}%`, top: `${posY * 100}%`, transform: "translate(-50%, -50%)" }}
        >
          <span
            className={`block size-6 rounded-full border-[3px] border-white shadow-[0_0_0_2px_rgba(0,0,0,0.6),0_2px_10px_rgba(0,0,0,0.5)] transition-transform ${
              dragging ? "scale-110 bg-white/50" : "bg-white/25"
            }`}
          />
          {/* Crosshair ticks make the exact focus pixel readable at 1× */}
          <span className="absolute left-1/2 top-1/2 block size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>
        {/* Live coordinate readout */}
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
          X {Math.round(posX * 100)} · Y {Math.round(posY * 100)}{allowZoom ? ` · ${zoom.toFixed(1)}×` : ""}
        </span>
      </div>

      {/* Fit toggle */}
      <div role="radiogroup" aria-label={t("imageFitAria")} className="grid grid-cols-2 gap-1.5">
        {(["cover", "contain"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={fit === f}
            onClick={() => onChange({ ...value, fit: f })}
            className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
              fit === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {f === "cover" ? t("fitCover") : t("fitContain")}
          </button>
        ))}
      </div>

      {/* Zoom slider — never for video */}
      {allowZoom ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("zoomLabel")}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{zoom.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            aria-label={t("zoomLabel")}
            onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })}
            className="w-full accent-violet"
          />
          <p className="text-[10px] text-muted-foreground">{t("zoomWheelHint")}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onChange({ fit: "cover", posX: 0.5, posY: 0.5, zoom: 1 })}
        className="self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("resetAdjustments")}
      </button>
    </div>
  );
}

/** Value from nullable DB columns (NULL → defaults, pre-spec rendering). */
export function pickerValueFrom(
  fit: string | null | undefined,
  posX: number | null | undefined,
  posY: number | null | undefined,
  zoom: number | null | undefined,
): ImagePositionPickerValue {
  return {
    fit: resolveObjectFit({ fit }),
    posX: typeof posX === "number" ? posX : 0.5,
    posY: typeof posY === "number" ? posY : 0.5,
    zoom: typeof zoom === "number" && zoom >= 1 && zoom <= 3 ? zoom : 1,
  };
}

/** Nullable DB columns from a picker value (persisted via updatePageAction). */
export function pickerToFormFields(
  prefix: "avatar" | "banner" | "background",
  v: ImagePositionPickerValue,
): Record<string, string> {
  const fitKey = prefix === "background" ? "backgroundFitOverride" : `${prefix}Fit`;
  return {
    [fitKey]: v.fit,
    [`${prefix}PosX`]: String(v.posX),
    [`${prefix}PosY`]: String(v.posY),
    ...(prefix !== "background" ? { [`${prefix}Zoom`]: String(v.zoom) } : {}),
  };
}
