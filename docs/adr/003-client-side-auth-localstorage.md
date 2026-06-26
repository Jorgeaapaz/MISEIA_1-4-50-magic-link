# ADR-003: Client-Side Auth State via localStorage

**Date:** 2026-04-21  
**Status:** Accepted  
**Deciders:** Jorge Aguilar

## Context

The session JWT must be persisted on the client so that the user stays logged in across page refreshes. Two standard options:

- **HttpOnly cookie** — token stored in a cookie inaccessible to JavaScript; server reads it automatically; requires CSRF protection
- **localStorage + React Context** — token stored in browser storage; JavaScript reads it explicitly and attaches it as a `Bearer` header

## Decision

Store the session token in **localStorage** and manage auth state via a React Context (`AuthContext`). The token is sent as `Authorization: Bearer <token>` on API calls.

## Consequences

### Positive
- Simpler implementation — no cookie/CSRF boilerplate needed
- Works seamlessly with Next.js App Router where some pages are client components
- React Context provides a clean, reactive auth state without a global store library

### Negative
- **XSS vulnerability** — any injected script can read localStorage and steal the token. HttpOnly cookies are immune to this attack
- Requires manual token attachment on every fetch call; cookies would be sent automatically
- Token survives browser close but not private/incognito session end (localStorage is cleared on tab close in some browsers)

### Neutral
- Acceptable for this project scope — the app renders no user-supplied HTML and has no rich text editor that could introduce XSS vectors
- For a production financial or healthcare application, HttpOnly cookies with CSRF tokens would be the correct choice
