"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { deleteLinkGroupAction } from "@/server/actions/groups";
import type { LinkGroupRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteGroupDialogProps {
  group: LinkGroupRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGroupDialog({ group, open, onOpenChange }: DeleteGroupDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!group) return;
    startTransition(async () => {
      await deleteLinkGroupAction(group.id);
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the group "{group?.title}"? Links inside this group will not be deleted, but they will be moved to the top ungrouped list.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting..." : "Delete group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
