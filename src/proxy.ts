import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/session-token";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAvailableLocale,
} from "@/i18n/config";

/**
 * Protect admin routes. Public routes, the auth/setup pages, and the public
 * API endpoints are always accessible. Everything else under /dashboard,
 * /links, /profile, /theme, /settings requires a VALID session cookie
 * (signature verified + expiry checked, not just cookie existence).
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/links",
  "/profile",
  "/theme",
  "/settings",
];

const PUBLIC_EXACT = new Set([
  "/login",
  "/setup",
  "/api/track",
  "/api/qr",
  "/api/health",
]);

// Admin-reserved paths (never served as public link slugs)
const ADMIN_RESERVED = new Set([
  "/login",
  "/setup",
  "/dashboard",
  "/links",
  "/profile",
  "/theme",
  "/settings",
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── i18n: forward the admin UI locale as a request header ─────────────
  // The lb_locale cookie is the source of truth (set from Settings). The
  // admin layout/server components read x-lb-locale via headers(); public
  // [slug] pages never see it, so they stay English regardless of cookie.
  const isAdminPath =
    PROTECTED_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    ) ||
    pathname === "/login" ||
    pathname === "/setup";

  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const requestHeaders = new Headers(request.headers);
  if (isAdminPath && isAvailableLocale(localeCookie)) {
    requestHeaders.set(LOCALE_HEADER, localeCookie);
  } else {
    requestHeaders.delete(LOCALE_HEADER); // strip client-supplied spoofing
  }

  const next = () => NextResponse.next({ request: { headers: requestHeaders } });

  // Always allow the explicit public set.
  if (PUBLIC_EXACT.has(pathname)) {
    return next();
  }

  // Allow all API routes (auth is enforced inside server actions / route handlers).
  if (pathname.startsWith("/api/")) {
    return next();
  }

  // Allow Next internals + static assets.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected) {
    // Demo auto-login: skip the cookie check entirely. The admin layout's
    // getSession() also returns a mock session, so the page renders normally.
    if (process.env.DEMO_AUTO_LOGIN === "true") {
      return next();
    }

    const sessionCookie = request.cookies.get("lb_session")?.value;
    // Verify the token — not just cookie existence. A forged or expired
    // cookie is redirected to login just like a missing one.
    //
    // NOTE: This checks signature + expiry only. The password version (pv)
    // is NOT checked here because the middleware has no DB access. After a
    // password change, a stale cookie passes this gate but is rejected by
    // getSession() inside the page layout (which reads the DB). This is a
    // deliberate defense-in-depth split: middleware is the fast first gate,
    // getSession() is the authoritative second gate.
    if (!sessionCookie || !verifyToken(sessionCookie)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return next();
  }

  // Everything else (e.g. /<slug>) is treated as a public link page.
  // Block reserved admin words from being served as public pages.
  if (ADMIN_RESERVED.has(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return next();
}

export const config = {
  // Run on all paths; logic above decides what to protect.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
