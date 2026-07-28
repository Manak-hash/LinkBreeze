# ─── Build Stage ───────────────────────────────────────
FROM node:22-alpine AS builder

# Native build tools for better-sqlite3 (compiles from source on Alpine/musl)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx next build

# ─── Runner Stage ──────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/app/data/linkbreeze.db

# Create data directory as root BEFORE switching to node user
RUN mkdir -p /app/data && chown node:node /app/data

# Copy built app with correct ownership
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Switch to non-root user
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:3000/api/health || exit 1

# Override Docker's HOSTNAME so Next.js binds to 0.0.0.0
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node server.js"]
