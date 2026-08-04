# Changelog

All notable changes to LinkBreeze will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - Unreleased

### Fixed

- **Dashboard edge-card hover clipping** — Hover effects (spotlight glow, ring shadow, scale) on dashboard cards along the grid's outer borders and corners were visually clipped. The dashboard root container had `lg:overflow-hidden` which cut off outward-extending box-shadows and transforms at the boundary. Removed the redundant overflow constraint (the chart section retains its own `overflow-hidden` for internal containment), allowing hover effects to render fully on all 8 cards.
- **Dashboard bottom-row card watermark icons** — Top Links, Referrers, Devices, and Countries cards had missing or mismatched watermark icons (no icon, wrong icon, or small circle style). All four now have semantically correct watermark icons (Trophy, Share2, MonitorSmartphone, Globe) matching the top-row cards' size, position, and styling exactly.
- **"All" range chart showing only 1-2 days** — The `rangeDayCount("all")` function assumed analytics timestamps were always in SQLite `datetime('now')` format (`YYYY-MM-DD HH:MM:SS`). When timestamps were stored in ISO format (e.g. from `.toISOString()`), the date parser produced `NaN`, causing the chart to show only 1 data point. Fixed the parser to handle both ISO and SQLite datetime formats, with an `isNaN` guard falling back to 30 days.
- **Demo seed timestamps not backdated** — The demo seed script's 7-day analytics loop intended to spread data across the past week, but `createdAt` was never explicitly set on inserts, causing all records to default to `now()`. This compressed all analytics into a single day, making the "All" range chart show only 1 data point. Each pageview and click now gets a backdated `createdAt` timestamp spread across the appropriate day.

### Security

- **npm dependency overrides** — Bumped `fast-uri` to `^3.1.5` (ReDoS via backslash authority), `brace-expansion` to `^5.0.9` (DoS via unbounded arrays), and added `hono` override to `^4.12.34` (ReDoS in CORS middleware). `npm audit` now reports 0 vulnerabilities.

## [1.2.2] - 2026-08-02

### Added

- **Live preview pane** — A floating phone-frame overlay accessible from a "Preview" button in the admin sidebar (desktop) and mobile tab bar. The `PreviewProvider` wraps the entire admin shell so any edit — link reorder, toggle, theme change, profile update, settings save — instantly reflects in the preview iframe. The preview auto-reloads on active page changes and supports manual refresh + open-in-new-tab. The phone frame uses a 9:19.5 aspect ratio with a max height of 720px. The public page detects when it's inside the preview iframe (`window.self !== window.top`) and hides its scrollbar so the phone mockup stays clean.
- **Dashboard metric cards with deltas and sparklines** — The four KPI cards (Views, Clicks, CTR, Active Links) now show period-over-period change indicators (up/down arrows with percentage) comparing the selected range to the previous equivalent range via a new `getPreviousStats()` query. Views and Clicks cards include inline sparkline charts rendered from daily data. Each card has a watermark-style icon in the bottom-right corner.
- **Expandable dashboard breakdown cards** — Top Links, Top Referrers, Devices, and Countries cards are now clickable. Each shows a compact view (max 4 items) on the dashboard and opens a Dialog with the full dataset when clicked. A maximize icon appears on hover.
- **Magic Bento SpotlightCard component** — New reusable card component (`src/components/ui/spotlight-card.tsx`) with a mouse-following radial glow effect. Used for dashboard metric cards. Glow color matches the aurora violet (`#533fd6`).
- **Tabbed settings page** — Settings split from a single long form into 4 tabs: General (page title, slug, SEO, footer, CSS), Appearance (theme picker, favicon upload, custom CSS), Security (password change), Data (email capture toggle, subscribers, backup/restore, clear analytics). Each tab is an independent form with its own save button. New `SettingsTabs` shell + `settings-tab-forms.tsx` with `GeneralTab`, `AppearanceTab`, `SecurityTab`, `DataTab`.
- **Reusable tab UI component** — New lightweight `src/components/ui/tabs.tsx` for accessible keyboard-navigable tabs, used by settings and theme customizer.
- **11 missing brand icons** — Added proper brand SVG icons for 11 platforms that previously fell through to the generic circle placeholder: reddit, facebook, pinterest, substack, dribbble, vimeo, paypal, buymeacoffee, kofi, medium, and X (the `"x"` key, which now resolves to the X logo SVG alongside the existing `"twitter"` key).
- **Social platform icon-chip selector** — Profile page social links: the dropdown platform selector was replaced with a visual chip grid showing all 54 platforms as icon chips. Dimmed chips indicate already-added platforms. Clicking a chip adds that platform to the social links list.
- **PageSwitcher external links** — Each page entry in the PageSwitcher dropdown now has an always-visible external-link icon that opens the public page in a new tab. Previously this was hover-only and got swallowed by nested group CSS.

### Changed

- **Dashboard layout fills the viewport** — The dashboard now uses `lg:h-[calc(100dvh-3rem)]` with `lg:overflow-hidden` so all content fits within the viewport with no scrollbar and no empty space. The "Views over time" chart takes the full middle row (grows with `flex-1` to fill remaining vertical space), with the four breakdown cards (Top Links, Referrers, Devices, Countries) in a single `lg:grid-cols-4` row at the bottom. The chart's Y-axis margin was fixed from `-16` to `0` to stop axis labels from clipping off the left edge as faint ghost artifacts.
- **Theme customizer consolidated to 4 tabs** — Merged from 6 tabs to 4: Background (background type/value/angle/image/overlay/mode + colors), Typography (font family/scale/weight/spacing), Links (link style/hover/button size/radius/border/shadow/container width/alignment/density — former Card Style + Layout merged), Effects (glow/noise/color/blur/reveal animation).
- **Profile avatar aurora ring** — The profile avatar in the admin form now has a violet aurora gradient ring around it.
- **Admin link favicon system** — Admin link cards (`sortable-link.tsx`) now use the cached favicon from `src/lib/favicon.ts` (stored in the `iconUrl` field) as the primary icon, falling back to Google S2 (`sz=64`). Special protocol icons are used for non-HTTP link types: `mailto:` → Mail icon, `tel:` → Phone icon, embed/vcard → Code2 icon. Broken favicon images auto-hide via `onError` handler.
- **Admin shell full-width content** — The admin main content area no longer has a `max-width` cap; content uses full available width.

## [1.2.1] - 2026-07-29

### Fixed

- **Settings save no longer overwrites Display Name or wipes social links (#57, reported by @jmbillard)** — The Settings form and Profile form both route through the same server action. The Settings form sent a title field that collided with the Display Name column, silently overwriting it. Social links were also wiped because the shared action defaulted the missing field to an empty array.
- **Settings tab now updates immediately when switching pages (#58, reported by @jmbillard)** — The Settings form used uncontrolled inputs that didn't react to page changes.
- **Auto Icon toggle now correctly hides the icon when disabled (#59, reported by @jmbillard)** — The public page renderer ignored the autoIcon field entirely.

### Security & Performance

- **Update-check server actions now require authentication** — Prevents unauthenticated users from triggering version-check API calls.
- **Embed iframes (YouTube, Spotify, SoundCloud, Vimeo, Bandcamp) now sandboxed** — All third-party embeds are wrapped in `sandbox` attributes to restrict their capabilities.
- **Migration wizard imports links in parallel instead of sequentially** — Significantly speeds up large imports.

### Removed

- **5 unused UI scaffolding files** — Dead code cleanup from earlier prototyping.

## [1.2.0] - 2026-07-28

### Added

- **Migration Wizard — import from URL (#45) and file upload (#46)** — New three-step wizard in Settings lets users import links and social profiles from any existing link-in-bio page. URL mode fetches and parses the page using a three-tier extraction engine: Tier 1 `__NEXT_DATA__` JSON (Linktree, Bento, and other Next.js platforms), Tier 2.5 inline `<script>` JSON (Hopp.bio, Beacons, and other Wix/doppe-based platforms), Tier 3 DOM `<a>` scraping (universal fallback). File mode accepts uploaded HTML or JSON exports (LittleLink, LinkStack, etc.). Extracted links and social profiles are previewed with thumbnails, auto-detected platform icons, and individual checkboxes before the user confirms import. SSRF protection: private-IP blocking, http/https only, max 3 redirects, 8s timeout, 5MB response cap. Social platforms auto-detected via the existing `detectPlatform()` helper. Closes #45, closes #46.
- **Favicon upload in settings UI (#52)** — Administrators can now upload a custom favicon directly from the Settings page. Supports .ico, .png, .svg, .gif, and .webp formats up to 1 MB. The upload is now per-page: each page can have its own favicon, and pages without one fall back to the default LinkBreeze branding. The admin dashboard always uses the default LinkBreeze favicon. Closes #52.
- **Auto-favicon for links (#10)** — URL-type links automatically fetch and display the target site's favicon next to the link title. Favicons are fetched via Google's S2 favicon service and cached locally as PNGs in `data/uploads/` (keyed by domain hash, so two links to the same domain share one cached file). Links without a favicon fall back to a first-letter avatar (accent-colored circle with the link's initial). Each link has a per-link "Auto icon" toggle (enabled by default) in the link editor — turning it off clears the favicon and reverts to the first-letter fallback. Non-HTTP link types (email, phone, WhatsApp) are excluded automatically. Closes #10.
- **Multi-page support (#47)** — Users can now create unlimited pages, each with its own slug, title, bio, avatar, social links, theme, links, analytics, SEO settings, favicon, QR code, footer text, custom CSS, analytics script, and email capture toggle. The `pages` table replaces the singleton `profile` table as the source of truth for page content. A page switcher in the admin sidebar (drop-up on desktop, compact in mobile header) lets users switch between pages; each admin section (links, profile, theme, dashboard, settings) is page-scoped via a `?page=N` query param that persists across tab navigation. New pages are created at `/pages/new`. The public route `/{slug}` resolves to the matching page with per-page metadata (title, description, favicon, OG image). Existing installs are migrated automatically: the current profile/settings data is seeded as the default page, and all existing links are assigned to it. Root `/` redirects to the default page's slug. Analytics (pageviews, breakdowns, dashboard stats) are tracked per-page. QR codes are generated per-page using the page's slug. Closes #47.
- **Social platform support expanded from 32 → 54 platforms** — Added 22 new platforms (Apple Music, Apple Podcasts, Tumblr, Flickr, RSS, Steam, Etsy, Goodreads, Wattpad, Unsplash, DeviantArt, Cash App, Venmo, LINE, WeChat, VK, Quora, GitLab, Stack Overflow, Product Hunt, Linktree, Bento). Replaced all 10 globe placeholder icons (Threads, Bluesky, Mastodon, Snapchat, Patreon, Gumroad, Behance, SoundCloud, Bandcamp, Signal) with real brand SVGs from simple-icons (CC0). Every platform now has its proper branded icon — zero placeholders remain. Added detection rules for all new platforms.
- **One-line install script (`scripts/install.sh`)** — New `curl | bash` installer detects Docker or Podman automatically, pulls the latest image, starts the container with correct port and volume mappings, waits for the health check endpoint to confirm startup, and optionally generates a systemd service for auto-start on boot. Shellcheck-clean. Usable via GitHub raw URL or locally after cloning.
- **README deployment guides for 8 platforms** — Quick Start section restructured with a method-selector table at the top. Added step-by-step guides for: one-line script, Docker, Docker Compose, Coolify, Synology NAS, Podman (with rootless notes), Portainer (Stack YAML), and Manual (from source). Each section is self-contained — users find their platform and follow steps without reading unrelated content.

### Changed

- **Root layout metadata resolves origin dynamically** — The `generateMetadata()` conversion initially hardcoded a `metadataBase` URL, which is wrong for an OSS project where every instance has its own domain. Fixed: `metadataBase` now resolves from `BASE_URL` env var first, then request headers (`x-forwarded-host` + `x-forwarded-proto`), with a localhost fallback for build time — same pattern the public page already uses for OG images and sitemap.
- **.ico and .svg content-type support** — Added `image/x-icon` and `image/svg+xml` to the uploads content-type map so the upload route serves favicon files with correct headers.
- **Dependency security overrides** — Bumped npm overrides to resolve all 4 dependabot high-severity advisories: `postcss` ^8.5.18 (path traversal via sourceMappingURL, GHSA), `sharp` ^0.35.0 (libvips CVEs), `fast-uri` ^3.1.4 (host confusion via backslash/IDN), `brace-expansion` ^5.0.8 + minimatch ^10.0.1 (DoS via unbounded expansion, GHSA-mh99-v99m-4gvg). `npm audit` now reports 0 vulnerabilities.
- **Dependency bumps** — next 16.2.11→16.2.12 (TypeScript 7 support backport), react/react-dom 19.2.7→19.2.8 (RSC decoding perf), eslint-config-next 16.2.11→16.2.12, better-sqlite3 12.11.1→13.0.1 (major: refactored to N-API/node-addon-api, removed prebuild-install dep, prebuilt binaries now cross-runtime compatible — all 269 tests pass). Supersedes dependabot PRs #55 and #56.
- **Lighthouse CI workflow triggers on push to main** — Previously only ran on PRs and daily cron, so the seed-database fix went unverified until a PR was opened. Added `push: [main]` and `workflow_dispatch` triggers.

### Fixed

- **Dashboard referrers showed raw URLs with duplicates** — Referrer entries like `https://example.com`, `http://example.com`, and `https://example.com/` appeared as separate rows instead of being grouped. Fixed: referrers are now normalized to their hostname (stripping protocol, path, `www.` prefix) and counts are merged. Applies to both dashboard and per-link analytics.
- **Login page had no way back to the public page** — The login form was a dead end with no navigation. Added a "← Back to page" link below the sign-in button.

- **Owner views counted in analytics (#40)** — The public page had `revalidate = 60` (ISR), which made Next.js statically cache the page. During static generation, `cookies()` is not available, so `getSession()` couldn't detect the owner's session cookie — the owner detection check silently failed and every owner pageview was counted as a regular visitor. Fixed: added `export const dynamic = "force-dynamic"` to the public page so cookies and headers are read at request time. ISR cache headers for CDN-edge caching are preserved via the `headers()` config in `next.config.ts`.
- **Public page crashed with `require is not defined`** — The root layout's `generateMetadata()` used `await import("@/server/queries")` which Turbopack bundled as CJS, crashing in the ESM runtime. Fixed: converted to a static import.
- **`/favicon.ico` returned HTML instead of an image** — Without a route handler, Next.js fell through to the catch-all route and returned the page HTML with a 200 status. Browsers cached that response aggressively and never re-requested, so the custom favicon never appeared in the browser tab. Fixed: added a `/favicon.ico` route handler that 302-redirects to the custom favicon (or default fallback), with host-aware URLs derived from request headers and `no-cache` headers so changes are picked up immediately.
- **Custom favicon ignored by browsers despite correct HTML** — When a custom favicon was set, the default `favicon-32.png` and `favicon-16.png` link tags remained in the HTML alongside it. Chrome's favicon selection algorithm picks the icon with the best `sizes` match, so it preferred the explicitly sized defaults over the custom icon. Fixed: when a custom favicon is set, it becomes the ONLY `<link rel="icon">` in the document, with `sizes="16x16 32x32 48x48 96x96 150x150 192x192"` and the correct `type` attribute. SVG favicons use `sizes="any"`.
- **Slug pattern regex invalid in Chrome `/v` mode** — The `[a-zA-Z0-9_-]+` pattern on the slug input had an unescaped hyphen that Chromium's new regex engine rejected. Fixed: escaped the hyphen.
- **Setup page showed duplicate logo and title** — Both `page.tsx` and `setup-form.tsx` rendered their own logo + heading, and both had nested `min-h-screen` centering creating a massive gap. Fixed: removed the duplicate header from `page.tsx`; `setup-form.tsx` now owns the entire layout.
- **allowedDevOrigins didn't strip protocol/port** — The `DEV_ORIGINS` env var contains full URLs (`http://192.168.x.x:3000`) but Next.js expects bare hostnames. Fixed: the config now strips protocol and port before passing to `allowedDevOrigins`.
- **Lighthouse CI "Seed database" step crashed with `no such table: users`** — The seed script (`src/scripts/seed-lighthouse.ts`) ran before the Next.js server started, but the DB tables are only created when the server boots (via `instrumentation.ts` → `migrate()`). The seed hit a completely empty SQLite file and crashed on its first query. Fixed: the seed script now runs migrations itself before inserting data, mirroring the same `migrate()` call `instrumentation.ts` uses.
- **Migration Wizard vulnerable to case-variant dangerous URL schemes (code-scanning #14)** — The `javascript:` scheme filter was case-sensitive, so `JavaScript:` or `JAVASCRIPT:` bypassed it. Fixed: replaced with a case-insensitive regex that also blocks `data:` and `vbscript:` schemes.
- **Link dialog schedule inputs overflowed on small screens** — "Show from" and "Hide after" sat side-by-side on `sm+` breakpoints, pushing the dialog past the viewport height on mobile. Fixed: inputs now always stack vertically (Show from on top, Hide after below).

### Refactored

- **Design system foundation: DESIGN.md + semantic tokens + FormField component** — Added `DESIGN.md` at repo root documenting the full visual language: color tokens (brand + semantic), 5-step spacing scale, typography, component conventions, motion, accessibility, and file structure. Created `--success` and `--warning` CSS tokens to split feedback colors from brand accent (previously `text-lavender` doubled as both brand accent and success, and raw Tailwind colors like `text-green-500` and `text-amber-400` were used ad-hoc). Created `FormField` component (`src/components/ui/form-field.tsx`) as the single source of truth for label + control + hint spacing. Migrated all 6 admin forms to FormField: `settings-form`, `change-password-form`, `profile-form`, `link-dialog`, `setup-form`, and `MigrationWizard` — 25 field instances total, each verified pixel-identical (8px label→input gap, 32px input height) against pre-migration baselines. Required fields now show asterisks automatically (accessibility improvement). Migrated all raw Tailwind color classes to semantic tokens (`text-green-500` → `text-success`, `text-amber-400` → `text-warning`, `text-red-400` → `text-destructive`, data-manager success messages `text-lavender` → `text-success`). Theme customizer (`field-controls.tsx`) intentionally NOT migrated — its denser 6px spacing is correct for a customizer panel context.
- **Update checker** — Dashboard now polls `latest-version.json` from the repo (served via GitHub raw) on a 24h cache to detect new releases. When a newer version is found, a dismissible banner appears at the top of the dashboard: "LinkBreeze vX.Y.Z is available — You're running vX.Y.Z" with a "View release notes" link, a manual "Check again" button, and a dismiss button. Settings > Data card has an "Update notifications" toggle (default ON) to disable the check entirely. No user data sent, no phone-home, no auto-update — just a plain GET to the public JSON file. Silently fails on offline, rate-limit, or timeout (no error shown to user).
- **`links-manager.tsx` split from 573 → 151 lines** — Extracted `SortableLink`, `LinkDialog`, and `DeleteDialog` into separate component files under `src/app/(admin)/links/components/`. Moved `LINK_TYPES`, label/placeholder maps, and URL-prefix logic into `link-helpers.ts` (where `prefixLinkUrl()` will be reused by the migration wizard). Fixed a stale-closure bug in `handleDragEnd` where `items.map()` read the pre-drag array instead of the post-drag order. The slim orchestrator is now structured to accept a `pageId` prop for multi-page support.
- **`theme-manager.tsx` split from 782 → 159 lines** — Extracted `ColorField`, `SelectField`, `ToggleField`, `SliderField` into `field-controls.tsx`; `PresetGallery`, `ThemeCustomizer` (with 6 section sub-components), and `DuplicateTheme` into separate component files. Moved all constant arrays and the `swatchFor` helper into `theme-constants.ts`. The orchestrator is ready for theme-per-page work.
- **`build-link-card.ts` signature modernized** — Changed from 5 positional params to an options object `buildLinkCardHtml({ link, theme, index, staggerMs? })`. Removed unused `_profile` parameter. Extracted `resolveLinkUrl()` and `buildContentRow()` helpers, eliminating the duplicated content-row HTML between the image and no-image code paths. Updated `LinkCard.tsx` caller to drop the now-unused `profile` prop.

## [1.1.5] - 2026-07-25

### Fixed

- **17 unused `React` imports removed** — Next.js 16 uses the automatic JSX runtime and does not require `import * as React` in component files. Removed from all 17 files where React was imported but never referenced. No behavior change.
- **4 redundant boolean comparisons simplified** — `theme-tokens.ts` (glow/noise enabled checks) and `links.ts` (isHighlighted/isActive Zod transforms) used verbose `=== true || === "true" || === 1 || === "1"` chains. Extracted into a shared `truthy()` helper in `src/lib/utils.ts`. Same behavior, cleaner code.
- **Nested ternaries in `links-manager.tsx` replaced with lookup maps** — The link type label and placeholder chains (6 nested ternaries each) were converted to `Record<string, string>` lookup maps with fallback defaults. Improves readability and makes adding new link types trivial.
- **`confirm()` in theme-manager replaced with Dialog** — The native `confirm()` dialog for theme deletion was replaced with a styled shadcn/ui Dialog component, matching the rest of the admin UI. Better mobile UX, no main-thread blocking.
- **`confirm()` in data-manager replaced with Dialog** — The restore-backup and clear-analytics confirmation dialogs also used `window.confirm()`. Both replaced with styled shadcn/ui Dialog components for consistency with the theme-manager fix.
- **Phone placeholder genericized** — The Morocco-specific phone placeholder `+212****0000` in the link editor was replaced with the international `+1 (555) 000-0000`. LinkBreeze targets international users.
- **Inter font now loaded (default theme font was missing)** — The DB schema defaults `fontFamily` to "inter" and the admin UI lists it as the first option, but `layout.tsx` never loaded it via `next/font/google`. Users selecting "Inter" got a system-ui fallback. Added `Inter` with `--lb-font-inter` variable and `preload: false`.
- **`getSession()` performance regression on public pageviews** — The owner-exclusion analytics feature called `getSession()` (which does a DB query) on every public page render, even for anonymous visitors. Fixed: all three tracking paths now check cookie existence first and only call `getSession()` when the `lb_session` cookie is present.
- **Analytics contaminated by dev traffic and ghost tracking path** — Two bugs inflated analytics counts. (1) The old client-side `/api/track` endpoint still accepted `type: "view"` events even though server-side tracking in `[slug]/page.tsx` had replaced it — duplicate and orphaned pageviews (page_id=NULL) were recorded whenever the endpoint was hit. Fixed: `/api/track` is now click-only; the view handler is removed entirely. (2) All three tracking paths (pageview server-side, `/api/track`, `/go/:id` redirect) recorded analytics during development, meaning every `npm run dev` visit inflated production-bound metrics. Fixed: every path now checks `process.env.NODE_ENV === "production"` before writing to the analytics tables. Dev/preview traffic is zero from now on.

### Security

- **Bot/crawler filtering in analytics (#41)** — Known bots and crawlers (Googlebot, Bingbot, social preview crawlers, SEO tools, etc.) are now filtered out before recording pageviews and clicks. Prevents inflated metrics from automated traffic. Conservative pattern matching avoids over-filtering legitimate visitors.
- **Owner view/click exclusion from analytics (#40)** — Authenticated admin sessions are no longer counted in analytics. When the owner views their own page or clicks their own links, the event is skipped. Prevents self-inflated metrics.
- **Dependabot alert #3 patched (brace-expansion DoS)** — Added npm override forcing `brace-expansion >= 5.0.7` to resolve the high-severity ReDoS vulnerability in the transitive dependency.
- **Dependabot alert #4 patched (@hono/node-server path traversal)** — Added npm override forcing `@hono/node-server >= 2.0.5` to resolve the medium-severity path traversal vulnerability in the transitive dependency.

### Added

- **Lighthouse CI workflow (#39)** — Added `.github/workflows/lighthouse.yml` with `lighthouserc.json` config. Runs Lighthouse audits on PRs targeting main and nightly on main. Includes a seed script (`src/scripts/seed-lighthouse.ts`) that creates a minimal profile + slug so Lighthouse audits a real public page instead of a /setup redirect. Reports uploaded as artifacts.
- **Bot detection tests (37 tests)** — `src/lib/__tests__/bot-detect.test.ts` covers 21 known bot UAs (all match), 10 real browser UAs (none match), and edge cases (empty UA, whitespace, word-boundary false positives). Ensures the analytics bot filter doesn't over-filter legitimate traffic.

### Changed

- **Dependency bumps** — `lucide-react` 1.24→1.25, `shadcn` 4.13→4.13.1 (patch-level), `next` 16.2.10→16.2.11 (patch — resolves multiple Next.js security advisories), `eslint-config-next` 16.2.10→16.2.11. Supersedes Dependabot PR #43.
- **Lighthouse thresholds tuned** — Performance set to warn at 0.7 (not 0.8) because third-party embeds (YouTube, Spotify) on user pages can load 1.4MB of third-party JS that the app doesn't control. Accessibility remains error-gated at 0.9. SEO set to warn at 0.7 for pages like /login that legitimately lack meta tags.
- **Code cleanup from Herald audit** — 9 unused `cn` imports, 4 commented-out code blocks, and 4 flagged unused vars (`chartData`, `avatarSrc`, `jsonLd`, `anchorHtml`) were verified as already addressed during v1.1.4. No changes needed.

## [1.1.4] - 2026-07-22

### Fixed

- **CI badge showed failing on default branch** — The CI workflow only triggered on `pull_request`, so no runs ever executed on `main`. Shields.io checks the default branch, causing the README badge to always show "failing". Added `push: branches: [main]` to the workflow triggers.
- **Theme import card didn't state the expected file format (#44)** — The import/export card description was ambiguous about which file type to use, leaving users unsure whether to upload a zip or JSON. The system is and has always been JSON-only (export produces `.json`, import parses JSON). The card description and a new helper line under the import button now explicitly say `.json`. No behavior change — the input's `accept` attribute was already correct.
- **Type error in manifest test** — `manifest.test.ts` called `.startsWith()` on `start_url` typed as `unknown`, causing a `tsc --noEmit` failure. Added the same `as string` cast already used for `short_name` on the line above.
- **Image background overlay rendered as a dark gradient instead of a translucent tint** — `resolveBackground()` for `backgroundType: "image"` built the overlay layer as `linear-gradient(#00000080, #000000)` — alpha encoded on the first stop only, second stop dropped the alpha entirely. The result was a near-opaque dark layer over the image instead of the intended uniform translucent tint. Additionally, `overlayOpacity: "0"` still rendered the broken gradient instead of skipping the overlay. Fixed: the overlay is now a uniform translucent layer (`#color+alpha` at both gradient stops), and opacity 0 or missing skips the overlay entirely. No preset used the image background type, so no existing theme was visually affected — the bug only hit user-created image-background themes.
- **`mode` column comment claimed `auto` was supported** — The schema comment on `themes.mode` documented `dark, light, auto`, but the Zod validator, the admin UI select, and the resolver only handle `dark` and `light`. A value of `auto` would have triggered the same silent `safeParse` reject as the v1.1.2 density bug (entire save payload rejected, error swallowed client-side). Comment aligned to reality; no behavior change, no migration.
- **Click-inflation attack on `/go/:id` (security)** — The JS-free click redirect endpoint had no rate limit, while the JS fallback (`/api/track`) was throttled at 60 req/min/IP. A bot could hammer `/go/:id` in a loop to inflate any link's `clicksCount` and raw `analyticsClicks` rows indefinitely — polluting both the admin dashboard and the export. Fixed: `/go/:id` now applies the same `rateLimit("go:<ip>", 60, 60_000)` check as `/api/track`. Rate-limited requests still redirect (real users never hit the limit), but the click is not recorded. This closes the integrity gap between the two click-tracking paths.
- **"Zero client JavaScript" claim was inaccurate** — The README, CONTRIBUTING, ADR-0001, and CHANGELOG all claimed the public page ships "zero client JS", but `build-link-card.ts` emits an inline `onclick="navigator.sendBeacon(...)"` for non-http links (mailto, tel, sms). While no JS *bundle* ships (no React runtime), inline handlers are technically client-side JS. Claims softened to "zero client-side JS bundles" / "no React runtime" across all docs. The architecture is unchanged; only the marketing/technical claims were corrected to match reality.

### Added

- **Theme system regression matrix (69 tests)** — `src/lib/__tests__/theme-matrix.test.ts` locks the contract between the 4 layers that must agree: DB schema defaults, Zod validator (`customSchema`), token resolver (`resolveThemeTokens`), and the 9 preset definitions. Every past theme bug (v1.1.2 density enum, v1.1.3 `soft` shadow missing, v1.1.3 `fontScale` numeric fallthrough) was a drift between these layers that shipped to production undetected. The matrix covers 4 dimensions: (1) enum conformance — every schema default and documented enum value is a valid Zod enum member; (2) preset coverage — every preset passes Zod, produces non-default CSS vars where it declares overrides, and resolves `fontScale`/`shadowStrength` to their intended values (not the default fallthrough); (3) resolver edge cases — `resolveFontSize`, `resolveSpacing`, `resolveShadow` each handle every input shape including null/garbage without `NaN`; (4) schema↔Zod↔resolver drift guard — the full schema-default theme resolves to a complete CSS-var token set with no empty/undefined values.
- **Image overlay regression test (4 tests)** — `src/lib/__tests__/theme-image-overlay.test.ts` pins the fixed overlay render behavior across 50%/100%/0% opacity and the no-image-URL fallback path.
- **PWA manifest upgrade for public pages (closes #18)** — The manifest existed but was missing the fields browsers actually check before showing the install / "Add to Home Screen" prompt. Without `start_url` and `scope`, Android and Desktop Chrome treat the page as non-installable; without a maskable icon, Android adaptive-icon launchers letterbox the icon. Added: `start_url` (`/?source=pwa`, also lets us measure PWA launches in analytics), `scope: "/"`, `orientation: "portrait"`, `categories`, `lang`, `dir`, a maskable variant of the 192px and 512px icons, and a `screenshots` entry (Android shows this in the install sheet). `theme_color`/`background_color` kept as the existing Aurora dark navy.
- **Manifest contract test** — `src/lib/__tests__/manifest.test.ts` (6 tests) parses `public/site.webmanifest` and asserts the install-prompt-critical fields. Prevents silent regressions where someone edits the JSON and breaks installation.

### Changed

- **Extracted theme presets and Zod schema into importable modules** — `src/lib/theme-presets.ts` (the 9 presets + shared `base` defaults) and `src/lib/theme-schema.ts` (the `customSchema` Zod validator + `cssColor` helper) are now pure data modules importable by tests without dragging in the `"use server"` / `"server-only"` runtime. `src/server/queries/index.ts` and `src/server/actions/theme.ts` import from these modules instead of defining the data inline. Zero behavior change — the refactor exists to make the regression matrix possible.
- **Dependency bumps** — Merged #36 (minor-and-patch group) and #33 (vitest 3.2.6 → 4.1.10). Closed #37 (typescript 7 — blocked by `@typescript-eslint` peer range), #26 (eslint 10 — blocked by `eslint-plugin-react` incompatibility), and #22 (node 26-alpine — non-LTS, conflicting).
- **Disabled theme font preloading (perf)** — All 9 Google Fonts (21 woff2 files, 483KB) were preloaded on every page via `next/font`'s default `preload: true`, even though the public page only uses ONE font (the active theme's `fontFamily`). This was 62% of total page transfer. With `preload: false`, the `@font-face` rules remain in the CSS (so the admin theme picker still works), but the browser only downloads a font when an element actually renders with that font-family. Net effect on the public page: ~3 woff2 requests (~20KB) instead of 21 (483KB) — ~460KB saved per page view (~60% transfer reduction). No behavior change, no schema change. Admin theme picker: fonts swap in on-demand (~100ms FOUT when switching themes, no layout shift).

## [1.1.3] - 2026-07-16

### Fixed

- **Fresh Docker deploy crash — migration 0005 fails (crash on startup)** — Migrations 0005 and 0006 were hand-written (not generated by `drizzle-kit`) and missing the `--> statement-breakpoint` markers that Drizzle's migrator uses to split statements. `better-sqlite3` only accepts one statement per `prepare()` call, so the multi-statement files threw `"You can only execute one statement at a time"`, crashing the server before it could serve a single request. Every new deployment was affected. Added the missing breakpoints. Fixes #38.
- **Preset themes ignored numeric `fontScale` values** — Presets like Editorial Paper (`"110"`), Retro Sunset (`"120"`), and others stored `fontScale` as a numeric percentage string, but `resolveFontSize()` only handled `"sm"`, `"md"`, `"lg"`. Numeric values silently fell through to the default `15px`, losing the intended font sizing. The resolver now treats numeric strings as percentages (100 = 15px, 110 = 16.5px, etc.).
- **`"Pastel Soft"` preset rendered with wrong shadow** — The theme action enum and the preset both use `shadowStrength: "soft"`, but `resolveShadow()` had no case for it — it fell through to the medium shadow. Added the missing `"soft"` case.
- **`resolveSpacing()` density values mismatched the enum** — The density enum allows `"compact"`, `"normal"`, `"relaxed"`, but the resolver checked for `"compact"`, `"spacious"`, `"comfortable"`. The `"relaxed"` value (more spacing) was dead — it fell to the default alongside `"normal"`. Fixed: `"relaxed"` now correctly returns `16px` (was `12px`), `"compact"` stays `8px`, `"normal"` stays `12px`.
- **Theme name conflicts on duplicate and import** — Duplicating a theme or importing a theme file did not check whether a theme with the same name already existed, creating silent duplicates (e.g. 5 themes all named "Aurora copy"). Both operations now reject names that are already in use with a clear error.

### Security

- **OG image and sitemap routes ignored `BASE_URL` env var** — The public page and QR route both gained `BASE_URL` support in v1.1.2 to prevent host-header injection behind reverse proxies. Two routes were missed: the OpenGraph image generator (`/[slug]/opengraph-image`) and `sitemap.xml`. Both fully trusted `x-forwarded-host`/`x-forwarded-proto`, allowing an attacker to make the instance generate OG images or sitemap URLs pointing at an attacker-controlled domain. Both now check `BASE_URL` first.
- **Password complexity requirements (setup + change password)** — Password creation only enforced `min(8)` characters with no complexity checks. A password like `aaaaaaaa` was accepted. Both setup and change-password now require at least one lowercase letter, one uppercase letter, and one number. Closes #7.
- **Open-redirect hardening on `/go/:id`** — The JS-free click tracking redirect (`/go/:id`) did `NextResponse.redirect(link.url)` without a runtime protocol check. The create/update validators already block non-http schemes, but a stale or tampered DB row could bypass that. The route now validates the URL protocol at redirect time — only `http:` and `https:` are allowed.

### Changed

- **Theme export schema density default** — The `exportableThemeSchema` in backup/restore defaulted `density` to `"comfortable"` (the old invalid value that v1.1.2 migration 0006 fixed). Importing a theme file with a missing density field would create a theme with an invalid value. Default is now `"normal"`, matching the schema and Zod enum.

## [1.1.2] - 2026-07-11

### Fixed

- **Themes not seeding on fresh deploy (only Aurora appears)** — `getActiveTheme()` had an inline fallback that seeded a single Aurora theme when the database was empty. Because the public page calls `getActiveTheme()` before the admin theme page is ever visited, this single Aurora prevented `seedThemesIfEmpty()` from running (it saw count > 0 and bailed). The other 8 presets never appeared. Fixed: `getActiveTheme()` now delegates to `seedThemesIfEmpty()`, making it the single source of truth. Migration 0006 also cleans up orphan fallback themes on existing broken deployments. Fixes #35.
- **Theme changes silently not saved (Zod validation failure)** — The `density` column defaulted to `"comfortable"` in the schema, but the Zod validator only accepts `"compact"`, `"normal"`, `"relaxed"`. Themes seeded by the fallback path inherited this bad value. When the user saved, the Select submitted `"comfortable"`, Zod's `safeParse` rejected the entire payload, and the error was silently swallowed by the client. Fixed: schema default changed to `"normal"`, migration 0006 repairs existing data, and the save handler now surfaces errors instead of hiding them. Fixes #35.
- **Floating promise in subscriber clear** — `clearAllSubscribers()` called the async `clearSubscribers()` without `await`, returning success before the DB delete completed and silently swallowing errors. The delete is now awaited.
- **CSV export link lint error** — The subscriber export `<a>` tag was flagged by `@next/next/no-html-link-for-pages`. Added the `download` attribute (semantically correct for file downloads — the linter recognizes `download` as an explicit non-navigation marker).
- **Unused eslint-disable in OG image route** — Removed a stale `// eslint-disable-next-line @next/next/no-img-element` directive that was no longer needed (the rule doesn't trigger inside `ImageResponse`).
- **Missing lint step in CI** — The CI pipeline ran `tsc`, tests, and build but never `npm run lint`, allowing lint errors to slip into `main`. Lint now runs on every PR.

### Security

- **Forgeable admin sessions when `SECRET_KEY` unset (HIGH)** — In production, `getSecret()` silently fell back to `DEFAULT_SECRET`, a constant in the public source code. Anyone who read the repo could forge a valid admin session cookie and bypass authentication entirely. Production now throws on first use instead of degrading to a known secret. Dev mode is unaffected.
- **XFF-spoofable login brute-force protection (HIGH)** — The per-IP login rate limit (`5/min`) could be bypassed by rotating the `X-Forwarded-For` header on bare-IP deploys (the recommended Docker path). Added a global login throttle (`15/min` regardless of IP) that closes this vector for LinkBreeze's single-admin model.
- **Subscriber table-flooding DoS (HIGH)** — The public `subscribe()` endpoint had no rate limit, and `subscribers.email` had no unique constraint — the code's duplicate-catch never fired. Added a per-IP rate limit (`10/min`) and a `UNIQUE INDEX` on `email` (migration 0005). Existing duplicates are deduplicated on migrate.
- **Stored XSS via backup restore (MEDIUM)** — `restoreBackup()` validated row shapes but not link URL schemes. A shared backup file could carry `javascript:` URLs that render as clickable links on the public page, executing script in every visitor's browser. Link URLs in backups are now re-validated through `isAllowedLinkUrl()` and offending rows are dropped.
- **Host-header injection → QR phishing / OG spoofing (MEDIUM)** — Both `getOrigin()` functions (QR API + public page metadata) fully trusted `X-Forwarded-Host`/`X-Forwarded-Proto`. An attacker could make the instance generate a QR code pointing to `evil.com`, or emit `og:url`/canonical/JSON-LD pointing at an attacker domain. Added an optional `BASE_URL` env var — when set, forwarded host headers are ignored entirely.

### Changed

- **Dependency updates** — Merged 3 safe Dependabot PRs: recharts 3.9.1→3.9.2 + shadcn/ui 4.12→4.13 (minor), `@types/bcryptjs` 2.4.6→3.0.0 (dev types), `@types/node` 20.19.43→26.1.0 (dev types).
- **`next.config.ts` optimizations** — Disabled `poweredByHeader` (no longer leaks `X-Powered-By: Next.js`). Enabled `experimental.optimizePackageImports` for `lucide-react`, `recharts`, and `@dnd-kit/*` to tree-shake barrel exports and reduce client bundle size.
- **CSS-based link card hover** — Replaced inline `onmouseover`/`onmouseout` JS handlers on public-page link cards with CSS `:hover` rules using class + data attributes. This produces cleaner HTML output (2 fewer inline JS attributes per card) and enables proper `prefers-reduced-motion` gating.

### Added

- **Unique visitor count in dashboard** — The `visitorHash` was collected on every pageview since v1.0.0 but the dashboard only displayed total views (`COUNT(*)`). The Views card now shows the unique visitor count alongside total views, computed via `COUNT(DISTINCT visitorHash)`.
- **JS-free click tracking via `/go/:id` redirect** — Click tracking previously relied entirely on client-side `navigator.sendBeacon`, which fails for JS-disabled browsers, crawlers, and in-app browsers that block it. Public-page http(s) links now use `/go/:id` as their href — the server records the click (same visitor-hash logic as `/api/track`) then 302-redirects to the real URL. Non-http links (mailto, tel, etc.) still use the sendBeacon fallback. Closes #19.
- **`vCard` and `File` link types in the admin UI** — The schema and URL validator supported 8 link types, but the admin dropdown only exposed 6 (`vcard` and `file` were missing). Both are now selectable when creating or editing a link.
- **`npm run seed` script** — The demo seed script (`src/scripts/seed-demo.ts`) existed but had no `package.json` entry. Added `"seed": "tsx src/scripts/seed-demo.ts"` so developers can populate a fresh database with one command. Closes #8.
- **Skip-to-content link on public pages** — Keyboard and screen-reader users previously had to tab through the entire header before reaching link content. A visually-hidden "Skip to content" link now appears on focus, jumping directly to the main content area.
- **`prefers-reduced-motion` support for link card hover** — Hover effects on public-page link cards (lift, scale, glow transforms) were applied via inline JS and ignored the user's OS-level reduced-motion preference. Hover transforms are now disabled for users who request reduced motion, matching the existing aurora-background behavior.

## [1.1.1] - 2026-07-07

### Fixed

- **Fresh-deploy crash (Next.js error 1654975601)** — On a fresh `docker compose` deploy, the SQLite database was created empty with no tables because migrations never ran. The first query threw `no such table: settings`, surfacing as a generic "server error" page with code 1654975601 on every reload. Migrations now run automatically on server startup via a Next.js instrumentation hook (`src/instrumentation.ts`). The setup wizard appears on first launch as documented. Fixes #34.
- **Healthcheck false-positive** — The `/api/health` endpoint returned 200 without touching the database, so a broken instance (missing tables, corrupt DB) still reported "healthy". The health route now probes the DB with `SELECT 1` and returns 503 on failure, so the Docker healthcheck reflects real readiness.

### Changed

- **Migration files explicitly bundled** — Added `outputFileTracingIncludes` to `next.config.ts` to guarantee Drizzle migration `.sql` files and `meta/_journal.json` are included in the standalone build output (previously worked by accident; now explicit).
- **`db:migrate` script** — Added `npm run db:migrate` (`drizzle-kit migrate`) to `package.json` for manual migration in dev/CI. Docker deployments auto-migrate on boot and don't need this.

## [1.1.0] - 2026-07-06

### Added

- **Full theme system rework** — Complete redesign of the theming engine with a CSS custom property (`--lb-*`) token system. Every visual property is now a token consumed by public page components — no hardcoded colors, radii, or shadows anywhere.
  - **9 preset themes** (was 5): Aurora (animated flagship), Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light
  - **8 background types** (was 4): solid, gradient, radial, mesh, aurora, animated gradient, image, pattern — with angle, overlay color, and overlay opacity controls
  - **6 link/card styles** (was 3): pill, rounded, sharp, glass, outline, neon
  - **10 curated Google Fonts** (was 1): Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit — loaded server-side via `next/font/google` (zero client JS, no layout shift)
  - **Full color palette**: accent, secondary, text, muted text, card background, card border — all accept hex or rgba
  - **Typography controls**: font scale (80-150%), weight (300-700), letter spacing (-2 to 5)
  - **Card controls**: button size (sm/md/lg), corner radius, border width, shadow strength (none/subtle/soft/medium/strong), hover effect (lift/scale/glow/none)
  - **Layout controls**: container width, alignment (left/center/right), density (compact/normal/relaxed)
  - **Effects**: glow toggle with custom color, glass blur, noise texture, reveal animation
  - **Theme duplication**: clone any theme (preset or custom) as a new editable copy — presets are protected from deletion
  - **Theme deletion**: custom (non-preset) themes can be deleted from the gallery
- **External analytics injection** — Paste a Plausible, Umami, Matomo, or Google Analytics `<script>` snippet into Settings; it's injected onto your public page. Self-hosters no longer need to choose between LinkBreeze's built-in analytics and their existing stack.
- **Custom CSS injection** — Raw CSS textarea in Settings, injected as a `<style>` tag on the public page. Power users can fine-tune anything the theme customizer can't reach.
- **20 new social icons** — Threads, Bluesky, Mastodon, Reddit, Facebook, Pinterest, Snapchat, Patreon, Substack, Gumroad, Behance, Dribbble, SoundCloud, Bandcamp, Vimeo, Signal, PayPal, Buy Me a Coffee, Ko-fi, Medium. Total platform count: 32 (was 12).
- **Link thumbnails** — Optional image URL per link. Renders as a card with the image on top, text below — like a Discord/Slack link preview.
- **Embed widgets** — New link type `embed`. Paste a YouTube, Spotify, SoundCloud, Vimeo, or Bandcamp URL and it renders as an inline iframe on your public page instead of a link.
- **Email capture** — Toggle in Settings adds an email signup form to the public page. Subscribers stored in SQLite, exportable to CSV from Settings. Free alternative to Linktree's $9/mo email feature.
- **Theme import/export** — Export any theme as JSON from the Theme page, import on another instance. Share presets without manual recreation. API endpoints at `/api/themes/export` and `/api/themes/import`.
- **Link scheduling UI** — The link scheduler existed in the database and query layer since v1.0.0 but had no admin UI. Added a Schedule toggle with datetime pickers (Show from / Hide after) in the link dialog, plus a "Scheduled" badge with clock icon on the links list.
- **DEV_ORIGINS env var** — For dev servers accessed via Tailscale or LAN IPs. Set `DEV_ORIGINS` in `.env` to allow Server Actions from external origins (see `.env.example`).

### Fixed

- **Atomic click tracking** — `recordClick()` now wraps the analytics insert and the `clicksCount` increment in a single `db.transaction()`. Previously these were two separate statements that could drift out of sync if the second failed, leaving the denormalized count permanently wrong.
- **JSON-LD XSS hardening** — The structured data `<script>` tag now escapes `<` characters (`\u003c`) in the `JSON.stringify` output, preventing profile text fields (displayName, bio) from breaking out of the script context.
- **Embed widget rendering** — Spotify embeds now use a fixed 152px height (matching Spotify's native player) instead of a bloated 16:9 aspect ratio container that left empty space. YouTube embeds use `youtube-nocookie.com` with `rel=0` and `modestbranding=1` for a cleaner, privacy-respecting player. Redundant title captions removed for YouTube/Spotify (they show their own title). Fixed Spotify double `/embed/` path bug that caused 404s.
- **Link thumbnail layout** — Cards with thumbnail images now use block layout (image on top, content row below) instead of `flex-wrap`, which was shrinking the image and crushing the title text between the image and the card's right border.

### Changed

- **Schema expanded** — Themes table rebuilt with ~25 new columns. Migration `0004_theme-rework.sql` handles the upgrade safely (copies existing data, new columns get sensible defaults). Old themes continue to work.
- **Token resolver** — New `src/lib/theme-tokens.ts` (466 lines) provides `resolveThemeTokens()` → CSS vars + keyframes, `buildThemeStyleBlock()`, `resolveBackground()` (handles all 8 types), `resolveFont()`, and animated background detection.
- **Public components refactored** — `build-link-card.ts`, `LinkCard.tsx`, `ProfileHeader.tsx`, `SocialIcons.tsx`, `EmailCapture.tsx`, and `page.tsx` now consume `var(--lb-*)` tokens instead of hardcoded values.
- **Customizer UI overhauled** — `theme-manager.tsx` rebuilt with 6 organized sections (Background, Colors, Typography, Card Style, Layout, Effects). Includes color pickers, font radio picker with previews, sliders, toggles, and selects for all enum fields.
- **Server actions expanded** — `customizeActiveTheme` now accepts all new fields with Zod validation. New `duplicateActiveTheme` and `deleteCustomTheme` actions added.
- **Export/import updated** — Theme JSON now carries all new fields. Backward compatible with old exports.
- **Seed demo** — Now seeds the Aurora preset instead of the old 5-theme set.
- **Removed dead `metadata` column** — The `links.metadata` column (default `"{}"`) was defined in the schema but never read or written anywhere in the codebase. Removed from the schema, backup Zod validation, and a new migration (`0001_remove_link_metadata.sql`) drops it from existing databases.
- **allowedDevOrigins via env** — `next.config.ts` now reads `DEV_ORIGINS` from the environment instead of hardcoding IPs. Safe to commit — no private IPs in the repo.
- **README features + comparison** — Features list expanded from 8 to 14 items. Comparison table expanded from 12 to 17 rows, now includes External Analytics, Email Capture, Embed Widgets, Link Thumbnails, Custom CSS, and Themes Import/Export.
- **CONTRIBUTING.md** — Updated theme submission instructions to reference the new dedicated theme export feature and full token-based theme properties table.
- **Migrations** — Four new migrations: `0001_remove_link_metadata`, `0002_add_image_url_to_links`, `0003_add_subscribers_table`, `0004_theme-rework`. All run automatically on next startup.

### Dependencies

- Bumped `actions/checkout` from v4 to v7 (#21)
- Bumped `actions/setup-node` from v4 to v6 (#20)

## [1.0.2] - 2026-07-04

### Security

- **SVG upload XSS eliminated** — Removed `.svg` from the upload allowlist entirely. Added `Content-Security-Policy: default-src 'none'` and `X-Content-Type-Options: nosniff` headers to the uploads serving route as defense-in-depth. Closes #15.
- **Login rate limiting** — The login form is now rate-limited to 5 attempts/min per IP, preventing brute-force password attacks. Closes #1.
- **Production secret key warning** — When `SECRET_KEY` is unset in production, both `session-token.ts` and `visitor.ts` now log a loud console warning. The `/api/health` endpoint exposes `secretKeySet: boolean` so monitoring tools can detect misconfiguration. Closes #9.
- **Backup row validation** — `restoreBackup()` now validates every row (profiles, links, settings, themes) with Zod schemas before the database transaction. Malformed backup files are rejected instead of corrupting the DB.
- **Analytics foreign key** — `analytics_clicks.link_id` now has a foreign key reference to `links.id` with `ON DELETE CASCADE`. `deleteLink()` also explicitly cleans up orphaned analytics rows for databases created before this constraint existed.

### Added

- **Comprehensive test suite** — 134 tests across 16 files covering pure functions, server actions, and security validation. Includes tests for: rate limiting, visitor hashing, device detection, geo/country lookup, QR code generation, session tokens, social icon detection/normalization, link URL scheme validation, demo mode guards, upload content types, version reading, theme backgrounds, link card rendering, auth (login + setup), settings updates, link CRUD, and backup validation. (Closes #6, #17)

### Fixed

- **Login sidebar bug** — When already logged in, visiting `/login` showed the login form inside the admin sidebar layout. Now `/login` is a server component that redirects authenticated users to `/dashboard`. The page split into `page.tsx` (server, session check) + `login-form.tsx` (client, interactive form).
- **Health endpoint version** — `/api/health` now reads the version dynamically from `package.json` instead of returning a hardcoded `1.0.0`.
- **Backup version constant** — `exportBackup()` now uses `SUPPORTED_BACKUP_VERSION` instead of a hardcoded `1` literal.

### Changed

- **Atomic transactions** — `reorderLinks()`, `clearAnalytics()`, and `setActiveTheme()` now wrap their multi-statement operations in `db.transaction()`. Crashes mid-operation no longer leave the database in an inconsistent state.
- **Proactive rate-limit cleanup** — The rate-limit bucket map now sweeps expired entries every 30 seconds (when map exceeds 100 entries) instead of only on overflow at 10,000 keys. Prevents slow memory growth under sustained traffic.
- **Shared analytics-range module** — Extracted duplicated `sinceExpr`/`parseRange` logic from `queries/index.ts` and `api/analytics/export/route.ts` into `src/lib/analytics-range.ts`. Single source of truth for range types and SQL window expressions.
- **Code cleanup** — Moved `updateUserPassword` from server actions to queries layer. Removed unused `inArray` import and dead `void inArray` statement. Documented `getActiveProfile` as an intentional extension point.
- **Dependency overrides** — Added npm overrides for `postcss >= 8.5.10` and `esbuild >= 0.25.0`. `npm audit` now reports 0 vulnerabilities (was 6 moderate).
- **Proxy documentation** — Documented the defense-in-depth session validation split: middleware checks signature + expiry (fast first gate), `getSession()` checks password version (authoritative second gate).
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
- **Public page**: No client-side JS bundles (no React runtime) — pure Server Components. http/https links use a JS-free `/go/:id` redirect for click tracking; mailto/tel links use a tiny inline `onclick` sendBeacon beacon.
- **Performance**: <300ms FCP target, ISR with 60s revalidation
