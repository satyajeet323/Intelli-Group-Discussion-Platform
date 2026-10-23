# Technical Debt, Risks & Architectural Concerns

## 1. WebRTC Mesh Scalability Bottleneck
- **Current Architecture:** Full peer-to-peer mesh topology where every participant connects directly to every other participant ($N \times (N - 1) / 2$ connections).
- **Impact:** Each user must encode and upload $N-1$ video/audio streams and decode $N-1$ downstream video streams. While efficient for 2-4 participants, bandwidth consumption and CPU utilization spike significantly beyond 5-6 participants, leading to frame drops, audio stutter, and browser lag on lower-tier hardware.
- **Recommended Remediation:** Migrate to a Selective Forwarding Unit (SFU) architecture (such as LiveKit, Mediasoup, or Janus) for group sessions with 6+ participants, allowing each client to upload only a single stream.

## 2. In-Memory Session State (`sessionStore.js`)
- **Current Architecture:** Active session metadata, active participants, and peer mappings are stored in a JavaScript `Map` inside the Node.js server process memory.
- **Impact:**
  - If the Node.js process crashes or is restarted, all ongoing sessions and socket mappings are lost immediately.
  - Multi-instance horizontal scaling (e.g., across multiple container replicas behind a load balancer) is not possible without sticky sessions or a shared pub/sub cache.
- **Recommended Remediation:** Back the session store with Redis (using Redis Hashes and Redis Pub/Sub for Socket.IO adapter) to ensure zero-downtime restarts and horizontal cluster scaling.

## 3. ML Service Cold Start & Resource Footprint
- **Current Architecture:** FastAPI loads heavy PyTorch models (Whisper, SBERT, FillerCRNN) into host memory upon startup.
- **Impact:**
  - `docker-compose.yml` places a 2GB memory limit on `ml-server`. During concurrent requests with multiple simultaneous audio decodes and Whisper transcriptions, memory consumption can exceed this limit, leading to container OOM kills.
  - Audio files are processed synchronously on disk (`segments_temp/`, `temp_audio/`), which may bottleneck high-volume concurrent calls.
- **Recommended Remediation:**
  - Offload heavy transcription jobs to an asynchronous task queue (Celery or ARQ with Redis).
  - Add request concurrency throttling in `ml-server` to guard against OOM spikes.
  - Ensure persistent caching for HuggingFace and Whisper model weights across container restarts.

## 4. Audio Batching vs. Real-Time Streaming
- **Current Architecture:** Speech fluency feedback is processed post-hoc after the user stops recording and uploads an entire WebM audio file.
- **Impact:** Users must wait several seconds after speaking for upload, transcription, and Gemini analysis to complete before seeing feedback.
- **Recommended Remediation:** Transition toward bidirectional streaming (e.g., WebSockets with Gemini Live API or streaming Whisper chunking) to provide live real-time feedback and transcription while the user speaks.

## 5. Security & Secret Management
- **Current State:** `.env` files contain active secrets (`MONGODB_URI`, `JWT_SECRET`, fallback API keys).
- **Noticeable Artifacts:** Some `.log`, `.err`, and `.wav` files currently exist in working directories (`ml-server/segments_temp/`, `client/client.err`, `server/server.err`) and should be added to `.gitignore`.
- **Recommended Remediation:** Clean untracked runtime artifacts and ensure all temporary directories (`temp/`, `segments_temp/`, `*.log`, `*.err`) are strictly ignored in `.gitignore`.
