# ADR-002: Stateless JWT Sessions Instead of Server-Side Session Store

**Date:** 2026-04-21  
**Status:** Accepted  
**Deciders:** Jorge Aguilar

## Context

After a user clicks a magic link, the server must issue a credential that proves identity on subsequent requests. Two main options:

- **Server-side sessions** — server generates a session ID, stores session data in Redis/DB, client sends the ID in a cookie
- **Stateless JWTs** — server signs a self-contained token, client stores it, server verifies the signature on each request (no storage needed)

The project runs as a single Next.js instance and currently has no Redis infrastructure.

## Decision

Use **signed JWTs (HS256)** for session tokens with a 7-day expiry. The token payload contains `{ userId, email, purpose: "session" }`. The `purpose` field prevents a magic-link token from being used as a session token.

## Consequences

### Positive
- Zero additional infrastructure — no Redis, no session store, no sticky sessions
- Horizontally scalable by default — any instance can verify any token
- Self-contained payload means one fewer DB query per authenticated request (for the `/api/auth/me` route we still query to fetch fresh user data)

### Negative
- **No server-side revocation** — a stolen token remains valid until expiry (7 days). Mitigating this requires a token blocklist, which negates the stateless benefit
- Token size (~380 bytes) adds overhead vs a 32-byte session ID on every request
- Secret rotation invalidates all active sessions instantly

### Neutral
- The 7-day window is a deliberate trade-off: long enough to avoid frequent re-logins, short enough to limit exposure if a token is stolen
