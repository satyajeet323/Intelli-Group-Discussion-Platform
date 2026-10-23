---
phase: 7
title: Automated Test Coverage & CI Hardening
status: planned
plans:
  - 07-01-PLAN.md
  - 07-02-PLAN.md
  - 07-03-PLAN.md
  - 07-04-PLAN.md
waves:
  - wave: 1
    plans: [07-01, 07-02, 07-03]
    description: Build localized test runners and suites for Backend, ML microservice, and Frontend in parallel.
  - wave: 2
    plans: [07-04]
    description: Modernize and harden GitHub Actions CI/PR workflows to execute all test suites with strict gates.
---

# Phase 7: Automated Test Coverage & CI Hardening

## Overview
Phase 7 elevates the INTELLI BOT platform from individual manual testing scripts to a unified, multi-layer automated testing ecosystem backed by continuous integration.

## Wave Execution Structure

```mermaid
graph TD
    subgraph Wave 1: Layered Test Suites
        W1A["07-01: Backend Test Runner<br/>(npm test consolidation)"]
        W1B["07-02: FastAPI ML Pytest Suite<br/>(health, schemas, scoring)"]
        W1C["07-03: Frontend Vitest Suite<br/>(utils, UI, LeaveDialog)"]
    end

    subgraph Wave 2: CI Pipeline Hardening
        W2["07-04: GitHub Actions Modernization<br/>(fix ci.yml & pr-checks.yml)"]
    end

    W1A --> W2
    W1B --> W2
    W1C --> W2
```

## Detailed Plan Summary

### Wave 1 (Parallel Independent Suites)
- **[07-01-PLAN.md](file:///c:/Users/sattu/Documents/Programing%20Coding/SkillvSyncGD/RoxGD/.planning/phases/07-automated-test-coverage-ci-hardening/07-01-PLAN.md):**
  Consolidates `test-signaling.js`, `test-reports.js`, `test-history.js`, and `test-integration.js` into a cross-platform ESM runner in `server/package.json` callable via `npm test`.
- **[07-02-PLAN.md](file:///c:/Users/sattu/Documents/Programing%20Coding/SkillvSyncGD/RoxGD/.planning/phases/07-automated-test-coverage-ci-hardening/07-02-PLAN.md):**
  Adds `pytest`, `pytest-asyncio`, and `httpx` to `ml-server/` with automated tests covering `/health`, Pydantic schemas, and audio prosody calculations.
- **[07-03-PLAN.md](file:///c:/Users/sattu/Documents/Programing%20Coding/SkillvSyncGD/RoxGD/.planning/phases/07-automated-test-coverage-ci-hardening/07-03-PLAN.md):**
  Introduces Vitest and React Testing Library to `client/`, adding unit tests for utility functions and UI components with `npm test`.

### Wave 2 (Orchestration & Verification)
- **[07-04-PLAN.md](file:///c:/Users/sattu/Documents/Programing%20Coding/SkillvSyncGD/RoxGD/.planning/phases/07-automated-test-coverage-ci-hardening/07-04-PLAN.md):**
  Remedies legacy paths in `.github/workflows/ci.yml` and `pr-checks.yml`, wires all test suites into CI gates, maps correct environment variables (`ML_SERVER_URL`), and disables failure masking.

## Success Criteria
- [ ] Backend: `cd server && npm test` runs and passes.
- [ ] ML Service: `cd ml-server && pytest` runs and passes.
- [ ] Frontend: `cd client && npm test` runs and passes.
- [ ] CI: `.github/workflows/ci.yml` and `pr-checks.yml` validate clean with no dead path references.
