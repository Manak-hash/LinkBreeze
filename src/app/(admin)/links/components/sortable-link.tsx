"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import Image from "next/image";
import {
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  BarChart3,
  Clock,
  Mail,
  Phone,
  Image as ImageIcon,
  Code2,
  Minus,
} from "lucide-react";
import { toggleLink } from "@/server/actions/links";
import { resolveIcon, isLucideIconName } from "@/lib/icon-registry";
import { useRouter } from "next/navigation";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePreview } from "@/components/admin/PreviewPane";

export interface SortableLinkProps {
  link: LinkRow;
  onEdit: (link: LinkRow) => void;
  onDelete: (link: LinkRow) => void;
}

export function SortableLink({ link, onEdit, onDelete }: SortableLinkProps) {
  const t = useTranslations("linksPage");
  const { reload: reloadPreview } = usePreview();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const router = useRouter();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    ...(isDragging
      ? {
          boxShadow: "0 0 30px -4px rgba(124,58,237,0.4)",
          borderRadius: "0.875rem",
        }
      : {}),
  };

  // Resolve favicon/icon: manual choices (#91) first — picked lucide icon,
  // then uploaded image — then the cached favicon, then type icons and the
  // first-letter avatar, matching the public page's resolution order.
  const { displayIcon, displaySrc, letter } = React.useMemo(() => {
    // #87 dividers: no icon, just the row glyph (rendered separately below).
    if (link.type === "divider") return { displayIcon: Minus, displaySrc: null, letter: null };
    // Picked lucide icon stored as a dashed name.
    if (link.iconMode === "lucide" && link.icon && isLucideIconName(link.icon)) {
      return { displayIcon: resolveIcon(link.icon), displaySrc: null, letter: null };
    }
    // Uploaded custom icon.
    if (link.iconMode === "custom" && link.customIconUrl) {
      return { displayIcon: null, displaySrc: link.customIconUrl, letter: null };
    }
    if (link.type === "embed") return { displayIcon: Code2, displaySrc: null, letter: null };
    if (link.url.startsWith("mailto:")) return { displayIcon: Mail, displaySrc: null, letter: null };
    if (link.url.startsWith("tel:")) return { displayIcon: Phone, displaySrc: null, letter: null };

    // Prefer the cached favicon stored on the link
    if (link.iconUrl) return { displayIcon: null, displaySrc: link.iconUrl, letter: null };

    try {
      const u = new URL(link.url);
      if (u.protocol === "http:" || u.protocol === "https:") {
        const ch = (link.title || u.hostname).trim().charAt(0).toUpperCase();
        return { displayIcon: null, displaySrc: null, letter: ch || "?" };
      }
    } catch {
      // not a parseable URL
    }
    return { displayIcon: ImageIcon, displaySrc: null, letter: null };
  }, [link.url, link.type, link.iconUrl, link.title, link.iconMode, link.icon, link.customIconUrl]);

  const Icon = displayIcon;

  const [toggling, setToggling] = React.useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleLink(link.id);
      router.refresh();
      reloadPreview();
    } finally {
      setToggling(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1">
      <button
        className="flex cursor-grab items-center px-1 text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={t("dragReorder")}
        type="button"
      >
        <GripVertical className="size-4" />
      </button>

      <Card className="flex-1 transition-[box-shadow] duration-200 hover:shadow-[0_0_20px_-8px_rgba(124,58,237,0.2)]">
        <CardContent className="flex items-center gap-3 py-3">
          {/* Favicon / Type icon */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50">
            {displaySrc ? (
              <Image
                src={displaySrc}
                alt=""
                width={16}
                height={16}
                unoptimized
                className="size-4 rounded-sm"
                loading="lazy"
                onError={(e) => {
                  // Hide broken favicon, show fallback icon
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : letter ? (
              <span className="flex size-4 items-center justify-center rounded-sm bg-violet/15 text-[10px] font-semibold leading-none text-violet">
                {letter}
              </span>
            ) : Icon ? (
              <Icon className="size-4 text-muted-foreground" />
            ) : (
              <ExternalLink className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {link.type === "divider" ? (
                <>
                  <Minus className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-muted-foreground">{t("dividerRow")}</span>
                </>
              ) : (
                <>
                  <span className="truncate text-sm font-medium">{link.title}</span>
                  {link.isHighlighted ? (
                    <Badge className="shrink-0 border-transparent bg-[var(--aurora-grad)] text-white">{t("star")}</Badge>
                  ) : null}
                </>
              )}
              {!link.isActive ? (
                <Badge variant="outline" className="shrink-0">{t("hidden")}</Badge>
              ) : null}
              {link.scheduleStart || link.scheduleEnd ? (
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Clock className="size-3" />{t("scheduled")}</Badge>
              ) : null}
            </div>
            {link.type === "divider" ? null : (
              <p className="truncate text-xs text-muted-foreground">{link.url}</p>
            )}
          </div>

          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
            {t("clicksCount", { count: link.clicksCount })}
          </span>

          {link.type === "divider" ? null : (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 text-muted-foreground hover:text-foreground sm:inline-flex"
              aria-label={t("openLinkAria")}
            >
              <ExternalLink className="size-4" />
            </a>
          )}

          <Link
            href={`/links/${link.id}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={t("linkAnalyticsAria")}
          >
            <BarChart3 className="size-4" />
          </Link>

          <Switch
            checked={link.isActive}
            onCheckedChange={handleToggle}
            disabled={toggling}
            aria-label={t("toggleVisibilityAria")}
          />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(link)}
            aria-label={t("editLinkAria")}
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(link)}
            aria-label={t("deleteLinkAria")}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
