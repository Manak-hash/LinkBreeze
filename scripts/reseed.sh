#!/bin/bash
# Quick reseed: run migrations + seed-demo in one go
set -e
cd "$(dirname "$0")/.."
source ~/.nvm/nvm.sh

echo "→ Removing old DB..."
rm -f data/linkbreeze.db data/linkbreeze.db-wal data/linkbreeze.db-shm

echo "→ Running migrations..."
npx tsx -e "
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
const sqlite = new Database('data/linkbreeze.db');
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: 'src/db/migrations' }).then(() => {
  console.log('✓ Migrations done');
  sqlite.close();
});
"

echo "→ Seeding demo data..."
npx tsx src/scripts/seed-demo.ts
