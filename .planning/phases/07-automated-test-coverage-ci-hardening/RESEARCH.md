# Phase 7 Research: Automated Test Coverage & CI Hardening

## 1. Current State & Critical Findings

### A. CI Workflow Path Mismatches (`.github/workflows/ci.yml`, `pr-checks.yml`)
- **Issue:** The existing GitHub Actions workflows reference legacy paths before the Python microservice was extracted into `ml-server/`:
  - `cache-dependency-path: server/requirements.txt` fails because `requirements.txt` only exists in `ml-server/`.
  - Python lint (`flake8`, `black`) and compile steps look for `server/*.py`, which contains zero Python files.
  - Test setup references `PYTHON_SERVICE_URL` instead of `ML_SERVER_URL` (which `server/src/index.js` and `services/mlClient.js` consume).
  - Integration test job has `continue-on-error: true`, silently masking test failures in CI.
- **Solution:** Align `.github/workflows/ci.yml` and `pr-checks.yml` to target `ml-server/**`, replace Flask checks with FastAPI/pytest, wire proper environment variables, and eliminate failure suppression.

### B. Backend Test Infrastructure (`server/`)
- **Current Setup:** `server/` has standalone test files (`test-signaling.js`, `test-reports.js`, `test-history.js`, `test-integration.js`) and a Windows batch script (`run-tests.bat`).
- **Gaps:** `server/package.json` lacks a `"test"` script. Running automated tests in CI or Linux requires a cross-platform command (e.g. `npm test`) rather than `.bat` scripts.
- **Solution:** Add a unified Node test runner script in `server/` (e.g., `npm test`) using Node 20's built-in test runner or an automated orchestrator running the test scripts with clear exit code handling.

### C. ML Microservice Testing (`ml-server/`)
- **Current Setup:** FastAPI service with endpoints (`/health`, `/analyze/*`, `/evaluate/*`, `/generate/*`) and audio/scoring services, but zero automated tests.
- **Gaps:** `requirements.txt` lacks test dependencies (`pytest`, `pytest-asyncio`, `httpx`).
- **Solution:**
  - Add `pytest`, `pytest-asyncio`, and `httpx` to `ml-server/requirements.txt` (or dev dependencies).
  - Create `ml-server/tests/`:
    - `test_health.py`: Validates `/health` schema and status indicators.
    - `test_schemas.py`: Validates Pydantic request/response payload schemas.
    - `test_scoring.py`: Unit tests for prosody calculation helpers, text scoring parsing, and fallback handling with synthetic/mock data to run in milliseconds without requiring heavy Whisper GPU weights during CI.

### D. Frontend Unit Testing (`client/`)
- **Current Setup:** Vite 7 + React 19 + TypeScript 5.8 + TanStack Start.
- **Gaps:** `client/package.json` has `lint`, `build`, `dev`, but no `test` script and no test framework installed.
- **Solution:**
  - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` in `client/package.json` devDependencies.
  - Configure `vitest` in `client/vite.config.ts`.
  - Create initial unit tests for critical utilities (`utils.test.ts`), hooks (`useCurrentUser.test.ts`), and key UI components (`LeaveDialog.test.tsx`, `ControlBar.test.tsx`).
  - Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts.

---

## 2. Dependency Decisions & Tool Selection

| Domain | Recommended Tool | Rationale |
|---|---|---|
| **Frontend Tests** | Vitest (`^3.x` / `^2.x`) + `@testing-library/react` | Native Vite integration, fast ESM execution, zero-config TS/JSX support, matches existing Vite setup. |
| **Backend Tests** | Native Node.js test runner (`node --test`) or structured npm test script | Zero additional dependencies for `server/`, utilizes native Node 20 ESM support. |
| **ML Microservice** | Pytest (`^8.x`) + `httpx` | Standard for FastAPI application testing (`fastapi.testclient.TestClient`), async support via `pytest-asyncio`. |
| **CI/CD** | GitHub Actions (`ci.yml`, `pr-checks.yml`) | Fix broken directory paths, matrix checks, and artifact retention. |
