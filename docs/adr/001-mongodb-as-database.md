# ADR-001: MongoDB as the Primary Database

**Date:** 2026-04-21  
**Status:** Accepted  
**Deciders:** Jorge Aguilar

## Context

The magic link auth system needs to persist user records (email, createdAt, lastLoginAt). The schema is simple and unlikely to require complex relational joins. The project stack is Node.js/Next.js and the team is already familiar with the MongoDB Node.js driver.

Alternatives considered:
- **PostgreSQL** — strong ACID, typed schema, requires SQL knowledge and schema migrations
- **SQLite** — zero-config, file-based, but poor concurrency and no hosted cloud option
- **MongoDB** — flexible document model, native JS objects, rich Node.js driver

## Decision

Use **MongoDB 7** with the official Node.js driver (no ODM layer). A single `users` collection holds user documents with a unique index on `email`.

## Consequences

### Positive
- No schema migrations needed for document shape changes
- Native BSON types map directly to JS objects (dates, ObjectIds)
- Upsert semantics (`updateOne` with `upsert: true`) simplify auto-registration
- Single-collection model is easy to reason about at this scale

### Negative
- No ACID multi-document transactions (not needed here, but limits future complexity)
- No enforced schema at the database level — invalid documents can be inserted without application validation
- Horizontal sharding requires careful shard key design if scale grows

### Neutral
- The unique index on `email` provides the same uniqueness guarantee as a SQL UNIQUE constraint
