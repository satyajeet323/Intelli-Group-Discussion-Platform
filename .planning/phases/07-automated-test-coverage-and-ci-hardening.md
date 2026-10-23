# Phase 7 Execution Plan: Automated Test Coverage & CI Hardening

## Overview
Phase 7 focuses on establishing robust automated testing across all three tiers of the application (Node.js backend/signaling, Python ML microservice, and frontend UI components) and verifying GitHub Actions CI automation.

## Objectives
1. **Consolidate & Expand Node.js Test Suite:** Integrate all existing test scripts (`test-signaling.js`, `test-reports.js`, `test-history.js`, `test-integration.js`) into a unified root `npm test` script in `server/package.json`.
2. **Add Pytest Suite for ML Service:** Implement `ml-server/tests/` with Pytest covering audio schema validation, prosody extraction helpers, filler CRNN classification stubs, and endpoint health checks.
3. **Add Frontend Component Tests:** Set up Vitest and React Testing Library in `client/` to test critical UI components (`ParticipantTile`, `AIPanel`, `ControlBar`, `PeerRatingModal`).
4. **CI & PR Workflow Verification:** Validate GitHub Actions workflows (`ci.yml`, `pr-checks.yml`) and ensure pre-commit/pre-push checks execute successfully.

## Step-by-Step Task Breakdown
- [ ] **Step 7.1:** Update `server/package.json` with unified test runner scripts (`npm test`).
- [ ] **Step 7.2:** Implement Pytest suite in `ml-server/tests/` (`test_audio_schema.py`, `test_scoring.py`, `test_health.py`).
- [ ] **Step 7.3:** Install Vitest and React Testing Library devDependencies in `client/` and add test runner (`npm test`).
- [ ] **Step 7.4:** Write core React component tests in `client/src/__tests__/` (`ParticipantTile.test.tsx`, `ControlBar.test.tsx`).
- [ ] **Step 7.5:** Run full local test validation (Node, Python Pytest, and Frontend Vitest).
- [ ] **Step 7.6:** Update `.planning/STATE.md` to reflect Phase 7 completion and advance to Phase 8.
