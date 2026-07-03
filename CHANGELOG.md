# Changelog

All notable changes to LinkBreeze will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - Unreleased

### Added

- **Comprehensive test suite** — 134 tests across 16 files covering pure functions, server actions, and security validation. Includes tests for: rate limiting, visitor hashing, device detection, geo/country lookup, QR code generation, session tokens, social icon detection/normalization, link URL scheme validation, demo mode guards, upload content types, version reading, theme backgrounds, link card rendering, auth (login + setup), settings updates, link CRUD, and backup validation. (Closes #6, #17)

### Fixed

- **Health endpoint version** — `/api/health` now reads the version dynamically from `package.json` instead of returning a hardcoded `1.0.0`.

### Changed

- **CI workflow** — Now runs `npm run test` (Vitest) in addition to tsc + build. Closes #2.
- **Docker release workflow** — Added `.github/workflows/release.yml` that builds and pushes Docker images to GHCR automatically on tag push (`v*`). Tags both `latest` and the version number.

## [1.0.1] - 2026-07-03

### Security

- **Session invalidation on password change** — Changing your password now invalidates all existing sessions (stolen or old cookies become instantly invalid). Implemented via a `sessionVersion` counter in the settings table: tokens include the version at issue time, `getSession()` rejects mismatches.
- **QR download endpoint rate limiting** — The `/api/qr` endpoint is now rate-limited to 30 requests/min per IP. Prevents CPU abuse from repeated QR generation.
- **CSRF protection documented** — SECURITY.md now documents that Next.js 16 Server Actions verify `Origin`/`Host` headers on every non-GET submission (built-in framework protection, no manual token needed).
- **SECURITY.md vulnerability reporting** — Added response timeline (48h ack, 7-day status, 30/90-day patch targets) and safe harbor clause for security researchers.
- **Social icon URL detection hardened** — Platform detection in `social-icons.ts` now uses proper hostname matching (`isHost()`) instead of `.includes()`. Prevents `evil.com/github.com` from matching as GitHub. Resolves 11 CodeQL alerts.
- **CI workflow permissions** — Added explicit `permissions: contents: read` to CI workflow. Follows least-privilege principle. Resolves 1 CodeQL alert.
- **Link URL scheme validation** — Link URLs are now validated by type: only `http:`/`https:` for regular links, `mailto:` for email, `tel:` for phone, `wa.me` for WhatsApp, etc. Blocks `javascript:` and `data:` URI XSS. (Contributed by @MFA-G, PR #29, closes #14)
- **Backup version validation** — Restoring a backup from an incompatible future version is now rejected before any database transaction runs. (Contributed by @vku2018, PR #30, closes #16)

### Added

- **robots.txt** — Dynamic route that blocks admin and API routes, allows the public slug page.
- **sitemap.xml** — Dynamic route that reads the public slug from the database and derives the origin from request headers.
- **LICENSE** — MIT license file (was referenced in README but missing from repo).
- **TROUBLESHOOTING.md** — Dedicated troubleshooting guide: Docker Desktop issues, PowerShell syntax errors, password recovery (3 methods), port conflicts, database corruption, analytics tracking, cache issues.
- **Upgrade guide** — TROUBLESHOOTING.md now documents the upgrade process (Docker pull + auto-migrations, non-Docker steps).
- **Slug management docs** — TROUBLESHOOTING.md now explains how slug changes work (no redirects, reserved words, QR code behavior).
- **Accessibility docs** — SECURITY.md now documents the accessibility posture (Radix/shadcn WAI-ARIA, keyboard nav, WCAG AA contrast, screen-reader support).
- **GitHub Discussions** — Enabled on the repository.

### Fixed

- **Middleware session validation** — Middleware now verifies the HMAC signature and expiry of the `lb_session` cookie instead of only checking for its existence. Forged or expired cookies are redirected to `/login`. Token logic extracted into `src/lib/session-token.ts` (shared between `proxy.ts` and `auth.ts`).
- **README Docker commands** — Fixed PowerShell compatibility: `docker run` command now works on Windows (backslash continuation broke PowerShell). Added single-line variant.
- **docker-compose.yml** — Now pulls pre-built image from GHCR by default instead of building from source.
- **SECURITY.md** — Corrected 4 false claims: session expiry is 30 days (not 7), X-Frame-Options is `SAMEORIGIN` (not `DENY`), removed non-existent login rate-limiting claim, removed false Docker read-only filesystem claim. Added honest "Known Limitations" section.
- **CONTRIBUTING.md** — Removed references to non-existent `public/themes/` directory (themes are DB-stored, managed via admin panel). Added test step to PR checklist.
- **package.json** — Version aligned with release: `0.1.0` → `1.0.0`.
- **Theme submission template** — Updated to reflect actual admin-panel-based theme workflow.

### Changed

- **README.md** — Split docker-compose instructions into Option A (pre-built image) and Option B (build from source). Added "Make sure Docker is running" note. Added CHANGELOG and TROUBLESHOOTING links to documentation section. Added CI badge.
- **PR template** — Now requires `npm run test` to pass.
- **Dependencies** — Bumped via Dependabot: next 16.2.9→16.2.10, react 19.2.4→19.2.7, react-dom 19.2.4→19.2.7, lucide-react 1.22→1.23, recharts 3.9.0→3.9.1, tailwindcss 4.3.1→4.3.2, eslint-config-next 16.2.9→16.2.10.
- **Dependabot** — Added `.github/dependabot.yml` for automated weekly npm/Docker and monthly GitHub Actions updates.

### Removed

- **47 MB of unused screenshots** — Deleted uncompressed PNG variants that were never referenced by the README.

### Social

- **GitHub social preview** — Uploaded 1280x640 banner image for link unfurls on Reddit, Twitter, Discord.

## [1.0.0] - 2026-07-01

### Added

- **Link management** — Add, reorder, toggle, and customize unlimited links with drag-and-drop (dnd-kit)
- **Privacy-first analytics** — Page views, click tracking, referrers, device type, country detection. No cookies, no raw IP storage (SHA-256 with daily-rotating salt)
- **5 built-in themes** — Midnight, Sunset, Ocean, Mono, Forest presets
- **Full theme customizer** — Colors, fonts, backgrounds (solid/gradient/pattern), link styles (rounded/sharp/glass), animations (lift/scale/none)
- **QR codes** — Auto-generated for public pages, downloadable as SVG or PNG
- **Link scheduling** — Schedule links to appear/disappear automatically
- **Admin dashboard** — Overview stats, views chart with date range picker, per-link click analytics
- **Profile editor** — Avatar upload, display name, bio, badge text, social links
- **Setup wizard** — First-run setup creates the admin account in under 30 seconds
- **Settings page** — Page slug, SEO title/description, footer text, password change
- **Backup system** — Export/import full configuration (profile, links, settings, themes) as JSON. Transactional restore with rollback.
- **Analytics export** — CSV export of pageview and click data
- **Analytics retention setting** — Configurable retention window
- **Security headers** — HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **CSP on SVG images** — Strips scripts/sandbox from served SVG to neutralize XSS
- **Health endpoint** — `/api/health` for Docker HEALTHCHECK and load balancer probes
- **OpenGraph images** — Auto-generated OG images per public page for social sharing
- **JSON-LD structured data** — ProfilePage schema for SEO
- **Docker image** — Multi-stage build, non-root user, HEALTHCHECK directive. Published to `ghcr.io/manak-hash/linkbreeze:latest`
- **CI pipeline** — TypeScript type-check + Next.js build on every PR
- **Issue templates** — Bug report, feature request, theme submission
- **4 ADR documents** — Technology decisions documented (Next.js, Drizzle, SQLite, abstraction layer)

### Security

- bcrypt password hashing (12 rounds)
- HMAC-signed session cookies with constant-time comparison (`crypto.timingSafeEqual`)
- httpOnly, SameSite cookie attributes
- Zod input validation on every server action and API route boundary
- Path-traversal-safe file upload resolution
- File upload restrictions: images only, 2 MB max, sanitized random filenames
- Rate limiting on analytics tracking endpoint (60 req/min per IP)

### Technical

- **Framework**: Next.js 16 (App Router, Server Components, ISR)
- **Database**: SQLite via better-sqlite3 (WAL mode)
- **ORM**: Drizzle ORM (type-safe, zero-overhead)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Public page**: Zero client-side JavaScript — pure Server Components with inline `onclick`/`sendBeacon` for click tracking
- **Performance**: <300ms FCP target, ISR with 60s revalidation
