@~/.claude/prompts/new_functionality_prompt_spec.md

# Create Dockerfile and Deploy Instructions

## Role
Act as a Software Architect and DevOps Engineer expert in Docker and Next.js deployment.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Location: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant item: `dc_instrucciones_deploy`

The project has no Dockerfile and no deploy instructions beyond local development. A production-ready Dockerfile is required for:
1. The GitHub Actions CI/CD pipeline (task [005])
2. Enabling `fn_deploy_publico_accesible`

Target infrastructure: Ubuntu VM on GCloud with Docker + Traefik (`miseia-net` network, wildcard `*.deviaaps.com`).

## Task
1. Create a **multistage Dockerfile** for the Next.js app.
2. Create a `docker-compose.deploy.yml` for the production container with Traefik labels.
3. Add a **"Deployment" section** to `README.md` with step-by-step verified instructions.

### Dockerfile Guidelines
- Use multistage build: `builder` stage (install + build) → `runner` stage (production only)
- Base image: `node:20-alpine`
- Enable Next.js standalone output: set `output: 'standalone'` in `next.config.ts`
- Copy only necessary files to runner stage: `.next/standalone/`, `.next/static/`, `public/`
- Run as non-root user (`nextjs` user, uid 1001)
- `EXPOSE 3000`
- `CMD ["node", "server.js"]`

### docker-compose.deploy.yml Guidelines
```yaml
services:
  magik-link:
    image: ghcr.io/<github-user>/magik-link:latest
    container_name: magik-link
    restart: unless-stopped
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_APP_URL=https://magik-link.deviaaps.com
      - SMTP_HOST=mailhog
      - SMTP_PORT=1025
      - NODE_ENV=production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.magik-link.rule=Host(`magik-link.deviaaps.com`)"
      - "traefik.http.routers.magik-link.entrypoints=websecure"
      - "traefik.http.routers.magik-link.tls=true"
      - "traefik.http.routers.magik-link.tls.certresolver=cloudflare"
      - "traefik.http.services.magik-link-svc.loadbalancer.server.port=3000"
    networks:
      - miseia-net

networks:
  miseia-net:
    external: true
```

### next.config.ts Update
Add `output: 'standalone'` to the Next.js config to enable standalone mode for Docker.

### README Deploy Section
Add a `## Deployment` section with:
1. Prerequisites (Docker, env vars)
2. Build image command
3. Run with docker-compose.deploy.yml
4. Verify command (curl or browser)

## Steps to Follow
1. Update `next.config.ts` to add `output: 'standalone'`.
2. Create `Dockerfile` at project root.
3. Create `docker-compose.deploy.yml` at project root.
4. Build locally: `docker build -t magik-link:test .`
5. Run locally: `docker run -p 3000:3000 -e MONGODB_URI=... -e JWT_SECRET=... magik-link:test`
6. Verify app loads at `http://localhost:3000`.
7. Add Deployment section to README.md.
8. Commit: `feat: add Dockerfile and deploy instructions`.

## Output Checklist and Guardrails
- [ ] Dockerfile uses multistage build (builder + runner)
- [ ] Runner stage runs as non-root user
- [ ] `next.config.ts` has `output: 'standalone'`
- [ ] `docker build` succeeds locally
- [ ] App runs in Docker container and login page is accessible
- [ ] `docker-compose.deploy.yml` includes Traefik labels for `magik-link.deviaaps.com`
- [ ] README has verified deploy instructions
