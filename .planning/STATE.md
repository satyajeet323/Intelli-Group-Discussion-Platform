# Project State

## Current Position
- **Active Milestone:** Milestone 2: Hardening, Test Automation & Scalability
- **Current Phase:** Phase 7: Automated Test Coverage & CI Hardening (Planned)
- **Status:** Phase 7 detailed plans created (.planning/phases/07-automated-test-coverage-ci-hardening/). Structured into Wave 1 (localized test runners for Backend, ML, Frontend) and Wave 2 (CI modernization). Ready for execution.

## Key Decisions & Established Patterns
1. **Multi-Service Architecture:**
   - Client: TanStack Start / React 19 SPA running on port 5173.
   - Server: Node.js Express & Socket.IO running on port 4000.
   - ML Engine: Python FastAPI microservice running on port 8000.
2. **Audio Processing Pipeline:**
   - Client records WebM -> Server proxies to FastAPI -> Whisper STT + FillerCRNN acoustic detection + Librosa prosody -> SBERT semantic similarity + Gemini multi-dimensional evaluation.
3. **Dynamic API Key Management:**
   - Keys (Gemini, Groq, ElevenLabs) are stored encrypted in MongoDB, tracked with latency/error counters, with automatic fallback to .env.
4. **Signaling & WebRTC:**
   - P2P mesh topology managed via Socket.IO events (join-session, webrtc-offer, webrtc-answer, webrtc-ice-candidate).
5. **Testing Approach:**
   - Batch runner un-tests.bat triggers Node integration test scripts (	est-signaling.js, 	est-reports.js, 	est-history.js, 	est-integration.js).

## Outstanding Concerns & Technical Debt
- WebRTC mesh bandwidth limitations for 6+ participants.
- In-memory sessionStore.js vulnerable to process restart.
- Untracked audio files and log files in ml-server/ and client/ directories.
- Need for automated CI/CD pipeline and unit tests across frontend and ML microservice.

## Next Step
- Run `/gsd-execute-phase 7` to execute Wave 1 and Wave 2 plans for Phase 7.
