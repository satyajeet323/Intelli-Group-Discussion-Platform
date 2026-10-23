# Architecture & Data Flow

## 1. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Web Browser (Client)                       │
│    TanStack Start / React 19 + Radix UI + Lucide + TailwindCSS v4     │
└───────────────┬───────────────────────────────────────▲────────────────┘
                │ HTTP REST / Uploads                   │ WebRTC Audio/Video
                │ & Socket.IO Signaling                 │ (Peer-to-Peer Mesh)
                ▼                                       ▼
┌───────────────────────────────────────────────┐ ┌──────────────────────┐
│          Node.js Orchestration Server         │ │ Peer User Browsers   │
│             Express + Socket.IO               │ │ (Mesh Connections)   │
│                 (Port 4000)                   │ └──────────────────────┘
└───┬───────────────────┬───────────────────┬───┘
    │                   │                   │
    ▼                   ▼                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────────────┐
│   MongoDB    │ │ Cloud AI APIs│ │      FastAPI ML Microservice         │
│ (Port 27017) │ │ Gemini, Groq,│ │      PyTorch, Whisper, CRNN, SBERT   │
│ Persistent   │ │ ElevenLabs   │ │               (Port 8000)            │
│ Storage      │ └──────────────┘ └──────────────────────────────────────┘
└──────────────┘
```

## 2. Core Architectural Layers

### A. Presentation & Application Layer (`client/`)
- Single-page application using modern file-based routing with `@tanstack/react-router`.
- Dual practice modes:
  - **Group Discussion Room (`/group-session_.$sessionId.tsx`):** Multi-user room with WebRTC video/audio tiles, live text chat, AI side-panel insights, media controls (mute/unmute, camera toggle), and peer rating dialog on exit.
  - **AI Solo Session (`/ai-session.tsx`):** Single-user 1-on-1 dialogue with an AI conversational partner using real-time speech recognition, Groq Llama 3 for intelligent dialogue turns, and ElevenLabs TTS audio streaming with canvas-rendered audio waveforms.
  - **Fluency Assessment Session (`/gd.$sessionId.tsx`):** Structured individual fluency recording, multi-metric speech analysis, and automated Gemini evaluation.
  - **Analytics & History (`/dashboard.tsx`, `/history.tsx`, `/report.$sessionId.tsx`):** Interactive visualization of speaking speed, filler frequency, vocabulary richness, and overall performance progression using Recharts.
  - **Admin Control Center (`/admin/*`):** User management, active session monitoring, dynamic API key administration, audit logs, and system configuration.

### B. Orchestration & Gateway Layer (`server/`)
- **API Gateway & Routing:** Express handles authentication (`/api/auth`), session lifecycle (`/api/sessions`), reports (`/api/reports`), history queries (`/api/history`), dynamic topics (`/api/topics`), and admin controls (`/api/admin`).
- **WebRTC Signaling Hub (`socketHandler.js`):** Coordinates multi-party room state, peer discovery, SDP offer/answer forwarding, ICE candidate relays, and chat broadcasting.
- **In-Memory Active Session Store (`sessionStore.js`):** Low-latency memory cache tracking ongoing rooms, connected socket IDs, user roster, participant mute status, and speaking turn tracking.
- **Service Orchestrator (`services/mlClient.js`, `services/apiKeyService.js`):** Mediates requests to the FastAPI ML engine and manages encrypted AI provider credentials.

### C. Machine Learning Engine Layer (`ml-server/`)
- **FastAPI Async Pipeline:** Dedicated Python microservice optimized for heavy audio signal processing and machine learning inference.
- **Acoustic & Prosody Pipeline (`audio_service.py`):**
  - Audio decoding & format normalization via `ffmpeg` / `soundfile` to 16 kHz mono WAV.
  - Speech transcription using OpenAI Whisper (`tiny.en` / `base.en`).
  - Filler word detection using a custom Convolutional Recurrent Neural Network (FillerCRNN) running on PyTorch (`models/crnn.py`), identifying lexical and non-lexical hesitations ("um", "uh", "like", "you know").
  - Prosodic analysis via Librosa and Scipy: computes words per minute (WPM), speech duration, pause ratio, total pause duration, and normalized pairwise variability index (nPVI).
- **Semantic & Evaluation Pipeline (`scoring_service.py`, `session_service.py`):**
  - SBERT semantic similarity (`all-MiniLM-L6-v2`) compares candidate speech embeddings against the target topic prompt.
  - Gemini GenAI model delivers structured evaluation across grammar, clarity, coherence, vocabulary richness, and constructive suggestions.

## 3. End-to-End Data Flows

### A. Group Discussion Session Flow
1. **Creation:** Host initiates session via UI -> Server creates session document in MongoDB and initializes active room state in `sessionStore.js`.
2. **Joining:** Participants join via room code -> Socket.IO verifies room -> Emits `join-session`. Existing peers establish P2P WebRTC RTCPeerConnection mesh connections.
3. **Turn Tracking:** Speaking activity and chat messages are logged during the discussion.
4. **Conclusion & Peer Rating:** Host ends session -> Server signals all peers -> Room transitions to peer evaluation modal where participants rate each other on leadership, listening, content, and collaboration.
5. **Final Aggregation:** Ratings and participation metrics are consolidated into MongoDB `Session` and `Report` records.

### B. Individual Fluency Analysis Flow
1. User records audio prompt in browser via `MediaRecorder`.
2. Audio WebM blob is uploaded to Node backend `/api/fluency/upload`.
3. Node server proxies audio buffer to FastAPI `/analyze/audio`.
4. ML engine decodes audio, extracts prosody metrics, runs Whisper STT and FillerCRNN.
5. Extracted transcript and metrics are forwarded to `/analyze/transcript` for SBERT relevance checking and Gemini assessment.
6. Structured scoring payload is returned to the client and saved to MongoDB for trend tracking.
