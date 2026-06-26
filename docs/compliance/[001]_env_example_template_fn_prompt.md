@~/.claude/prompts/new_functionality_prompt_spec.md

# Create .env.example Template

## Role
Act as a Software Developer and Security Engineer.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant items: `dc_env_example`, `cq_sin_secretos_en_repo`

The project has a `.env.local` file (gitignored, contains real dev values) but no `.env.example` committed to the repository. This means other developers cloning the repo have no template for the required environment variables.

Required variables (from `.env.local` and `lib/` source files):
- `MONGODB_URI` — MongoDB connection string (used in `lib/db.ts`)
- `JWT_SECRET` — Secret key for signing JWTs (used in `lib/jwt.ts`)
- `NEXT_PUBLIC_APP_URL` — Public app URL for magic link generation (used in `app/api/auth/send-magic-link/route.ts`)
- `SMTP_HOST` — SMTP server host (used in `lib/mail.ts`)
- `SMTP_PORT` — SMTP server port (used in `lib/mail.ts`)

## Task
1. Create `.env.example` at the project root with all required variables, using placeholder (not real) values.
2. Update `README.md` — replace the inline env block in "Environment Variables" section to reference `.env.example` (`cp .env.example .env.local` workflow).
3. Verify `.gitignore` already excludes `.env*` (it does — line 34: `.env*`).

### .env.example Guidelines
- Use clearly fake placeholder values (e.g., `your-jwt-secret-here`, `mongodb://localhost:27017/magiklink`)
- Add a comment line above each variable explaining what it is and where to get it
- Never include real credentials

## Output format
File: `.env.example` at project root  
Format:
```
# Description of the variable
VAR_NAME=placeholder-value
```

## Examples and Steps to Follow
1. Read `lib/db.ts`, `lib/jwt.ts`, `lib/mail.ts`, `app/api/auth/send-magic-link/route.ts` to confirm all env vars used.
2. Create `.env.example` with comments and placeholders.
3. Edit `README.md` to replace the env block with `cp .env.example .env.local` instruction.
4. Commit with message: `docs: add .env.example template`.

## Output Checklist and Guardrails
- [ ] `.env.example` contains all 5 required variables
- [ ] No real secrets in `.env.example`
- [ ] Comments above each variable
- [ ] README updated to reference `.env.example`
- [ ] Tests pass after change (`npm run lint` still works)
