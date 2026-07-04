# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in LinkBreeze, please report it
responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **manak@omnirise.dev**

Include:
- Description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- Potential impact (who's affected, what an attacker could do)
- Suggested fix (if any)

### Response timeline

- **Acknowledgement**: within 48 hours
- **Status update**: within 7 days (with severity assessment + fix plan)
- **Patch release**: within 30 days for high/critical, 90 days for moderate/low
- **Public disclosure**: after the patch is released, coordinated with reporter

### Safe harbor

We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations and service disruption
- Do not access or modify data that doesn't belong to them
- Report the vulnerability promptly and give us reasonable time to respond
- Do not publicly disclose the issue until a fix is available

## Security Measures

LinkBreeze implements the following security practices:

- **Auth**: bcrypt password hashing (12 rounds), HMAC-signed session cookies
- **Sessions**: httpOnly, SameSite cookies, 30-day expiry, **session invalidation on password change** (stolen cookies become invalid when you change your password)
- **Input validation**: Zod schemas on every server action and API route
- **SQL injection prevention**: Drizzle ORM parameterized queries (no raw SQL)
- **Security headers**: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy on all routes
- **X-Frame-Options**: SAMEORIGIN (prevents external clickjacking)
- **URL validation**: Rejects `javascript:`, `data:`, `blob:` schemes
- **File uploads**: Type whitelist (images only), size limit (2 MB), path-traversal-safe filename resolution
- **Docker**: Runs as non-root user (`node`), data volume is the only writable path
- **CSRF protection**: Next.js 16 Server Actions verify the `Origin` header
  against the `Host` header on every non-GET submission. Cross-site form posts
  are rejected automatically by the framework — no manual CSRF token needed.
- **Rate limiting**: Login endpoint (5 attempts/min per IP), analytics tracking endpoint (60 req/min per IP), QR generation endpoint (30 req/min per IP)
- **SVG uploads blocked**: SVG files are no longer accepted as uploads. The uploads serving route also sends `Content-Security-Policy: default-src 'none'` and `X-Content-Type-Options: nosniff` headers as defense-in-depth.
- **Privacy-first analytics**: No raw IP storage — visitor hashes use SHA-256 with a daily-rotating salt

## Known Limitations (v1.0.3)

The following are NOT yet implemented. If you need these, track the corresponding
issue or contribute:

- **Password recovery**: No self-service reset flow. If you lose your password,
  see the [Troubleshooting guide](TROUBLESHOOTING.md#forgot-admin-password)
  for three recovery methods (hash reset, full reset, or database deletion).
- **2FA**: Not yet available.

## Scope

This policy covers the LinkBreeze application code in this repository.
Third-party dependencies should be reported to their respective maintainers.

## Accessibility

LinkBreeze is built on shadcn/ui (Radix Primitives), which provides WAI-ARIA
compliant components out of the box:

- Keyboard navigation (Tab, Enter, Escape) works on all interactive elements
- Focus indicators are visible on all form fields, buttons, and dialogs
- Drag-and-drop links are keyboard-accessible via alternative controls
- Color themes meet WCAG AA contrast ratios
- Screen-reader-friendly markup (aria-labels, semantic HTML, role attributes)

The public link page is designed to be fully accessible — it's a simple list of
links that works without JavaScript enabled.

If you encounter an accessibility issue, please
[open a bug report](https://github.com/Manak-hash/LinkBreeze/issues/new?template=bug_report.md)
with the **Accessibility** label.
