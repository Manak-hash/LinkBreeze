"use client";

import * as React from "react";
import { Maximize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * ExpandableSection — wraps any card content in a clickable layer that
 * opens a Dialog showing the full dataset. Used on the dashboard so
 * compact cards (top 4 links, 6 referrers, etc.) expand to show everything.
 */
export function ExpandableSection({
  title,
  description,
  compact,
  expanded,
  className,
}: {
  title: string;
  description?: string;
  compact: React.ReactNode;
  expanded: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "group relative h-full cursor-pointer rounded-xl outline-none transition-transform hover:scale-[1.005] focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
      >
        {compact}
        <span className="pointer-events-none absolute right-2.5 top-2.5 flex size-6 items-center justify-center rounded-md bg-muted/50 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" />
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {expanded}
        </DialogContent>
      </Dialog>
    </>
  );
}
