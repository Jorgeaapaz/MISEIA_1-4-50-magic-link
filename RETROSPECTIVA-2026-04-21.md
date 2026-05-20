# Retrospectiva de Sesion — 2026-04-21
### Sistema de Autenticacion Magic Link con Next.js 16, MongoDB y MailHog

## Resumen / Overview
Se construyo desde cero un sistema completo de autenticacion por magic link sobre un proyecto Next.js 16.2.4 recien creado. El sistema permite a los usuarios iniciar sesion introduciendo su email, recibir un enlace magico por correo (via MailHog), y al hacer clic obtener un JWT de sesion almacenado en localStorage. El build compila correctamente sin errores.

## Proceso de instalacion / Installation

### 1. Dependencias del proyecto
```bash
npm install mongodb jsonwebtoken nodemailer
npm install -D @types/jsonwebtoken @types/nodemailer
```

### 2. Variables de entorno (`.env.local`)
```env
MONGODB_URI=mongodb://localhost:27017/magiklink
JWT_SECRET=magik-link-dev-secret-2024
NEXT_PUBLIC_APP_URL=http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1027
```

### 3. Prerequisitos externos
- **MongoDB**: instalado y corriendo en local en `localhost:27017`
- **MailHog**: corriendo en Docker con puerto host `1027` mapeado al puerto contenedor `1025` (SMTP). UI web en `http://localhost:8025`

## Archivos creados y modificados / Files Created & Modified

### Nuevos (11 archivos)
| Archivo | Descripcion |
|---------|-------------|
| `.env.local` | Variables de entorno (MongoDB, JWT, SMTP) |
| `lib/db.ts` | Conexion singleton a MongoDB con cache en globalThis para hot-reload |
| `lib/jwt.ts` | Helpers para firmar y verificar JWT (signToken, verifyToken) |
| `lib/mail.ts` | Transporter de nodemailer configurado para MailHog |
| `app/api/auth/send-magic-link/route.ts` | POST: valida email, upsert usuario, genera JWT magic-link, envia email |
| `app/api/auth/verify/route.ts` | GET: verifica JWT magic-link, crea JWT de sesion, retorna token |
| `app/api/auth/me/route.ts` | GET: valida JWT de sesion, retorna datos del usuario |
| `context/AuthContext.tsx` | Provider de React Context para estado de autenticacion |
| `app/login/page.tsx` | Pagina de login con formulario de email |
| `app/auth/verify/page.tsx` | Pagina que procesa el magic link y almacena el JWT en localStorage |
| `app/dashboard/page.tsx` | Pagina protegida con info del usuario y boton de logout |

### Modificados (2 archivos)
| Archivo | Cambio |
|---------|--------|
| `app/layout.tsx` | Agregado AuthProvider, actualizado metadata (titulo y descripcion) |
| `app/page.tsx` | Reemplazado template por redirect a /dashboard o /login segun auth |

## Arquitectura / Architecture

### Flujo JWT (dos tokens)
- **Magic Link Token**: `{ email, purpose: "magic-link" }` — expira en 15 minutos
- **Session Token**: `{ userId, email, purpose: "session" }` — expira en 7 dias
- El campo `purpose` previene el uso cruzado de tokens

### Coleccion MongoDB: `users`
```
{ _id: ObjectId, email: string (unique index), createdAt: Date, lastLoginAt: Date | null }
```
Auto-registro: la primera solicitud de magic link crea el usuario automaticamente via upsert.

### Flujo end-to-end
1. Usuario ingresa email en `/login` → POST `/api/auth/send-magic-link`
2. Servidor crea JWT magic-link, envia email via MailHog (SMTP localhost:1027)
3. Usuario abre MailHog UI (`http://localhost:8025`), clic en el enlace
4. Navegador va a `/auth/verify?token=<jwt>`
5. Pagina cliente llama GET `/api/auth/verify?token=<jwt>` → recibe JWT de sesion
6. Cliente guarda JWT en localStorage, redirige a `/dashboard`
7. Dashboard lee estado auth del contexto, muestra info del usuario

## Levantar y detener la aplicacion / Running & Stopping

### Iniciar
```bash
# 1. Asegurarse que MongoDB esta corriendo localmente
# 2. Asegurarse que MailHog esta corriendo en Docker (puerto 1027:1025)
# 3. Iniciar la app
cd D:/Master-IA-Dev/04-Bloque4/1-4-50-magic-link/magik-link
npm run dev
```

### Detener
```bash
# Ctrl+C en la terminal donde corre npm run dev
```

### Probar endpoints con curl
```bash
# Enviar magic link
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verificar token (copiar token del email en MailHog)
curl "http://localhost:3000/api/auth/verify?token=<TOKEN_DEL_EMAIL>"

# Obtener datos del usuario autenticado
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <SESSION_TOKEN>"
```

## URLs de prueba / Test URLs
| URL | Descripcion |
|-----|-------------|
| `http://localhost:3000` | Pagina raiz (redirige a login o dashboard) |
| `http://localhost:3000/login` | Formulario de inicio de sesion |
| `http://localhost:3000/dashboard` | Dashboard protegido del usuario |
| `http://localhost:8025` | MailHog Web UI (ver emails enviados) |

## Problemas encontrados / Problems & Solutions
| Problema | Solucion |
|----------|----------|
| Error de tipos en `jwt.sign()` — el parametro `expiresIn` como string no era compatible con la firma de tipos de `@types/jsonwebtoken` | Se tipio explicitamente `options` como `SignOptions` y se uso cast `as SignOptions["expiresIn"]` para el valor de expiresIn |

## Resultados y conclusiones / Results & Conclusions
- El proyecto compila exitosamente con `next build` (Turbopack) sin errores de TypeScript
- Se respetaron las convenciones de Next.js 16: params como Promises async, route handlers con `Request`/`Response`, Server Components por defecto, `'use client'` donde se necesita interactividad
- La proteccion de rutas es client-side (localStorage + AuthContext) — adecuada para esta aplicacion
- Stack minimalista: solo 3 dependencias de produccion adicionales (mongodb, jsonwebtoken, nodemailer)
- Para produccion se deberia cambiar `JWT_SECRET` por un valor seguro y considerar proteccion server-side adicional
