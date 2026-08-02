"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
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
} from "lucide-react";
import { toggleLink } from "@/server/actions/links";
import { useRouter } from "next/navigation";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
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

  // Resolve favicon/icon: prefer stored iconUrl (cached by favicon lib),
  // then fall back to Google S2 for http(s) links.
  // Special protocols get their own icon.
  const { displayIcon, displaySrc } = React.useMemo(() => {
    if (link.type === "embed") return { displayIcon: Code2, displaySrc: null };
    if (link.url.startsWith("mailto:")) return { displayIcon: Mail, displaySrc: null };
    if (link.url.startsWith("tel:")) return { displayIcon: Phone, displaySrc: null };

    // Prefer the cached favicon stored on the link
    if (link.iconUrl) return { displayIcon: null, displaySrc: link.iconUrl };

    // Fall back to Google S2 for http(s)
    try {
      const u = new URL(link.url);
      return {
        displayIcon: null,
        displaySrc: `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`,
      };
    } catch {
      return { displayIcon: ImageIcon, displaySrc: null };
    }
  }, [link.url, link.type, link.iconUrl]);

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
        aria-label="Drag to reorder"
        type="button"
      >
        <GripVertical className="size-4" />
      </button>

      <Card className="flex-1 transition-[box-shadow] duration-200 hover:shadow-[0_0_20px_-8px_rgba(124,58,237,0.2)]">
        <CardContent className="flex items-center gap-3 py-3">
          {/* Favicon / Type icon */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50">
            {displaySrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displaySrc}
                alt=""
                className="size-4 rounded-sm"
                loading="lazy"
                onError={(e) => {
                  // Hide broken favicon, show fallback icon
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : Icon ? (
              <Icon className="size-4 text-muted-foreground" />
            ) : (
              <ExternalLink className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">{link.title}</span>
              {link.isHighlighted ? (
                <Badge className="shrink-0 border-transparent bg-[var(--aurora-grad)] text-white">
                  Star
                </Badge>
              ) : null}
              {!link.isActive ? (
                <Badge variant="outline" className="shrink-0">
                  Hidden
                </Badge>
              ) : null}
              {link.scheduleStart || link.scheduleEnd ? (
                <Badge variant="outline" className="shrink-0 gap-1">
                  <Clock className="size-3" />
                  Scheduled
                </Badge>
              ) : null}
            </div>
            <p className="truncate text-xs text-muted-foreground">{link.url}</p>
          </div>

          <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:inline">
            {link.clicksCount} clicks
          </span>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 text-muted-foreground hover:text-foreground sm:inline-flex"
            aria-label="Open link"
          >
            <ExternalLink className="size-4" />
          </a>

          <Link
            href={`/links/${link.id}`}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Link analytics"
          >
            <BarChart3 className="size-4" />
          </Link>

          <Switch
            checked={link.isActive}
            onCheckedChange={handleToggle}
            disabled={toggling}
            aria-label="Toggle link visibility"
          />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(link)}
            aria-label="Edit link"
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(link)}
            aria-label="Delete link"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
