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

const nextConfig: NextConfig = {
  output: "standalone",

  // Allow Server Actions from external IPs during dev (Tailscale, LAN, etc.)
  // Set DEV_ORIGINS="http://100.x.x.x:3000,http://192.168.x.x:3000" in .env
  allowedDevOrigins: process.env.DEV_ORIGINS?.split(",").map((s) => s.trim()) ?? [],

  // better-sqlite3 is a native module — exclude it from the server bundling
  // so the standalone server loads it from node_modules at runtime.
  serverExternalPackages: ["better-sqlite3"],

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
        // Revalidate public link pages on a short interval (ISR hint).
        source: "/:slug*",
        headers: [
          ...securityHeaders,
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
