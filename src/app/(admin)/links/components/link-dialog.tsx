"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  createLink,
  updateLink,
} from "@/server/actions/links";
import type { LinkRow, LinkSectionRow } from "@/server/queries";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
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
import { ImagePlus, Sparkles } from "lucide-react";
import { IconPicker } from "./icon-picker";
import type { IconMode } from "@/lib/link-icons";

/** Derive the dialog's initial icon mode from an editing row (#91). */
function initialIconMode(editing?: LinkRow | null): IconMode {
  if (editing?.iconMode === "lucide" && isLucideIconName(editing.icon)) return "lucide";
  if (editing?.iconMode === "custom" && editing.customIconUrl) return "custom";
  return "auto";
}
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
  const t = useTranslations("linksPage");
  // Initial value from `editing`; resets via key remount in the parent.
  const [value, setValue] = React.useState(String(editing?.sectionId ?? "none"));

  return (
    <FormField label={t("section")}>
      <Select value={value} onValueChange={(v) => setValue(v ?? "none")}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t("noSection")}</SelectItem>
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
  const t = useTranslations("linksPage");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState(editing?.type ?? "url");
  const [highlighted, setHighlighted] = React.useState(editing?.isHighlighted ?? false);
  const [active, setActive] = React.useState(editing?.isActive ?? true);
  const [scheduled, setScheduled] = React.useState(!!editing?.scheduleStart || !!editing?.scheduleEnd);
  // Icon mode (#91): auto favicon / lucide pick / uploaded image.
  const [iconMode, setIconMode] = React.useState<IconMode>(initialIconMode(editing));
  // autoIcon is no longer a separate toggle (#91 redesign): the Icon section's
  // Auto segment IS the toggle. autoIcon derives from the mode — only "auto"
  // fetches favicons — while `editing.autoIcon === false` (explicitly
  // switched off before this redesign) still round-trips: the stored value
  // seeds the mode for old rows and is preserved on save.
  const [autoIconPrefOff] = React.useState(editing?.autoIcon === false);
  const autoIcon = iconMode === "auto" && !autoIconPrefOff;
  const [lucidePick, setLucidePick] = React.useState(editing?.iconMode === "lucide" ? editing.icon ?? "" : "");
  const [customIconUrl, setCustomIconUrl] = React.useState(editing?.iconMode === "custom" ? editing.customIconUrl ?? "" : "");
  const [iconFileName, setIconFileName] = React.useState("");
  const iconFileRef = React.useRef<HTMLInputElement>(null);
  // True once a NEW file is chosen in this session (drives preview swap).
  const [hasNewIconFile, setHasNewIconFile] = React.useState(false);
  const [cardStyle, setCardStyle] = React.useState<"compact" | "rich">(
    editing?.cardStyle === "rich" ? "rich" : "compact",
  );

  // UTM state — only relevant for type === "url"
  const isUrlType = type === "url";
  // #93 popup types share the popup fields (body, CTA).
  const isPopupType = type === "text" || type === "location";
  const isTextPopup = type === "text";
  const storedUrl = editing?.url ?? "";
  const hadUTM = isUrlType && hasUTM(storedUrl);
  const [showUTM, setShowUTM] = React.useState(hadUTM);

  const router = useRouter();
  // Action error surfaced inline (upload too large, bad SVG, unknown icon…).
  const [actionError, setActionError] = React.useState<string | null>(null);

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
      setIconMode(initialIconMode(editing));
      setLucidePick(editing?.iconMode === "lucide" ? editing.icon ?? "" : "");
      setCustomIconUrl(editing?.iconMode === "custom" ? editing.customIconUrl ?? "" : "");
      setIconFileName("");
      setHasNewIconFile(false);
      setActionError(null);
      setCardStyle(editing?.cardStyle === "rich" ? "rich" : "compact");

      const had = editing?.type === "url" && hasUTM(editing?.url ?? "");
      setShowUTM(had);
    }
  }

  // If user switches away from "url" type, collapse UTM (values preserved).
  const utmVisible = isUrlType && showUTM;

  const urlLabel = isPopupType
    ? isTextPopup
      ? t("ctaUrlLabel")
      : t("ltLocationLabel")
    : t(getUrlLabel(type));
  const urlPlaceholder = isPopupType
    ? isTextPopup
      ? t("phCtaUrl")
      : t("phLocation")
    : t(getUrlPlaceholder(type));

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

    // Icon system (#91): send the mode + its payload. Uploads ride along
    // as a File in the same FormData — no separate upload endpoint.
    formData.set("iconMode", iconMode);
    if (iconMode === "lucide") {
      formData.set("icon", lucidePick);
    } else {
      formData.delete("icon");
    }
    if (iconMode === "custom" && !iconFileRef.current?.files?.length) {
      // Editing without re-uploading: keep the stored URL.
      formData.set("iconCustomUrl", customIconUrl);
    }

    // If scheduling is toggled off, clear any stale schedule values.
    if (!scheduled) {
      formData.delete("scheduleStart");
      formData.delete("scheduleEnd");
    }

    startTransition(async () => {
      const result = editing ? await updateLink(formData) : await createLink(formData);
      if (!result.success) {
        setActionError(result.error ?? null);
        return;
      }
      setActionError(null);
      router.refresh();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t("editLink") : t("addLink")}</DialogTitle>
          <DialogDescription>
            {editing ? t("updateDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-3.5">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          {pageId ? <input type="hidden" name="pageId" value={pageId} /> : null}

          <FormField label={t("title_field")} htmlFor="title" required>
            <Input
              id="title"
              name="title"
              defaultValue={editing?.title ?? ""}
              required
              maxLength={120}
              placeholder={t("titlePlaceholder")}
            />
          </FormField>

          <FormField label={urlLabel} htmlFor="url" required={!isTextPopup}>
            <Input
              id="url"
              name="url"
              defaultValue={urlDefault}
              required={!isTextPopup}
              maxLength={2048}
              placeholder={urlPlaceholder}
            />
          </FormField>

          {/* #93 popup cards: body text (markdown subset) + optional CTA
              label. The URL field above doubles as CTA target (text) or
              place/address input (location) — labels swap per type. */}
          {isPopupType ? (
            <FormField label={t("popupTextLabel")} htmlFor="popupText" required={isTextPopup}>
              <textarea
                id="popupText"
                name="popupText"
                defaultValue={editing?.popupText ?? ""}
                rows={6}
                maxLength={5000}
                placeholder={t("phPopupText")}
                className="flex min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-violet focus-visible:ring-2 focus-visible:ring-violet/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </FormField>
          ) : null}
          {isPopupType ? (
            <FormField label={t("ctaLabel")} htmlFor="ctaLabel">
              <Input
                id="ctaLabel"
                name="ctaLabel"
                defaultValue={editing?.ctaLabel ?? ""}
                maxLength={80}
                placeholder={isTextPopup ? t("phCtaLabel") : t("phCtaLabelLocation")}
              />
            </FormField>
          ) : null}

          {/* Description + Thumbnail: both optional one-liners — natural peers
              on a shared row (stacked on narrow screens). */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
            <FormField label={t("description")} htmlFor="description">
              <Input
                id="description"
                name="description"
                defaultValue={editing?.description ?? ""}
                maxLength={300}
                placeholder={t("descriptionPlaceholder")}
              />
            </FormField>

            <FormField label={t("thumbnail")} htmlFor="imageUrl">
              <Input
                id="imageUrl"
                name="imageUrl"
                defaultValue={editing?.imageUrl ?? ""}
                maxLength={2048}
                placeholder="https://example.com/image.jpg"
              />
            </FormField>
          </div>

          {/* Type + Section share a row — both single-select metadata, natural
              peers. Collapse to a column when the dialog is narrow (mobile). */}
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
              <FormField label={t("typeLabel")}>
                <Select value={type} onValueChange={(v) => setType(v ?? "url")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_TYPES.map((lt) => (
                      <SelectItem key={lt.value} value={lt.value}>
                        {t(lt.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <SectionSelect key={editing?.id ?? "new"} editing={editing} sections={sections} />
            </div>
          ) : (
            <FormField label={t("typeLabel")}>
              <Select value={type} onValueChange={(v) => setType(v ?? "url")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LINK_TYPES.map((lt) => (
                    <SelectItem key={lt.value} value={lt.value}>
                      {t(lt.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {isUrlType ? (
            <FormField label={t("cardStyle")} hint={cardStyle === "rich" ? t("richHint") : t("iconHint")}>
              {/* Slim segmented control: mini glyphs stand in for the card
                  layouts so the choice reads at a glance without three rows
                  of description text. */}
              <div
                role="radiogroup"
                aria-label={t("cardStyle")}
                className="grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={cardStyle === "compact"}
                  onClick={() => setCardStyle("compact")}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    cardStyle === "compact"
                      ? "border-violet bg-violet/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                  }`}
                >
                  {/* compact glyph: icon + text lines */}
                  <span aria-hidden className="flex size-7 items-center justify-center rounded-md border border-current/20 bg-background/60">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <rect x="0" y="4" width="4" height="4" rx="1" fill="currentColor" opacity="0.7" />
                      <rect x="5.5" y="4.9" width="7" height="1.4" rx="0.7" fill="currentColor" opacity="0.45" />
                      <rect x="5.5" y="7.7" width="5" height="1.4" rx="0.7" fill="currentColor" opacity="0.3" />
                    </svg>
                  </span>
                  <span className="font-medium">{t("compact")}</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={cardStyle === "rich"}
                  onClick={() => setCardStyle("rich")}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    cardStyle === "rich"
                      ? "border-violet bg-violet/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                  }`}
                >
                  {/* rich glyph: image block + text lines */}
                  <span aria-hidden className="flex size-7 items-center justify-center rounded-md border border-current/20 bg-background/60">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <rect x="0" y="2" width="12.5" height="6" rx="1" fill="currentColor" opacity="0.25" />
                      <circle cx="3" cy="4" r="1" fill="currentColor" opacity="0.7" />
                      <path d="M1 7.4 L4.5 5 L7 7 L9.5 4.6 L12.5 8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="0" y="9.6" width="9" height="1.4" rx="0.7" fill="currentColor" opacity="0.45" />
                    </svg>
                  </span>
                  <span className="font-medium">{t("richPreview")}</span>
                </button>
              </div>
            </FormField>
          ) : null}

          {/* Icon system (#91): auto favicon / lucide pick / upload.
              One-line segmented control with a live preview chip — the chip
              shows WHAT is selected (favicon sparkle, picked icon, uploaded
              image) so the mode names don't carry the meaning alone. */}
          <FormField
            label={t("iconSection")}
            hint={iconMode === "auto" ? t("iconAutoHint") : undefined}
          >
            <div className="flex items-stretch gap-2">
              {/* Preview chip: 32px square showing the current icon */}
              <span
                aria-hidden
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  iconMode === "auto"
                    ? "border-border bg-muted/40 text-muted-foreground"
                    : "border-violet/40 bg-violet/5 text-foreground"
                }`}
              >
                {iconMode === "lucide" && lucidePick && isLucideIconName(lucidePick) ? (
                  <LucideIcon name={lucidePick} size={18} />
                ) : iconMode === "custom" && (customIconUrl && !hasNewIconFile) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customIconUrl} alt="" className="size-5 rounded object-cover" />
                ) : iconMode === "custom" && iconFileName ? (
                  <ImagePlus size={18} className="text-muted-foreground" />
                ) : (
                  <Sparkles size={18} className="text-muted-foreground" />
                )}
              </span>

              {/* Segmented Auto / Pick / Upload */}
              <div
                role="radiogroup"
                aria-label={t("iconSection")}
                className="grid flex-1 grid-cols-3 gap-1 rounded-lg border border-border bg-muted/30 p-1"
              >
                {(["auto", "lucide", "custom"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={iconMode === mode}
                    onClick={() => setIconMode(mode)}
                    className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                      iconMode === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "auto" ? t("iconModeAuto") : mode === "lucide" ? t("iconModeLucide") : t("iconModeCustom")}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode payloads */}
            {iconMode === "lucide" ? (
              <div className="mt-2">
                <IconPicker value={lucidePick} onChange={setLucidePick} />
              </div>
            ) : null}
            {iconMode === "custom" ? (
              <div className="mt-2 flex items-center gap-3">
                {customIconUrl && !hasNewIconFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customIconUrl} alt="" className="size-8 rounded-md border border-border object-cover" />
                ) : null}
                <Input
                  ref={iconFileRef}
                  type="file"
                  name="iconFile"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.ico,.svg"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setIconFileName(f?.name ?? "");
                    setHasNewIconFile(!!f);
                  }}
                  className="flex-1 text-xs"
                />
              </div>
            ) : null}
            {iconMode === "custom" && iconFileName ? (
              <p className="mt-1 text-xs text-muted-foreground">{t("iconUploadSelected", { name: iconFileName })}</p>
            ) : null}
          </FormField>

          {/* Toggle strip: boolean-ish options in one 2-col grid — peers, not
              a vertical list. UTM only exists for URL-type links. */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={highlighted} onCheckedChange={setHighlighted} />{t("featured")}</label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} />{t("active")}</label>
            {isUrlType ? (
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={showUTM} onCheckedChange={setShowUTM} />{t("utmParameters")}</label>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={scheduled} onCheckedChange={setScheduled} />{t("schedule")}</label>
          </div>

          {/* UTM builder — expands under the toggle strip (URL links only) */}
          {utmVisible ? (
            <div className="flex flex-col gap-2 rounded-md border border-border p-3">
              <UTMField label={t("utmSource")} name="utm_source" placeholder="instagram" defaultValue={utmDefaults.source} />
              <UTMField label={t("utmMedium")} name="utm_medium" placeholder="social" defaultValue={utmDefaults.medium} />
              <UTMField label={t("utmCampaign")} name="utm_campaign" placeholder="spring_sale" defaultValue={utmDefaults.campaign} />
              <UTMField label={t("utmTerm")} name="utm_term" placeholder="running_shoes" defaultValue={utmDefaults.term} />
              <UTMField label={t("utmContent")} name="utm_content" placeholder="banner_ad_1" defaultValue={utmDefaults.content} />
            </div>
          ) : null}

          {/* Schedule builder — expands under the toggle strip */}
          {scheduled ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("showFrom")}</span>
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
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t("hideAfter")}</span>
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

          {actionError ? (
            <p role="alert" className="text-sm text-destructive">{actionError}</p>
          ) : null}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? tCommon("saving") : tCommon("save")}
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
