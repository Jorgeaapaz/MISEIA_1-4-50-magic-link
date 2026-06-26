@~/.claude/prompts/new_functionality_prompt_spec.md

# Add Test Coverage Report

## Role
Act as a Software Developer and QA Engineer.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `cq_cobertura_alta`  
Prerequisite: Task `[002]_unit_integration_tests_fn_prompt.md` must be completed first.

The project must report test coverage ≥60% on domain code (lib/ and app/api/). Coverage report must be accessible and referenced in the README.

## Task
1. Install `@vitest/coverage-v8` (if not already installed from task 002).
2. Configure coverage thresholds in `vitest.config.ts`:
   - `lines: 60`, `functions: 60`, `branches: 50`
   - Include: `lib/**/*.ts`, `app/api/**/*.ts`
   - Exclude: `node_modules`, `.next`, `tests/`
3. Add coverage script to `package.json`: `"test:coverage": "vitest run --coverage"`.
4. Generate an HTML + JSON coverage report in `coverage/`.
5. Add `coverage/` to `.gitignore`.
6. Add a coverage badge or summary section to `README.md` showing the coverage percentage.

### Coverage Guidelines
- Coverage report format: `html` (for browsing) + `text-summary` (for CI output)
- Minimum acceptable: 60% line coverage on `lib/` modules
- Include `c8` or `istanbul` provider (v8 is preferred for ESM)

## Output Format
`vitest.config.ts` updated with coverage config:
```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'text-summary', 'html'],
  include: ['lib/**/*.ts', 'app/api/**/*.ts'],
  thresholds: { lines: 60, functions: 60, branches: 50 },
}
```

## Examples and Steps to Follow
1. Update `vitest.config.ts` with coverage block.
2. Run `npm run test:coverage`.
3. Verify coverage output shows ≥60% on lib/ files.
4. Add to `README.md` under "Testing" section: coverage badge or text summary.
5. Commit: `test: add coverage report configuration`.

## Output Checklist and Guardrails
- [ ] `npm run test:coverage` runs without error
- [ ] Coverage report generated in `coverage/` directory
- [ ] lib/ coverage ≥60% lines
- [ ] `coverage/` added to `.gitignore`
- [ ] README updated with coverage info
