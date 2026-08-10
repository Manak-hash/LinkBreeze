import type { NextConfig } from "next";

const securityHeaders = [
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
 * Content-Security-Policy (ENFORCED).
 *
 * Moved from Report-Only to enforced in v1.2.5 after verifying no real-world
 * violations. Documented exceptions:
 *
 * - script-src 'unsafe-inline': Required for the sendBeacon click tracker on
 *   public link cards. The onclick handler is injected via build-link-card.ts
 *   as a raw HTML string. Nonce/hash-based CSP is a future hardening step.
 * - style-src 'unsafe-inline': Required for theme CSS custom properties
 *   (--lb-* tokens injected as inline <style> tags) and Next.js inline styles.
 * - frame-src: whitelisted embed providers only (YouTube, Spotify, Vimeo,
 *   SoundCloud, Bandcamp). Prevents arbitrary iframe injection.
 * - img-src https: data: blob: permissive by design — avatars, favicons, and
 *   thumbnails come from user-supplied domains (Unsplash, GitHub, etc.).
 * - connect-src 'self': covers /api/track. Users who inject external analytics
 *   (Plausible, Umami) via the analyticsScript field will see those scripts
 *   blocked by connect-src unless they add the origin here. This is the
 *   expected trade-off for a secure default.
 * - object-src 'none': no Flash, Java, or other plugins. Ever.
 * - form-action 'self': prevents form data exfiltration to external domains.
 */
const cspEnforced = {
  key: "Content-Security-Policy",
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self' https://www.youtube-nocookie.com https://open.spotify.com https://player.vimeo.com https://w.soundcloud.com https://bandcamp.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; "),
};

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
  },

  // Allow SVG through the image optimizer (the logo + QR code are SVG). The
  // CSP strips scripting/sandbox from served SVG, which neutralizes the XSS
  // risk that `dangerouslyAllowSVG` would otherwise introduce.
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    contentDispositionType: "attachment",
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
          cspEnforced,
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
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
          cspEnforced,
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

export default nextConfig;
