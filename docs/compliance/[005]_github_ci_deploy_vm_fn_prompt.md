@~/.claude/prompts/new_functionality_prompt_spec.md

# Create a Github CI/CD Pipeline and Deploy App to VM at Google Cloud

## Role
Act as a Software Architect, you are an expert in Github and Google Cloud Services

## Task
Create Github actions that allows to compile and deploy the app to `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186` in the directory ~/MISEIA150_magik-link. Test and build must be done in a GitHub Actions. The service must be created in the remote ubuntu VM in Docker.

The app must be accessible through Traefik using the domain magik-link.deviaaps.com, port 30001, use the traefik wildcard *.deviaaps.com.

Use /gh and gcloud for all secrets required.

## Context
Project: **Magik Link** — Next.js 16 passwordless auth system.  
Local path: `D:\Master-IA-Dev\04-Bloque4\1-4-50-magic-link\magik-link`  
Non-compliant items: `cq_ci_funcional`, `fn_deploy_publico_accesible`  
Prerequisite: Task `[007]_dockerfile_deploy_instructions_fn_prompt.md` must be completed first (Dockerfile needed).

VM Infrastructure details:
- **SSH:** `ssh -i C:\ubuntuiso\.ssh\vboxuser gcvmuser@34.174.56.186`
- **Deploy dir:** `~/MISEIA150_magik-link`
- **Docker network:** `miseia-net` (already running with Traefik)
- **Traefik domain:** `magik-link.deviaaps.com`
- **App port (internal):** 3000 (Next.js default)
- **Traefik host port:** 30001

Environment variables needed on the VM container:
- `MONGODB_URI=mongodb://mongodb:27017/magiklink` (uses existing mongodb container on miseia-net)
- `JWT_SECRET` (from GitHub secret)
- `NEXT_PUBLIC_APP_URL=https://magik-link.deviaaps.com`
- `SMTP_HOST=mailhog` (uses existing mailhog container on miseia-net)
- `SMTP_PORT=1025`

### GitHub Actions Guidelines
- Trigger: push to `main`/`master` branch
- Steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies (`npm ci`)
  4. Run linter (`npm run lint`)
  5. Run tests (`npm test` with `CI=true`)
  6. Build Next.js (`NODE_ENV=production npm run build`)
  7. Build Docker image and push to GitHub Container Registry (ghcr.io)
  8. SSH into VM and deploy: pull new image, recreate container with Traefik labels

### Docker Compose / Container Labels for Traefik
The deployed container must include these Traefik labels:
```yaml
- "traefik.enable=true"
- "traefik.http.routers.magik-link.rule=Host(`magik-link.deviaaps.com`)"
- "traefik.http.routers.magik-link.entrypoints=websecure"
- "traefik.http.routers.magik-link.tls=true"
- "traefik.http.routers.magik-link.tls.certresolver=cloudflare"
- "traefik.http.services.magik-link-svc.loadbalancer.server.port=3000"
- "traefik.docker.network=miseia-net"
networks:
  - miseia-net
```

### Secrets to Configure via GitHub CLI (`/gh` + `gcloud`)
```bash
# SSH private key (from C:\ubuntuiso\.ssh\vboxuser)
gh secret set VM_SSH_KEY < C:\ubuntuiso\.ssh\vboxuser

# VM connection
gh secret set VM_HOST --body "34.174.56.186"
gh secret set VM_USER --body "gcvmuser"

# App secrets
gh secret set JWT_SECRET --body "your-production-secret"
gh secret set MONGODB_URI --body "mongodb://mongodb:27017/magiklink"
```

## Steps to Follow
1. Ensure Dockerfile exists (task [007]).
2. Create `.github/workflows/ci-deploy.yml`.
3. Configure GitHub secrets with `/gh` CLI.
4. Push to master — verify Actions run all steps green.
5. Verify `https://magik-link.deviaaps.com` is accessible.
6. Update README.md with the public URL.

## Output Checklist and Guardrails
- [ ] GitHub Actions workflow runs lint, test, build before deploy
- [ ] Docker image pushed to ghcr.io on successful build
- [ ] Container deployed to VM with correct Traefik labels
- [ ] `https://magik-link.deviaaps.com` resolves and shows login page
- [ ] README updated with public deploy URL
- [ ] All GitHub secrets set via gh CLI (no hardcoded values in workflow)
- [ ] `NODE_ENV=production` only on the build step
