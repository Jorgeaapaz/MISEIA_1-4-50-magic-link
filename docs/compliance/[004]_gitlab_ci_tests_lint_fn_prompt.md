@~/.claude/prompts/new_functionality_prompt_spec.md

# Fix GitLab CI Pipeline — Add Tests and Linter

## Role
Act as a Software Architect and DevOps Engineer expert in GitLab CI/CD.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `cq_ci_funcional`  
Prerequisites: Tasks `[002]` (tests) and `[003]` (coverage) must be completed first.

Current `.gitlab-ci.yml` only runs `npm ci && npm run build`. It does not run lint or tests. The pipeline must also run the linter and test suite on every push.

Use /glab for all GitLab operations.

IMPORTANT: `NODE_ENV=production` must only be set on the `npm run build` command, NOT as a job-level variable. This prevents test runners from switching to production mode and skipping test-related dependencies.

## Task
Update `.gitlab-ci.yml` to add two new stages: `lint` and `test`, before the existing `build` stage.

### GitLab CI Guidelines
- Stages order: `lint` → `test` → `build`
- Use `node:20-alpine` image for all jobs
- Cache `node_modules/` keyed on `package-lock.json` (shared across all jobs)
- `lint` job: runs `npm run lint`
- `test` job: runs `npm test` (must have `CI=true` env var for non-interactive mode)
- `build` job: runs `NODE_ENV=production npm run build` — set NODE_ENV only on this command line, NOT as a job-level `variables:` entry
- All jobs run on `main` and `master` branches
- Add `coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'` regex to the test job to report coverage in GitLab UI
- Artifacts: test job exports `coverage/` for 1 hour; build job exports `.next/` for 1 hour

## Output Format
Updated `.gitlab-ci.yml`:
```yaml
stages:
  - lint
  - test
  - build

.node_cache: &node_cache
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/]

lint:
  stage: lint
  image: node:20-alpine
  <<: *node_cache
  script:
    - npm ci
    - npm run lint
  only: [main, master]

test:
  stage: test
  image: node:20-alpine
  <<: *node_cache
  variables:
    CI: "true"
  script:
    - npm ci
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    paths: [coverage/]
    expire_in: 1 hour
  only: [main, master]

build:
  stage: build
  image: node:20-alpine
  <<: *node_cache
  script:
    - npm ci
    - NODE_ENV=production npm run build
  artifacts:
    paths: [.next/]
    expire_in: 1 hour
  only: [main, master]
```

## Examples and Steps to Follow
1. Read current `.gitlab-ci.yml`.
2. Rewrite it with lint + test + build stages.
3. Verify `npm run lint` works locally (no errors).
4. Verify `npm test` works locally (all tests pass).
5. Commit and push — trigger pipeline and verify all 3 stages pass.
6. Use `/glab` to check pipeline status.

## Output Checklist and Guardrails
- [ ] Three stages: lint, test, build
- [ ] `NODE_ENV=production` is ONLY on the build command line, NOT a job-level variable
- [ ] Tests run with `CI=true`
- [ ] Coverage regex extracts percentage for GitLab UI
- [ ] Pipeline passes on push to master
- [ ] Existing build artifact still exported
