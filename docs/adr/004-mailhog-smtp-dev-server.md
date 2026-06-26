# ADR-004: MailHog as Local SMTP Server for Development

**Date:** 2026-04-21  
**Status:** Accepted  
**Deciders:** Jorge Aguilar

## Context

During development, the app sends emails containing magic links. Options:

- **Real SMTP provider** (SendGrid, SES, Mailgun) — requires API keys, may cost money, risk of accidentally emailing real users during testing
- **MailHog** — lightweight Go-based SMTP trap; catches all outgoing emails and displays them in a web UI; never delivers to real recipients
- **Ethereal Email** — online fake SMTP; requires internet access to preview emails

## Decision

Use **MailHog** via Docker as the local SMTP server. The Nodemailer transport points to `localhost:1025` (SMTP) and the web UI is at `http://localhost:8025`.

## Consequences

### Positive
- Zero risk of emailing real users during development or testing
- Web UI at `:8025` makes it easy to inspect the full email HTML and click the magic link without leaving the browser
- Single Docker command to start: `docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog`
- No API keys or external accounts needed

### Negative
- Requires Docker to be running locally (adds a prerequisite for new developers)
- MailHog is no longer actively maintained (last release 2022); Mailpit is a modern drop-in replacement if issues arise

### Neutral
- Production uses a real SMTP provider; the same `SMTP_HOST`/`SMTP_PORT` env vars switch between environments without code changes
