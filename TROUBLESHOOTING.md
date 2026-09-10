# Troubleshooting

Common issues and how to fix them. If your problem isn't listed here,
[open an issue](https://github.com/Manak-hash/LinkBreeze/issues).

---

## Docker Desktop not running (Windows)

**Symptom:** `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

Docker Desktop hasn't started yet. Open it from the Start menu, wait for the
whale icon in the system tray to turn green (30–60 seconds on first boot),
then retry your command.

If the whale never turns green: open Docker Desktop → Settings → ensure the
WSL2 backend is enabled.

---

## PowerShell command syntax errors

**Symptom:** `Missing expression after unary operator '--'`

PowerShell does not support `\` for line continuation (that's bash syntax).
Either run the `docker run` command as a single line (recommended):

```powershell
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

Or use backticks `` ` `` instead of backslashes for multi-line:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

---

## Forgot admin password or username

LinkBreeze v1 is single-user and self-hosted — there is no self-service
password reset (no email server, no SMTP). Pick one of these methods.

First, find your container name (it isn't always `linkbreeze` — compose
projects and platforms like TrueNAS name it differently):

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -i linkbreeze
```

If you run it via docker compose, `docker compose ps` from the compose
folder works too. Replace `<container>` in the commands below with that name.

### Option A — Reset the password hash (keeps all data)

```bash
# Replace "newpassword" with your desired password
docker exec -it <container> node -e "
  const Database = require('better-sqlite3');
  const bcrypt = require('bcryptjs');
  const db = new Database('/app/data/linkbreeze.db');
  const hash = bcrypt.hashSync('newpassword', 12);
  db.prepare('UPDATE users SET password_hash = ?').run(hash);
  console.log('Password updated successfully');
"
```

If you also forgot the username, list it first:

```bash
docker exec -it <container> node -e "
  const db = new (require('better-sqlite3'))('/app/data/linkbreeze.db');
  console.log(db.prepare('SELECT username FROM users').all());
"
```

### Option B — Delete the volume and re-setup (loses all data)

```bash
docker stop <container> && docker rm <container>
docker volume rm linkbreeze-data
# Re-run the docker run command — the setup wizard will appear
```

### Option C — Running without Docker

```bash
sqlite3 data/linkbreeze.db "DELETE FROM users;"
npm run dev   # Visit the app → setup wizard appears
```

---

## Port 3000 already in use

**Symptom:** `EADDRINUSE: address already in use 0.0.0.0:3000`

Either stop the other process or map to a different port:

```bash
docker run -d --name linkbreeze -p 8080:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

---

## Database is locked / corrupted

Stop the container, back up the database file, then restart:

```bash
docker stop linkbreeze
cp ./data/linkbreeze.db ./data/linkbreeze.db.bak
docker start linkbreeze
```

If it won't start after that, delete the database and re-run setup:

```bash
docker stop linkbreeze && docker rm linkbreeze
docker volume rm linkbreeze-data
# Re-run the docker run command
```

---

## Analytics not tracking

1. Check that the public page loads at `http://localhost:3000/your-slug`
2. Open browser DevTools → Network tab → look for a `POST /api/track` call
3. If it returns 429, you're being rate-limited (10 requests / 10 seconds per IP)
4. If retention is set to a low number, old data may have been pruned automatically

---

## Changes not showing on public page

The public page is cached. If you changed something in the admin panel and it
isn't reflected on the public page, hard-refresh: `Ctrl+Shift+R` (or
`Cmd+Shift+R` on Mac). In Docker, ensure the container was restarted after any
environment variable changes.

---

## Upgrading LinkBreeze

### Docker

```bash
docker compose pull && docker compose up -d
```

That's it. New versions pull automatically.

### What happens to my data on upgrade?

**Nothing destructive.** LinkBreeze uses Drizzle ORM migrations that run
**automatically on container startup**. When you pull a new image and restart:

1. The app checks for pending schema migrations
2. Applies them forward-only (no destructive operations without backup)
3. Your links, settings, analytics, and themes are preserved

You never need to run `drizzle-kit migrate` manually in Docker — it's handled
for you. If a migration ever fails, the old database is left untouched and the
container logs will show the error.

### Running without Docker

```bash
git pull
npm install
npx drizzle-kit migrate   # apply any new migrations
npm run build && npm start
```

---

## How slugs work

Your public page lives at `/<slug>`. The default slug is `u`.

- **Changing the slug**: Go to Settings → Page URL. The slug must be
  alphanumeric with hyphens/underscores, max 64 characters.
- **After changing**: The old slug immediately returns a 404. There are **no
  redirects** — update any links or QR codes pointing to the old URL.
- **Reserved words**: `/login`, `/setup`, `/dashboard`, `/links`, `/profile`,
  `/settings`, `/theme` are admin-reserved and cannot be used as slugs.
- **QR codes**: QR codes are generated for the current slug. If you change your
  slug, download a new QR code from the admin panel.
