/**
 * Social platform detection + inline SVG icons.
 *
 * These are plain string helpers (no React) so they can be used both in
 * server components (for the public page, zero-JS) and in admin UI.
 */

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "github"
  | "discord"
  | "twitch"
  | "spotify"
  | "linkedin"
  | "telegram"
  | "whatsapp"
  | "email"
  | "threads"
  | "bluesky"
  | "mastodon"
  | "reddit"
  | "facebook"
  | "pinterest"
  | "snapchat"
  | "patreon"
  | "substack"
  | "gumroad"
  | "behance"
  | "dribbble"
  | "soundcloud"
  | "bandcamp"
  | "vimeo"
  | "signal"
  | "paypal"
  | "buymeacoffee"
  | "kofi"
  | "medium";

export const SUPPORTED_PLATFORMS: SocialPlatform[] = [
  "instagram",
  "tiktok",
  "youtube",
  "twitter",
  "github",
  "discord",
  "twitch",
  "spotify",
  "linkedin",
  "telegram",
  "whatsapp",
  "email",
  "threads",
  "bluesky",
  "mastodon",
  "reddit",
  "facebook",
  "pinterest",
  "snapchat",
  "patreon",
  "substack",
  "gumroad",
  "behance",
  "dribbble",
  "soundcloud",
  "bandcamp",
  "vimeo",
  "signal",
  "paypal",
  "buymeacoffee",
  "kofi",
  "medium",
];

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  twitter: "X (Twitter)",
  github: "GitHub",
  discord: "Discord",
  twitch: "Twitch",
  spotify: "Spotify",
  linkedin: "LinkedIn",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  email: "Email",
  threads: "Threads",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  reddit: "Reddit",
  facebook: "Facebook",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  patreon: "Patreon",
  substack: "Substack",
  gumroad: "Gumroad",
  behance: "Behance",
  dribbble: "Dribbble",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
  vimeo: "Vimeo",
  signal: "Signal",
  paypal: "PayPal",
  buymeacoffee: "Buy Me a Coffee",
  kofi: "Ko-fi",
  medium: "Medium",
};

export function getPlatformLabel(platform: SocialPlatform): string {
  return PLATFORM_LABELS[platform] ?? platform;
}

interface Rule {
  platform: SocialPlatform;
  test: (host: string, value: string) => boolean;
}

/** Check if a hostname exactly matches or is a subdomain of the given domain. */
function isHost(host: string, domain: string): boolean {
  return host === domain || host.endsWith("." + domain);
}

const RULES: Rule[] = [
  { platform: "instagram", test: (h) => isHost(h, "instagram.com") },
  { platform: "tiktok", test: (h) => isHost(h, "tiktok.com") },
  { platform: "youtube", test: (h) => isHost(h, "youtube.com") || isHost(h, "youtu.be") },
  { platform: "twitter", test: (h) => isHost(h, "twitter.com") || isHost(h, "x.com") },
  { platform: "github", test: (h) => isHost(h, "github.com") },
  { platform: "discord", test: (h, v) => isHost(h, "discord.gg") || isHost(h, "discord.com") || v.startsWith("discord:") },
  { platform: "twitch", test: (h) => isHost(h, "twitch.tv") },
  { platform: "spotify", test: (h) => isHost(h, "spotify.com") },
  { platform: "linkedin", test: (h) => isHost(h, "linkedin.com") },
  { platform: "telegram", test: (h, v) => h === "t.me" || h.endsWith(".t.me") || v.startsWith("telegram:") || v.startsWith("tg:") },
  { platform: "whatsapp", test: (h, v) => h === "wa.me" || isHost(h, "whatsapp.com") || v.startsWith("whatsapp:") },
  { platform: "threads", test: (h) => isHost(h, "threads.net") },
  { platform: "bluesky", test: (h) => isHost(h, "bsky.app") || isHost(h, "bsky.social") },
  { platform: "mastodon", test: (h) => isHost(h, "mastodon.social") || isHost(h, "mas.to") || h.endsWith(".mastodon.social") },
  { platform: "reddit", test: (h) => isHost(h, "reddit.com") },
  { platform: "facebook", test: (h) => isHost(h, "facebook.com") || isHost(h, "fb.com") },
  { platform: "pinterest", test: (h) => isHost(h, "pinterest.com") || isHost(h, "pin.it") },
  { platform: "snapchat", test: (h) => isHost(h, "snapchat.com") },
  { platform: "patreon", test: (h) => isHost(h, "patreon.com") },
  { platform: "substack", test: (h) => isHost(h, "substack.com") },
  { platform: "gumroad", test: (h) => isHost(h, "gumroad.com") || isHost(h, "gum.co") },
  { platform: "behance", test: (h) => isHost(h, "behance.net") },
  { platform: "dribbble", test: (h) => isHost(h, "dribbble.com") },
  { platform: "soundcloud", test: (h) => isHost(h, "soundcloud.com") },
  { platform: "bandcamp", test: (h) => isHost(h, "bandcamp.com") },
  { platform: "vimeo", test: (h) => isHost(h, "vimeo.com") },
  { platform: "signal", test: (h, v) => h === "signal.me" || h === "sgnl.me" || v.startsWith("signal:") },
  { platform: "paypal", test: (h) => h === "paypal.me" || isHost(h, "paypal.com") },
  { platform: "buymeacoffee", test: (h) => isHost(h, "buymeacoffee.com") },
  { platform: "kofi", test: (h) => isHost(h, "ko-fi.com") },
  { platform: "medium", test: (h) => isHost(h, "medium.com") },
  { platform: "email", test: (_h, v) => v.startsWith("mailto:") },
];

/**
 * Detect a social platform from a URL or handle string. Returns null when
 * no platform matches.
 */
export function detectPlatform(input: string): SocialPlatform | null {
  if (!input) return null;
  const value = input.trim().toLowerCase();
  for (const rule of RULES) {
    let host = "";
    try {
      host = new URL(value.startsWith("http") ? value : `https://${value}`).hostname;
    } catch {
      host = value;
    }
    if (rule.test(host, value)) return rule.platform;
  }
  return null;
}

/**
 * Minimal, single-colour inline SVG icons for each platform. `currentColor`
 * is used so the icon inherits text colour. Each returns a self-contained
 * `<svg>` markup string sized 24x24.
 */
const GLOBE_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;

export function getSocialIconSvg(platform: SocialPlatform): string {
  switch (platform) {
    case "instagram":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
    case "tiktok":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>`;
    case "youtube":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
    case "twitter":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
    case "github":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`;
    case "discord":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>`;
    case "twitch":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>`;
    case "spotify":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;
    case "linkedin":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>`;
    case "telegram":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`;
    case "whatsapp":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
    case "email":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
    case "threads":
      return GLOBE_SVG;
    case "bluesky":
      return GLOBE_SVG;
    case "mastodon":
      return GLOBE_SVG;
    case "reddit":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.204-4.259-1.982-6.977-2.06l1.184-3.752 3.293.782-.004.149c0 1.176.957 2.134 2.134 2.134 1.176 0 2.135-.958 2.135-2.134 0-1.177-.958-2.135-2.135-2.135-.792 0-1.485.436-1.861 1.08l-3.611-.855c-.184-.043-.369.063-.42.244l-1.35 4.272c-2.751.058-5.232.837-7.06 2.057-.475-.457-1.119-.74-1.829-.74C1.193 9.135 0 10.32 0 11.779c0 .988.547 1.851 1.357 2.305-.036.224-.055.451-.055.682 0 3.456 4.083 6.261 9.119 6.261s9.119-2.805 9.119-6.261c0-.225-.018-.447-.052-.667.819-.45 1.372-1.32 1.372-2.32zm-12.579 4.704c0 .584-.473 1.057-1.057 1.057-.583 0-1.056-.473-1.056-1.057 0-.583.473-1.056 1.056-1.056.584 0 1.057.473 1.057 1.056zm6.272 0c0 .584-.473 1.057-1.057 1.057-.583 0-1.056-.473-1.056-1.057 0-.583.473-1.056 1.056-1.056.584 0 1.057.473 1.057 1.056zm-3.111 2.638c-.034.038-.86.887-2.582.887-1.725 0-2.548-.849-2.582-.887-.085-.094-.078-.24.016-.325.094-.085.24-.078.325.016.024.026.708.703 2.241.703 1.538 0 2.218-.677 2.242-.703.085-.094.231-.101.325-.016.094.085.101.231.016.325z"/></svg>`;
    case "facebook":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
    case "pinterest":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.083.342-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>`;
    case "snapchat":
      return GLOBE_SVG;
    case "patreon":
      return GLOBE_SVG;
    case "substack":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>`;
    case "gumroad":
      return GLOBE_SVG;
    case "behance":
      return GLOBE_SVG;
    case "dribbble":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>`;
    case "soundcloud":
      return GLOBE_SVG;
    case "bandcamp":
      return GLOBE_SVG;
    case "vimeo":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/></svg>`;
    case "signal":
      return GLOBE_SVG;
    case "paypal":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 5.853-7.473 5.853h-1.99l-1.298 8.234a.641.641 0 0 0 .632.739h3.722c.456 0 .842-.331.922-.78l.038-.196.703-4.463.046-.251a.929.929 0 0 1 .921-.78h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.393-.795-4.508-.235-.27-.525-.508-.864-.71l-.011.011z"/></svg>`;
    case "buymeacoffee":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6.898 0L5.682 3.692H22.21L21.063 0H6.898zm3.822 0l-.83 3.692h6.244L15.4 0h-4.68zm-6.99 5.078c-.382 0-.623.276-.535.65l2.51 13.714c.088.376.453.651.835.651h11.142c.382 0 .748-.275.836-.651l2.51-13.713c.087-.375-.155-.651-.535-.651H3.73zm10.51 3.616c.32 0 .515.236.444.553l-.026.106-1.324 6.394c-.071.317-.387.553-.707.553H8.27c-.32 0-.515-.236-.444-.553l1.324-6.394c.071-.317.387-.553.707-.553h4.383z"/></svg>`;
    case "kofi":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.606 6.649-6.916zm-11.062 3.511c-1.246 1.453-3.883 3.978-3.887 3.978-.234.227-.483.114-.483-.114V8.083c0-.255.299-.299.461-.054.146.222 3.51 4.117 3.909 4.43z"/></svg>`;
    case "medium":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>`;
    default:
      return GLOBE_SVG;
  }
}

/**
 * Normalise a social link value into a full, clickable URL.
 */
export function normalizeSocialUrl(platform: SocialPlatform, value: string): string {
  if (!value) return "";
  if (platform === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value.replace(/^@/, "")}`;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("mailto:")) return value;
  return `https://${value}`;
}
