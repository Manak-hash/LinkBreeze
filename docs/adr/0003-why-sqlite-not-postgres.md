# ADR-0003: Use SQLite instead of PostgreSQL

**Status**: Accepted
**Date**: 2026-06-28

## Context

The database choice for a self-hosted link-in-bio tool must balance:
simplicity of deployment, performance, and scalability path.

## Decision

Use **SQLite** (via better-sqlite3) for v1 and self-hosted instances.

## Rationale

- **Zero configuration**: SQLite is a single file (`linkbreeze.db`). No
  database server to install, configure, or maintain. This is critical for
  the "one Docker command" deployment promise.
- **Performance**: better-sqlite3 uses synchronous native bindings — the
  fastest SQLite driver in the Node.js ecosystem. For read-heavy workloads
  (which a link page is), SQLite with WAL mode handles thousands of
  concurrent readers easily.
- **Docker simplicity**: No multi-container setup. One process, one volume.
  The Docker image stays under 80MB.
- **Portability**: The entire database is one file. Users can back up by
  copying it. No `pg_dump` complexity.
- **Adequate for the workload**: A link page is read-heavy with infrequent
  writes (admin changes links occasionally). SQLite excels at this pattern.

## Migration Path to PostgreSQL

When the hosted (cloud) version launches, the architecture supports switching
to PostgreSQL with minimal changes:

1. Drizzle ORM supports PostgreSQL with the same schema definition pattern
2. Change the driver import and connection string
3. Run `drizzle-kit generate` for PostgreSQL dialect
4. The queries layer abstraction (ADR-0004) means no component changes needed

This decision is **reversible** without rewriting the application.
