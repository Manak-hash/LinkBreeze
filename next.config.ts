import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Security headers. X-Frame-Options is omitted entirely when DEMO_MODE is
 * active — in that mode CSP frame-ancestors is the sole frame-embedding gate
 * (see buildCsp below), and sending both X-Frame-Options and a permissive
 * frame-ancestors simultaneously is contradictory per the spec. In normal
 * mode, SAMEORIGIN prevents clickjacking on non-demo deployments.
 */
const securityHeaders = process.env.DEMO_MODE === "true"
  ? [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ]
  : [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

/**
 * Build the Content-Security-Policy header value.
 *
 * When DEMO_MODE=true, the frame-ancestors directive is relaxed to allow
 * embedding from the origin specified in DEMO_FRAME_ORIGIN (e.g. the
 * marketing website). This enables the live demo iframe without weakening
 * security for normal self-hosted deployments.
 */
function buildCsp(): { key: string; value: string } {
  const frameAncestors =
    process.env.DEMO_MODE === "true" && process.env.DEMO_FRAME_ORIGIN
      ? `frame-ancestors 'self' ${process.env.DEMO_FRAME_ORIGIN}`
      : "frame-ancestors 'self'";

  // React dev mode uses eval() for stack reconstruction. Production never does.
  const isDev = process.env.NODE_ENV === "development";

  // External analytics domains (Plausible, Umami, Matomo, etc.).
  // Space-separated list in EXTRA_SCRIPT_SRC. Each domain is added to
  // script-src so the operator's analytics `<script src="...">` tags load
  // without being blocked by CSP. Example:
  //   EXTRA_SCRIPT_SRC=plausible.io umami.is matomo.example.com
  const extraScriptSrc = (process.env.EXTRA_SCRIPT_SRC || "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");

  return {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${extraScriptSrc ? ` ${extraScriptSrc}` : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      // Media (background videos) — same trust model as img-src: operators
      // hotlink from arbitrary https CDNs (Mixkit, etc.). Without this,
      // default-src 'self' silently blocks cross-origin <video> and the
      // gradient fallback paints instead.
      "media-src 'self' https: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      // Location popup maps (#93): the keyless embed lives on maps.google.com
      // but redirects to www.google.com to serve tiles — both must be allowed.
      "frame-src 'self' https://www.youtube-nocookie.com https://open.spotify.com https://player.vimeo.com https://w.soundcloud.com https://bandcamp.com https://maps.google.com https://www.google.com",
      frameAncestors,
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  };
}

const nextConfig: NextConfig = {
  output: "standalone",

  // Don't leak "X-Powered-By: Next.js" in response headers.
  poweredByHeader: false,

  // Force the Drizzle migration files (.sql + meta/_journal.json) to be bundled
  // into the standalone server output. They're read at runtime by the
  // auto-migrate step in src/instrumentation.ts; without this, file tracing may
  // or may not include them, which would silently break migrations on fresh
  // deploys.
  outputFileTracingIncludes: {
    "/": ["./src/db/migrations/**/*"],
  },

  // Allow Server Actions from external IPs during dev (Tailscale, LAN, etc.)
  // Set DEV_ORIGINS="http://100.x.x.x:3000,http://192.168.x.x:3000" in .env
  // Next.js expects bare hostnames (no protocol/port), so we strip them.
  allowedDevOrigins:
    process.env.DEV_ORIGINS?.split(",")
      .map((s) =>
        s
          .trim()
          .replace(/^https?:\/\//, "")
          .replace(/:\d+$/, "")
          .replace(/\/$/, ""),
      ) ?? [],

  // better-sqlite3 is a native module — exclude it from the server bundling
  // so the standalone server loads it from node_modules at runtime.
  serverExternalPackages: ["better-sqlite3"],

  // Tree-shake large barrel-export packages to reduce client bundle size.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],

    // Server Action request body cap. Next's default is 1 MB, which rejects
    // every upload the app itself accepts (2 MB images / avatars, 5 MB
    // background videos) with a bare 413 before validation runs. 10 MB
    // comfortably covers the largest cap with headroom for multipart
    // overhead, while still bounding abuse.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  async headers() {
    return [
      {
        // Immutable long-term cache for Next.js static assets (hashed
        // JS/CSS chunks). These are content-addressed — the filename
        // changes on every build, so a 1-year TTL is safe.
        // MUST be above the /:slug* rule — otherwise _next/static/ files
        // match the catch-all and get the short s-maxage=60 instead.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Revalidate public link pages on a short interval (ISR hint).
        // Skips /_next, /api, and admin routes (handled below).
        source: "/:slug*",
        headers: [
          ...securityHeaders,
          buildCsp(),
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        // Uploaded icon/avatar/font files: served as attachments' sources,
        // never as documents. A strict CSP (no scripts, no frames, no
        // origins) means even a malicious SVG executes nothing if opened
        // directly — defense in depth behind the upload sanitizer.
        // NOTE: this rule MUST come AFTER /:slug* — when several header
        // rules match, the last one wins, so this overrides the broad
        // page CSP for upload files.
        source: "/api/uploads/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; media-src 'self'; font-src 'self'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Cache QR codes aggressively.
        source: "/api/qr",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
      {
        // Admin pages should not be cached / framed.
        source: "/(dashboard|links|profile|theme|settings)(:path*)?",
        headers: [
          ...securityHeaders,
          buildCsp(),
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

export default withNextIntl(nextConfig);
