<div align="center">

<img src="public/Public-Page-iPhone-Dashboard-iMac.png" alt="Banner" width="100%" />

---

[English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [中文](README.zh.md) · [العربية](README.ar.md) · **Português (Brasil)**

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
> A [versão em inglês](README.md) é a oficial. Esta tradução pode apresentar divergências em relação ao original.

---

> **Pare de pagar R$ 15/mês pelo Linktree.** O LinkBreeze oferece links, estatísticas,
> códigos QR, temas e um painel de administração completo — grátis, para sempre, em um único comando Docker.

**[🔗 Demonstração ao vivo](https://linkbreeze-demo.omnirise.dev/linkbreeze)** — veja a página pública em ação.

**[🔐 Painel de demonstração](https://linkbreeze-demo.omnirise.dev/dashboard)** — explore o painel com todos os recursos (somente leitura).

## ✨ Recursos

- **🔗 Gerenciamento de Links** — Adicione, reordene e personalize links ilimitados com arrastar e soltar
- **🌐 Suporte a Múltiplas Páginas** — Crie páginas ilimitadas, cada uma com seu próprio slug, tema, links, estatísticas, SEO e código QR
- **🎨 Favicon Automático nos Links** — Os links mostram automaticamente o favicon do site de destino — sem necessidade de upload manual
- **📥 Assistente de Migração** — Importe links e perfis sociais de Linktree, Bento, Hopp.bio, LittleLink ou de qualquer arquivo HTML/JSON exportado
- **🖼️ Miniaturas nos Links** — Adicione imagens aos seus links para cartões com pré-visualização visual
- **🎵 Widgets Incorporados** — Incorpore YouTube, Spotify, SoundCloud, Vimeo ou Bandcamp diretamente na sua página
- **⏰ Agendamento de Links** — Agende links para aparecerem ou desaparecerem automaticamente com controles de data/hora
- **📊 Estatísticas com Privacidade** — Visualizações, cliques, origens, tipos de dispositivos. Sem cookies por design. Os IPs dos visitantes são criptografados com salt diário rotativo e nunca armazenados. Dados com mais de 90 dias são removidos automaticamente por padrão (Configurações → Dados; defina 0 para manter tudo).
- **📈 Estatísticas Externas** — Conecte Plausible, Umami, Matomo ou Google Analytics colando seu script
- **🔔 Notificações de Atualização** — Banner no painel avisa quando uma nova versão estiver disponível (sem rastreamento de uso, sem atualizações automáticas invasivas)
- **🎨 Temas** — 11 temas prontos (Aurora, Glassmorphism, Neon Cyberpunk, Editorial Paper, Terminal Mono, Pastel Soft, Brutalist, Retro Sunset, Minimal Light, 8-Bit Retro, Frutiger Aero) + personalizador completo com sistema de tokens CSS (cores, 15 fontes + upload de fontes personalizadas, 8 tipos de fundo, 8 estilos de cartão, controles de layout, efeitos) + duplicação/importação/exportação de temas
- **✏️ CSS Personalizado** — Ajuste fino na sua página com injeção direta de CSS
- **📧 Captura de E-mails** — Colete e-mails de inscritos na sua página pública e exporte para CSV
- **📱 Foco no Mobile (Mobile-First)** — Visual impecável em qualquer tela. Carrega em menos de 300 ms. Sem pacotes JS pesados no cliente.
- **🎯 Códigos QR** — Gerados automaticamente para sua página. Baixe em SVG ou PNG. Personalize cores, incorpore seu avatar ou favicon no centro e exporte em até 1024 px para impressão.
- **🔒 Auto-Hospedado (Self-Hosted)** — Seus dados, seu servidor. Sem rastreadores de terceiros. Sem anúncios. Sem assinatura.
- **🐳 Instalação com Um Comando** — Docker compose e sua página estará no ar

## 🚀 Início Rápido

**Um comando — configuração zero — no ar em 30 segundos:**

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
```

O script detecta Docker ou Podman, baixa a imagem, inicia o container e, opcionalmente, cria um serviço systemd para inicialização automática no boot do sistema. Quer inicialização automática no boot? Execute com `sudo bash` e responda **y** quando solicitado.

<details>
<summary>Prefere não redirecionar para o bash?</summary>

```bash
curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh -o install.sh
less install.sh
bash install.sh
```

</details>

Depois, abra http://localhost:3000 — o assistente de configuração leva menos de 30 segundos.

**Prefere outro método?** Expanda uma das opções abaixo:

<details>
<summary>🐳 &nbsp;Docker</summary>

Sem Node.js, sem npm, sem necessidade de arquivos de configuração. Imagens multi-arquitetura: `linux/amd64` e `linux/arm64` (Raspberry Pi 3/4/5, Apple Silicon, VPS ARM).

**Linux / macOS / Prompt de Comando do Windows (CMD):**

```bash
docker run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

**Windows PowerShell** — use crases para quebra de linha:

```powershell
docker run -d `
  --name linkbreeze `
  --restart unless-stopped `
  -p 3000:3000 `
  -v linkbreeze-data:/app/data `
  ghcr.io/manak-hash/linkbreeze:latest
```

> **As migrações de banco de dados rodam automaticamente** na inicialização do container — não é necessário executar
> `drizzle-kit migrate` manualmente em implantações com Docker.

</details>

<details>
<summary>🧩 &nbsp;Docker Compose</summary>

Ideal se você deseja personalizar portas, usar proxy reverso ou gerenciar atualizações facilmente.

**Opção A — Usar a imagem pronta:**

Crie um `docker-compose.yml`:

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

**Opção B — Compilar a partir do código-fonte:**

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze
docker compose up -d --build
```

Atualize quando quiser: `docker compose pull && docker compose up -d`

Logs: `docker compose logs -f linkbreeze`

</details>

<details>
<summary>☁️ &nbsp;Coolify</summary>

Executa o [Coolify](https://coolify.io/) em sua VPS?

1. **+ New Resource** → **Docker Compose Empty**
2. Cole o conteúdo:

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

3. Configure um domínio (ex: `links.seudominio.com`) para obter SSL automático
4. Clique em **Deploy** — o Coolify gerencia o Let's Encrypt automaticamente

</details>

<details>
<summary>📦 &nbsp;Synology NAS</summary>

Executando o [Synology DiskStation](https://www.synology.com/) com Container Manager (DSM 7.2+)?

1. Abra o **Container Manager** → **Container** → **Create**
2. **Imagem:** `ghcr.io/manak-hash/linkbreeze:latest` (baixe antes em **Image** → **Add** se não encontrar)
3. Configurações do container:
   - **Nome:** `linkbreeze`
   - **Porta:** Local `3000` → Container `3000`
   - **Volume:** Crie `/docker/linkbreeze/data` e aponte para `/app/data`
   - **Política de reinício:** `Unless stopped`
4. Clique em **Done** — acesse em `http://<ip-do-nas>:3000`

> **Atualizações futuras:** baixe a imagem mais recente, pare e recrie o container. Os dados permanecem preservados no volume.

</details>

<details>
<summary>🔧 &nbsp;Podman</summary>

Usa [Podman](https://podman.io/) em vez do Docker (RHEL, Fedora, CentOS)? Substitua `docker` por `podman`:

```bash
podman run -d --name linkbreeze --restart unless-stopped -p 3000:3000 -v linkbreeze-data:/app/data ghcr.io/manak-hash/linkbreeze:latest
```

Se ocorrer erro de permissão no volume, crie-o antes: `podman volume create linkbreeze-data`

Para integração com systemd no modo rootless Podman: execute `podman generate systemd` após iniciar o container.

O instalador de uma linha no início desta seção detecta o Podman automaticamente.

</details>

<details>
<summary>🖥️ &nbsp;Portainer</summary>

Usa o [Portainer](https://www.portainer.io/) para gerenciar containers? Implante como Stack.

1. Acesse seu ambiente → **Stacks** → **Add stack**
2. Nomeie como `linkbreeze` e cole:

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

3. Clique em **Deploy the stack**

> **Atualização:** **Stacks** → `linkbreeze` → **Editor** → clique em **Pull and redeploy**.

</details>

<details>
<summary>🔨 &nbsp;Manual (sem Docker)</summary>

Requer Node.js 18+.

```bash
git clone https://github.com/Manak-hash/LinkBreeze.git
cd LinkBreeze

npm install

cp .env.example .env
# Edite o .env para configurar SECRET_KEY e DATABASE_PATH se necessário

npm run db:migrate
npm run dev
```

> Para produção: `npm run build && npm start`

</details>

## 🌐 Publicando Sua Página

O LinkBreeze roda no seu servidor. Uma vez implantado, sua página fica acessível para qualquer pessoa
em `https://seu-dominio.com/seu-slug`. Veja como colocar online:

### Início rápido: Aponte seu domínio

1. Aponte o registro tipo A do seu domínio para o IP do seu servidor
2. Exponha a porta 3000 ou configure um proxy reverso
3. Pronto — sua página estará no ar em `https://seu-dominio.com/seu-slug`

### Cenários avançados de implantação

Para ambientes de produção — proxies reversos com TLS automático, túneis zero-trust,
Kubernetes, backups agendados — consulte o diretório **[`examples/`](examples/)**.
Cada exemplo é um arquivo independente com comentários explicativos.

<details>
<summary>Referência rápida: qual exemplo usar para cada cenário?</summary>

| O que você precisa | Use este arquivo |
|--------------------|------------------|
| TLS automático sem configuração manual | `docker-compose.caddy.yml` ou `docker-compose.https-portal.yml` |
| TLS automático com painel de controle (Traefik) | `docker-compose.traefik.yml` |
| Expor sem abrir portas no firewall (Zero Trust) | `docker-compose.cloudflare-tunnel.yml` |
| Já utiliza Nginx + Certbot | `docker-compose.nginx.yml` |
| Backups agendados do SQLite | `docker-compose.with-backup.yml` |
| Executando em cluster Kubernetes | `kubernetes.yaml` |

</details>

### Opção 1: Proxy Reverso com seu Domínio

Aponte o registro A do seu domínio para o IP do servidor e utilize um proxy reverso com
HTTPS automático:

<details>
<summary>Caddy (recomendado — HTTPS automático)</summary>

```
links.exemplo.com {
    reverse_proxy localhost:3000
}
```

Para uma configuração completa com Docker Compose e Caddy, veja [`examples/docker-compose.caddy.yml`](examples/docker-compose.caddy.yml).

</details>

<details>
<summary>Nginx</summary>

```nginx
server {
    server_name links.exemplo.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Para uma configuração completa com Docker Compose e Nginx, veja [`examples/docker-compose.nginx.yml`](examples/docker-compose.nginx.yml).

</details>

### Opção 2: Cloudflare Tunnel (sem abrir portas)

Não requer compra de IP fixo nem encaminhamento de portas:

```bash
cloudflared tunnel --url http://localhost:3000
```

Para uma configuração completa com Docker Compose e Cloudflare Tunnel, veja [`examples/docker-compose.cloudflare-tunnel.yml`](examples/docker-compose.cloudflare-tunnel.yml).

## 📸 Capturas de Tela

<details>
    <summary>Clique para expandir</summary>
    <br/>

<table>
    <tr>
    <td>Página Pública</td>
    <td>Painel de Administração</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Public-Page(Aurora).jpeg" alt="Página Pública [Tema Aurora]" /></td>
    <td><img src="public/screenshots/Admin-Dashboard.jpeg" alt="Painel Admin" /></td>
    </tr>
    <tr>
    <td>Links</td>
    <td>Perfil</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Links.jpeg" alt="Página de Links" /></td>
    <td><img src="public/screenshots/Profile.jpeg" alt="Página de Perfil" /></td>
    </tr>
    <tr>
    <td>Tema</td>
    <td>Painel de Prévia ao Vivo</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Theme.jpeg" alt="Página de Temas" /></td>
    <td><img src="public/screenshots/Preview.jpeg" alt="Painel de Pré-visualização" /></td>
    </tr>
    <tr>
    <td>Configurações [Geral]</td>
    <td>Configurações [Aparência]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(General).jpeg" alt="Configurações [Aba Geral]" /></td>
    <td><img src="public/screenshots/Settings(Appearance).jpeg" alt="Configurações [Aba Aparência]" /></td>
    <tr>
    <td>Configurações [Segurança]</td>
    <td>Configurações [Dados]</td>
    </tr>
    <tr>
    <td><img src="public/screenshots/Settings(Security).jpeg" alt="Configurações [Aba Segurança]" /></td>
    <td><img src="public/screenshots/Settings(Data).jpeg" alt="Configurações [Aba Dados]" /></td>
    </tr>
</table>

</details>

## 🆚 Comparativo

| Recurso | Linktree | LinkStack | LittleLink | Shako | **LinkBreeze** |
|---------|----------|-----------|------------|-------|----------------|
| **Preço** | R$15/mês | Grátis | Grátis | Grátis | **Grátis** |
| **Painel Admin** | ✅ | Lento | ❌ | ❌ | **✅ Rápido** |
| **Múltiplas Páginas** | ✅ (pago) | ❌ | ❌ | ❌ | **✅** |
| **Favicon Automático** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Assistente de Migração** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Banco de Dados** | Próprio deles | MySQL | Nenhum | Nenhum | **SQLite** |
| **Estatísticas Nativas** | Pago | Básico | ❌ | ❌ | **✅ Completo** |
| **Estatísticas Externas** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Captura de E-mails** | Pago | ❌ | ❌ | ❌ | **✅** |
| **Widgets Incorporados** | Pago | ❌ | ❌ | ❌ | **✅** |
| **Miniaturas de Links** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **Códigos QR** | ✅ | ✅ | ❌ | ❌ | **✅** |
| **Agendamento de Links** | Pago | ❌ | ❌ | ❌ | **✅** |
| **Temas** | Pago | Limitado | Apenas CSS | Config | **✅ Sistema de Tokens + Import/Export** |
| **CSS Personalizado** | ❌ | ❌ | ✅ | ❌ | **✅** |
| **Auto-Hospedado** | ❌ | ✅ | ✅ | ✅ | **✅** |
| **Linguagem** | Fechado | PHP | HTML | Astro | **TypeScript** |
| **Implantação Docker** | N/A | Complexo | Simples | Simples | **Um comando** |
| **Carregamento de Página**| ~2-3s | ~1-2s | Rápido | Rápido | **<300ms** |
| **Licença** | Proprietária | AGPL | MIT | GPL | **MIT** |

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Server Components, ISR) |
| Banco de Dados | SQLite via better-sqlite3 (modo WAL) |
| ORM | Drizzle ORM (type-safe, overhead zero) |
| Autenticação | Sessões HMAC baseadas em cookies, bcrypt |
| Interface | shadcn/ui + Tailwind CSS 4 |
| Arrastar e Soltar | dnd-kit |
| Gráficos | Recharts |
| Códigos QR | qrcode (SVG/PNG gerados no servidor) |
| Validação | Zod |
| Ícones | Lucide + SVGs sociais personalizados |

## 📖 Documentação

- [Guia de Contribuição](CONTRIBUTING.md)
- [Política de Segurança](SECURITY.md)
- [Histórico de Alterações](CHANGELOG.md)
- [Solução de Problemas](TROUBLESHOOTING.md)
- [Decisões de Arquitetura](docs/adr/)
- [Referência de Configuração](#configuração)

## ⚙️ Configuração

Todas as configurações são feitas por variáveis de ambiente (`.env`):

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta do servidor |
| `DATABASE_PATH` | `./data/linkbreeze.db` | Caminho do arquivo de banco SQLite |
| `SECRET_KEY` | Gerado automaticamente | Chave de assinatura HMAC para sessões |
| `EXTRA_SCRIPT_SRC` | _(vazio)_ | Domínios de estatísticas separados por espaço para o CSP (ex: `plausible.io umami.is`) |

**Usando estatísticas externas (Plausible, Umami, Matomo, Google Analytics):**

As estatísticas integradas cobrem visualizações, cliques, referências e tipos de dispositivo sem necessidade de configuração adicional. Caso deseje incluir um provedor externo, cole seu snippet `<script>` em Configurações -> Integração -> Script de estatísticas, e adicione o domínio do provedor em `EXTRA_SCRIPT_SRC` para autorização do CSP:

```bash
EXTRA_SCRIPT_SRC=plausible.io umami.is
```

Recompile a aplicação após alterar esta variável (o CSP é gerado no processo de build).

As configurações de tempo de execução (slug da página, título, SEO, tema) são gerenciadas diretamente no painel administrativo
e salvas no banco de dados — sem necessidade de alterações no código.

## 🎨 Sistema de Temas

11 temas pré-configurados estão disponíveis: **Aurora** (tema animado principal), **Glassmorphism**, **Neon Cyberpunk**, **Editorial Paper**, **Terminal Mono**, **Pastel Soft**, **Brutalist**, **Retro Sunset**, **Minimal Light**, **8-Bit Retro** e **Frutiger Aero** (visual aquático e vítreo dos anos 2000 — botões em bolha de gel, cartões em vidro fosco, fundo de vídeo de bolhas com gradiente aqua alternativo e fonte Nunito).

O motor de temas utiliza propriedades personalizadas CSS (`--lb-*`) — cada cor, raio, sombra e fonte é um token consumido pelos componentes da página pública. O editor oferece controle total sobre:

- **Plano de Fundo** — 8 tipos (sólido, gradiente, radial, malha/mesh, aurora, gradiente animado, imagem, padrão) com ajustes de ângulo, sobreposição e opacidade
- **Cores** — destaque, secundária, texto, texto secundário, fundo do cartão, borda do cartão (hex ou rgba)
- **Tipografia** — 15 fontes selecionadas do Google Fonts (Inter, Poppins, Playfair Display, JetBrains Mono, Space Grotesk, DM Sans, Lora, Bebas Neue, Sora, Outfit, Nunito, Montserrat, Caveat, Pacifico, Abril Fatface), escala de fonte, peso, espaçamento de letras — e fontes próprias: envie qualquer arquivo woff2/woff (máx. 2 MB) na aba Tipografia e use-a como fonte nativa. Fontes enviadas são servidas na mesma origem, incorporadas nas exportações de temas e incluídas nos backups.
- **Estilo dos Cartões** — 7 estilos de links (pílula, arredondado, reto, vidro, contorno, neon, pixel), efeitos de hover, tamanho do botão, raio dos cantos, largura da borda, intensidade da sombra
- **Layout** — largura do contêiner, alinhamento (esquerda/centro/direita), densidade (compacto/normal/espaçado)
- **Efeitos** — brilho com cor personalizada, desfoque de vidro, textura de ruído, animação de entrada
- **Duplicação** — clone qualquer tema (predefinido ou personalizado) para uma nova cópia editável

Todas as alterações são aplicadas com zero bundles JS no cliente — a página pública não envia runtime do React e é renderizada como HTML puro no servidor. (Links de e-mail/telefone/redes sociais usam um beacon leve inline `onclick` para contagem aproximada de cliques; links comuns http/https utilizam o redirecionador `/go/:id` sem necessidade de JS.)

## 💬 Comunidade

- **[Compartilhe seu tema do LinkBreeze](https://github.com/Manak-hash/LinkBreeze/discussions/51)** — Exporte o JSON do seu tema personalizado e mostre sua página. Os melhores são incluídos em futuras versões.
- **[Quem está usando o LinkBreeze? Deixe seu link](https://github.com/Manak-hash/LinkBreeze/discussions/54)** — Conte o que você construiu, qual o propósito da página e o que pode ser melhorado.

## 🤝 Contribuição

Contribuições são muito bem-vindas! Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

## 📜 Licença

MIT — faça o que quiser. Veja [LICENSE](LICENSE).

## 🏢 Sobre

Criado por [Manak-hash](https://github.com/Manak-hash) · Um projeto [OmniRise](https://omnirise.dev).
