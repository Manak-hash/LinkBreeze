"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { saveSection } from "@/server/actions/sections";
import type { LinkSectionRow } from "@/server/queries";
import { isLucideIconName } from "@/components/public/LucideIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { IconPicker } from "./icon-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: LinkSectionRow | null;
  pageId?: number;
}

/**
 * Create / edit a link section (title + optional lucide icon).
 * Sections group links under a header on the public page.
 */
export function SectionDialog({ open, onOpenChange, editing, pageId }: SectionDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  // Icon picker value — dashed lucide name or "". Mirrored into a hidden
  // input so the server action receives it via FormData.
  const [icon, setIcon] = React.useState(
    isLucideIconName(editing?.icon?.trim()) ? (editing?.icon?.trim() as string) : "",
  );

  // Reset icon state whenever the dialog opens on a different target.
  const sessionKey = open ? `open:${editing?.id ?? "new"}` : "closed";
  const [lastSession, setLastSession] = React.useState(sessionKey);
  if (sessionKey !== lastSession) {
    setLastSession(sessionKey);
    if (open) setIcon(isLucideIconName(editing?.icon?.trim()) ? (editing?.icon?.trim() as string) : "");
  }

  const handleSubmit = () => {
    const form = formRef.current;
    if (!form) return;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    startTransition(async () => {
      const result = await saveSection(formData);
      if (!result.success) return;
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this section's header."
              : "Group links under a titled header on your public page."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          {pageId ? <input type="hidden" name="pageId" value={pageId} /> : null}

          <FormField label="Title" htmlFor="section-title" required>
            <Input
              id="section-title"
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              maxLength={80}
              placeholder="My projects"
              autoFocus
            />
          </FormField>

          <FormField label="Icon (optional)">
            <IconPicker
              value={icon}
              onChange={setIcon}
              hint="Shown before the section title on your public page."
            />
            <input type="hidden" name="icon" value={icon} />
          </FormField>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pending} onClick={handleSubmit}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
