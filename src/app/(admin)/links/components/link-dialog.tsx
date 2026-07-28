"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createLink,
  updateLink,
} from "@/server/actions/links";
import type { LinkRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
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
import {
  LINK_TYPES,
  getUrlLabel,
  getUrlPlaceholder,
  prefixLinkUrl,
} from "../link-helpers";

export interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: LinkRow | null;
  pageId?: number;
}

export function LinkDialog({ open, onOpenChange, editing, pageId }: LinkDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState(editing?.type ?? "url");
  const [highlighted, setHighlighted] = React.useState(editing?.isHighlighted ?? false);
  const [active, setActive] = React.useState(editing?.isActive ?? true);
  const [scheduled, setScheduled] = React.useState(!!editing?.scheduleStart || !!editing?.scheduleEnd);
  const [autoIcon, setAutoIcon] = React.useState(editing?.autoIcon ?? true);
  const router = useRouter();

  // Reset local form state whenever the dialog opens (or switches target).
  // Adjusting state during render — instead of in an effect — avoids the
  // cascading-render anti-pattern.
  const sessionKey = open ? `open:${editing?.id ?? "new"}` : "closed";
  const [lastSession, setLastSession] = React.useState(sessionKey);
  if (sessionKey !== lastSession) {
    setLastSession(sessionKey);
    if (open) {
      setType(editing?.type ?? "url");
      setHighlighted(editing?.isHighlighted ?? false);
      setActive(editing?.isActive ?? true);
      setScheduled(!!editing?.scheduleStart || !!editing?.scheduleEnd);
      setAutoIcon(editing?.autoIcon ?? true);
    }
  }

  const urlLabel = getUrlLabel(type);
  const urlPlaceholder = getUrlPlaceholder(type);

  const handleSubmit = (formData: FormData) => {
    // Prepend the correct prefix for non-URL types
    const rawUrl = (formData.get("url") as string) || "";
    formData.set("url", prefixLinkUrl(type, rawUrl));
    formData.set("type", type);
    formData.set("isHighlighted", highlighted ? "on" : "off");
    formData.set("isActive", active ? "on" : "off");
    formData.set("autoIcon", autoIcon ? "on" : "off");

    // If scheduling is toggled off, clear any stale schedule values.
    if (!scheduled) {
      formData.delete("scheduleStart");
      formData.delete("scheduleEnd");
    }

    startTransition(async () => {
      if (editing) {
        await updateLink(formData);
      } else {
        await createLink(formData);
      }
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update the details of this link." : "Create a new link for your page."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          {pageId && !editing ? <input type="hidden" name="pageId" value={pageId} /> : null}

          <FormField label="Title" htmlFor="title" required>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              maxLength={120}
              placeholder="My website"
            />
          </FormField>

          <FormField label={urlLabel} htmlFor="url" required>
            <Input
              id="url"
              name="url"
              defaultValue={editing?.url ?? ""}
              required
              maxLength={2048}
              placeholder={urlPlaceholder}
            />
          </FormField>

          <FormField label="Description (optional)" htmlFor="description">
            <Input
              id="description"
              name="description"
              defaultValue={editing?.description ?? ""}
              maxLength={300}
              placeholder="A short subtitle"
            />
          </FormField>

          <FormField label="Thumbnail image URL (optional)" htmlFor="imageUrl">
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={editing?.imageUrl ?? ""}
              maxLength={2048}
              placeholder="https://example.com/image.jpg"
            />
          </FormField>

          <FormField label="Type">
            <Select value={type} onValueChange={(v) => setType(v ?? "url")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={highlighted} onCheckedChange={setHighlighted} />
              Highlight
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={autoIcon} onCheckedChange={setAutoIcon} />
              Auto icon
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={scheduled} onCheckedChange={setScheduled} />
              Schedule
            </label>
            {scheduled ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Show from</span>
                  <Input
                    type="datetime-local"
                    name="scheduleStart"
                    defaultValue={
                      editing?.scheduleStart
                        ? editing.scheduleStart.replace(" ", "T").slice(0, 16)
                        : ""
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Hide after</span>
                  <Input
                    type="datetime-local"
                    name="scheduleEnd"
                    defaultValue={
                      editing?.scheduleEnd
                        ? editing.scheduleEnd.replace(" ", "T").slice(0, 16)
                        : ""
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
