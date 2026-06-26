@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Architecture Decision Records (ADRs)

## Role
Act as a Software Architect expert in documentation and system design.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `dc_adrs_o_decision_log`

The project has good design pattern documentation in README.md but lacks formal Architecture Decision Records (ADRs). ADRs capture the **context**, **decision**, and **consequences** for each key architectural choice.

Existing design decisions to formalize (from README.md and RETROSPECTIVA):
1. MongoDB as database (vs PostgreSQL/SQLite)
2. Stateless JWT sessions (vs server-side sessions)
3. Client-side auth state with localStorage (vs HttpOnly cookies)
4. MailHog as SMTP dev server (vs real SMTP in dev)
5. Next.js App Router (vs Pages Router)

## Task
Create an ADR directory and write formal ADRs for at least 3 key decisions.

### ADR File Naming Convention
`docs/adr/NNN-short-title.md` where NNN is a zero-padded 3-digit number.

### ADR Template
```markdown
# ADR-NNN: Title

**Date:** YYYY-MM-DD  
**Status:** Accepted | Proposed | Deprecated | Superseded  
**Deciders:** [author]

## Context
What is the background and problem this decision addresses?

## Decision
What was decided?

## Consequences
### Positive
- ...

### Negative
- ...

### Neutral
- ...
```

## Output Format
Create these files:
```
docs/adr/
  001-mongodb-as-database.md
  002-stateless-jwt-sessions.md
  003-client-side-auth-localstorage.md
  004-mailhog-smtp-dev-server.md
  005-nextjs-app-router.md
```

Add to `README.md` a link to the ADR directory: `See [Architecture Decision Records](docs/adr/) for key design decisions.`

## Examples and Steps to Follow
1. Create `docs/adr/` directory.
2. Write ADR-001 for MongoDB: context = need for flexible schema + existing driver familiarity; decision = MongoDB 7; consequences = great for document-shaped user data, but no ACID multi-document transactions.
3. Write ADR-002 for stateless JWT: context = simplicity, horizontal scaling; decision = JWT signed with HS256; consequences = no server-side revocation without token blacklist.
4. Write ADR-003 for localStorage: context = simple implementation; decision = localStorage for session token; consequences = XSS risk vs HttpOnly cookie; acceptable for project scope.
5. Write ADR-004 and ADR-005 similarly.
6. Add link to ADRs in README.md.
7. Commit: `docs: add architecture decision records`.

## Output Checklist and Guardrails
- [ ] At least 3 ADR files created in `docs/adr/`
- [ ] Each ADR has Context, Decision, Consequences (positive AND negative)
- [ ] Status field set to "Accepted" for implemented decisions
- [ ] README.md links to the ADR directory
- [ ] ADR-002 explicitly mentions the XSS risk trade-off for localStorage
- [ ] ADR-002 (JWT) mentions the token revocation limitation
