"use client";

import { Check, Palette, Trash2 } from "lucide-react";
import type { ThemeRow } from "@/server/queries";
import { Badge } from "@/components/ui/badge";
import { swatchFor } from "../theme-constants";

interface PresetGalleryProps {
  themes: ThemeRow[];
  activeId: number | null;
  selecting: number | null;
  delPending: number | null;
  onSelect: (id: number) => void;
  onDeleteClick: (id: number) => void;
}

export function PresetGallery({
  themes,
  activeId,
  selecting,
  delPending,
  onSelect,
  onDeleteClick,
}: PresetGalleryProps) {
  return (
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
              onClick={() => onSelect(theme.id)}
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
                onClick={() => onDeleteClick(theme.id)}
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
  );
}
