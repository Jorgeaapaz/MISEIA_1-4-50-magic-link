# ADR-005: Next.js App Router over Pages Router

**Date:** 2026-04-21  
**Status:** Accepted  
**Deciders:** Jorge Aguilar

## Context

Next.js 16 ships two routing paradigms:

- **Pages Router** — file-based routing in `pages/`; API routes in `pages/api/`; stable, well-documented, large ecosystem of examples
- **App Router** — file-based routing in `app/`; API routes as Route Handlers; React Server Components by default; streaming; colocated layouts

The project is greenfield, so there is no migration cost.

## Decision

Use the **App Router** (`app/` directory) with React Server Components as the default. Pages that require client interactivity (login form, verify page, dashboard) are explicitly marked `"use client"`. API endpoints are Route Handlers (`export async function GET/POST`).

## Consequences

### Positive
- Aligns with the current Next.js direction (Pages Router is in maintenance mode)
- Server Components reduce client bundle size — layout and static shell ship zero JS
- Colocated layouts (`layout.tsx`) simplify wrapping the entire app in `AuthContext`
- Route Handlers use standard `Request`/`Response` Web APIs, making unit testing straightforward

### Negative
- App Router has more footguns: `async` params, `use client` boundaries, caching behaviour that differs from Pages Router
- Smaller body of Stack Overflow answers and third-party tutorials compared to Pages Router
- Some Next.js middlewares and plugins have not yet been updated for App Router

### Neutral
- The `"use client"` directive is required on all three page components (login, verify, dashboard) since they all use React hooks or browser APIs
