<div align="center">

# 🌬️ LinkBreeze

### Self-hosted link-in-bio platform. The Linktree alternative you own.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](Dockerfile)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![OmniRise](https://img.shields.io/badge/OmniRise-omnirise.dev-06B6D4?style=for-the-badge)](https://omnirise.dev)

</div>

---

> **Stop paying $15/mo for Linktree.** LinkBreeze gives you links, analytics,
> QR codes, themes, and a real admin panel — free, forever, in one Docker command.

## ✨ Features

- **🔗 Link Management** — Add, reorder, and customize unlimited links with drag-and-drop
- **📊 Privacy-First Analytics** — Page views, click tracking, referrers — no cookies, no tracking
- **🎨 Themes** — 5 built-in presets + full customizer (colors, fonts, backgrounds, animations)
- **📱 Mobile-First** — Gorgeous on every screen. Loads in under 300ms. Zero client JavaScript.
- **🎯 QR Codes** — Auto-generated for your page. Download as SVG or PNG.
- **⏰ Link Scheduling** — Schedule links to appear/disappear automatically
- **🔒 Self-Hosted** — Your data, your server. No tracking. No ads. No subscription.
- **🐳 One-Command Deploy** — Docker compose and you're live

## 🚀 Quick Start

```bash
# Clone and run
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d
```

Visit `http://localhost:3000` and follow the setup wizard. Done in 30 seconds.

### Manual (without Docker)

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
npm install
cp .env.example .env
npx drizzle-kit migrate
npm run dev
```

## 📸 Screenshots

> **Screenshots coming before public launch.**
> Public page, admin dashboard, theme picker, analytics view.

## 🆚 Comparison

| Feature | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|---------|----------|-----------|------------|-------|----------------|
| **Price** | $15/mo | Free | Free | Free | **Free** |
| **Admin Panel** | ✅ | Slow | ❌ | ❌ | **✅ Fast** |
| **Database** | Theirs | MySQL | None | None | **SQLite** |
| **Analytics** | Paid | Basic | ❌ | ❌ | **✅ Full** |
| **QR Codes** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Link Scheduling** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Themes** | Paid | Limited | CSS only | Config | **✅ Full** |
| **Self-Hosted** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **Language** | Closed | PHP | HTML | Astro | **TypeScript** |
| **Docker Deploy** | N/A | Complex | Simple | Simple | **One command** |
| **Page Load** | ~2-3s | ~1-2s | Fast | Fast | **<300ms** |
| **License** | Closed | AGPL | MIT | GPL | **MIT** |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Database | SQLite via better-sqlite3 (WAL mode) |
| ORM | Drizzle ORM (type-safe, zero overhead) |
| Auth | Cookie-based HMAC sessions, bcrypt |
| UI | shadcn/ui + Tailwind CSS 4 |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| QR Codes | qrcode (server-side SVG/PNG) |
| Validation | Zod |
| Icons | Lucide + custom social SVGs |

## 📖 Documentation

- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Architecture Decisions](docs/adr/)
- [Configuration Reference](#configuration)

## ⚙️ Configuration

All configuration is via environment variables (`.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DATABASE_PATH` | `./data/linkbreeze.db` | SQLite database file path |
| `SECRET_KEY` | Auto-generated | HMAC signing key for sessions |

Runtime settings (page slug, title, SEO, theme) are managed via the admin dashboard
and stored in the database — no code changes needed.

## 🎨 Theme System

Themes are JSON files. Create your own and submit via PR:

```json
{
  "name": "My Custom Theme",
  "backgroundType": "gradient",
  "backgroundValue": "#0f0c29,#302b63",
  "fontFamily": "Inter",
  "primaryColor": "#6366f1",
  "textColor": "#e2e8f0",
  "linkStyle": "glass",
  "animationType": "lift"
}
```

See [`public/themes/`](public/themes/) for examples.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

The easiest way to contribute is by creating a theme — it's just a JSON file,
no coding required.

## 📜 License

MIT — do whatever you want. See [LICENSE](LICENSE).

## 🏢 About

Built by [Manak-hash](https://github.com/Manak-hash) · An [OmniRise](https://omnirise.dev) project.

LinkBreeze is open-source under MIT. A managed cloud version is available at
[$5/mo](https://omnirise.dev) for those who prefer not to self-host.
