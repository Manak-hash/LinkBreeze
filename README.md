<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Banner" width="100%" />

---

**English** · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [中文](README.zh.md) · [العربية](README.ar.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/users/Manak-hash/packages/container/package/linkbreeze)
[![Website](https://img.shields.io/badge/Website-linkbreeze-533fd6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://linkbreeze.omnirise.dev/)
[![OmniRise](https://img.shields.io/badge/OmniRise-omnirise-06B6D4?style=for-the-badge&logo=rocket&logoColor=white)](https://omnirise.dev)
[![YouTube](https://img.shields.io/badge/Watch-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=_Ipf-_1B4BY)

[![CI](https://img.shields.io/github/actions/workflow/status/Manak-hash/LinkBreeze/ci.yml?style=for-the-badge&logo=githubactions&label=CI&logoColor=white)](https://github.com/Manak-hash/LinkBreeze/actions/workflows/ci.yml)
[![Latest Release](https://img.shields.io/github/v/release/Manak-hash/LinkBreeze?style=for-the-badge&logo=github&color=blue)](https://github.com/Manak-hash/LinkBreeze/releases/latest)
[![Last Commit](https://img.shields.io/github/last-commit/Manak-hash/LinkBreeze?style=for-the-badge&logo=git&color=green)](https://github.com/Manak-hash/LinkBreeze/commits)

</div>

---

> **Stop paying $15/mo for Linktree.** LinkBreeze gives you links, analytics,
> QR codes, themes, and a real admin panel — free, forever, in one Docker command.

**[🔗 Live Demo](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — see the public page in action.

**[🔐 Demo Dashboard](https://linkbreeze-demo.omnirise.dev/dashboard)** — see the dashboard with all features (read-only).

## ✨ Features

- **🔗 Link Management** — Add, reorder, and customize unlimited links with drag-and-drop
- **🌐 Multi-Page Support** — Create unlimited pages, each with its own slug, theme, links, analytics, SEO, and QR code
- **🎨 Auto-Favicon Links** — Links automatically show the target site's favicon — no manual icon uploads needed
- **📥 Migration Wizard** — Import existing links and social profiles from Linktree, Bento, Hopp.bio, LittleLink, or any HTML/JSON export
- **🖼️ Link Thumbnails** — Add images to your links for visual preview cards
- **🎵 Embed Widgets** — Embed YouTube, Spotify, SoundCloud, Vimeo, or Bandcamp directly on your page
- **⏰ Link Scheduling** — Schedule links to appear/disappear automatically with date/time controls
- **📊 Privacy-Respecting Analytics** — Views, clicks, referrers, device type. Cookieless by design. Visitor IPs are hashed with a daily-rotating salt, never stored. Data older than 90 days is pruned automatically by default (Settings → Data; set 0 to keep everything).
- **📈 External Analytics** — Inject Plausible, Umami, Matomo, or Google Analytics with one paste
- **🔔 Update Notifications** — Dashboard banner notifies you when a new version is available (no phone-home, no auto-update)
- **🎨 Themes** — 11 built-in presets (Aurora, Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light, 8-Bit Retro, Frutiger Aero) + full customizer with CSS token system (colors, 15 fonts + custom font upload, 8 background types, 8 card styles, layout controls, effects) + theme duplicate/import/export
- **✏️ Custom CSS** — Fine-tune your page with raw CSS injection
- **📧 Email Capture** — Collect subscriber emails on your public page, export to CSV
- **📱 Mobile-First** — Gorgeous on every screen. Loads in under 300ms. Zero client-side JS bundles.
- **🎯 QR Codes** — Auto-generated for your page. Download as SVG or PNG. Customize colors, embed your avatar or favicon in the center, export up to 1024 px for print.
- **🔒 Self-Hosted** — Your data, your server. No third-party trackers. No ads. No subscription.
- **🐳 One-Command Deploy** — Docker compose and you're live

## 🚀 Quick Start

**One command — zero config — live in 30 seconds:**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

The script detects Docker or Podman, pulls the image, starts the container, and optionally sets up a systemd service for auto-start on boot. Want auto-start on boot? Run it with `sudo bash` instead and answer **y** when prompted.

<details>
<summary>Don't like piping to bash?</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

Then open http://localhost:3000 — the setup wizard takes under 30 seconds.

**Prefer a different method?** Expand one below:

<details>
<summary>🐳 &nbsp;Docker</summary>

No Node.js, no npm, no config files needed.

**Linux / macOS / Windows CMD:**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — use backticks for line breaks:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **Database migrations run automatically** on container startup — no manual
> `drizzle-kit migrate` needed for Docker deployments.

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

Best if you want to customize ports, add a reverse proxy, or manage updates easily.

**Option A — Pull the pre-built image:**

Create a `docker-compose.yml`:

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

```bash
docker compose up -d
```

**Option B — Build from source:**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Upgrade anytime: `docker compose pull && docker compose up -d`

Logs: `docker compose logs -f linkbreeze`

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

Running [Coolify](https://coolify.io/) on your VPS?

1. **+ New Resource** → **Docker Compose Empty**
2. Paste:

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

3. Set a domain (e.g., `links.yourdomain.com`) for automatic SSL
4. Click **Deploy** — Coolify handles Let's Encrypt automatically

</details>

<details>
<summary>📦 &nbsp;Synology NAS</summary>

Running [Synology DiskStation](https://www.synology.com/) with Container Manager (DSM 7.2+)?

1. Open **Container Manager** → **Container** → **Create**
2. **Image:** `ghcr.io/manak-hash/linkbreeze:latest` (pull it first via **Image** → **Add** if not found)
3. Container settings:
   - **Name:** `linkbreeze`
   - **Port:** Local `3000` → Container `3000`
   - **Volume:** Create `/docker/linkbreeze/data` and map to `/app/data`
   - **Restart policy:** `Unless stopped`
4. Click **Done** — live at `http://<nas-ip>:3000`

> **Update later:** pull the latest image, stop and recreate the container. Data persists in the volume.

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

Using [Podman](https://podman.io/) instead of Docker (RHEL, Fedora, CentOS)? Replace `docker` with `podman`:

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

If you get permission errors on the volume, create it first: `podman volume create linkbreeze-data`

For systemd integration with rootless Podman: `podman generate systemd` after starting the container.

The one-line install script at the top of this section detects Podman automatically.

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

Using [Portainer](https://www.portainer.io/) to manage containers? Deploy as a Stack.

1. Go to your environment → **Stacks** → **Add stack**
2. Name it `linkbreeze` and paste:

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

3. Click **Deploy the stack**

> **Update:** **Stacks** → `linkbreeze` → **Editor** → click **Pull and redeploy**.

</details>

<details>
<summary>🔨 &nbsp;Manual (without Docker)</summary>

Requires Node.js 18+.

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# Edit .env to set your SECRET_KEY and DATABASE_PATH if needed

npm run db:migrate
npm run dev
```

> For production: `npm run build && npm start`

</details>

## 🌐 Making Your Page Public

LinkBreeze runs on your server. Once deployed, your page is accessible to anyone
at `https://your-domain.com/your-slug`. Here's how to get it online:

### Quick start: Point your domain

1. Point your domain's A record to your server IP
2. Expose port 3000 or add a reverse proxy
3. Done — your page is live at `https://your-domain.com/your-slug`

### Advanced deployment scenarios

For production setups — reverse proxies with automatic TLS, zero-trust tunnels,
Kubernetes, scheduled backups — see the **[`examples/`](examples/)** directory.
Each example is a single, self-contained file with a header comment explaining
when to use it.

<details>
<summary>Quick reference: which example for which scenario?</summary>

| What you want | Use this file |
|---------------|---------------|
| Automatic TLS without manual config | `docker-compose.caddy.yml` or `docker-compose.https-portal.yml` |
| Automatic TLS with a dashboard (Traefik) | `docker-compose.traefik.yml` |
| Expose without opening ports (zero-trust) | `docker-compose.cloudflare-tunnel.yml` |
| You already use Nginx + Certbot | `docker-compose.nginx.yml` |
| Scheduled SQLite backups | `docker-compose.with-backup.yml` |
| Running on Kubernetes cluster | `kubernetes.yaml` |

</details>

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

For a complete Docker Compose setup with Caddy, see [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml).

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

For a complete Docker Compose setup with Nginx, see [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml).

</details>

### Option 2: Cloudflare Tunnel (no open ports)

No domain purchase or port forwarding needed:

```bash
cloudflared tunnel --url http://localhost:3000
```

For a complete Docker Compose setup with Cloudflare Tunnel, see [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml).

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
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="Public Page [Aurora Theme]" /></td>
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
    <td>Live Preview Pane</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="Theme Page" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="Live Preview Pane" /></td>
    </tr>
    <tr>
    <td>Settings [General]</td>
    <td>Settings [Appearance]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="Settings Page [General Tab]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="Settings Page [Appearance Tab]" /></td>
    <tr>
    <td>Settings [Security]</td>
    <td>Settings [Data]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="Settings Page [Security Tab]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="Settings Page [Data Tab]" /></td>
    </tr>
</table>

</details>

## 🆚 Comparison

| Feature | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|---------|----------|-----------|------------|-------|----------------|
| **Price** | $15/mo | Free | Free | Free | **Free** |
| **Admin Panel** | ✅ | Slow | ❌ | ❌ | **✅ Fast** |
| **Multi-Page** | ✅ (paid) | ❌ | ❌ | ❌ | **✅** |
| **Auto-Favicon Links** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Migration Wizard** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Database** | Theirs | MySQL | None | None | **SQLite** |
| **Built-in Analytics** | Paid | Basic | ❌ | ❌ | **✅ Full** |
| **External Analytics** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Email Capture** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Embed Widgets** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Link Thumbnails** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **QR Codes** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Link Scheduling** | Paid | ❌ | ❌ | ❌ | **✅** |
| **Themes** | Paid | Limited | CSS only | Config | **✅ Full Token System + Import/Export** |
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
| `EXTRA_SCRIPT_SRC` | _(empty)_ | Space-separated analytics domains for CSP (e.g. `plausible.io umami.is`) |

**Using external analytics (Plausible, Umami, Matomo, Google Analytics):**

The built-in analytics covers views, clicks, referrers, and device type with no setup needed. If you want to add a third-party analytics provider, paste your `<script>` snippet into Settings -> Integration -> Analytics script, then add the provider's domain to `EXTRA_SCRIPT_SRC` so CSP allows it to load:

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

Rebuild after changing this variable (CSP is baked into the build).

Runtime settings (page slug, title, SEO, theme) are managed via the admin dashboard
and stored in the database — no code changes needed.

## 🎨 Theme System

11 presets are included out of the box: **Aurora** (animated flagship), **Glassmorphism**, **Neon Cyberpunk**, **Editorial Paper**, **Terminal Mono**, **Pastel Soft**, **Brutalist**, **Retro Sunset**, **Minimal Light**, **8-Bit Retro**, and **Frutiger Aero** (glossy mid-2000s water-and-air look — gel bubble buttons, frosted glass cards, a bubbles video background with an aqua gradient fallback, and the Nunito font).

The theme engine uses a CSS custom property (`--lb-*`) token system — every color, radius, shadow, and font is a token consumed by the public page components. The customizer gives you full control over:

- **Background** — 8 types (solid, gradient, radial, mesh, aurora, animated gradient, image, pattern) with angle, overlay, and opacity controls
- **Colors** — accent, secondary, text, muted text, card background, card border (hex or rgba)
- **Typography** — 15 curated Google Fonts (Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit, Nunito, Montserrat, Caveat, Pacifico, Abril Fatface), font scale, weight, letter spacing — plus your own: upload any woff2/woff (max 2 MB) in the Typography tab and pick it like a bundled font. Uploaded fonts are served same-origin, embedded in theme export files, and carried through backups. Deleting one resets themes using it to Inter (with a confirmation listing the affected themes).
- **Card style** — 7 link styles (pill, rounded, sharp, glass, outline, neon, pixel), hover effects, button size, corner radius, border width, shadow strength
- **Layout** — container width, alignment (left/center/right), density (compact/normal/relaxed)
- **Effects** — glow with custom color, glass blur, noise texture, reveal animation
- **Duplicate** — clone any theme (preset or custom) as a new editable copy

All changes apply with zero client-side JS bundles — the public page ships no React runtime and renders as pure server-side HTML. (mailto/tel/social links use a tiny inline `onclick` beacon for best-effort click tracking; http/https links use the JS-free `/go/:id` redirect.)

## 💬 Community

- **[Share your LinkBreeze theme](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — Export your custom theme JSON and show off your page. The best ones get featured in future releases.
- **[Who's using LinkBreeze? Drop your link](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — Tell us what you built, what your page is for, and what's missing. Be brutal.

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License

MIT — do whatever you want. See [LICENSE](LICENSE).

## 🏢 About

Built by [Manak-hash](https://github.com/Manak-hash) · An [OmniRise](https://omnirise.dev) project.
