"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createLink,
  updateLink,
} from "@/server/actions/links";
import type { LinkRow, LinkSectionRow } from "@/server/queries";
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
import { LucideIcon, isLucideIconName } from "@/components/public/LucideIcon";
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
  sections?: LinkSectionRow[];
}

function SectionSelect({
  editing,
  sections,
}: {
  editing?: LinkRow | null;
  sections: LinkSectionRow[];
}) {
  // Initial value from `editing`; resets via key remount in the parent.
  const [value, setValue] = React.useState(String(editing?.sectionId ?? "none"));

  return (
    <FormField label="Section" hint="Links without a section appear above all sections.">
      <Select value={value} onValueChange={(v) => setValue(v ?? "none")}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No section</SelectItem>
          {sections.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {isLucideIconName(s.icon) ? (
                <LucideIcon name={s.icon as string} size={14} className="mr-1 inline-block align-[-2px] text-muted-foreground" />
              ) : null}
              {s.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* "none" → empty string so the server action stores NULL. */}
      <input type="hidden" name="sectionId" value={value === "none" ? "" : value} />
    </FormField>
  );
}

export function LinkDialog({ open, onOpenChange, editing, pageId, sections = [] }: LinkDialogProps) {
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState(editing?.type ?? "url");
  const [highlighted, setHighlighted] = React.useState(editing?.isHighlighted ?? false);
  const [active, setActive] = React.useState(editing?.isActive ?? true);
  const [scheduled, setScheduled] = React.useState(!!editing?.scheduleStart || !!editing?.scheduleEnd);
  const [autoIcon, setAutoIcon] = React.useState(editing?.autoIcon ?? true);
  const [cardStyle, setCardStyle] = React.useState<"compact" | "rich">(
    editing?.cardStyle === "rich" ? "rich" : "compact",
  );

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
      setCardStyle(editing?.cardStyle === "rich" ? "rich" : "compact");

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

  // Form action (React 19): the browser runs native validation (required,
  // maxLength…) before invoking this, so Enter and the Save button both
  // submit — no JavaScript-only interception.
  const handleSubmit = (formData: FormData) => {
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
    formData.set("cardStyle", cardStyle);

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
        <form action={handleSubmit} className="flex flex-col gap-4">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          {pageId ? <input type="hidden" name="pageId" value={pageId} /> : null}

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

          {sections.length > 0 ? (
            <SectionSelect key={editing?.id ?? "new"} editing={editing} sections={sections} />
          ) : null}

          {isUrlType ? (
            <FormField label="Card style" hint={cardStyle === "rich" ? "Thumbnail + auto preview from the link's Open Graph data. Falls back to compact if no image is found." : "Icon + title. Clean and simple."}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCardStyle("compact")}
                  className={`flex-1 rounded-lg border-2 p-3 text-left text-sm transition-colors ${cardStyle === "compact" ? "border-violet bg-violet/5 ring-1 ring-violet/30" : "border-border hover:border-muted-foreground/50"}`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className={`flex size-4 items-center justify-center rounded-full border-2 transition-colors ${cardStyle === "compact" ? "border-violet bg-violet" : "border-muted-foreground/40"}`} />
                    Compact
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Icon + title</p>
                </button>
                <button
                  type="button"
                  onClick={() => setCardStyle("rich")}
                  className={`flex-1 rounded-lg border-2 p-3 text-left text-sm transition-colors ${cardStyle === "rich" ? "border-violet bg-violet/5 ring-1 ring-violet/30" : "border-border hover:border-muted-foreground/50"}`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span className={`flex size-4 items-center justify-center rounded-full border-2 transition-colors ${cardStyle === "rich" ? "border-violet bg-violet" : "border-muted-foreground/40"}`} />
                    Rich preview
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Thumbnail + description</p>
                </button>
              </div>
            </FormField>
          ) : null}

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={highlighted} onCheckedChange={setHighlighted} />
              Featured
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
            <Button type="submit" disabled={pending}>
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
