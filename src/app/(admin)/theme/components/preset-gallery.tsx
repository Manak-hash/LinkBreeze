"use client";

import { Check, Trash2 } from "lucide-react";
import type { ThemeRow } from "@/server/queries";
import { Badge } from "@/components/ui/badge";
import { resolveBackground } from "@/lib/theme-tokens";
import { useTranslations } from "next-intl";

interface PresetGalleryProps {
  themes: ThemeRow[];
  activeId: number | null;
  selecting: number | null;
  delPending: number | null;
  onSelect: (id: number) => void;
  onDeleteClick: (id: number) => void;
}

/**
 * Build a mini visual preview of a theme using its actual tokens.
 * Uses the production resolveBackground so the card matches what the public
 * page renders (including aurora's base color and image overlays).
 */
function ThemePreview({ theme }: { theme: ThemeRow }) {
  const isAurora = theme.backgroundType === "aurora";
  const bg = resolveBackground(theme);
  // resolveBackground already composes fit + focal point into the background
  // shorthand for image/gif media; extra size/position overrides would fight it.
  const bgStyle: React.CSSProperties = isAurora
    ? { background: theme.backgroundValue?.split(",")[0]?.trim() || "#0a0820" }
    : { background: bg };

  const radius = theme.radius ?? "12px";
  const isPill = theme.linkStyle === "pill";
  const isSharp = theme.linkStyle === "sharp";
  const isPixel = theme.linkStyle === "pixel";
  const isGel = theme.linkStyle === "gel";

  const cardRadius = isPill || isGel ? "9999px" : isSharp || isPixel ? "0px" : radius;

  // Fake link card
  const fakeCard: React.CSSProperties = {
    background: theme.cardBackground ?? "rgba(255,255,255,0.1)",
    padding: "4px 8px",
    marginBottom: "4px",
  };

  if (isPixel) {
    fakeCard.clipPath = "polygon(4px 0,calc(100% - 4px) 0,calc(100% - 4px) 2px,calc(100% - 2px) 2px,calc(100% - 2px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 2px) calc(100% - 4px),calc(100% - 2px) calc(100% - 2px),calc(100% - 4px) calc(100% - 2px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 2px),2px calc(100% - 2px),2px 4px,0 4px)";
    fakeCard.boxShadow = `0 0 0 2px ${theme.cardBorderColor ?? "#ea580c"}`;
  } else {
    fakeCard.border = `1px solid ${theme.cardBorderColor ?? "rgba(255,255,255,0.1)"}`;
    fakeCard.borderRadius = cardRadius;
  }

  return (
    <div className="relative flex h-32 flex-col items-center justify-center overflow-hidden p-3" style={bgStyle}>
      {/* Mini avatar circle */}
      <div
        className="mb-2 h-6 w-6 rounded-full"
        style={{
          background: theme.primaryColor ?? "#7c5ff0",
          border: `2px solid ${theme.primaryColor ?? "#7c5ff0"}`,
        }}
      />
      {/* Name bar */}
      <div
        className="mb-2 h-1.5 w-16 rounded-full"
        style={{ background: theme.textColor ?? "#fff", opacity: 0.8 }}
      />
      {/* Fake link cards */}
      <div className="w-full px-2">
        <div style={fakeCard}>
          <div className="h-1 w-full rounded-full" style={{ background: theme.textColor ?? "#fff", opacity: 0.5 }} />
        </div>
        <div style={{ ...fakeCard, marginBottom: 0 }}>
          <div className="h-1 w-3/4 rounded-full" style={{ background: theme.primaryColor ?? "#7c5ff0", opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

export function PresetGallery({
  themes,
  activeId,
  selecting,
  delPending,
  onSelect,
  onDeleteClick,
}: PresetGalleryProps) {
  const t = useTranslations("theme");
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {themes.map((theme) => {
        const isActive = theme.id === activeId;
        return (
          <div
            key={theme.id}
            className="group relative overflow-hidden rounded-xl border border-border text-left transition-[border-color,box-shadow] hover:ring-2 hover:ring-ring/50 data-[active=true]:ring-2 data-[active=true]:ring-primary"
            data-active={isActive}
          >
            <button
              onClick={() => onSelect(theme.id)}
              className="block w-full"
              type="button"
              disabled={selecting === theme.id}
            >
              <ThemePreview theme={theme} />
              <div className="bg-card p-2.5">
                <div className="truncate text-sm font-medium text-foreground">{theme.name}</div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs capitalize text-muted-foreground">
                    {theme.linkStyle} · {theme.fontFamily}
                  </span>
                  {isActive ? (
                    <Badge className="shrink-0 border-transparent bg-[var(--aurora-grad)] text-white">
                      <Check className="size-3" /> Active
                    </Badge>
                  ) : selecting === theme.id ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{t("applying")}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Use
                    </span>
                  )}
                </div>
              </div>
            </button>
            {/* Delete button for non-preset, non-active custom themes */}
            {!theme.isPreset && !isActive ? (
              <button
                onClick={() => onDeleteClick(theme.id)}
                disabled={delPending === theme.id}
                className="absolute right-1.5 top-1.5 rounded-md bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                title={t("deleteTheme")}
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : null}
            {!theme.isPreset ? (
              <span className="absolute left-1.5 top-1.5 rounded bg-black/40 px-1.5 py-0.5 text-xs font-medium text-white">
                Custom
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
