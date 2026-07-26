/**
 * Shared constants and helpers for link forms and URL normalization.
 *
 * Kept module-level (not re-created per render) so dialogs reuse a single
 * instance. `prefixLinkUrl` is also reused by the migration wizard.
 */

export const LINK_TYPES = [
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "vcard", label: "vCard (contact card)" },
  { value: "file", label: "File download" },
  { value: "embed", label: "Embed (YouTube, Spotify, etc.)" },
] as const;

const LINK_LABELS: Record<string, string> = {
  email: "Email address",
  phone: "Phone number",
  whatsapp: "WhatsApp number",
  sms: "Phone number",
};

const LINK_PLACEHOLDERS: Record<string, string> = {
  email: "you@example.com",
  phone: "+1 (555) 000-0000",
  whatsapp: "+1 (555) 000-0000",
  sms: "+1 (555) 000-0000",
};

export function getUrlLabel(type: string): string {
  return LINK_LABELS[type] ?? "URL";
}

export function getUrlPlaceholder(type: string): string {
  return LINK_PLACEHOLDERS[type] ?? "https://example.com";
}

/**
 * Prepend the correct scheme/prefix for non-URL link types.
 *
 * Mirrors the original if/else chain in LinkDialog.handleSubmit:
 * - email   -> mailto:
 * - phone   -> tel:
 * - whatsapp-> https://wa.me/<digits>
 * - sms     -> sms:
 * - other   -> returned unchanged
 *
 * Reused by the migration wizard to normalize legacy URLs.
 */
export function prefixLinkUrl(type: string, rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  if (type === "email" && !rawUrl.startsWith("mailto:")) {
    return `mailto:${rawUrl}`;
  }
  if (type === "phone" && !rawUrl.startsWith("tel:")) {
    return `tel:${rawUrl}`;
  }
  if (type === "whatsapp" && !rawUrl.startsWith("https://wa.me/")) {
    return `https://wa.me/${rawUrl.replace(/[^0-9]/g, "")}`;
  }
  if (type === "sms" && !rawUrl.startsWith("sms:")) {
    return `sms:${rawUrl}`;
  }
  return rawUrl;
}
