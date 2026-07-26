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
} from "lucide-react";
import { toggleLink } from "@/server/actions/links";
import { useRouter } from "next/navigation";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface SortableLinkProps {
  link: LinkRow;
  onEdit: (link: LinkRow) => void;
  onDelete: (link: LinkRow) => void;
}

export function SortableLink({ link, onEdit, onDelete }: SortableLinkProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const router = useRouter();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [toggling, setToggling] = React.useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleLink(link.id);
      router.refresh();
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

      <Card className="flex-1">
        <CardContent className="flex items-center gap-3 py-3">
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
