<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Banner" width="100%" />

---

[English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · **Deutsch** · [中文](README.zh.md) · [العربية](README.ar.md)

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

> [!NOTE]
> Die [englische Version](README.md) ist maßgeblich. Diese Übersetzung kann dem
> Original hinterherhinken.

---

> **Schluss mit 15 $/Monat für Linktree.** LinkBreeze gibt dir Links, Statistiken,
> QR-Codes, Themes und ein echtes Admin-Panel — kostenlos, für immer, in einem einzigen Docker-Befehl.

**[🔗 Live-Demo](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — sieh die öffentliche Seite in Aktion.

**[🔐 Demo-Dashboard](https://linkbreeze-demo.omnirise.dev/dashboard)** — das Dashboard mit allen Funktionen (schreibgeschützt).

## ✨ Funktionen

- **🔗 Link-Verwaltung** — Füge unbegrenzt Links per Drag-and-Drop hinzu, sortiere sie und passe sie an
- **🌐 Mehrere Seiten** — Erstelle unbegrenzt viele Seiten, jede mit eigenem Slug, Theme, Links, Statistiken, SEO und QR-Code
- **🎨 Auto-Favicon-Links** — Links zeigen automatisch das Favicon der Zielwebsite — kein manuelles Hochladen von Icons nötig
- **📥 Migrations-Assistent** — Importiere bestehende Links und Social-Profile aus Linktree, Bento, Hopp.bio, LittleLink oder jedem HTML/JSON-Export
- **🖼️ Link-Miniaturansichten** — Füge Bilder zu deinen Links hinzu für visuelle Vorschaukarten
- **🎵 Eingebettete Widgets** — Bette YouTube, Spotify, SoundCloud, Vimeo oder Bandcamp direkt auf deiner Seite ein
- **⏰ Link-Planung** — Plane das automatische Erscheinen und Verschwinden von Links mit Datum- und Uhrzeit-Steuerung
- **📊 Privatsphäre-freundliche Statistiken** — Aufrufe, Klicks, Referrer, Gerätetyp. Von Grund auf ohne Cookies. Besucher-IPs werden mit einem täglich rotierenden Salt gehasht und niemals gespeichert. Daten, die älter als 90 Tage sind, werden standardmäßig automatisch gelöscht (Einstellungen → Daten; setze 0, um alles zu behalten).
- **📈 Externe Analysen** — Füge Plausible, Umami, Matomo oder Google Analytics mit einem einzigen Einfügen hinzu
- **🔔 Update-Benachrichtigungen** — Ein Banner im Dashboard benachrichtigt dich, wenn eine neue Version verfügbar ist (kein Phone-Home, kein Auto-Update)
- **🎨 Themes** — 11 eingebaute Presets (Aurora, Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light, 8-Bit Retro, Frutiger Aero) + vollständiger Anpassungs-Editor mit CSS-Token-System (Farben, 15 Schriftarten + Upload eigener Schriftarten, 8 Hintergrundtypen, 8 Kartenstile, Layout-Steuerung, Effekte) + Themes duplizieren/importieren/exportieren
- **✏️ Eigenes CSS** — Feintune deine Seite mit direkter CSS-Injektion
- **📧 E-Mail-Sammlung** — Sammle Abonnenten-E-Mails auf deiner öffentlichen Seite, Export als CSV
- **📱 Mobile zuerst** — Großartig auf jedem Bildschirm. Lädt in unter 300 ms. Null clientseitige JS-Bundles.
- **🎯 QR-Codes** — Automatisch für deine Seite generiert. Als SVG oder PNG herunterladen. Farben anpassen, deinen Avatar oder dein Favicon mittig einbetten, bis 1024 px für den Druck exportieren.
- **🔒 Selbst gehostet** — Deine Daten, dein Server. Keine Tracker von Drittanbietern. Keine Werbung. Kein Abo.
- **🐳 Deployment mit einem Befehl** — Docker compose und du bist online

## 🚀 Schnellstart

**Ein Befehl — null Konfiguration — in 30 Sekunden online:**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

Das Skript erkennt Docker oder Podman, zieht das Image, startet den Container und richtet optional einen systemd-Dienst für den Autostart beim Booten ein. Willst du Autostart? Führe es mit `sudo bash` aus und antworte bei der Frage mit **y**.

<details>
<summary>Du magst Piping zu bash nicht?</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

Öffne dann http://localhost:3000 — der Einrichtungsassistent dauert keine 30 Sekunden.

**Lieber eine andere Methode?** Klapp eine der folgenden auf:

<details>
<summary>🐳 &nbsp;Docker</summary>

Kein Node.js, kein npm, keine Config-Dateien nötig.

**Linux / macOS / Windows CMD:**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — nutze Backticks für Zeilenumbrüche:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **Datenbank-Migrationen laufen automatisch** beim Start des Containers — kein
> manuelles `drizzle-kit migrate` bei Docker-Deployments nötig.

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

Am besten, wenn du Ports anpassen, einen Reverse Proxy ergänzen oder Updates bequem verwalten willst.

**Option A — Fertiges Image ziehen:**

Erstelle eine `docker-compose.yml`:

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

**Option B — Aus dem Quellcode bauen:**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Upgraden jederzeit: `docker compose pull && docker compose up -d`

Logs: `docker compose logs -f linkbreeze`

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

Du betreibst [Coolify](https://coolify.io/) auf deinem VPS?

1. **+ New Resource** → **Docker Compose Empty**
2. Einfügen:

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

3. Lege eine Domain fest (z. B. `links.deinedomain.de`) für automatisches SSL
4. Klicke auf **Deploy** — Coolify kümmert sich automatisch um Let's Encrypt

</details>

<details>
<summary>📦 &nbsp;Synology NAS</summary>

Du betreibst einen [Synology DiskStation](https://www.synology.com/) mit Container Manager (DSM 7.2+)?

1. Öffne **Container Manager** → **Container** → **Create**
2. **Image:** `ghcr.io/manak-hash/linkbreeze:latest` (vorher über **Image** → **Add** ziehen, falls nicht gefunden)
3. Container-Einstellungen:
   - **Name:** `linkbreeze`
   - **Port:** Lokal `3000` → Container `3000`
   - **Volume:** Erstelle `/docker/linkbreeze/data` und mappe es auf `/app/data`
   - **Restart-Richtlinie:** `Unless stopped`
4. Klicke auf **Done** — live unter `http://<nas-ip>:3000`

> **Später updaten:** neuestes Image ziehen, Container stoppen und neu erstellen. Deine Daten bleiben im Volume erhalten.

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

Du nutzt [Podman](https://podman.io/) statt Docker (RHEL, Fedora, CentOS)? Ersetze `docker` durch `podman`:

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

Bei Berechtigungsfehlern auf dem Volume lege es zuerst an: `podman volume create linkbreeze-data`

Für die systemd-Integration mit rootless Podman: `podman generate systemd` nach dem Start des Containers.

Das Einzeilen-Installations-Skript oben in diesem Abschnitt erkennt Podman automatisch.

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

Du verwaltest deine Container mit [Portainer](https://www.portainer.io/)? Deploye als Stack.

1. Gehe zu deiner Umgebung → **Stacks** → **Add stack**
2. Nenne ihn `linkbreeze` und füge ein:

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

3. Klicke auf **Deploy the stack**

> **Update:** **Stacks** → `linkbreeze` → **Editor** → klicke auf **Pull and redeploy**.

</details>

<details>
<summary>🔨 &nbsp;Manuell (ohne Docker)</summary>

Benötigt Node.js 18+.

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# Passe .env an, um bei Bedarf SECRET_KEY und DATABASE_PATH zu setzen

npm run db:migrate
npm run dev
```

> Für Produktion: `npm run build && npm start`

</details>

## 🌐 Deine Seite öffentlich machen

LinkBreeze läuft auf deinem Server. Nach dem Deployment ist deine Seite für alle
unter `https://deine-domain.de/dein-slug` erreichbar. So kommst du online:

### Schnellstart: Domain aufschalten

1. Lege den A-Record deiner Domain auf die IP deines Servers
2. Exponiere Port 3000 oder ergänze einen Reverse Proxy
3. Fertig — deine Seite ist live unter `https://deine-domain.de/dein-slug`

### Fortgeschrittene Deployment-Szenarien

Für Produktiv-Setups — Reverse Proxies mit automatischem TLS, Zero-Trust-Tunnel,
Kubernetes, geplante Backups — sieh dir das Verzeichnis **[`examples/`](examples/)** an.
Jedes Beispiel ist eine einzige, in sich geschlossene Datei mit einem Kopfkommentar,
der erklärt, wann du es einsetzt.

<details>
<summary>Kurzreferenz: welches Beispiel für welches Szenario?</summary>

| Was du willst | Nutze diese Datei |
|---------------|-------------------|
| Automatisches TLS ohne manuelle Konfiguration | `docker-compose.caddy.yml` oder `docker-compose.https-portal.yml` |
| Automatisches TLS mit Dashboard (Traefik) | `docker-compose.traefik.yml` |
| Exponieren ohne offene Ports (Zero-Trust) | `docker-compose.cloudflare-tunnel.yml` |
| Du nutzt schon Nginx + Certbot | `docker-compose.nginx.yml` |
| Geplante SQLite-Backups | `docker-compose.with-backup.yml` |
| Betrieb in einem Kubernetes-Cluster | `kubernetes.yaml` |

</details>

### Option 1: Reverse Proxy mit eigener Domain

Lege den A-Record deiner Domain auf die IP deines Servers und nutze dann einen
Reverse Proxy mit automatischem HTTPS:

<details>
<summary>Caddy (empfohlen — Auto-HTTPS)</summary>

```
links.example.com {
    reverse_proxy localhost:3000
}
```

Für ein vollständiges Docker-Compose-Setup mit Caddy siehe [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml).

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

Für ein vollständiges Docker-Compose-Setup mit Nginx siehe [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml).

</details>

### Option 2: Cloudflare Tunnel (ohne offene Ports)

Kein Domain-Kauf, kein Port-Forwarding nötig:

```bash
cloudflared tunnel --url http://localhost:3000
```

Für ein vollständiges Docker-Compose-Setup mit Cloudflare Tunnel siehe [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml).

## 📸 Screenshots

<details>
    <summary>Zum Aufklappen klicken</summary>
    <br/>

<table>
    <tr>
    <td>Öffentliche Seite</td>
    <td>Admin-Dashboard</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="Öffentliche Seite [Theme Aurora]" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="Admin-Dashboard" /></td>
    </tr>
    <tr>
    <td>Links</td>
    <td>Profil</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="Links-Seite" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="Profilseite" /></td>
    </tr>
    <tr>
    <td>Theme</td>
    <td>Live-Vorschau</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="Theme-Seite" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="Live-Vorschau-Panel" /></td>
    </tr>
    <tr>
    <td>Einstellungen [Allgemein]</td>
    <td>Einstellungen [Erscheinungsbild]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="Einstellungen [Tab Allgemein]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="Einstellungen [Tab Erscheinungsbild]" /></td>
    </tr>
    <tr>
    <td>Einstellungen [Sicherheit]</td>
    <td>Einstellungen [Daten]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="Einstellungen [Tab Sicherheit]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="Einstellungen [Tab Daten]" /></td>
    </tr>
</table>

</details>

## 🆚 Vergleich

| Funktion | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|----------|----------|-----------|------------|-------|----------------|
| **Preis** | 15 $/Monat | Kostenlos | Kostenlos | Kostenlos | **Kostenlos** |
| **Admin-Panel** | ✅ | Langsam | ❌ | ❌ | **✅ Schnell** |
| **Mehrere Seiten** | ✅ (kostenpflichtig) | ❌ | ❌ | ❌ | **✅** |
| **Auto-Favicon-Links** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Migrations-Assistent** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Datenbank** | Bei denen | MySQL | Keine | Keine | **SQLite** |
| **Eingebaute Statistiken** | Kostenpflichtig | Basis | ❌ | ❌ | **✅ Vollständig** |
| **Externe Analysen** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **E-Mail-Sammlung** | Kostenpflichtig | ❌ | ❌ | ❌ | **✅** |
| **Eingebettete Widgets** | Kostenpflichtig | ❌ | ❌ | ❌ | **✅** |
| **Link-Miniaturansichten** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **QR-Codes** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Link-Planung** | Kostenpflichtig | ❌ | ❌ | ❌ | **✅** |
| **Themes** | Kostenpflichtig | Begrenzt | Nur CSS | Konfig-Datei | **✅ Vollständiges Token-System + Import/Export** |
| **Eigenes CSS** | ❌ | ❌ | ✅ | ❌ | **✅** |
| **Selbst gehostet** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **Sprache** | Geschlossen | PHP | HTML | Astro | **TypeScript** |
| **Docker-Deployment** | N/A | Komplex | Einfach | Einfach | **Ein Befehl** |
| **Seitenladung** | ~2-3 s | ~1-2 s | Schnell | Schnell | **<300 ms** |
| **Lizenz** | Geschlossen | AGPL | MIT | GPL | **MIT** |

## 🛠️ Tech-Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Datenbank | SQLite via better-sqlite3 (WAL-Modus) |
| ORM | Drizzle ORM (typsicher, null Overhead) |
| Auth | Cookie-basierte HMAC-Sessions, bcrypt |
| UI | shadcn/ui + Tailwind CSS 4 |
| Drag & Drop | dnd-kit |
| Diagramme | Recharts |
| QR-Codes | qrcode (serverseitig SVG/PNG) |
| Validierung | Zod |
| Icons | Lucide + eigene Social-SVGs |

## 📖 Dokumentation

- [Beitragsleitfaden](CONTRIBUTING.md)
- [Sicherheitsrichtlinie](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Fehlerbehebung](TROUBLESHOOTING.md)
- [Architekturentscheidungen](docs/adr/)
- [Konfigurationsreferenz](#️-konfiguration)

## ⚙️ Konfiguration

Die gesamte Konfiguration läuft über Umgebungsvariablen (`.env`):

| Variable | Standard | Beschreibung |
|----------|----------|--------------|
| `PORT` | `3000` | Serverport |
| `DATABASE_PATH` | `./data/linkbreeze.db` | Pfad der SQLite-Datenbankdatei |
| `SECRET_KEY` | Automatisch generiert | HMAC-Signaturschlüssel für Sessions |
| `EXTRA_SCRIPT_SRC` | _(leer)_ | Durch Leerzeichen getrennte Analyse-Domains für die CSP (z. B. `plausible.io umami.is`) |

**Externe Analysen verwenden (Plausible, Umami, Matomo, Google Analytics):**

Die eingebauten Statistiken decken Aufrufe, Klicks, Referrer und Gerätetyp ab — ganz ohne Setup. Wenn du einen Drittanbieter ergänzen willst, füge dein `<script>`-Snippet in Einstellungen → Integration → Analyse-Script ein und trage dann die Domain des Anbieters in `EXTRA_SCRIPT_SRC` ein, damit die CSP das Laden erlaubt:

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

Baue nach dem Ändern dieser Variable neu (die CSP wird beim Build fixiert).

Laufzeiteinstellungen (Seiten-Slug, Titel, SEO, Theme) verwaltest du im
Admin-Dashboard — sie liegen in der Datenbank, keine Codeänderungen nötig.

## 🎨 Theme-System

11 Presets sind ab Werk dabei: **Aurora** (das animierte Flaggschiff), **Glassmorphism**,
**Neon Cyberpunk**, **Editorial Paper**, **Terminal Mono**, **Pastel Soft**,
**Brutalist**, **Retro Sunset**, **Minimal Light**, **8-Bit Retro** und
**Frutiger Aero** (der glänzende Wasser-und-Luft-Look der Mitte der 2000er —
Gel-Blasen-Buttons, Milchglas-Karten, ein Blasen-Video-Hintergrund mit
Aqua-Gradient-Fallback und die Schrift Nunito).

Die Theme-Engine nutzt ein Token-System auf Basis von CSS-Custom-Properties
(`--lb-*`) — jede Farbe, jeder Radius, jeder Schatten und jede Schrift ist ein
Token, das die Komponenten der öffentlichen Seite konsumieren. Der
Anpassungs-Editor gibt dir die volle Kontrolle über:

- **Hintergrund** — 8 Typen (Uni, Verlauf, radial, Mesh, Aurora, animierter Verlauf, Bild, Muster) mit Steuerung für Winkel, Overlay und Deckkraft
- **Farben** — Akzent, Sekundär, Text, gedämpfter Text, Kartenhintergrund, Kartenrand (Hex oder rgba)
- **Typografie** — 15 kuratierte Google-Fonts (Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit, Nunito, Montserrat, Caveat, Pacifico, Abril Fatface), Schriftskalierung, Strichstärke, Laufweite — plus deine eigenen: Lade beliebige woff2/woff hoch (max. 2 MB) im Tab Typografie und wähle sie wie einen mitgelieferten Font. Hochgeladene Fonts werden same-origin ausgeliefert, in Theme-Exporte eingebettet und in Backups mitgeführt. Löschst du einen, laufen Themes, die ihn nutzen, auf Inter zurück (mit einer Bestätigung, die die betroffenen Themes auflistet).
- **Kartenstil** — 7 Link-Stile (Pill, abgerundet, kantig, Glas, Outline, Neon, Pixel), Hover-Effekte, Button-Größe, Eckenradius, Rahmenstärke, Schattenstärke
- **Layout** — Containerbreite, Ausrichtung (links/mitte/rechts), Dichte (kompakt/normal/locker)
- **Effekte** — Glow mit eigener Farbe, Glas-Blur, Noise-Textur, Reveal-Animation
- **Duplizieren** — klone jedes Theme (Preset oder eigenes) als neue, bearbeitbare Kopie

Alle Änderungen greifen mit null clientseitigen JS-Bundles — die öffentliche
Seite liefert kein React-Runtime aus und rendert als reines serverseitiges HTML.
(mailto/tel/Social-Links nutzen ein winziges Inline-`onclick`-Beacon für
Best-Effort-Klicktracking; http/https-Links laufen über das JS-freie
`/go/:id`-Redirect.)

## 💬 Community

- **[Zeig dein LinkBreeze-Theme](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — Exportiere das JSON deines eigenen Themes und zeig deine Seite. Die besten werden in künftigen Releases vorgestellt.
- **[Wer nutzt LinkBreeze? Hinterlass deinen Link](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — Erzähl uns, was du gebaut hast, wofür deine Seite gedacht ist und was fehlt. Sei gnadenlos.

## 🤝 Mitmachen

Beiträge sind willkommen! Sieh dir [CONTRIBUTING.md](CONTRIBUTING.md) für die Richtlinien an.

## 📜 Lizenz

MIT — mach damit, was du willst. Siehe [LICENSE](LICENSE).

## 🏢 Über

Gebaut von [Manak-hash](https://github.com/Manak-hash) · Ein [OmniRise](https://omnirise.dev)-Projekt.
