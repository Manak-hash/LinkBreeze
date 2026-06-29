# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in LinkBreeze, please report it
responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **manak@omnirise.dev**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within 48 hours.

## Security Measures

LinkBreeze implements the following security practices:

- **Auth**: bcrypt password hashing (12 rounds), HMAC-signed session cookies
- **Sessions**: httpOnly, SameSite cookies, 7-day expiry
- **Input validation**: Zod schemas on every server action and API route
- **SQL injection prevention**: Drizzle ORM parameterized queries (no raw SQL)
- **CSP headers**: Content-Security-Policy on all routes
- **X-Frame-Options**: DENY (prevents clickjacking)
- **URL validation**: Rejects `javascript:`, `data:`, `blob:` schemes
- **File uploads**: Type whitelist, size limit (2MB), sanitized filenames
- **Docker**: Non-root user, read-only filesystem except data volume
- **Rate limiting**: Login attempts, API endpoints

## Disclosure Timeline

1. Report received → acknowledged within 48h
2. Fix developed → timeline depends on severity
3. Patch released → advisory published
4. Public disclosure → after patch is available

## Scope

This policy covers the LinkBreeze application code in this repository.
Third-party dependencies should be reported to their respective maintainers.
