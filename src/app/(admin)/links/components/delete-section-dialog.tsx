"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteSection } from "@/server/actions/sections";
import type { LinkSectionRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface DeleteSectionDialogProps {
  section: LinkSectionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Delete a section. Its links are NOT deleted — they move to the
 * uncategorized group at the top of the page.
 */
export function DeleteSectionDialog({ section, open, onOpenChange }: DeleteSectionDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!section) return;
    const formData = new FormData();
    formData.set("id", String(section.id));
    startTransition(async () => {
      const result = await deleteSection(formData);
      if (!result.success) return;
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete section?</DialogTitle>
          <DialogDescription>
            {section
              ? `"${section.title}" will be removed. Its links move to Uncategorized — nothing is deleted.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting…" : "Delete section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
