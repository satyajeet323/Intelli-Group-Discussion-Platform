# Testing & Verification Guide

## 1. Existing Test Suites & Scripts

The repository contains automated and semi-automated integration scripts situated in `server/` and accessible via the top-level batch script `run-tests.bat`.

### Test Runner: `run-tests.bat`
Executes four automated integration test suites sequentially:
```cmd
run-tests.bat
```
Output summarizes pass/fail exit codes for each test phase:
- Test 1: WebRTC Signaling System (`test-signaling.js`)
- Test 2: Performance Tracking Module (`test-reports.js`)
- Test 3: Session History Module (`test-history.js`)
- Test 4: Full System Integration (`test-integration.js`)

### Specific Test Modules:

1. **`server/test-signaling.js`**
   - **Scope:** Verifies the real-time Socket.IO signaling workflow.
   - **Checks:**
     - Simulates multi-peer connection establishment.
     - Tests `join-session`, `webrtc-offer`, `webrtc-answer`, and `webrtc-ice-candidate` exchange.
     - Tests media state toggles (`toggle-media`) and chat messaging (`chat-message`).
     - Validates session roster synchronization and departure handling.

2. **`server/test-reports.js`**
   - **Scope:** Evaluates score aggregation and report generation.
   - **Checks:**
     - Tests `POST /api/reports/:id` with participant turn data.
     - Tests turn updates via `PATCH /api/reports/:id/turn`.
     - Validates leaderboard calculations and summary statistics.

3. **`server/test-history.js`**
   - **Scope:** Validates session history storage and query capabilities.
   - **Checks:**
     - Paginated retrieval (`GET /api/history`).
     - Search filters by topic, date, and participant count (`GET /api/history/search`).
     - User performance trend analytics (`GET /api/history/stats`).

4. **`server/test-integration.js`**
   - **Scope:** End-to-end multi-module verification.
   - **Checks:**
     - User registration and JWT login.
     - Session creation and room validation (`/api/sessions/:id/validate`).
     - Socket.IO connection authenticated with JWT.
     - End-of-session reporting and cleanup.

5. **`server/test-auth.ps1`**
   - **Scope:** PowerShell script for manual verification of auth endpoints.
   - **Checks:**
     - Tests registration, login, profile retrieval (`/api/auth/me`), and invalid token rejection.

## 2. ML Service Health Verification
- **Liveness probe:** `GET http://localhost:8000/health`
  - Validates that Whisper, FillerCRNN weights (`filler_crnn_final.pth`), and Sentence-Transformers are properly loaded in memory.
- **Node-to-ML Proxy probe:** `GET http://localhost:4000/api/fluency/health`

## 3. Testing Gaps & Recommendations
- **Frontend Unit Tests:** Currently missing component-level tests (e.g., with Vitest and React Testing Library) for `ParticipantTile`, `AIPanel`, and `ControlBar`.
- **Python ML Tests:** No `pytest` suite for `ml-server/` testing audio segment slicing, Mel-spectrogram calculation, and SBERT scoring in isolation.
- **End-to-End Browser Tests:** WebRTC mesh and media stream negotiation should be tested with headless browsers (Playwright) to verify audio/video track lifecycle.
- **Continuous Integration (CI):** GitHub Actions workflow should be configured to run linting and integration tests on pull requests.
