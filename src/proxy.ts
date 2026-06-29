import { NextRequest, NextResponse } from "next/server";

/**
 * Protect admin routes. Public routes, the auth/setup pages, and the public
 * API endpoints are always accessible. Everything else under /dashboard,
 * /links, /profile, /theme, /settings requires a valid session cookie.
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

  // Always allow the explicit public set.
  if (PUBLIC_EXACT.has(pathname)) {
    return NextResponse.next();
  }

  // Allow all API routes (auth is enforced inside server actions / route handlers).
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow Next internals + static assets.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (isProtected) {
    const sessionCookie = request.cookies.get("lb_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Everything else (e.g. /<slug>) is treated as a public link page.
  // Block reserved admin words from being served as public pages.
  if (ADMIN_RESERVED.has(pathname)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths; logic above decides what to protect.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
