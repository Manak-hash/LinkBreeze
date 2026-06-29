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
   npm run build                     # Full build
   ```

4. **Commit** using conventional commits:
   ```bash
   git commit -m "feat: add new theme preset"
   git commit -m "fix: link reorder not persisting"
   git commit -m "docs: update README deployment section"
   ```

5. **Open a Pull Request** — fill out the PR template.

## 🎨 Contributing a Theme (No Coding Required!)

Themes are JSON files in `public/themes/`. To add one:

1. Copy an existing theme file as a template
2. Modify the values (colors, fonts, backgrounds)
3. Test locally by selecting it in the admin theme picker
4. Open a PR with your theme JSON

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

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:
- LinkBreeze version
- Deployment method (Docker, manual, Vercel)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Requesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

## 📏 Coding Standards

- **TypeScript strict mode** — no `any` types
- **ESLint** — must pass without errors
- **Zod validation** on every input boundary
- **Conventional commits** — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- **No direct DB access** from components — always use the queries layer

## 🏗️ Architecture Notes

See [`docs/adr/`](docs/adr/) for detailed reasoning behind technology choices.
Key principle: **all database access is abstracted** through `src/server/queries/`
to enable future multi-tenant support without rewriting the app.

## ❓ Questions?

Open a [GitHub Discussion](https://github.com/Manak-hash/LinkBreeze/discussions)
or an issue with the `question` label.
