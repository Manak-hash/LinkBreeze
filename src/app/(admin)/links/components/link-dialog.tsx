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
import {
  parseUTM,
  stripUTM,
  appendUTM,
  emptyUTM,
  hasUTM,
  type UTMParams,
} from "@/lib/utm";

export interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: LinkRow | null;
  pageId?: number;
}

export function LinkDialog({ open, onOpenChange, editing, pageId }: LinkDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [type, setType] = React.useState(editing?.type ?? "url");
  const [highlighted, setHighlighted] = React.useState(editing?.isHighlighted ?? false);
  const [active, setActive] = React.useState(editing?.isActive ?? true);
  const [scheduled, setScheduled] = React.useState(!!editing?.scheduleStart || !!editing?.scheduleEnd);
  const [autoIcon, setAutoIcon] = React.useState(editing?.autoIcon ?? true);

  // UTM state — only relevant for type === "url"
  const isUrlType = type === "url";
  const storedUrl = editing?.url ?? "";
  const hadUTM = isUrlType && hasUTM(storedUrl);
  const [showUTM, setShowUTM] = React.useState(hadUTM);

  const router = useRouter();

  // Reset local form state whenever the dialog opens (or switches target).
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

      const had = editing?.type === "url" && hasUTM(editing?.url ?? "");
      setShowUTM(had);
    }
  }

  // If user switches away from "url" type, collapse UTM (values preserved).
  const utmVisible = isUrlType && showUTM;

  const urlLabel = getUrlLabel(type);
  const urlPlaceholder = getUrlPlaceholder(type);

  // For the URL field default: show the clean URL (UTM stripped) so the
  // user sees the base URL separately from the UTM builder.
  const urlDefault = hadUTM ? stripUTM(storedUrl) : storedUrl;

  // Pre-compute default values for the UTM fields when editing.
  const utmDefaults: UTMParams = hadUTM ? parseUTM(storedUrl) : emptyUTM();

  const handleSubmit = () => {
    const form = formRef.current;
    if (!form) return;
    // Use native form.reportValidity() so required fields, maxLength etc. work.
    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    // Prepend the correct prefix for non-URL types
    const rawUrl = (formData.get("url") as string) || "";
    let finalUrl = prefixLinkUrl(type, rawUrl);
    formData.set("type", type);

    // Append UTM params for URL-type links when the builder is open.
    // Read from form fields (uncontrolled inputs) — no React state needed.
    if (utmVisible) {
      const utm: Partial<UTMParams> = {
        source: (formData.get("utm_source") as string) || "",
        medium: (formData.get("utm_medium") as string) || "",
        campaign: (formData.get("utm_campaign") as string) || "",
        term: (formData.get("utm_term") as string) || "",
        content: (formData.get("utm_content") as string) || "",
      };
      // Remove the raw utm_* fields from formData — they go into the URL.
      formData.delete("utm_source");
      formData.delete("utm_medium");
      formData.delete("utm_campaign");
      formData.delete("utm_term");
      formData.delete("utm_content");
      finalUrl = appendUTM(finalUrl, utm);
    }
    formData.set("url", finalUrl);

    formData.set("isHighlighted", highlighted ? "on" : "off");
    formData.set("isActive", active ? "on" : "off");
    formData.set("autoIcon", autoIcon ? "on" : "off");

    // If scheduling is toggled off, clear any stale schedule values.
    if (!scheduled) {
      formData.delete("scheduleStart");
      formData.delete("scheduleEnd");
    }

    startTransition(async () => {
      const result = editing ? await updateLink(formData) : await createLink(formData);
      if (!result.success) return;
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
        <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
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
              defaultValue={urlDefault}
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

          {/* UTM builder — only for URL-type links */}
          {isUrlType ? (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={showUTM} onCheckedChange={setShowUTM} />
                UTM parameters
              </label>
              {utmVisible ? (
                <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <UTMField label="Source" name="utm_source" placeholder="instagram" defaultValue={utmDefaults.source} />
                  <UTMField label="Medium" name="utm_medium" placeholder="social" defaultValue={utmDefaults.medium} />
                  <UTMField label="Campaign" name="utm_campaign" placeholder="spring_sale" defaultValue={utmDefaults.campaign} />
                  <UTMField label="Term (optional)" name="utm_term" placeholder="running_shoes" defaultValue={utmDefaults.term} />
                  <UTMField label="Content (optional)" name="utm_content" placeholder="banner_ad_1" defaultValue={utmDefaults.content} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={scheduled} onCheckedChange={setScheduled} />
              Schedule
            </label>
            {scheduled ? (
              <div className="flex flex-col gap-2">
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
            <Button type="button" disabled={pending} onClick={handleSubmit}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Single UTM input field with inline label (uncontrolled). */
function UTMField({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <Input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}
