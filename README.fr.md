<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Bannière" width="100%" />

---

[English](README.md) · **Français**

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

> [!NOTE]
> La [version anglaise](README.md) fait référence. Cette traduction peut prendre
> du retard sur l'original.

---

> **Arrêtez de payer 15 $/mois pour Linktree.** LinkBreeze vous donne des liens,
> des statistiques, des QR codes, des thèmes et un vrai panneau d'administration —
> gratuit, pour toujours, en une seule commande Docker.

**[🔗 Démo en ligne](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — voyez la page publique en action.

**[🔐 Tableau de bord de démo](https://linkbreeze-demo.omnirise.dev/dashboard)** — le tableau de bord complet, toutes fonctionnalités (lecture seule).

## ✨ Fonctionnalités

- **🔗 Gestion des liens** — Ajoutez, réorganisez et personnalisez des liens illimités en glisser-déposer
- **🌐 Pages multiples** — Créez des pages illimitées, chacune avec son propre slug, thème, liens, statistiques, SEO et QR code
- **🎨 Favicons automatiques** — Les liens affichent automatiquement le favicon du site cible — aucun upload d'icône manuel
- **📥 Assistant de migration** — Importez vos liens et profils sociaux existants depuis Linktree, Bento, Hopp.bio, LittleLink ou n'importe quel export HTML/JSON
- **🖼️ Miniatures de liens** — Ajoutez des images à vos liens pour des cartes d'aperçu visuelles
- **🎵 Widgets intégrés** — Intégrez YouTube, Spotify, SoundCloud, Vimeo ou Bandcamp directement sur votre page
- **⏰ Programmation des liens** — Programmez l'apparition/disparition automatique des liens avec des contrôles de date et d'heure
- **📊 Statistiques respectueuses de la vie privée** — Vues, clics, référents, type d'appareil. Sans cookies par conception. Les IP des visiteurs sont hachées avec un sel rotatif quotidien, jamais stockées. Les données de plus de 90 jours sont purgées automatiquement par défaut (Paramètres → Données ; mettez 0 pour tout conserver).
- **📈 Statistiques externes** — Injectez Plausible, Umami, Matomo ou Google Analytics d'un simple copier-coller
- **🔔 Notifications de mise à jour** — Un bandeau du tableau de bord vous prévient quand une nouvelle version est disponible (pas de phone-home, pas de mise à jour automatique)
- **🎨 Thèmes** — 11 préréglages intégrés (Aurora, Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light, 8-Bit Retro, Frutiger Aero) + personnalisateur complet avec un système de tokens CSS (couleurs, 15 polices + upload de polices personnalisées, 8 types d'arrière-plan, 8 styles de cartes, contrôles de mise en page, effets) + duplication/import/export de thèmes
- **✏️ CSS personnalisé** — Ajustez votre page au pixel près avec une injection de CSS brut
- **📧 Collecte d'e-mails** — Recoltez les e-mails des abonnés sur votre page publique, exportez en CSV
- **📱 Mobile d'abord** — Superbe sur tous les écrans. Charge en moins de 300 ms. Zéro bundle JS côté client.
- **🎯 QR codes** — Générés automatiquement pour votre page. Téléchargez en SVG ou PNG. Personnalisez les couleurs, intégrez votre avatar ou favicon au centre, exportez jusqu'à 1024 px pour l'impression.
- **🔒 Auto-hébergé** — Vos données, votre serveur. Aucun traceur tiers. Aucune pub. Aucun abonnement.
- **🐳 Déploiement en une commande** — Docker compose et c'est en ligne

## 🚀 Démarrage rapide

**Une commande — zéro configuration — en ligne en 30 secondes :**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

Le script détecte Docker ou Podman, récupère l'image, démarre le conteneur et configure optionnellement un service systemd pour le démarrage automatique au boot. Vous voulez le démarrage automatique ? Lancez-le avec `sudo bash` et répondez **y** à l'invite.

<details>
<summary>Vous n'aimez pas piper vers bash ?</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

Ouvrez ensuite http://localhost:3000 — l'assistant de configuration prend moins de 30 secondes.

**Vous préférez une autre méthode ?** Dépliez l'une d'elles :

<details>
<summary>🐳 &nbsp;Docker</summary>

Pas besoin de Node.js, de npm, ni de fichiers de config.

**Linux / macOS / Windows CMD :**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — utilisez des backticks pour les sauts de ligne :

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **Les migrations de base de données s'exécutent automatiquement** au démarrage
> du conteneur — pas de `drizzle-kit migrate` manuel nécessaire pour les
> déploiements Docker.

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

Idéal si vous voulez personnaliser les ports, ajouter un reverse proxy ou gérer facilement les mises à jour.

**Option A — Récupérer l'image pré-construite :**

Créez un `docker-compose.yml` :

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

**Option B — Construire depuis les sources :**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Mise à niveau à tout moment : `docker compose pull && docker compose up -d`

Logs : `docker compose logs -f linkbreeze`

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

Vous utilisez [Coolify](https://coolify.io/) sur votre VPS ?

1. **+ New Resource** → **Docker Compose Empty**
2. Collez :

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

3. Définissez un domaine (ex. `links.votredomaine.com`) pour le SSL automatique
4. Cliquez sur **Deploy** — Coolify gère Let's Encrypt automatiquement

</details>

<details>
<summary>📦 &nbsp;Synology NAS</summary>

Vous utilisez un [Synology DiskStation](https://www.synology.com/) avec Container Manager (DSM 7.2+) ?

1. Ouvrez **Container Manager** → **Container** → **Create**
2. **Image :** `ghcr.io/manak-hash/linkbreeze:latest` (récupérez-la d'abord via **Image** → **Add** si elle est introuvable)
3. Réglages du conteneur :
   - **Nom :** `linkbreeze`
   - **Port :** local `3000` → conteneur `3000`
   - **Volume :** créez `/docker/linkbreeze/data` et mappez-le vers `/app/data`
   - **Politique de redémarrage :** `Unless stopped`
4. Cliquez sur **Done** — en ligne sur `http://<ip-du-nas>:3000`

> **Mise à jour :** récupérez la dernière image, arrêtez et recréez le conteneur. Les données persistent dans le volume.

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

Vous utilisez [Podman](https://podman.io/) au lieu de Docker (RHEL, Fedora, CentOS) ? Remplacez `docker` par `podman` :

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

En cas d'erreurs de permission sur le volume, créez-le d'abord : `podman volume create linkbreeze-data`

Pour l'intégration systemd avec Podman rootless : `podman generate systemd` après le démarrage du conteneur.

Le script d'installation en une ligne en haut de cette section détecte Podman automatiquement.

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

Vous utilisez [Portainer](https://www.portainer.io/) pour gérer vos conteneurs ? Déployez en tant que Stack.

1. Allez dans votre environnement → **Stacks** → **Add stack**
2. Nommez-le `linkbreeze` et collez :

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

3. Cliquez sur **Deploy the stack**

> **Mise à jour :** **Stacks** → `linkbreeze` → **Editor** → cliquez sur **Pull and redeploy**.

</details>

<details>
<summary>🔨 &nbsp;Manuel (sans Docker)</summary>

Nécessite Node.js 18+.

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# Modifiez .env pour définir votre SECRET_KEY et DATABASE_PATH si nécessaire

npm run db:migrate
npm run dev
```

> En production : `npm run build && npm start`

</details>

## 🌐 Mettre votre page en ligne

LinkBreeze tourne sur votre serveur. Une fois déployé, votre page est accessible
à tous à l'adresse `https://votre-domaine.com/votre-slug`. Voici comment la
mettre en ligne :

### Démarrage rapide : pointez votre domaine

1. Pointez l'enregistrement A de votre domaine vers l'IP de votre serveur
2. Exposez le port 3000 ou ajoutez un reverse proxy
3. C'est fini — votre page est en ligne sur `https://votre-domaine.com/votre-slug`

### Scénarios de déploiement avancés

Pour les configurations de production — reverse proxies avec TLS automatique,
tunnels zero-trust, Kubernetes, sauvegardes planifiées — consultez le
répertoire **[`examples/`](examples/)**. Chaque exemple est un fichier unique
et autonome, avec un commentaire d'en-tête qui explique quand l'utiliser.

<details>
<summary>Référence rapide : quel exemple pour quel scénario ?</summary>

| Ce que vous voulez | Utilisez ce fichier |
|--------------------|---------------------|
| TLS automatique sans config manuelle | `docker-compose.caddy.yml` ou `docker-compose.https-portal.yml` |
| TLS automatique avec un dashboard (Traefik) | `docker-compose.traefik.yml` |
| Exposer sans ouvrir de ports (zero-trust) | `docker-compose.cloudflare-tunnel.yml` |
| Vous utilisez déjà Nginx + Certbot | `docker-compose.nginx.yml` |
| Sauvegardes SQLite planifiées | `docker-compose.with-backup.yml` |
| Cluster Kubernetes | `kubernetes.yaml` |

</details>

### Option 1 : reverse proxy avec votre domaine

Pointez l'enregistrement A de votre domaine vers l'IP de votre serveur, puis
utilisez un reverse proxy avec HTTPS automatique :

<details>
<summary>Caddy (recommandé — HTTPS automatique)</summary>

```
links.example.com {
    reverse_proxy localhost:3000
}
```

Pour une configuration Docker Compose complète avec Caddy, voir [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml).

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

Pour une configuration Docker Compose complète avec Nginx, voir [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml).

</details>

### Option 2 : Cloudflare Tunnel (sans ports ouverts)

Ni achat de domaine ni redirection de port :

```bash
cloudflared tunnel --url http://localhost:3000
```

Pour une configuration Docker Compose complète avec Cloudflare Tunnel, voir [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml).

## 📸 Captures d'écran

<details>
    <summary>Cliquez pour déplier</summary>
    <br/>

<table>
    <tr>
    <td>Page publique</td>
    <td>Tableau de bord admin</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="Page publique [Thème Aurora]" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="Tableau de bord admin" /></td>
    </tr>
    <tr>
    <td>Liens</td>
    <td>Profil</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="Page des liens" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="Page de profil" /></td>
    </tr>
    <tr>
    <td>Thème</td>
    <td>Panneau d'aperçu en direct</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="Page des thèmes" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="Panneau d'aperçu en direct" /></td>
    </tr>
    <tr>
    <td>Paramètres [Général]</td>
    <td>Paramètres [Apparence]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="Page paramètres [onglet Général]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="Page paramètres [onglet Apparence]" /></td>
    </tr>
    <tr>
    <td>Paramètres [Sécurité]</td>
    <td>Paramètres [Données]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="Page paramètres [onglet Sécurité]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="Page paramètres [onglet Données]" /></td>
    </tr>
</table>

</details>

## 🆚 Comparaison

| Fonctionnalité | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|----------------|----------|-----------|------------|-------|----------------|
| **Prix** | 15 $/mois | Gratuit | Gratuit | Gratuit | **Gratuit** |
| **Panneau admin** | ✅ | Lent | ❌ | ❌ | **✅ Rapide** |
| **Pages multiples** | ✅ (payant) | ❌ | ❌ | ❌ | **✅** |
| **Favicons automatiques** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Assistant de migration** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Base de données** | Chez eux | MySQL | Aucune | Aucune | **SQLite** |
| **Statistiques intégrées** | Payant | Basiques | ❌ | ❌ | **✅ Complètes** |
| **Statistiques externes** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Collecte d'e-mails** | Payant | ❌ | ❌ | ❌ | **✅** |
| **Widgets intégrés** | Payant | ❌ | ❌ | ❌ | **✅** |
| **Miniatures de liens** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **QR codes** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Programmation des liens** | Payant | ❌ | ❌ | ❌ | **✅** |
| **Thèmes** | Payant | Limités | CSS seul | Config | **✅ Système de tokens complet + import/export** |
| **CSS personnalisé** | ❌ | ❌ | ✅ | ❌ | **✅** |
| **Auto-hébergé** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **Langage** | Fermé | PHP | HTML | Astro | **TypeScript** |
| **Déploiement Docker** | N/A | Complexe | Simple | Simple | **Une commande** |
| **Chargement de page** | ~2-3 s | ~1-2 s | Rapide | Rapide | **<300 ms** |
| **Licence** | Fermée | AGPL | MIT | GPL | **MIT** |

## 🛠️ Pile technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Base de données | SQLite via better-sqlite3 (mode WAL) |
| ORM | Drizzle ORM (type-safe, zéro surcoût) |
| Authentification | Sessions cookie HMAC, bcrypt |
| UI | shadcn/ui + Tailwind CSS 4 |
| Glisser-déposer | dnd-kit |
| Graphiques | Recharts |
| QR codes | qrcode (SVG/PNG côté serveur) |
| Validation | Zod |
| Icônes | Lucide + SVG sociaux personnalisés |

## 📖 Documentation

- [Guide de contribution](CONTRIBUTING.md)
- [Politique de sécurité](SECURITY.md)
- [Journal des modifications](CHANGELOG.md)
- [Dépannage](TROUBLESHOOTING.md)
- [Décisions d'architecture](docs/adr/)
- [Référence de configuration](#️-configuration)

## ⚙️ Configuration

Toute la configuration passe par des variables d'environnement (`.env`) :

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `PORT` | `3000` | Port du serveur |
| `DATABASE_PATH` | `./data/linkbreeze.db` | Chemin du fichier SQLite |
| `SECRET_KEY` | Générée automatiquement | Clé de signature HMAC des sessions |
| `EXTRA_SCRIPT_SRC` | _(vide)_ | Domaines d'analytique séparés par des espaces pour la CSP (ex. `plausible.io umami.is`) |

**Utiliser une analytique externe (Plausible, Umami, Matomo, Google Analytics) :**

Les statistiques intégrées couvrent vues, clics, référents et type d'appareil,
sans aucune configuration. Pour ajouter un fournisseur tiers, collez votre
extrait `<script>` dans Paramètres → Intégration → Script d'analytique, puis
ajoutez le domaine du fournisseur à `EXTRA_SCRIPT_SRC` pour que la CSP autorise
son chargement :

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

Reconstruisez après avoir modifié cette variable (la CSP est intégrée au build).

Les réglages à l'exécution (slug, titre, SEO, thème) se gèrent depuis le
tableau de bord admin et se stockent en base — aucune modification de code
nécessaire.

## 🎨 Système de thèmes

11 préréglages inclus d'office : **Aurora** (la vitrine animée),
**Glassmorphism**, **Neon Cyberpunk**, **Editorial Paper**, **Terminal Mono**,
**Pastel Soft**, **Brutalist**, **Retro Sunset**, **Minimal Light**,
**8-Bit Retro** et **Frutiger Aero** (le look eau-et-air brillant du milieu des
années 2000 — boutons bulles de gel, cartes en verre dépoli, un arrière-plan
vidéo de bulles avec repli en dégradé aqua, et la police Nunito).

Le moteur de thèmes repose sur un système de tokens via des propriétés CSS
personnalisées (`--lb-*`) — chaque couleur, rayon, ombre et police est un token
consommé par les composants de la page publique. Le personnalisateur vous donne
le contrôle total sur :

- **Arrière-plan** — 8 types (couleur unie, dégradé, radial, mesh, aurora, dégradé animé, image, motif) avec contrôles d'angle, de voile et d'opacité
- **Couleurs** — accent, secondaire, texte, texte atténué, fond de carte, bordure de carte (hex ou rgba)
- **Typographie** — 15 polices Google curatées (Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit, Nunito, Montserrat, Caveat, Pacifico, Abril Fatface), échelle, graisse, interlettrage — plus les vôtres : téléversez n'importe quel woff2/woff (max 2 Mo) dans l'onglet Typographie et choisissez-la comme une police intégrée. Les polices téléversées sont servies same-origin, embarquées dans les exports de thème et conservées dans les sauvegardes. En supprimer une réinitialise les thèmes qui l'utilisent vers Inter (avec une confirmation listant les thèmes concernés).
- **Style de carte** — 7 styles de liens (pill, arrondi, anguleux, verre, contour, néon, pixel), effets au survol, taille de bouton, rayon des coins, épaisseur de bordure, intensité de l'ombre
- **Mise en page** — largeur du conteneur, alignement (gauche/centre/droite), densité (compacte/normale/détendue)
- **Effets** — halo lumineux avec couleur personnalisée, flou de verre, texture de bruit, animation d'apparition
- **Duplication** — clonez n'importe quel thème (préréglage ou personnalisé) en copie modifiable

Tous les changements s'appliquent avec zéro bundle JS côté client — la page
publique n'embarque aucun runtime React et se rend en HTML pur côté serveur.
(Les liens mailto/tel/réseaux sociaux utilisent une mini-balise `onclick`
inline pour un suivi des clics au mieux ; les liens http/https passent par la
redirection `/go/:id`, sans JS.)

## 💬 Communauté

- **[Partagez votre thème LinkBreeze](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — Exportez le JSON de votre thème personnalisé et montrez votre page. Les meilleurs seront mis en avant dans les prochaines versions.
- **[Qui utilise LinkBreeze ? Laissez votre lien](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — Dites-nous ce que vous avez construit, à quoi sert votre page et ce qui manque. Soyez impitoyables.

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour les directives.

## 📜 Licence

MIT — faites-en ce que vous voulez. Voir [LICENSE](LICENSE).

## 🏢 À propos

Développé par [Manak-hash](https://github.com/Manak-hash) · Un projet [OmniRise](https://omnirise.dev).
