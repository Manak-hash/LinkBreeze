const ALLOWED_SCHEMES_BY_TYPE: Record<string, Set<string>> = {
  url: new Set(["http:", "https:"]),
  email: new Set(["mailto:"]),
  phone: new Set(["tel:"]),
  whatsapp: new Set(["https:", "whatsapp:"]),
  sms: new Set(["sms:"]),
  vcard: new Set(["https:", "http:"]),
  file: new Set(["/", "https:", "http:"]),
};

export function isAllowedLinkUrl(type: string, value: string): boolean {
  const trimmed = value.trim();
  const allowedSchemes = ALLOWED_SCHEMES_BY_TYPE[type];
  if (!allowedSchemes || !trimmed) return false;

  if (trimmed.startsWith("/")) {
    return allowedSchemes.has("/") && !trimmed.startsWith("//");
  }

  try {
    const url = new URL(trimmed);
    if (type === "whatsapp" && url.protocol === "https:") {
      return url.hostname === "wa.me";
    }
    return allowedSchemes.has(url.protocol);
  } catch {
    return false;
  }
}
