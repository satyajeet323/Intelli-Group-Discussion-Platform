# Project Roadmap

## Milestone 1: Core Platform Baseline & Onboarding (Completed)
*Baseline established from existing brownfield implementation.*

- [x] **Phase 1: Foundation & Authentication**
  - User registration, login, JWT issuance, profile management, and bcrypt security.
  - Rate limiting, structured logging, and non-blocking MongoDB lifecycle.
- [x] **Phase 2: Real-Time Multi-Party WebRTC & Signaling**
  - Socket.IO signaling hub with room management and presence roster.
  - P2P mesh WebRTC audio/video calling, media toggling, and real-time text chat.
- [x] **Phase 3: Solo AI Conversational Partner**
  - Low-latency dialogue turn-taking powered by Groq Llama 3.
  - Realistic ElevenLabs voice synthesis proxy and interactive audio waveform canvas.
- [x] **Phase 4: Speech Analytics & Fluency Microservice**
  - Python FastAPI microservice integration.
  - OpenAI Whisper transcription, FillerCRNN acoustic filler detection, Librosa prosody extraction, and SBERT semantic relevance scoring.
  - Multi-dimensional Gemini scoring for grammar, vocabulary, and coherence.
- [x] **Phase 5: Reports, Analytics & Peer Evaluation**
  - Interactive report card with Recharts visualizations.
  - Post-discussion peer evaluation modal and historical session tracking.
- [x] **Phase 6: Administration & Operations**
  - Role-based access control, admin dashboard, dynamic API key rotation, and audit logs.

---

## Milestone 2: Hardening, Test Automation & Scalability (Active)
*Current objective focusing on reliability, automated test coverage, and infrastructure resilience.*

### Phase 7: Automated Test Coverage & CI Hardening
- **Goal:** Expand test coverage across frontend components, backend middleware, and Python ML pipelines.
- **Tasks:**
  - [ ] Consolidate server integration scripts into automated npm test runners (`npm test`).
  - [ ] Add Pytest suite in `ml-server/` for acoustic signal validation and schemas.
  - [ ] Add Vitest/Testing Library test suite for frontend UI components and hooks.
  - [ ] Set up GitHub Actions CI workflow to run linting and tests automatically on push/PR.

### Phase 8: State Resilience & Cache Modernization
- **Goal:** Eliminate process-memory state loss and prepare for horizontal scaling.
- **Tasks:**
  - [ ] Decouple `sessionStore.js` from in-memory JavaScript Map to Redis.
  - [ ] Implement Redis Pub/Sub adapter for Socket.IO multi-server synchronization.
  - [ ] Clean up untracked temporary files and configure strict `.gitignore` rules for audio segments and logs.

### Phase 9: WebRTC Scalability & SFU Migration
- **Goal:** Upgrade group discussions from P2P mesh (2-5 peers) to SFU architecture (15+ peers).
- **Tasks:**
  - [ ] Benchmark client bandwidth and CPU constraints in multi-peer sessions.
  - [ ] Evaluate SFU engine options (LiveKit / Mediasoup).
  - [ ] Implement SFU room connector with fallback to P2P mesh for 2-peer sessions.

### Phase 10: Real-Time Streaming Speech Feedback
- **Goal:** Provide live visual cues while speaking instead of post-speech batch uploads.
- **Tasks:**
  - [ ] Implement WebSocket streaming audio chunking from browser.
  - [ ] Provide real-time live filler word counters and pace warning indicators in the session UI.
