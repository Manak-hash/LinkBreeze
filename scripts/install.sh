#!/usr/bin/env bash
#
# LinkBreeze — One-line installer
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Manak-hash/LinkBreeze/main/scripts/install.sh | bash
#
# Or clone and run locally:
#   bash scripts/install.sh
#
# What it does:
#   1. Detects Docker or Podman (prefers Docker)
#   2. Pulls the latest LinkBreeze image from GHCR
#   3. Runs the container with sensible defaults
#   4. Optionally creates a systemd service for auto-start on boot
#

set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
    BOLD='\033[1m'
    GREEN='\033[0;32m'
    YELLOW='\033[0;33m'
    BLUE='\033[0;34m'
    RED='\033[0;31m'
    NC='\033[0m'
else
    BOLD=''; GREEN=''; YELLOW=''; BLUE=''; RED=''; NC=''
fi

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*" >&2; }

# ── Config ───────────────────────────────────────────────────────────────────
IMAGE="ghcr.io/manak-hash/linkbreeze:latest"
CONTAINER_NAME="linkbreeze"
PORT="${LINKBREEZE_PORT:-3000}"
DATA_VOLUME="linkbreeze-data"

# ── Banner ───────────────────────────────────────────────────────────────────
cat << 'EOF'

 ▐▀▀▀▀█        ▀▀▀▀▀▀▀▀▀▄          █▀▀▀▀█▐▀▀▀▀█     █▀▀▀▀█▐▀▀▀▀▀▀▀▀▀█▄▄    ▐▀▀▀▀▀▀▀▀▀█▄▄   ▐▀▀▀▀▀▀▀▀▀▀▀▀█▐▀▀▀▀▀▀▀▀▀▀▀▀█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▐▀▀▀▀▀▀▀▀▀▀▀▀█
 ▐ ████        ▀▀▀▀▀▀▀▀▄ ▀▄        ██████▐ ████     █ ████▐█████████████▄  ▐ ████████████▄ ▐ ████████████▐ ████████████▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▐ ████████████
 ▐ ████        ▀▀▀▀▀▀▀▀ ▀▄ ▀▄      ██████▐ ████     █ ████ ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀█▀████▌▐ ████▀▀▀▀▀▀▀▀▐ ████▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▐ ████▀▀▀▀▀▀▀▀
 ▐ ████         █▀▀▀▀█ ▀▄ ▀▄ ▀▄    ██████▐ ████▄▄▄▄█▀▄███▌▐▀▀▀▀█   ▀▀▀▀▀▀▀ ▐ █ █ ▄▄▄█ ████▌▐ ████▄▄▄▄▄▄▄▄▐ ████▄▄▄▄▄▄▄▄▀▀▀▀▀▀ ▄█▀▀▀███▀▐ ████▄▄▄▄▄▄▄▄
 ▐ ████         █ ████   ▀▄ ▀▄ ▀▄  █▄████▐ █████▄▄▄▄████▀ ▐█████ ▀▀▀▀▀▀▀▀▀ ▐ █ █ ██▄▄████▀ ▐ ████▄▄▄▄▄▄▄█▐ ████▄▄▄▄▄▄▄█     ▄█▀▄████▀ ▄▐ ████▄▄▄▄▄▄▄█
 ▐ ████         █ ████ ▐█▄ ▀▄ ▀▄ ▀▄ ▀████▐ ████████████ ▄▀▐█████ ▀▀▀▀▀▀▀▀▀ ▐ █ █ ██████▀   ▐ ████████████▐ ████████████   ▄█▀▄████▀ ▄▀ ▐ ████████████
 ▐▄████         █ ████ ▐ ██▄ ▀▄ ▀▄ ▀▄ ▀██▐▄████ ▄ ▀▀████▄ ▐█████ ▀ ▄█▀▀▀▀█▌▐ █ █ ▀█▄▀███▄  ▐▄████        ▐▄████         ▄█▀▄████▀  ▀   ▐▄████        
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ █ ████ ▐ ████  ▀▄ ▀▄ ▀▄ ▀▄▄▄▄▄▄  ▀▄  █████▐█████▀▀▀▀▄█████ ▐ █ █ ▄ ▀█ ████▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▐▀▄█████████████▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ █ ████ ▐ ████ ▀▄ ▀▄ ▀▄ ▀▄▄▄▄▄▄▄   █ ▄▄▄▄▄▄▐█████████████▀  ▐ █ █  ▀▄▐█ ████▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▐ ██████████████▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ █▄████ ▐▄████   ▀▄ ▀▄ █ █▄▄▄▄▄▄   █ ▄▄▄▄▄▄▐▄▄████████▀▀ ▄▀ ▐ █ █   █ █▄████▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▐▄██████████████▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄ ▄▄▄▄▄▄     ▀▄▄ ▄ ▄▄▄▄▄▄▄   █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀   ▄ ▄ ▄   ▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

EOF

# ── Preflight: detect container runtime ──────────────────────────────────────
RUNTIME=""
if command -v docker &>/dev/null; then
    RUNTIME="docker"
    success "Docker detected: $(docker --version)"
elif command -v podman &>/dev/null; then
    RUNTIME="podman"
    success "Podman detected: $(podman --version)"
    warn "Using Podman (rootless mode). If you hit permission issues, try: podman run --userns=keep-id ..."
else
    error "Neither Docker nor Podman was found on this system."
    echo ""
    echo "  Install one of the following:"
    echo "    Docker:  https://docs.docker.com/engine/install/"
    echo "    Podman:  https://podman.io/docs/installation"
    echo ""
    exit 1
fi

# ── Preflight: check if a container with the same name exists ────────────────
if "$RUNTIME" ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "$CONTAINER_NAME"; then
    warn "A container named '$CONTAINER_NAME' already exists."
    echo ""
    read -rp $'\033[0;33m?\033[0m  Stop and remove the existing container? [y/N] ' RECREATE
    RECREATE="${RECREATE:-N}"
    if [[ "${RECREATE,,}" == "y" ]]; then
        info "Stopping and removing existing container..."
        "$RUNTIME" rm -f "$CONTAINER_NAME" >/dev/null
        success "Old container removed."
    else
        info "Keeping existing container. Installation cancelled."
        exit 0
    fi
fi

# ── Pull the image ───────────────────────────────────────────────────────────
info "Pulling $IMAGE..."
"$RUNTIME" pull "$IMAGE"
success "Image pulled."

# ── Run the container ────────────────────────────────────────────────────────
info "Starting LinkBreeze on port $PORT..."

if [[ "$RUNTIME" == "docker" ]]; then
    "$RUNTIME" run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p "${PORT}:3000" \
        -v "${DATA_VOLUME}:/app/data" \
        "$IMAGE"
else
    # Podman: create a volume first (podman volume create is explicit)
    "$RUNTIME" volume create "$DATA_VOLUME" >/dev/null 2>&1 || true
    "$RUNTIME" run -d \
        --name "$CONTAINER_NAME" \
        --restart unless-stopped \
        -p "${PORT}:3000" \
        -v "${DATA_VOLUME}:/app/data" \
        "$IMAGE"
fi

success "Container started."

# ── Wait for health ──────────────────────────────────────────────────────────
info "Waiting for LinkBreeze to start..."
MAX_WAIT=30
for i in $(seq 1 "$MAX_WAIT"); do
    if curl -sf "http://localhost:${PORT}/api/health" >/dev/null 2>&1; then
        success "LinkBreeze is healthy!"
        break
    fi
    if [[ "$i" -eq "$MAX_WAIT" ]]; then
        warn "LinkBreeze didn't respond to health check within ${MAX_WAIT}s."
        warn "It may still be starting. Check: $RUNTIME logs -f $CONTAINER_NAME"
    fi
    sleep 1
done

# ── Systemd service prompt ───────────────────────────────────────────────────
echo ""
if [[ "$EUID" -ne 0 ]] && [[ -z "${SUDO_USER:-}" ]]; then
    # Non-root, no sudo — skip systemd prompt
    info "Run as root (or with sudo) to optionally generate a systemd service."
else
    read -rp $'\033[0;33m?\033[0m  Generate a systemd service so LinkBreeze starts on boot? [y/N] ' SYSTEMD_ANS
    SYSTEMD_ANS="${SYSTEMD_ANS:-N}"
    if [[ "${SYSTEMD_ANS,,}" == "y" ]]; then
        info "Creating systemd service..."

        SERVICE_FILE="/etc/systemd/system/linkbreeze.service"

        # Stop the container — systemd will manage it from here
        "$RUNTIME" stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
        "$RUNTIME" rm "$CONTAINER_NAME" >/dev/null 2>&1 || true

        cat > "$SERVICE_FILE" << EOF
[Unit]
Description=LinkBreeze — Self-hosted link-in-bio
Requires=${RUNTIME}.service
After=${RUNTIME}.service

[Service]
Type=simple
ExecStartPre=-/usr/bin/${RUNTIME} rm -f ${CONTAINER_NAME}
ExecStart=/usr/bin/${RUNTIME} run --name ${CONTAINER_NAME} \\
    --restart no \\
    -p ${PORT}:3000 \\
    -v ${DATA_VOLUME}:/app/data \\
    ${IMAGE}
ExecStop=/usr/bin/${RUNTIME} stop ${CONTAINER_NAME}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

        systemctl daemon-reload
        systemctl enable linkbreeze.service >/dev/null 2>&1
        systemctl start linkbreeze.service

        success "systemd service created and enabled!"
        info "Service file: $SERVICE_FILE"
        info "Commands:"
        echo "    systemctl status linkbreeze"
        echo "    systemctl stop linkbreeze"
        echo "    systemctl restart linkbreeze"
        echo "    journalctl -u linkbreeze -f"
    else
        info "Skipping systemd service. Container will restart via Docker/Podman restart policy."
    fi
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}  ✓ LinkBreeze is live!${NC}"
echo ""
echo -e "  Open:  ${BOLD}http://localhost:${PORT}${NC}"
echo ""
echo -e "  ${BLUE}First time?${NC} The setup wizard will create your admin account."
echo -e "  ${BLUE}Docs:${NC}     https://github.com/Manak-hash/LinkBreeze#readme"
echo ""
