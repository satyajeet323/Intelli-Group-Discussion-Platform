# Integrations & External Services

## 1. MongoDB Database
- **Connection:** Managed by `server/src/db.js` using Mongoose 8.
- **Resilience:** Implements automatic reconnection with exponential backoff and connection state monitoring. Server starts immediately without blocking on DB connection.
- **Key Models:**
  - `User.js`: User accounts, hashed passwords, avatar, speech stats, preferences.
  - `Session.js`: Group and solo sessions, session state (`active`, `ended`), room codes, topics, participant records, peer rating summaries.
  - `Notification.js` & `UserNotification.js`: System announcements, session alerts, user-specific notifications with read tracking.
  - `ApiKey.js`: Encrypted storage for runtime Gemini, Groq, and ElevenLabs API keys, key rotation, usage count, latency tracking, and failure counters.
  - `AdminUser.js` & `AdminRole.js`: Granular role-based access control (RBAC) for administration panel.
  - `AuditLog.js`: Structured logging for sensitive actions, logins, and key modifications.
  - `Plan.js`: Subscription and feature tier limits.
  - `SystemConfig.js`: Dynamic platform settings (maintenance mode, registration toggles, AI defaults).

## 2. FastAPI ML Microservice (`ml-server`)
- **Protocol:** HTTP REST with JSON and multipart/form-data.
- **Client Implementation:** `server/src/services/mlClient.js` using Axios with timeout handling.
- **Security:** Internal calls authenticated via `INTERNAL_SERVICE_SECRET` header.
- **Key Inter-Service Endpoints:**
  - `GET /health`: Liveness probe reporting model weights availability (`whisper`, `filler_crnn`, `sbert`, `gemini`).
  - `POST /analyze/audio`: Uploads recorded user audio buffer -> returns Whisper transcription, speech rate (WPM), pause ratio, syllable nuclei, and CRNN filler word occurrences.
  - `POST /analyze/transcript`: Evaluates transcript against discussion topic using SBERT semantic embeddings and Gemini API scoring.
  - `POST /evaluate/session`: Comprehensive session evaluation for all participant turns.
  - `POST /generate/report`: Aggregates prosody metrics, filler counts, vocabulary, grammar, and coherence into final discussion scorecards.
- **Key Resolution Hook:** `ml-server/utils/gemini_key.py` dynamically queries the Node backend (`/api/admin/api-keys/active/gemini`) to fetch the active Gemini key if not configured in `.env`.

## 3. WebRTC & Socket.IO Real-Time Communication
- **Architecture:** Full mesh peer-to-peer WebRTC connection topology among all participants in a discussion room.
- **Signaling Hub:** `server/src/socketHandler.js` over Socket.IO.
- **Signaling Flow:**
  - `join-session`: Client joins room, receives list of existing peers.
  - `webrtc-offer` / `webrtc-answer`: SDP exchange between joining peer and each existing peer.
  - `webrtc-ice-candidate`: ICE candidates exchanged via server relay.
  - `toggle-media`: Broadcasts mute/unmute and camera on/off states to room.
  - `chat-message`: Broadcasts room chat messages.
  - `leave-session`: Handles graceful disconnection and ICE cleanup.
  - `end-session`: Host triggers room termination; server broadcasts to all participants and transitions room to rating phase.
- **Client Hook:** `client/src/components/group-session/useGroupSession.ts` manages RTCPeerConnection instances, audio/video tracks, and ICE candidate queues.

## 4. Google Gemini API
- **Direct Integration in Server:** Used in `server/src/topics.js` to generate contextual, categorized discussion topics (e.g., Tech, Ethics, Economy, Society) with fallback to curated offline topics. Also acts as secondary AI chat fallback.
- **Integration in ML Microservice:** Used in `ml-server/services/session_service.py` to evaluate speech quality, grammatical accuracy, structural clarity, and deliver actionable user feedback.

## 5. Groq Cloud API
- **Implementation:** `server/src/routes/aiSession.js` using `@groq-sdk`.
- **Purpose:** Powers real-time 1-on-1 AI discussion sessions. Uses ultra-fast inference (Llama 3 70B/8B) to generate interactive, human-like verbal responses in the AI solo practice room.

## 6. ElevenLabs Text-to-Speech (TTS)
- **Implementation:** Server-side proxy at `POST /api/tts` in `server/src/index.js`.
- **Security Benefit:** Protects ElevenLabs API credentials from exposure to client browsers.
- **Voice Synthesis:** Streamlines high-fidelity voice audio (`audio/mpeg`) using the `eleven_turbo_v2` model for speech playback in the AI discussion room.

## 7. Dynamic API Key Management System
- **Module:** `server/src/services/apiKeyService.js` and `server/src/routes/admin/apiKeys.js`.
- **Capabilities:**
  - Add, test, activate, deactivate, and rotate keys dynamically via admin UI without restarting servers.
  - Real-time latency tracking and error-rate counting per key.
  - Graceful fallback to static `.env` variables if database keys are unconfigured.
