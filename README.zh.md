<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Banner" width="100%" />

---

[English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **中文** · [العربية](README.ar.md)

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
> [英文版](README.md)为权威版本。本翻译可能会落后于原文。

---

> **别再为 Linktree 每月付 15 美元了。** LinkBreeze 给你链接、统计分析、
> QR 码、主题和一个真正的管理后台 — 免费、永久、一条 Docker 命令搞定。

**[🔗 在线演示](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — 看公共页面的实际效果。

**[🔐 演示后台](https://linkbreeze-demo.omnirise.dev/dashboard)** — 查看包含全部功能的仪表盘（只读）。

## ✨ 功能

- **🔗 链接管理** — 拖拽添加、排序和自定义无限数量的链接
- **🌐 多页面支持** — 创建无限页面，每个页面拥有自己的 slug、主题、链接、统计、SEO 和 QR 码
- **🎨 自动 Favicon** — 链接自动显示目标网站的 favicon — 无需手动上传图标
- **📥 迁移向导** — 从 Linktree、Bento、Hopp.bio、LittleLink 或任何 HTML/JSON 导出文件导入现有链接和社交资料
- **🖼️ 链接缩略图** — 为链接添加图片，生成可视化预览卡片
- **🎵 内嵌小组件** — 在页面上直接嵌入 YouTube、Spotify、SoundCloud、Vimeo 或 Bandcamp
- **⏰ 链接定时** — 通过日期/时间控制，让链接自动上线/下线
- **📊 尊重隐私的统计** — 浏览量、点击量、来源、设备类型。设计上就不使用 Cookie。访客 IP 使用每日轮换的盐值哈希，绝不存储。超过 90 天的数据默认自动清理（设置 → 数据；设为 0 可永久保留）。
- **📈 第三方统计** — 粘贴一次即可接入 Plausible、Umami、Matomo 或 Google Analytics
- **🔔 更新通知** — 有新版本时仪表盘横幅会提醒你（不回传数据、不自动更新）
- **🎨 主题** — 11 个内置预设（Aurora、Glassmorphism、Neon Cyberpunk、Editorial Paper、Terminal Mono、Pastel Soft、Brutalist、Retro Sunset、Minimal Light、8-Bit Retro、Frutiger Aero）+ 基于 CSS 令牌系统的完整自定义器（颜色、15 种字体 + 自定义字体上传、8 种背景类型、8 种卡片样式、布局控制、特效）+ 主题复制/导入/导出
- **✏️ 自定义 CSS** — 通过原生 CSS 注入精细调整你的页面
- **📧 邮件收集** — 在公共页面收集订阅者邮箱，导出为 CSV
- **📱 移动优先** — 在任何屏幕上都惊艳。加载时间低于 300 毫秒。客户端零 JS 打包。
- **🎯 QR 码** — 为你的页面自动生成。下载 SVG 或 PNG。自定义颜色，在中心嵌入你的头像或 favicon，最高可导出 1024 px 用于印刷。
- **🔒 自托管** — 你的数据、你的服务器。无第三方跟踪器。无广告。无订阅。
- **🐳 一条命令部署** — docker compose 一跑即上线

## 🚀 快速开始

**一条命令 — 零配置 — 30 秒上线：**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

脚本会自动检测 Docker 或 Podman，拉取镜像，启动容器，并可选择配置 systemd 服务实现开机自启。想要开机自启？用 `sudo bash` 运行，并在提示时回答 **y**。

<details>
<summary>不喜欢管道到 bash？</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

然后打开 http://localhost:3000 — 安装向导不到 30 秒即可完成。

**想换一种方式？** 展开下面任意一个：

<details>
<summary>🐳 &nbsp;Docker</summary>

不需要 Node.js、npm 或任何配置文件。

**Linux / macOS / Windows CMD：**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — 换行使用反引号：

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **数据库迁移在容器启动时自动运行** — Docker 部署无需手动执行
> `drizzle-kit migrate`。

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

想自定义端口、添加反向代理或方便地管理更新时最佳。

**方案 A — 拉取预构建镜像：**

创建 `docker-compose.yml`：

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

**方案 B — 从源码构建：**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

随时升级：`docker compose pull && docker compose up -d`

日志：`docker compose logs -f linkbreeze`

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

在你的 VPS 上运行 [Coolify](https://coolify.io/)？

1. **+ New Resource** → **Docker Compose Empty**
2. 粘贴：

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

3. 设置域名（如 `links.yourdomain.com`）自动获得 SSL
4. 点击 **Deploy** — Coolify 自动处理 Let's Encrypt

</details>

<details>
<summary>📦 &nbsp;群晖 NAS</summary>

在使用 [Synology DiskStation](https://www.synology.com/) 和 Container Manager（DSM 7.2+）？

1. 打开 **Container Manager** → **Container** → **Create**
2. **镜像：** `ghcr.io/manak-hash/linkbreeze:latest`（如未找到，先通过 **Image** → **Add** 拉取）
3. 容器设置：
   - **名称：** `linkbreeze`
   - **端口：** 本地 `3000` → 容器 `3000`
   - **卷：** 创建 `/docker/linkbreeze/data` 并映射到 `/app/data`
   - **重启策略：** `Unless stopped`
4. 点击 **Done** — 访问 `http://<NAS-IP>:3000` 即上线

> **日后更新：** 拉取最新镜像，停止并重建容器。数据保留在卷中。

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

用 [Podman](https://podman.io/) 代替 Docker（RHEL、Fedora、CentOS）？把 `docker` 换成 `podman`：

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

如果卷出现权限错误，先创建它：`podman volume create linkbreeze-data`

rootless Podman 的 systemd 集成：启动容器后执行 `podman generate systemd`。

本节顶部的一行安装脚本会自动检测 Podman。

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

用 [Portainer](https://www.portainer.io/) 管理容器？以 Stack 方式部署。

1. 进入你的环境 → **Stacks** → **Add stack**
2. 命名为 `linkbreeze` 并粘贴：

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

3. 点击 **Deploy the stack**

> **更新：** **Stacks** → `linkbreeze` → **Editor** → 点击 **Pull and redeploy**。

</details>

<details>
<summary>🔨 &nbsp;手动（不用 Docker）</summary>

需要 Node.js 18+。

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# 按需编辑 .env 设置 SECRET_KEY 和 DATABASE_PATH

npm run db:migrate
npm run dev
```

> 生产环境：`npm run build && npm start`

</details>

## 🌐 让你的页面上线

LinkBreeze 运行在你的服务器上。部署完成后，任何人都可以通过
`https://your-domain.com/your-slug` 访问你的页面。上线步骤：

### 快速开始：绑定域名

1. 将域名的 A 记录指向你的服务器 IP
2. 开放 3000 端口或添加反向代理
3. 完成 — 你的页面已在 `https://your-domain.com/your-slug` 上线

### 进阶部署场景

生产环境配置 — 自动 TLS 的反向代理、零信任隧道、Kubernetes、定时备份 —
请查看 **[`examples/`](examples/)** 目录。
每个示例都是一个独立的单文件，头部注释说明了适用场景。

<details>
<summary>速查：哪种场景用哪个文件？</summary>

| 需求 | 使用这个文件 |
|------|--------------|
| 免配置的自动 TLS | `docker-compose.caddy.yml` 或 `docker-compose.https-portal.yml` |
| 自动 TLS + 控制面板（Traefik） | `docker-compose.traefik.yml` |
| 不开放端口对外暴露（零信任） | `docker-compose.cloudflare-tunnel.yml` |
| 已在用 Nginx + Certbot | `docker-compose.nginx.yml` |
| 定时 SQLite 备份 | `docker-compose.with-backup.yml` |
| 在 Kubernetes 集群上运行 | `kubernetes.yaml` |

</details>

### 方案 1：反向代理 + 自有域名

将域名的 A 记录指向服务器 IP，然后使用带自动 HTTPS 的反向代理：

<details>
<summary>Caddy（推荐 — 自动 HTTPS）</summary>

```
links.example.com {
    reverse_proxy localhost:3000
}
```

完整的 Caddy Docker Compose 配置见 [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml)。

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

完整的 Nginx Docker Compose 配置见 [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml)。

</details>

### 方案 2：Cloudflare Tunnel（无需开放端口）

无需购买域名或端口转发：

```bash
cloudflared tunnel --url http://localhost:3000
```

完整的 Cloudflare Tunnel Docker Compose 配置见 [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml)。

## 📸 截图

<details>
    <summary>点击展开</summary>
    <br/>

<table>
    <tr>
    <td>公共页面</td>
    <td>管理仪表盘</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="公共页面 [Aurora 主题]" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="管理仪表盘" /></td>
    </tr>
    <tr>
    <td>链接</td>
    <td>资料</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="链接页面" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="资料页面" /></td>
    </tr>
    <tr>
    <td>主题</td>
    <td>实时预览面板</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="主题页面" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="实时预览面板" /></td>
    </tr>
    <tr>
    <td>设置 [常规]</td>
    <td>设置 [外观]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="设置页面 [常规标签]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="设置页面 [外观标签]" /></td>
    </tr>
    <tr>
    <td>设置 [安全]</td>
    <td>设置 [数据]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="设置页面 [安全标签]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="设置页面 [数据标签]" /></td>
    </tr>
</table>

</details>

## 🆚 对比

| 功能 | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|------|----------|-----------|------------|-------|----------------|
| **价格** | 15 美元/月 | 免费 | 免费 | 免费 | **免费** |
| **管理后台** | ✅ | 慢 | ❌ | ❌ | **✅ 快** |
| **多页面** | ✅（付费） | ❌ | ❌ | ❌ | **✅** |
| **自动 Favicon** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **迁移向导** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **数据库** | 他们的 | MySQL | 无 | 无 | **SQLite** |
| **内置统计** | 付费 | 基础 | ❌ | ❌ | **✅ 完整** |
| **第三方统计** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **邮件收集** | 付费 | ❌ | ❌ | ❌ | **✅** |
| **内嵌小组件** | 付费 | ❌ | ❌ | ❌ | **✅** |
| **链接缩略图** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **QR 码** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **链接定时** | 付费 | ❌ | ❌ | ❌ | **✅** |
| **主题** | 付费 | 有限 | 仅 CSS | 配置文件 | **✅ 完整令牌系统 + 导入/导出** |
| **自定义 CSS** | ❌ | ❌ | ✅ | ❌ | **✅** |
| **自托管** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **语言** | 闭源 | PHP | HTML | Astro | **TypeScript** |
| **Docker 部署** | 无 | 复杂 | 简单 | 简单 | **一条命令** |
| **页面加载** | ~2-3 秒 | ~1-2 秒 | 快 | 快 | **<300 毫秒** |
| **许可证** | 闭源 | AGPL | MIT | GPL | **MIT** |

## 🛠️ 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16（App Router、Server Components、ISR） |
| 数据库 | SQLite（better-sqlite3，WAL 模式） |
| ORM | Drizzle ORM（类型安全、零开销） |
| 认证 | 基于 Cookie 的 HMAC 会话、bcrypt |
| UI | shadcn/ui + Tailwind CSS 4 |
| 拖拽 | dnd-kit |
| 图表 | Recharts |
| QR 码 | qrcode（服务端 SVG/PNG） |
| 校验 | Zod |
| 图标 | Lucide + 自定义社交 SVG |

## 📖 文档

- [贡献指南](CONTRIBUTING.md)
- [安全策略](SECURITY.md)
- [更新日志](CHANGELOG.md)
- [故障排查](TROUBLESHOOTING.md)
- [架构决策](docs/adr/)
- [配置参考](#️-配置)

## ⚙️ 配置

所有配置通过环境变量（`.env`）完成：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务器端口 |
| `DATABASE_PATH` | `./data/linkbreeze.db` | SQLite 数据库文件路径 |
| `SECRET_KEY` | 自动生成 | 会话的 HMAC 签名密钥 |
| `EXTRA_SCRIPT_SRC` | _(空)_ | CSP 允许的统计域名，空格分隔（如 `plausible.io umami.is`） |

**使用第三方统计（Plausible、Umami、Matomo、Google Analytics）：**

内置统计覆盖浏览量、点击量、来源和设备类型，无需任何设置。如果想接入第三方统计服务，把你的 `<script>` 代码片段粘贴到 设置 → 集成 → 统计脚本，然后把服务商的域名加入 `EXTRA_SCRIPT_SRC`，让 CSP 允许加载：

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

修改此变量后请重新构建（CSP 在构建时固化）。

运行时设置（页面 slug、标题、SEO、主题）在管理后台管理并
存储在数据库中 — 无需修改代码。

## 🎨 主题系统

内置 11 个预设：**Aurora**（动画旗舰）、**Glassmorphism**、
**Neon Cyberpunk**、**Editorial Paper**、**Terminal Mono**、
**Pastel Soft**、**Brutalist**、**Retro Sunset**、**Minimal Light**、
**8-Bit Retro** 和 **Frutiger Aero**（2000 年代中期的水与空气质感 —
凝胶气泡按钮、磨砂玻璃卡片、气泡视频背景（含水蓝渐变回退）以及 Nunito 字体）。

主题引擎基于 CSS 自定义属性（`--lb-*`）的令牌系统 — 每种颜色、圆角、
阴影和字体都是一个令牌，由公共页面组件消费。自定义器让你完全掌控：

- **背景** — 8 种类型（纯色、渐变、径向、网格、极光、动画渐变、图片、图案），支持角度、遮罩和不透明度控制
- **颜色** — 强调色、辅助色、文字、弱化文字、卡片背景、卡片边框（hex 或 rgba）
- **排版** — 15 款精选 Google 字体（Inter、Poppins、Playfair Display、JetBrains Mono、Space Grotesk、DM Sans、Lora、Bebas Neue、Sora、Outfit、Nunito、Montserrat、Caveat、Pacifico、Abril Fatface）、字号缩放、字重、字间距 — 还支持自定义：在排版标签页上传任意 woff2/woff（最大 2 MB），即可像内置字体一样选用。上传的字体同源提供、嵌入主题导出文件、随备份保留。删除字体会将使用它的主题重置为 Inter（删除前列出受影响主题并要求确认）。
- **卡片样式** — 7 种链接样式（胶囊、圆角、直角、玻璃、描边、霓虹、像素）、悬停效果、按钮大小、圆角半径、边框宽度、阴影强度
- **布局** — 容器宽度、对齐（左/中/右）、密度（紧凑/标准/宽松）
- **特效** — 自定义颜色的发光、玻璃模糊、噪点纹理、入场动画
- **复制** — 把任何主题（预设或自定义）克隆为可编辑的新副本

所有更改在客户端零 JS 打包下生效 — 公共页面不含 React 运行时，
以纯服务端 HTML 渲染。（mailto/tel/社交链接使用极小的内联 `onclick`
信标做尽力而为的点击统计；http/https 链接走免 JS 的 `/go/:id` 重定向。）

## 💬 社区

- **[分享你的 LinkBreeze 主题](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — 导出你的自定义主题 JSON，展示你的页面。最优秀的将在未来版本中精选展示。
- **[谁在用 LinkBreeze？留下你的链接](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — 告诉我们你用它在做什么、页面用途、还缺什么。尽管直言。

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 📜 许可证

MIT — 随便用。详见 [LICENSE](LICENSE)。

## 🏢 关于

由 [Manak-hash](https://github.com/Manak-hash) 开发 · [OmniRise](https://omnirise.dev) 项目。
