"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createLinkGroupAction, updateLinkGroupAction } from "@/server/actions/groups";
import type { LinkGroupRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: LinkGroupRow | null;
  pageId?: number;
}

export function GroupDialog({ open, onOpenChange, editing, pageId }: GroupDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const isEdit = !!editing;

  React.useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (pageId) formData.append("pageId", String(pageId));

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateLinkGroupAction(editing.id, formData);
        } else {
          await createLinkGroupAction(formData);
        }
        router.refresh();
        onOpenChange(false);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit group" : "Add group"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update your group settings."
                : "Groups help you organize links under a common title."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editing?.title ?? ""}
                placeholder="E.g. My Favorite Tools"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="linkSearch"
                name="linkSearch"
                value="true"
                defaultChecked={editing?.linkSearch ?? false}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="linkSearch" className="font-normal cursor-pointer">
                Enable search box for links in this group
              </Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="columns">Layout Columns</Label>
              <Select name="columns" defaultValue={editing?.columns ? String(editing.columns) : "1"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Column</SelectItem>
                  <SelectItem value="2">2 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
