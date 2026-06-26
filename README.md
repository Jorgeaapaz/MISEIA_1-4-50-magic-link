# Magik Link — Passwordless Authentication System

A **Next.js 16 / TypeScript** full-stack web application that implements **passwordless authentication via magic links** — users log in by clicking a time-limited link sent to their email, with no password required.

---

## Features Implemented

### 1. Magic Link Generation & Email Delivery
Users submit their email on the login page. The API generates a signed JWT (15-minute expiry) and sends a clickable magic link via Nodemailer to the user's inbox. MailHog is used as the local SMTP capture server during development.

### 2. Token Verification & Session Management
When the user clicks the link, the `/auth/verify` page calls the API to validate the JWT. On success, a longer-lived session token (7-day expiry) is issued and stored in `localStorage`. The user is then redirected to the protected dashboard.

### 3. Protected Dashboard & Auth Context
A React Context (`AuthContext`) manages auth state across the app — persisting the session token, syncing with the server on load via `/api/auth/me`, and providing login/logout helpers. The dashboard displays user details (email, member since, last login) and is inaccessible to unauthenticated users.

---

## Project Structure

```
magik-link/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── send-magic-link/route.ts  # POST — generates & emails the magic link JWT
│   │       ├── verify/route.ts           # GET  — validates token, returns session JWT
│   │       └── me/route.ts               # GET  — returns current authenticated user
│   ├── auth/
│   │   └── verify/page.tsx              # Handles link click, calls verify API, redirects
│   ├── dashboard/page.tsx               # Protected page showing user session info
│   ├── login/page.tsx                   # Email input form to request a magic link
│   ├── layout.tsx                       # Root layout wrapping AuthContext provider
│   └── page.tsx                         # Root redirect (→ login or dashboard)
├── context/
│   └── AuthContext.tsx                  # Global auth state, token persistence, useAuth hook
├── lib/
│   ├── db.ts                            # MongoDB singleton connection with pooling
│   ├── jwt.ts                           # JWT sign/verify helpers (magic link + session)
│   └── mail.ts                          # Nodemailer transport and magic link email template
├── .env.local                           # Local environment variables (not committed)
├── .gitlab-ci.yml                       # GitLab CI pipeline (build on main/master)
├── next.config.ts                       # Next.js configuration
└── tsconfig.json                        # TypeScript strict-mode configuration
```

---

## Design Patterns / Architecture

- **Singleton (Database connection)** — `lib/db.ts` maintains a single MongoDB client instance across hot-reloads in development and across requests in production, preventing connection exhaustion.
- **Repository / Service Layer** — Business logic (token creation, email dispatch, user upsert) is isolated in `lib/` modules and consumed by thin API route handlers in `app/api/`.
- **Context + Provider (Auth State)** — `AuthContext.tsx` implements the React Context pattern to share auth state across the component tree without prop drilling.
- **Stateless JWT Sessions** — No server-side session store. The session token is self-contained (signed, typed payload) and verified on each protected request, enabling horizontal scaling.

---

## How It Works

The user submits their email → the server creates a short-lived signed JWT and sends it as a URL parameter in an email → the user clicks the link, the token is verified server-side and exchanged for a long-lived session JWT → the session token is stored client-side and sent with every subsequent request to authenticate the user.

```typescript
// lib/jwt.ts — sign a magic link token (15 min) or session token (7 days)
export function signToken(payload: object, expiresIn: string = '15m'): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn });
}

// app/api/auth/send-magic-link/route.ts — core flow
const token = signToken({ email }, '15m');
const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
await sendMagicLinkEmail(email, magicLink);
```

---

## Architecture

### System Components

```mermaid
graph TD
    subgraph Browser["Browser (Client)"]
        LP[Login Page]
        VP[Verify Page]
        DP[Dashboard Page]
        AC[AuthContext\nLocalStorage]
    end

    subgraph AppRouter["Next.js App Router (Server)"]
        SML["POST /api/auth/send-magic-link"]
        VER["GET /api/auth/verify"]
        ME["GET /api/auth/me"]
    end

    subgraph ServiceLayer["Service Layer — lib/"]
        JWT[jwt.ts\nsignToken · verifyToken]
        MAIL[mail.ts\nsendMagicLinkEmail]
        DB[db.ts\nMongoDB singleton]
    end

    MongoDB[(MongoDB\nusers collection)]
    MailHog[MailHog\nSMTP]

    LP -->|POST email| SML
    SML --> JWT
    SML --> MAIL
    SML --> DB
    MAIL --> MailHog
    VP -->|GET token| VER
    VER --> JWT
    VER --> DB
    DP -->|GET session| ME
    ME --> JWT
    ME --> DB
    DB <--> MongoDB
    AC --> ME
```

### Magic Link Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant LP as Login Page
    participant API as send-magic-link API
    participant MH as MailHog
    participant VP as Verify Page
    participant VAPI as verify API
    participant DP as Dashboard

    User->>LP: enters email
    LP->>API: POST /api/auth/send-magic-link
    API->>API: validate email, upsert user in MongoDB
    API->>API: sign JWT (15 min, purpose: magic-link)
    API->>MH: send email with magic link URL
    MH-->>User: email delivered
    User->>VP: clicks magic link /auth/verify?token=...
    VP->>VAPI: GET /api/auth/verify?token=...
    VAPI->>VAPI: verify JWT signature & expiry
    VAPI->>VAPI: check purpose === "magic-link"
    VAPI->>VAPI: update lastLoginAt in MongoDB
    VAPI->>VAPI: sign session JWT (7 days, purpose: session)
    VAPI-->>VP: { token: sessionJWT, user }
    VP->>VP: store token in localStorage
    VP->>DP: redirect to /dashboard
    DP->>DP: display user info from AuthContext
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** running locally (default: `mongodb://localhost:27017`)
- **MailHog** for email capture in development

Install MailHog (Go required, or use Docker):
```bash
# Docker (recommended)
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### Clone & Install

```bash
git clone https://gitlab.codecrypto.academy/jorgeaapaz/MISEIA_1-4-50-magic-link.git
cd MISEIA_1-4-50-magic-link
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/magiklink` |
| `JWT_SECRET` | Secret for signing JWTs | run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_APP_URL` | Public app URL for magic links | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host | `localhost` (MailHog) |
| `SMTP_PORT` | SMTP server port | `1025` (MailHog default) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The MailHog web UI is available at [http://localhost:8025](http://localhost:8025) to inspect outgoing emails.

---

## Example Flows

### Success — Login with magic link

1. Navigate to `http://localhost:3000/login`
2. Enter your email and click **Send Magic Link**
3. Open MailHog at `http://localhost:8025` — find the email and click the link
4. You are redirected to `/dashboard` showing:
   ```
   Welcome back, user@example.com
   Member since: 2026-05-20
   Last login: just now
   ```

### Edge Case — Expired token

If the magic link is clicked after 15 minutes, the verify page displays:
```
Invalid or expired link. Please request a new one.
```
The user is redirected back to `/login` to request a fresh link.

### Edge Case — Already authenticated

If a logged-in user navigates to `/login`, the `AuthContext` detects a valid session token and immediately redirects them to `/dashboard`.

---

## CI/CD

GitLab CI runs on every push to `main`/`master`:

```yaml
# .gitlab-ci.yml
build:
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths: [.next/]
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Database | MongoDB 7 |
| Auth tokens | jsonwebtoken 9 |
| Email | Nodemailer 8 + MailHog (dev) |
| CI | GitLab CI (node:20-alpine) |
