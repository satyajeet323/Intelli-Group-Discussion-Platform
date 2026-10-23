# Code Conventions & Best Practices

## 1. Frontend Conventions (`client/`)
- **Language:** TypeScript with strict type checking enabled in `tsconfig.json`.
- **Component Pattern:** Functional components using React 19 hooks. Component filenames use PascalCase (e.g., `ParticipantTile.tsx`, `ControlBar.tsx`).
- **Routing:** TanStack Router file-based routing with explicit `createFileRoute`. Route files use lowercase kebab-case or special TanStack symbols (e.g., `group-session_.$sessionId.tsx`).
- **Styling Architecture:**
  - TailwindCSS v4 with `@tailwindcss/vite`.
  - CSS Custom Properties for theming (`--ib-bg`, `--ib-fg`, `--ib-card`, `--ib-amber`, `--ib-border`) defined in `client/src/styles.css`.
  - Dynamic light/dark theme support via `useTheme` hook modifying the root HTML class or dataset.
  - Class consolidation via `clsx` and `tailwind-merge` through the `cn(...)` utility helper (`client/src/lib/utils.ts`).
- **State & Data Fetching:**
  - TanStack React Query for server-state caching and invalidation.
  - React Hook Form paired with Zod schemas for form inputs and client validation.
- **Error Boundaries:** Custom `DefaultErrorComponent` in `client/src/router.tsx` to handle uncaught component errors without crashing the entire app.

## 2. Backend Conventions (`server/`)
- **Module System:** Native ECMAScript Modules (`import` / `export`) with `"type": "module"` in `package.json`.
- **API Style:** RESTful JSON endpoints with semantic HTTP status codes:
  - `200 OK` / `201 Created` for successful operations.
  - `400 Bad Request` for schema/validation errors.
  - `401 Unauthorized` / `403 Forbidden` for auth issues.
  - `404 Not Found` for nonexistent entities.
  - `429 Too Many Requests` when rate limits are exceeded.
  - `500 Internal Server Error` / `502 Bad Gateway` for unexpected exceptions or ML microservice failures.
- **Request Tracing:** `requestLogger` middleware assigns a unique `req.requestId` to each inbound HTTP request for correlation across logs.
- **Validation:** Input payload validation using `express-validator` on critical routes.
- **Database Modeling:**
  - Mongoose schemas in `server/src/models/` using timestamps (`{ timestamps: true }`).
  - Pre-save hooks for password hashing using `bcryptjs`.
  - Sensitive fields (such as `password`) stripped before sending user responses.
- **Security & Secrets:**
  - API keys stored securely in MongoDB via `apiKeyService.js` with fallback to process environment variables.
  - Strict rate limiting on write-heavy or sensitive paths (`/api/auth/register`, `/api/auth/login`).

## 3. Machine Learning Microservice Conventions (`ml-server/`)
- **Language & Style:** Python 3.10+ adhering to PEP 8 standards.
- **Type Annotations:** Pydantic models in `schemas/` for all request bodies and response contracts.
- **Service Layer Pattern:** Clean separation between endpoint routers (`routes/`) and business/model logic (`services/`).
- **Error Handling:** Centralized `@app.exception_handler(Exception)` logging traceback and returning structured JSON `{ "error": str(exc) }`.
- **Audio Processing:**
  - Temporary files placed in designated folders (`temp/`, `temp_audio/`, `segments_temp/`).
  - Audio files always normalized to 16 kHz mono WAV prior to model inference.
  - Automatic cleanup of intermediate audio buffers to prevent disk leaks.

## 4. Git & Branching Conventions
- **Branches:** Feature/developer branches (e.g., `satyajeet`), `staging`, and `main`/production.
- **Releases:** Automated changelog and version tagging configured via `.release-please-config.json` and `.release-please-manifest.json`.
