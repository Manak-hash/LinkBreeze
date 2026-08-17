"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deletePageAction } from "@/server/actions/pages";
import type { PageRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DeletePageDialogProps {
  page: Pick<PageRow, "id" | "slug" | "title"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Delete a non-default page. Two modes, user's choice:
 * - keep: links move to the default page, uncategorized
 * - wipe: the page's links are deleted with it (their click history too)
 * Sections and per-page view analytics are removed in both modes.
 */
export function DeletePageDialog({ page, open, onOpenChange }: DeletePageDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const handleDelete = (mode: "keep" | "wipe") => {
    if (!page) return;
    const formData = new FormData();
    formData.set("pageId", String(page.id));
    formData.set("mode", mode);
    startTransition(async () => {
      const result = await deletePageAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  const close = (next: boolean) => {
    if (!next) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete page?</DialogTitle>
          <DialogDescription>
            {page
              ? `"${page.title || page.slug}" will be removed. Choose what happens to its links:`
              : ""}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">{error}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleDelete("keep")}
            disabled={pending}
            className="flex flex-col gap-1 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/60 disabled:opacity-50"
          >
            <span className="text-sm font-medium">Keep the links</span>
            <span className="text-xs text-muted-foreground">
              Links move to your default page, uncategorized. Nothing is lost.
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete("wipe")}
            disabled={pending}
            className="flex flex-col gap-1 rounded-lg border border-destructive/40 p-3 text-left transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            <span className="text-sm font-medium text-destructive">Delete everything</span>
            <span className="text-xs text-muted-foreground">
              The page&rsquo;s links are deleted with it, including their click history.
            </span>
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => close(false)} disabled={pending}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
