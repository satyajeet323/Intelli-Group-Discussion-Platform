# Requirements Specification

## 1. Functional Requirements (FR)

### Module 1: Authentication & User Management
- [x] **FR-1.1: User Registration & Login:** Email/password registration with bcrypt password hashing and JWT token issuance.
- [x] **FR-1.2: Session Persistence & Re-auth:** Client-side JWT persistence in localStorage and automatic token verification via `/api/auth/me`.
- [x] **FR-1.3: User Profile & Preferences:** Editable user profiles with customizable display names, bio, notification preferences, and speech stats.
- [x] **FR-1.4: Rate Limiting & Brute Force Defense:** Strict IP-based rate limiting on `/api/auth/register` and `/api/auth/login`.

### Module 2: Real-Time Group Discussion (WebRTC & Socket.IO)
- [x] **FR-2.1: Room Lifecycle:** Create discussion rooms with unique alphanumeric codes, category-based topics, and duration limits.
- [x] **FR-2.2: Multi-Party WebRTC Mesh:** P2P audio and video transmission among participants with automatic SDP offer/answer negotiation and ICE trickling.
- [x] **FR-2.3: Audio/Video Controls:** Real-time muting/unmuting of microphone and toggling camera with synchronized room indicator states.
- [x] **FR-2.4: Real-Time In-Session Chat:** Text messaging channel synchronized across participants with timestamping.
- [x] **FR-2.5: AI In-Session Moderator / Insights:** AI panel delivering live advice and context on discussion topics during the session.
- [x] **FR-2.6: Peer Evaluation:** Post-session evaluation modal where peers score one another on Content, Communication, Leadership, and Collaboration.

### Module 3: Solo AI Practice Partner
- [x] **FR-3.1: Conversational Turn-Taking:** Low-latency back-and-forth dialogue using Groq Llama 3 models.
- [x] **FR-3.2: Voice Synthesis (TTS):** Natural speech playback via ElevenLabs API proxied through the backend.
- [x] **FR-3.3: Interactive Audio Waveform:** Real-time audio waveform animation rendered on an HTML5 canvas reflecting speech presence.
- [x] **FR-3.4: Solo Session Summary Export:** Generate downloadable text or PDF report summarizing discussion points and areas for improvement.

### Module 4: Speech Analysis & Fluency Engine
- [x] **FR-4.1: Speech-to-Text Transcription:** Accurate transcription of user audio segments via OpenAI Whisper.
- [x] **FR-4.2: Acoustic Filler Word Detection:** Deep-learning-based classification of acoustic fillers ("um", "uh", "err") using custom PyTorch FillerCRNN.
- [x] **FR-4.3: Prosody Extraction:** Librosa/Scipy extraction of speech rate (WPM), pause durations, pause ratio, and rhythmic variability (nPVI).
- [x] **FR-4.4: Semantic Relevance:** SBERT semantic embedding comparison measuring speech topicality against assigned GD topic.
- [x] **FR-4.5: Multi-Factor Fluency Scoring:** Gemini evaluation providing structured scores (1-10) for Grammar, Vocabulary, Coherence, and Pronunciation.

### Module 5: Performance Reports & Analytics
- [x] **FR-5.1: Consolidated Session Report Card:** Detailed report page displaying overall score, radar charts, filler frequency, and grammar tips.
- [x] **FR-5.2: Historical Tracking & Trends:** Historical view of user sessions with filtering, search, and progress metrics over time.
- [x] **FR-5.3: Session Leaderboards:** Group discussion participant ranking based on combined automated and peer scores.

### Module 6: Administration & Operations
- [x] **FR-6.1: RBAC System:** Admin roles, permissions, and dedicated administrative login portal.
- [x] **FR-6.2: Dynamic API Key Vault:** Runtime management and rotation of Google Gemini, Groq, and ElevenLabs API keys with fallback to environment variables.
- [x] **FR-6.3: Audit Logging:** Comprehensive administrative action log for security and troubleshooting.
- [x] **FR-6.4: System Health & Maintenance:** Global maintenance mode toggle, service health probes (`/health`, `/api/fluency/health`), and latency metrics.

---

## 2. Non-Functional Requirements (NFR)

- **NFR-1: Performance & Latency:**
  - WebRTC mesh audio/video latency < 250ms under typical broadband conditions.
  - AI solo conversational response turn-around < 1.5s using Groq inference.
- **NFR-2: Scalability:**
  - Microservice separation allows ML engine to scale independently from the Node API gateway.
- **NFR-3: Reliability & Resilience:**
  - Non-blocking MongoDB startup; automated reconnection with backoff.
  - Multi-tier fallback for API keys and topics (Gemini API -> static offline topic pool).
- **NFR-4: Security & Compliance:**
  - Passwords hashed using bcrypt (10 rounds).
  - External API keys (ElevenLabs, Groq, Gemini) guarded behind backend proxies; never leaked to frontend clients.
  - Express security headers (`x-powered-by` disabled, proxy trust configured).

---

## 3. Next-Generation Requirements (Backlog)

- [ ] **NGR-1: WebRTC Selective Forwarding Unit (SFU):** Replace peer-to-peer mesh with an SFU (e.g. LiveKit) to scale rooms to 15+ participants without client bandwidth degradation.
- [ ] **NGR-2: Live Real-Time Streaming Transcription:** Implement bidirectional WebSocket audio streaming (Gemini Live API or streaming Whisper) for immediate during-speech feedback.
- [ ] **NGR-3: Distributed Session Store:** Migrate in-memory `sessionStore.js` to Redis to enable multi-instance horizontal scaling.
- [ ] **NGR-4: Automated End-to-End Test Suite:** Comprehensive Playwright test suite validating WebRTC calling, chat, and reporting.
