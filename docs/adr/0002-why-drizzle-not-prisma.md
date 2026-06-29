# ADR-0002: Use Drizzle ORM instead of Prisma

**Status**: Accepted
**Date**: 2026-06-28

## Context

The project needs a TypeScript ORM for SQLite. The two main candidates are
Prisma and Drizzle.

## Decision

Use **Drizzle ORM**.

## Rationale

- **Performance**: Drizzle generates SQL strings directly with zero engine
  layer. Benchmarks in 2026 show 5-10x faster than Prisma for equivalent queries.
- **No binary engine**: Prisma ships a separate Rust binary (query engine).
  This adds ~40MB to the Docker image and causes compatibility issues with
  Alpine Linux / musl. Drizzle has zero runtime dependencies beyond the DB driver.
- **SQL-native**: Drizzle's API is close to SQL, making it transparent what
  queries are generated. Prisma abstracts SQL away, which can hide performance
  issues (N+1 queries, unnecessary joins).
- **Schema as TypeScript**: The schema is a regular `.ts` file — no separate
  `.prisma` DSL to learn.
- **SQLite-native**: Drizzle has first-class support for better-sqlite3.

## Alternatives Considered

- **Prisma**: Mature, excellent DX, great migrations tooling. But the binary
  engine requirement is a dealbreaker for Alpine Docker images, and the
  abstraction layer hides query performance.
- **Kysely**: Query builder, not an ORM. No schema definition, no migrations.
  Good but requires more boilerplate.
- **Raw SQL**: Maximum performance, zero abstraction. But loses type safety
  and makes the codebase harder for contributors.
