import type { NextConfig } from "next";

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

  return {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'self' https://www.youtube-nocookie.com https://open.spotify.com https://player.vimeo.com https://w.soundcloud.com https://bandcamp.com",
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
          buildCsp(),
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

export default nextConfig;
