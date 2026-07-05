<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac(-10MB).png" alt="Banner" width="100%" />

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/users/Manak-hash/packages/container/package/linkbreeze)
[![OmniRise](https://img.shields.io/badge/OmniRise-omnirise.dev-06B6D4?style=for-the-badge)](https://omnirise.dev)

[![CI](https://img.shields.io/github/actions/workflow/status/Manak-hash/LinkBreeze/ci.yml?style=for-the-badge&logo=githubactions&label=CI&logoColor=white)](https://github.com/Manak-hash/LinkBreeze/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/Manak-hash/LinkBreeze?style=for-the-badge&logo=github&color=blue)](https://github.com/Manak-hash/LinkBreeze/releases/latest)
[![Last Commit](https://img.shields.io/github/last-commit/Manak-hash/LinkBreeze?style=for-the-badge&logo=git&color=green)](https://github.com/Manak-hash/LinkBreeze/commits)

</div>

---

> **Stop paying $15/mo for Linktree.** LinkBreeze gives you links, analytics,
> QR codes, themes, and a real admin panel — free, forever, in one Docker command.

**[🔗 Live Demo](https://linkbreeze-demo.omnirise.dev/alex)** — see it in action (read-only).

## ✨ Features

- **🔗 Link Management** — Add, reorder, and customize unlimited links with drag-and-drop
- **🖼️ Link Thumbnails** — Add images to your links for visual preview cards
- **🎵 Embed Widgets** — Embed YouTube, Spotify, SoundCloud, Vimeo, or Bandcamp directly on your page
- **⏰ Link Scheduling** — Schedule links to appear/disappear automatically with date/time controls
- **📊 Privacy-First Analytics** — Page views, click tracking, referrers — no cookies, no tracking
- **📈 External Analytics** — Inject Plausible, Umami, Matomo, or Google Analytics with one paste
- **🎨 Themes** — 5 built-in presets + full customizer (colors, fonts, backgrounds, animations) + theme import/export
- **✏️ Custom CSS** — Fine-tune your page with raw CSS injection
- **📧 Email Capture** — Collect subscriber emails on your public page, export to CSV
- **📱 Mobile-First** — Gorgeous on every screen. Loads in under 300ms. Zero client JavaScript.
- **🎯 QR Codes** — Auto-generated for your page. Download as SVG or PNG.
- **🔒 Self-Hosted** — Your data, your server. No tracking. No ads. No subscription.
- **🐳 One-Command Deploy** — Docker compose and you're live

## 🚀 Quick Start

> Zero config. One command. Your Linktree alternative is live in 30 seconds.

### 🐳 Docker (Recommended)

The fastest path to production. No Node.js, no npm, no config files needed.

**Linux / macOS / Windows CMD** — run as a single line:

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — same command, use backticks for line breaks:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

Then open http://localhost:3000 — the setup wizard takes under 30 seconds.

> **First time?** Make sure Docker Desktop (Windows/Mac) or the Docker daemon
> (Linux) is running before you execute the command.

### 🧩 Docker Compose

Best if you want to customize ports, add a reverse proxy, or manage updates easily.

**Option A — Pull the pre-built image (fastest, no build step):**

Create a `docker-compose.yml` with:

```yaml
services:
  linkbreeze:
    image: ghcr.io/manak-hash/linkbreeze:latest
    ports:
      - "3000:3000"
    volumes:
      - linkbreeze-data:/app/data
    restart: unless-stopped

volumes:
  linkbreeze-data:
```

Then:

```bash
docker compose up -d
```

**Option B — Build from source (for development or customization):**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Check logs anytime with:

```bash
docker compose logs -f linkbreeze
```

Upgrade to the latest version:

```bash
docker compose pull && docker compose up -d
```

### 🔧 Manual (without Docker)

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

# Configure environment
cp .env.example .env
# Edit .env to set your SECRET_KEY and DATABASE_PATH if needed

# Run database migrations
npx drizzle-kit migrate

# Start development server
npm run dev
```

> For production, use npm run build && npm start instead of npm run dev.

## 🌐 Making Your Page Public

LinkBreeze runs on your server. Once deployed, your page is accessible to anyone
at `https://your-domain.com/your-slug`. Here's how to get it online:

### Option 1: Reverse Proxy with Your Domain

Point your domain's A record to your server IP, then use a reverse proxy with
automatic HTTPS:

<details>
<summary>Caddy (recommended — auto HTTPS)</summary>

```
links.example.com {
    reverse_proxy localhost:3000
}
```

</details>

<details>
<summary>nginx</summary>

```nginx
server {
    server_name links.example.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

</details>

### Option 2: Cloudflare Tunnel (no open ports)

No domain purchase or port forwarding needed:

```bash
cloudflared tunnel --url http://localhost:3000
```

## 📸 Screenshots

<details>
    <summary>Click to expand</summary>
    <br/>

<table>
    <tr>
    <td>Public Page</td>
    <td>Admin Dashboard</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page.jpeg" alt="Public Page" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="Admin Dashboard" /></td>
    </tr>
    <tr>
    <td>Links</td>
    <td>Profile</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="Links Page" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="Profile Page" /></td>
    </tr>
    <tr>
    <td>Theme</td>
    <td>Settings</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme-Picker.jpeg" alt="Theme Picker" /></td>
    <td><img src="public/screenshots/Settings.jpeg" alt="Settings Page" /></td>
    </tr>
</table>

</details>

## 🆚 Comparison

| Feature | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|---------|----------|-----------|------------|-------|----------------|
| **Price** | $15/mo | Free | Free | Free | **Free** |
| **Admin Panel** | ✅ | Slow | ❌ | ❌ | **✅ Fast** |
| **Database** | Theirs | MySQL | None | None | **SQLite** |
| **Built-in Analytics** | Paid | Basic | ❌ | ❌ | **✅ Full** |
| **External Analytics** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Email Capture** | $9/mo | ❌ | ❌ | ❌ | **✅** |
| **Embed Widgets** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Link Thumbnails** | Paid | ❌ | ❌ | ❌ | **✅** |
| **QR Codes** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Link Scheduling** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Themes** | Paid | Limited | CSS only | Config | **✅ Full + Import/Export** |
| **Custom CSS** | ❌ | ❌ | ✅ | ❌ | **✅** |
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
- [Changelog](CHANGELOG.md)
- [Troubleshooting](TROUBLESHOOTING.md)
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

5 themes are included out of the box (Midnight, Sunset, Ocean, Mono, Forest).
Customize any of them from the admin panel — colors, fonts, backgrounds, animations.
No code or config files needed.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License

MIT — do whatever you want. See [LICENSE](LICENSE).

## 🏢 About

Built by [Manak-hash](https://github.com/Manak-hash) · An [OmniRise](https://omnirise.dev) project.
