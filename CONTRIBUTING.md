# Contributing to LinkBreeze

Thanks for your interest in contributing! This guide covers everything you need.

## 🚀 Quick Start (Development)

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
npm install
cp .env.example .env
npx drizzle-kit migrate
npm run dev
```

Visit `http://localhost:3000` — you'll see the setup wizard on first run.

## 📋 Prerequisites

- Node.js 22+
- npm 10+
- No external database needed (SQLite is embedded)

## 🧑‍💻 Development Workflow

1. **Fork** the repo and create your branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes.** Follow existing code patterns:
   - All database access goes through `src/server/queries/` — never call Drizzle directly from components
   - All inputs validated with Zod
   - Server Components for public-facing pages (zero client JS)
   - Client Components only for admin dashboard (marked with `"use client"`)

3. **Test your changes:**
   ```bash
   npx tsc --noEmit --skipLibCheck  # Type check
   npm run test                      # Unit tests (Vitest)
   npm run build                     # Full build
   ```

4. **Commit** using conventional commits:
   ```bash
   git commit -m "feat: add new theme preset"
   git commit -m "fix: link reorder not persisting"
   git commit -m "docs: update README deployment section"
   ```

5. **Open a Pull Request** — fill out the PR template.

## 🎨 Contributing a Theme

Themes in LinkBreeze are stored in the database and managed through the admin
panel's theme customizer. There is no JSON file system — themes are live config.

### How to submit a theme

1. **Run LinkBreeze locally** (see Quick Start above)
2. **Open the theme customizer** at `http://localhost:3000/theme`
3. **Design your theme** — set colors, fonts, backgrounds, animations, link styles
4. **Take a screenshot** of the public page with your theme applied (mobile view preferred)
5. **Export the theme** — use the theme export button on the Theme page
   (`/theme` → Export), or use the backup export feature (`/settings` → Export)
   and extract the theme object
6. **Open a [Theme Submission issue](https://github.com/Manak-hash/LinkBreeze/issues/new?template=theme_submission.md)** with the values and screenshot

### Theme Properties

| Property | Type | Options |
|----------|------|---------|
| `name` | string | Display name |
| `backgroundType` | string | `solid`, `gradient`, `pattern` |
| `backgroundValue` | string | Color hex, gradient `#color1,#color2`, or pattern name |
| `fontFamily` | string | `Inter`, `Geist`, `Poppins`, `Space Grotesk` |
| `primaryColor` | string | Hex color for accents |
| `textColor` | string | Hex color for text |
| `linkStyle` | string | `rounded`, `sharp`, `glass` |
| `animationType` | string | `lift`, `scale`, `none` |

## 🐛 Reporting Bugs

Use the [Bug Report template](https://github.com/Manak-hash/LinkBreeze/issues/new?template=bug_report.md). Include:
- LinkBreeze version
- Deployment method (Docker, manual, Vercel)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Requesting Features

Use the [Feature Request template](https://github.com/Manak-hash/LinkBreeze/issues/new?template=feature_request.md).

## 📏 Coding Standards

- **TypeScript strict mode** — no `any` types
- **ESLint** — must pass without errors
- **Zod validation** on every input boundary
- **Conventional commits** — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- **No direct DB access** from components — always use the queries layer
- **Tests** — add or update tests for any logic change. Run `npm run test` before submitting.

## 🏗️ Architecture Notes

See [`docs/adr/`](docs/adr/) for detailed reasoning behind technology choices.
Key principle: **all database access is abstracted** through `src/server/queries/`
to enable future multi-tenant support without rewriting the app.

## ❓ Questions?

Open an [issue](https://github.com/Manak-hash/LinkBreeze/issues) with the
`question` label.
