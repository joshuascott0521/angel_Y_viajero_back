# Arquitectura del proyecto - Ángeles Viajeros Backend

## Resumen ejecutivo
Proyecto backend en Node.js + TypeScript diseñado como API REST con soporte de WebSockets. Organizado por módulos (dominios) y con capas separadas para controladores, servicios y repositorios. Incluye integración con Swagger, envío de correos y configuración centralizada de base de datos.

## Stack técnico
- Lenguaje: TypeScript
- Runtime: Node.js
- Framework HTTP: Express (configuración en `src/app.ts` / `src/server.ts`)
- Sockets: Socket.IO o implementación de WebSockets (carpeta `src/sockets/`)
- Documentación API: Swagger (configuración en `src/config/swagger.ts`)
- Envío de correos: módulo `src/config/mailer.ts` y `modules/auth/auth.mail.ts`
- Base de datos: archivo de configuración en `src/config/db.ts` (driver concreto decidido en ese archivo: p. ej. pg, mongoose)
- Autenticación: JWT y middlewares en `src/middlewares/authJwt.ts`
- Manejo de errores: utilidades `src/utils/appError.ts` y `src/utils/httpError.ts` y middleware `src/middlewares/errorHandler.ts`

## Principios de diseño
- Modularidad por dominio: cada carpeta en `src/modules/` agrupa `controller`, `service`, `repo`, `routes`.
- Separación de responsabilidades: controllers (HTTP), services (lógica), repos (persistencia).
- Middlewares reutilizables: autenticación, validación, rate limiting y manejo de errores.
- Tipos extendidos en `src/types/` para adaptar Express y otras librerías a TypeScript.

## Estructura principal (resumen)
- `src/` - Código fuente.
  - `app.ts`, `server.ts` - configuración e inicialización del servidor.
  - `config/` - `db.ts`, `mailer.ts`, `swagger.ts`.
  - `constants/` - constantes globales (ej. `roles.ts`).
  - `middlewares/` - `authJwt.ts`, `errorHandler.ts`, `rateLimitLogin.ts`, `requireRol.ts`.
  - `modules/` - dominios: `auth`, `catalogos`, `chat`, `perfiles`, `recompensas`, `servicios`, `solicitudes`.
    - Cada dominio contiene: `*.controller.ts`, `*.service.ts`, `*.repo.ts`, `*.routes.ts`.
    - `chat/` además contiene `chat.types.ts`.
  - `sockets/` - `index.ts`, `socketAuth.ts` (inicialización y autenticación de sockets).
  - `types/` - `express.d.ts` (extensiones de tipos globales).
  - `utils/` - `appError.ts`, `httpError.ts`.

## Flujos clave
- Autenticación: peticiones pasan por `auth` routes -> `auth.controller` -> `auth.service` -> `auth.repo`. JWT se valida en `authJwt` middleware.
- Peticiones REST: Rutas definidas en cada módulo; la capa de rutas enlaza controllers con `app.ts`.
- WebSockets: Conexión autenticada por `socketAuth.ts` y manejadores en `sockets/index.ts`.

## Archivos y puntos de integración importantes
- `src/app.ts` - configuración de middlewares globales, registro de rutas, Swagger.
- `src/server.ts` - arranque del servidor y (opcional) integración con sockets.
- `src/config/db.ts` - conexión y pool de la base de datos.
- `src/config/mailer.ts` - configuración del servicio de correo.
- `src/config/swagger.ts` - configuración y exposición de documentación OpenAPI/Swagger.
- `src/middlewares/authJwt.ts` - validación de `Authorization: Bearer <token>`.
- `src/sockets/index.ts` - manejadores de eventos en tiempo real.

## Variables de entorno (recomendadas)
- `PORT` - puerto del servidor.
- `NODE_ENV` - entorno (`development|production`).
- `DATABASE_URL` o: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`.
- `JWT_SECRET` - secreto para firmar tokens JWT.
- `JWT_EXPIRES_IN` - tiempo de expiración de tokens.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` - credenciales SMTP.
- `SWAGGER_ENABLED` - activar/desactivar Swagger en entornos.

## Comandos típicos
Revisar `package.json` para confirmar scripts. Comandos esperados:
```bash
npm install
npm run dev       # entorno de desarrollo con recarga (ts-node-dev / nodemon)
npm run build     # compilar TypeScript a JS
npm start         # ejecutar en producción
```

## Despliegue y consideraciones
- Compilar TypeScript antes de desplegar en producción (`npm run build`).
- Usar variables de entorno seguras y un `.env` por entorno; incluir `.env.example` en el repo.
- Asegurar la conexión de la BD con credenciales y TLS si aplica.
- Configurar CORS y límites de peticiones (rate limit) para endpoints sensibles como login.

## Recomendaciones y próximos pasos
1. Añadir `README.md` y `docs/ARCHITECTURE.md` (este archivo) en el repo.
2. Crear `.env.example` con las variables listadas.
3. Verificar `package.json` y añadir scripts si faltan (`dev`, `build`, `start`, `lint`, `test`).
4. Añadir tests unitarios para `services` y tests de integración para rutas críticas.
5. Documentar endpoints más importantes en Swagger (ejemplos de request/response).

---
Archivo generado automáticamente por la documentación de arquitectura.
