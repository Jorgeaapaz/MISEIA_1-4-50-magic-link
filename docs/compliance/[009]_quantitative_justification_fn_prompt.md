@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Quantitative Justification for Technical Decisions

## Role
Act as a Software Architect and Technical Writer expert in performance analysis.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `dc_justificacion_cuantitativa`

The project must justify at least one technical decision with numbers (benchmarks, latency, cost estimates, or comparisons with alternatives). Currently all justifications are qualitative.

Good candidates for quantitative justification:
1. **JWT size vs cookie overhead** — measure token size in bytes
2. **MongoDB connection pooling** — compare requests/sec with singleton vs per-request connection
3. **Magic link token expiry** — security rationale: probability of brute-force in 15 min window
4. **Next.js standalone Docker image size** — before vs after standalone mode
5. **JWT HS256 signing time** — measured latency for sign/verify operations

## Task
Add a **"Technical Decisions — Quantitative Analysis"** section to `README.md` (or a new file `docs/performance.md`) with at least ONE decision justified with measured or calculated numbers.

### Recommended: JWT Token Size Analysis
Measure and document:
- Magic link JWT size in bytes (header.payload.signature)
- Session JWT size in bytes  
- Cookie alternative size (session ID = 32 bytes)
- Overhead analysis: JWT adds ~300 bytes per request vs 32-byte session cookie
- Trade-off: 300 extra bytes per request → stateless scaling (no Redis/session store needed)

### Benchmarking Guidelines
- Use `crypto.timingSafeEqual` benchmark or simple `Date.now()` wrapping
- Run at least 1000 iterations, report p50/p95 latency
- Document Node.js version and hardware used
- If running a local benchmark: `node scripts/benchmark-jwt.js`

## Output Format
Add to `README.md` or `docs/performance.md`:

```markdown
## Technical Decisions — Quantitative Analysis

### JWT Stateless Sessions vs Server-Side Session Store

| Metric | JWT (this project) | Redis Session Store |
|---|---|---|
| Token size per request | ~380 bytes | 32 bytes (session ID) |
| Server memory per 1000 users | 0 MB | ~15 MB |
| Latency to validate (p50) | ~0.3 ms (HS256 verify) | ~1-2 ms (Redis round-trip) |
| Infrastructure cost | $0 extra | ~$15/mo Redis |
| Horizontal scaling | ✅ Stateless | Requires shared session store |

**Conclusion:** The 350-byte overhead per request (≈ 2.8 KB per 8 API calls per session) is 
justified by eliminating session store infrastructure entirely — a cost-latency trade-off 
appropriate for this project's scale.
```

## Steps to Follow
1. Write a small script `scripts/benchmark-jwt.js` that signs and verifies 10,000 JWTs and prints p50/p95.
2. Run it: `node scripts/benchmark-jwt.js`.
3. Decode a sample JWT to measure byte size.
4. Fill in the table with real measured values.
5. Add section to README.md or create `docs/performance.md`.
6. Commit: `docs: add quantitative justification for JWT vs session store`.

## Output Checklist and Guardrails
- [ ] At least one decision justified with real numbers (measured, not estimated)
- [ ] Numbers are reproducible — include the benchmark script
- [ ] Comparison table with at least one alternative
- [ ] Clear conclusion statement
- [ ] Added to README.md or linked from README.md
