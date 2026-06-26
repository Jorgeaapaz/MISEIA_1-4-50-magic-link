@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Automated Unit and Integration Tests

## Role
Act as a Software Developer and QA Engineer expert in Next.js testing.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `cq_tests_minimos`

The project has zero tests. No test framework is installed. Critical business logic lives in:
- `lib/jwt.ts` — `signToken(payload, expiresIn)`, `verifyToken(token)`
- `lib/mail.ts` — `sendMagicLinkEmail(email, magicLink)`
- `lib/db.ts` — `getDb()` MongoDB singleton
- `app/api/auth/send-magic-link/route.ts` — POST: validates email, upserts user, sends magic link
- `app/api/auth/verify/route.ts` — GET: verifies JWT, returns session token
- `app/api/auth/me/route.ts` — GET: validates session, returns user

## Task
1. Install **Vitest** + `@vitejs/plugin-react` + `@testing-library/react` as devDependencies.
2. Configure `vitest.config.ts` at the project root.
3. Add `"test": "vitest"` and `"test:coverage": "vitest run --coverage"` to `package.json` scripts.
4. Write unit tests for `lib/jwt.ts`:
   - `signToken` returns a string JWT
   - `verifyToken` returns payload for a valid token
   - `verifyToken` throws for an expired token
   - `verifyToken` throws for a tampered token
5. Write unit tests for email format validation in `send-magic-link/route.ts` (mock the db and mail transporter).
6. Write integration tests for API routes using `next/test` utilities or `fetch` against a test Next.js server.

### Test Guidelines
- Mock MongoDB with `mongodb-memory-server` for integration tests
- Mock Nodemailer transport to avoid real SMTP calls (use `jest.mock` or `vi.mock`)
- Set `JWT_SECRET=test-secret` in test environment via `vitest.config.ts`
- Place tests in `__tests__/` directories next to the files they test OR in a root `tests/` folder
- Tests must be runnable with: `npm test`

## Output Format
```
tests/
  unit/
    jwt.test.ts
    send-magic-link.test.ts
  integration/
    verify-route.test.ts
    me-route.test.ts
vitest.config.ts
```

## Examples and Steps to Follow
1. `npm install -D vitest @vitest/coverage-v8 @testing-library/react mongodb-memory-server`
2. Create `vitest.config.ts` with env vars and coverage settings.
3. Write `tests/unit/jwt.test.ts` covering sign/verify happy path and error cases.
4. Write `tests/unit/send-magic-link.test.ts` mocking db and mail, testing email validation.
5. Write integration tests for the API routes.
6. Run `npm test` — all tests must pass.
7. Commit: `test: add unit and integration tests for auth flows`.

## Output Checklist and Guardrails
- [ ] `npm test` runs without errors
- [ ] At least 8 test cases total
- [ ] JWT unit tests cover happy path + 2 error cases
- [ ] send-magic-link test covers valid email and invalid email (400 response)
- [ ] No real MongoDB or SMTP connections in unit tests
- [ ] `npm run lint` still passes after changes
