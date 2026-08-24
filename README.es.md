<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Banner" width="100%" />

---

[English](README.md) · **Español** · [Français](README.fr.md)

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
> La [versión inglesa](README.md) es la referencia. Esta traducción puede quedar
> desactualizada con respecto al original.

---

> **Deja de pagar 15 USD al mes por Linktree.** LinkBreeze te ofrece enlaces,
> estadísticas, códigos QR, temas y un panel de administración completo — gratis
> para siempre, con un solo comando de Docker.

**[🔗 Demo en línea](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — mira la página pública en acción.

**[🔐 Panel de demostración](https://linkbreeze-demo.omnirise.dev/dashboard)** — panel completo con todas las funciones (solo lectura).

## ✨ Funcionalidades

- **🔗 Gestión de enlaces** — Añade, reorganiza y personaliza enlaces ilimitados mediante arrastrar y soltar.
- **🌐 Múltiples páginas** — Crea páginas ilimitadas, cada una con su propio slug, tema, enlaces, estadísticas, SEO y código QR.
- **🎨 Favicons automáticos** — Los enlaces muestran automáticamente el favicon del sitio de destino; no necesitas subir iconos manualmente.
- **📥 Asistente de migración** — Importa tus enlaces y perfiles sociales existentes desde Linktree, Bento, Hopp.bio, LittleLink o cualquier exportación HTML/JSON.
- **🖼️ Miniaturas de enlaces** — Añade imágenes a tus enlaces para crear tarjetas de vista previa visuales.
- **🎵 Widgets integrados** — Inserta YouTube, Spotify, SoundCloud, Vimeo o Bandcamp directamente en tu página.
- **⏰ Programación de enlaces** — Programa cuándo deben aparecer o desaparecer automáticamente los enlaces mediante controles de fecha y hora.
- **📊 Estadísticas respetuosas con la privacidad** — Visualizaciones, clics, referentes y tipo de dispositivo. Sin cookies por diseño. Las IP de los visitantes se cifran mediante hash con una sal que cambia diariamente y nunca se almacenan. Los datos de más de 90 días se eliminan automáticamente de forma predeterminada (Configuración → Datos; establece 0 para conservarlo todo).
- **📈 Estadísticas externas** — Integra Plausible, Umami, Matomo o Google Analytics con un simple copiar y pegar.
- **🔔 Notificaciones de actualización** — Un banner en el panel te avisa cuando hay una nueva versión disponible (sin conexiones automáticas al servidor ni actualizaciones automáticas).
- **🎨 Temas** — 11 preajustes integrados (Aurora, Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light, 8-Bit Retro y Frutiger Aero), además de un personalizador completo con un sistema de tokens CSS (colores, 15 fuentes y carga de fuentes personalizadas, 8 tipos de fondo, 8 estilos de tarjeta, controles de diseño y efectos), junto con duplicación, importación y exportación de temas.
- **✏️ CSS personalizado** — Ajusta tu página al píxel mediante la inyección de CSS sin procesar.
- **📧 Recopilación de correos electrónicos** — Recopila los correos de tus suscriptores desde tu página pública y expórtalos a CSV.
- **📱 Diseño mobile-first** — Se ve excelente en cualquier pantalla. Carga en menos de 300 ms. Cero bundle de JavaScript en el cliente.
- **🎯 Códigos QR** — Se generan automáticamente para tu página. Descárgalos en SVG o PNG. Personaliza los colores, integra tu avatar o favicon en el centro y expórtalos hasta 1024 px para impresión.
- **🔒 Autoalojado** — Tus datos, tu servidor. Sin rastreadores de terceros, anuncios ni suscripciones.
- **🐳 Despliegue con un solo comando** — Ejecuta Docker Compose y estará en línea.

## 🚀 Inicio rápido

**Un comando — cero configuración — en línea en 30 segundos:**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

El script detecta Docker o Podman, descarga la imagen, inicia el contenedor y, opcionalmente, configura un servicio systemd para iniciar automáticamente el servicio al arrancar el sistema. ¿Quieres habilitar el inicio automático? Ejecútalo con `sudo bash` y responde **y** cuando se te solicite.

<details>
<summary>¿No te gusta enviar contenido directamente a bash mediante pipe?</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

Después, abre http://localhost:3000 — el asistente de configuración tarda menos de 30 segundos.

**¿Prefieres otro método?** Despliega cualquiera de las siguientes opciones:

<details>
<summary>🐳 &nbsp;Docker</summary>

No necesitas Node.js, npm ni archivos de configuración.

**Linux / macOS / Windows CMD:**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — usa backticks para los saltos de línea:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **Las migraciones de la base de datos se ejecutan automáticamente** al iniciar
> el contenedor; no es necesario ejecutar manualmente `drizzle-kit migrate` en
> los despliegues con Docker.

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

Ideal si quieres personalizar los puertos, añadir un proxy inverso o gestionar las actualizaciones fácilmente.

**Opción A — Usar la imagen preconstruida:**

Crea un archivo `docker-compose.yml`:

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

**Opción B — Compilar desde el código fuente:**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Actualiza cuando quieras: `docker compose pull && docker compose up -d`.
Consulta los registros con: `docker compose logs -f linkbreeze`.

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

¿Usas [Coolify](https://coolify.io/) en tu VPS?

1. **+ New Resource** → **Docker Compose Empty**
2. Pega lo siguiente:

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

3. Define un dominio (por ejemplo, `links.tudominio.com`) para habilitar SSL automático.
4. Haz clic en **Deploy** — Coolify gestionará Let's Encrypt automáticamente.

</details>

<details>
<summary>📦 &nbsp;Synology NAS</summary>

¿Usas un [Synology DiskStation](https://www.synology.com/) con Container Manager (DSM 7.2 o posterior)?

1. Abre **Container Manager** → **Container** → **Create**.
2. **Imagen:** `ghcr.io/manak-hash/linkbreeze:latest` (descárgala primero desde **Image** → **Add** si no aparece).
3. Configura el contenedor:
   - **Nombre:** `linkbreeze`.
   - **Puerto:** local `3000` → contenedor `3000`.
   - **Volumen:** crea `/docker/linkbreeze/data` y asígnalo a `/app/data`.
   - **Política de reinicio:** `Unless stopped`.
4. Haz clic en **Done** — estará disponible en `http://<ip-del-nas>:3000`.

> **Actualización:** descarga la imagen más reciente, detén y vuelve a crear el contenedor. Los datos persistirán en el volumen.

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

¿Usas [Podman](https://podman.io/) en lugar de Docker (RHEL, Fedora o CentOS)? Sustituye `docker` por `podman`:

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

Si aparecen errores de permisos en el volumen, créalo primero: `podman volume create linkbreeze-data`.

Para integrar Podman rootless con systemd: ejecuta `podman generate systemd` después de iniciar el contenedor.

El script de instalación de un solo comando que aparece al principio de esta sección detecta Podman automáticamente.

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

¿Usas [Portainer](https://www.portainer.io/) para gestionar tus contenedores? Despliega LinkBreeze como un Stack.

1. Ve a tu entorno → **Stacks** → **Add stack**.
2. Asígnale el nombre `linkbreeze` y pega lo siguiente:

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

3. Haz clic en **Deploy the stack**.

> **Actualización:** **Stacks** → `linkbreeze` → **Editor** → haz clic en **Pull and redeploy**.

</details>

<details>
<summary>🔨 &nbsp;Manual (sin Docker)</summary>

Requiere Node.js 18 o posterior.

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# Edita .env para definir SECRET_KEY y DATABASE_PATH si es necesario

npm run db:migrate
npm run dev
```

> En producción: `npm run build && npm start`.

</details>

## 🌐 Publica tu página

LinkBreeze se ejecuta en tu servidor. Una vez desplegada, tu página estará disponible
para todo el mundo en `https://tu-dominio.com/tu-slug`. Estas son las formas de
publicarla:

### Inicio rápido: apunta tu dominio

1. Apunta el registro A de tu dominio a la IP de tu servidor.
2. Expón el puerto 3000 o añade un proxy inverso.
3. Eso es todo: tu página estará disponible en `https://tu-dominio.com/tu-slug`.

### Escenarios de despliegue avanzados

Para configuraciones de producción — proxies inversos con TLS automático,
túneles zero-trust, Kubernetes y copias de seguridad programadas — consulta el
directorio **[`examples/`](examples/)**. Cada ejemplo es un archivo independiente
y autocontenido, con un comentario inicial que explica cuándo utilizarlo.

<details>
<summary>Referencia rápida: ¿qué ejemplo corresponde a cada escenario?</summary>

| Lo que quieres | Utiliza este archivo |
|----------------|----------------------|
| TLS automático sin configuración manual | `docker-compose.caddy.yml` o `docker-compose.https-portal.yml` |
| TLS automático con un panel (Traefik) | `docker-compose.traefik.yml` |
| Exponer el servicio sin abrir puertos (zero-trust) | `docker-compose.cloudflare-tunnel.yml` |
| Ya utilizas Nginx + Certbot | `docker-compose.nginx.yml` |
| Copias de seguridad programadas de SQLite | `docker-compose.with-backup.yml` |
| Clúster de Kubernetes | `kubernetes.yaml` |

</details>

### Opción 1: proxy inverso con tu dominio

Apunta el registro A de tu dominio a la IP de tu servidor y utiliza un proxy inverso con HTTPS automático:

<details>
<summary>Caddy (recomendado — HTTPS automático)</summary>

```
links.example.com {
    reverse_proxy localhost:3000
}
```

Para obtener una configuración completa de Docker Compose con Caddy, consulta [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml).

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

Para obtener una configuración completa de Docker Compose con Nginx, consulta [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml).

</details>

### Opción 2: Cloudflare Tunnel (sin puertos abiertos)

No necesitas comprar un dominio ni configurar redirecciones de puertos:

```bash
cloudflared tunnel --url http://localhost:3000
```

Para obtener una configuración completa de Docker Compose con Cloudflare Tunnel, consulta [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml).

## 📸 Capturas de pantalla

<details>
    <summary>Haz clic para desplegar</summary>
    <br/>

<table>
    <tr>
    <td>Página pública</td>
    <td>Panel de administración</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="Página pública [tema Aurora]" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="Panel de administración" /></td>
    </tr>
    <tr>
    <td>Enlaces</td>
    <td>Perfil</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="Página de enlaces" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="Página de perfil" /></td>
    </tr>
    <tr>
    <td>Tema</td>
    <td>Panel de vista previa en directo</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="Página de temas" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="Panel de vista previa en directo" /></td>
    </tr>
    <tr>
    <td>Configuración [General]</td>
    <td>Configuración [Apariencia]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="Página de configuración [pestaña General]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="Página de configuración [pestaña Apariencia]" /></td>
    </tr>
    <tr>
    <td>Configuración [Seguridad]</td>
    <td>Configuración [Datos]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="Página de configuración [pestaña Seguridad]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="Página de configuración [pestaña Datos]" /></td>
    </tr>
</table>

</details>

## 🆚 Comparación

| Funcionalidad | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|----------------|----------|-----------|------------|-------|----------------|
| **Precio** | 15 USD/mes | Gratis | Gratis | Gratis | **Gratis** |
| **Panel de administración** | ✅ | Lento | ❌ | ❌ | **✅ Rápido** |
| **Múltiples páginas** | ✅ (de pago) | ❌ | ❌ | ❌ | **✅** |
| **Favicons automáticos** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Asistente de migración** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Base de datos** | Gestionada por ellos | MySQL | Ninguna | Ninguna | **SQLite** |
| **Estadísticas integradas** | De pago | Básicas | ❌ | ❌ | **✅ Completas** |
| **Estadísticas externas** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Recopilación de correos** | De pago | ❌ | ❌ | ❌ | **✅** |
| **Widgets integrados** | De pago | ❌ | ❌ | ❌ | **✅** |
| **Miniaturas de enlaces** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **Códigos QR** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Programación de enlaces** | De pago | ❌ | ❌ | ❌ | **✅** |
| **Temas** | De pago | Limitados | Solo CSS | Configuración | **✅ Sistema completo de tokens + importación/exportación** |
| **CSS personalizado** | ❌ | ❌ | ✅ | ❌ | **✅** |
| **Autoalojado** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **Lenguaje** | Cerrado | PHP | HTML | Astro | **TypeScript** |
| **Despliegue con Docker** | N/D | Complejo | Sencillo | Sencillo | **Un comando** |
| **Carga de página** | ~2-3 s | ~1-2 s | Rápida | Rápida | **<300 ms** |
| **Licencia** | Cerrada | AGPL | MIT | GPL | **MIT** |

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Base de datos | SQLite mediante better-sqlite3 (modo WAL) |
| ORM | Drizzle ORM (type-safe, sin sobrecoste) |
| Autenticación | Sesiones mediante cookies HMAC, bcrypt |
| UI | shadcn/ui + Tailwind CSS 4 |
| Arrastrar y soltar | dnd-kit |
| Gráficos | Recharts |
| Códigos QR | qrcode (SVG/PNG en el servidor) |
| Validación | Zod |
| Iconos | Lucide + SVG sociales personalizados |

## 📖 Documentación

- [Guía de contribución](CONTRIBUTING.md)
- [Política de seguridad](SECURITY.md)
- [Registro de cambios](CHANGELOG.md)
- [Solución de problemas](TROUBLESHOOTING.md)
- [Decisiones de arquitectura](docs/adr/)
- [Referencia de configuración](#️-configuración)

## ⚙️ Configuración

Toda la configuración se realiza mediante variables de entorno (`.env`):

| Variable | Valor predeterminado | Descripción |
|----------|----------------------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `DATABASE_PATH` | `./data/linkbreeze.db` | Ruta del archivo SQLite |
| `SECRET_KEY` | Generada automáticamente | Clave de firma HMAC de las sesiones |
| `EXTRA_SCRIPT_SRC` | _(vacío)_ | Dominios de analítica separados por espacios para la CSP (por ejemplo, `plausible.io umami.is`) |

**Usar analítica externa (Plausible, Umami, Matomo o Google Analytics):**

Las estadísticas integradas cubren visualizaciones, clics, referentes y tipo de dispositivo,
sin ninguna configuración. Para añadir un proveedor externo, pega tu fragmento `<script>` en
Configuración → Integración → Script de analítica y añade el dominio del proveedor a
`EXTRA_SCRIPT_SRC` para que la CSP autorice su carga:

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

Vuelve a compilar después de modificar esta variable (la CSP se incorpora durante la compilación).

Los ajustes en tiempo de ejecución (slug, título, SEO y tema) se gestionan desde el panel de administración y se almacenan en la base de datos; no es necesario modificar el código.

## 🎨 Sistema de temas

Se incluyen 11 preajustes de serie: **Aurora** (la experiencia visual animada),
**Glassmorphism**, **Neon Cyberpunk**, **Editorial Paper**, **Terminal Mono**,
**Pastel Soft**, **Brutalist**, **Retro Sunset**, **Minimal Light**,
**8-Bit Retro** y **Frutiger Aero** (el estilo brillante de agua y aire de mediados
de los años 2000: botones con aspecto de burbuja de gel, tarjetas de vidrio esmerilado,
un fondo de vídeo con burbujas y un degradado aguamarina alternativo, además de la
fuente Nunito).

El motor de temas se basa en un sistema de tokens mediante propiedades CSS personalizadas
(`--lb-*`): cada color, radio, sombra y fuente es un token utilizado por los componentes
de la página pública. El personalizador ofrece control total sobre:

- **Fondo** — 8 tipos (color sólido, degradado, radial, malla, aurora, degradado animado, imagen y patrón), con controles de ángulo, superposición y opacidad.
- **Colores** — color de acento, secundario, texto, texto atenuado, fondo de tarjeta y borde de tarjeta (hex o rgba).
- **Tipografía** — 15 fuentes de Google seleccionadas (Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit, Nunito, Montserrat, Caveat, Pacifico y Abril Fatface), escala, grosor e interletraje; además de tus propias fuentes: sube cualquier woff2/woff (máx. 2 MB) en la pestaña Tipografía y selecciónala como una fuente integrada. Las fuentes subidas se sirven desde el mismo origen, se incluyen en las exportaciones de temas y se conservan en las copias de seguridad. Eliminar una restablece a Inter los temas que la utilizan, previa confirmación con una lista de los temas afectados.
- **Estilo de tarjeta** — 7 estilos de enlace (pill, redondeado, angular, cristal, contorno, neón y píxel), efectos al pasar el cursor, tamaño del botón, radio de las esquinas, grosor del borde e intensidad de la sombra.
- **Diseño** — anchura del contenedor, alineación (izquierda, centro o derecha) y densidad (compacta, normal o espaciosa).
- **Efectos** — halo luminoso con color personalizado, desenfoque de cristal, textura de ruido y animación de aparición.
- **Duplicación** — clona cualquier tema (preajuste o personalizado) como una copia editable.

Todos los cambios se aplican sin ningún bundle de JavaScript en el cliente: la página
pública no incluye ningún runtime de React y se renderiza como HTML puro en el servidor.
(Los enlaces mailto/tel/redes sociales utilizan una pequeña etiqueta `onclick`
en línea para realizar el seguimiento de clics cuando es posible; los enlaces
http/https pasan por la redirección `/go/:id`, sin JavaScript).

## 💬 Comunidad

- **[Comparte tu tema de LinkBreeze](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — Exporta el JSON de tu tema personalizado y muestra tu página. Los mejores aparecerán en próximas versiones.
- **[¿Quién usa LinkBreeze? Deja tu enlace](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — Cuéntanos qué has creado, para qué sirve tu página y qué echas en falta. No te cortes.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las directrices.

## 📜 Licencia

MIT — haz con él lo que quieras. Consulta [LICENSE](LICENSE).

## 🏢 Acerca del proyecto

Desarrollado por [Manak-hash](https://github.com/Manak-hash) · Un proyecto de [OmniRise](https://omnirise.dev).