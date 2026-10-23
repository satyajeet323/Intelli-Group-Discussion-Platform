# Directory & File Structure

```
RoxGD/
├── .planning/                  # Project memory, roadmap, requirements, and codebase map
│   ├── codebase/               # 7-document codebase map
│   └── ...
├── client/                     # Frontend Application (TanStack Start / React 19)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # Admin dashboard management components
│   │   │   ├── group-session/  # Group session components (video tiles, controls, chat, ratings)
│   │   │   │   ├── AIPanel.tsx
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── ControlBar.tsx
│   │   │   │   ├── LeaveDialog.tsx
│   │   │   │   ├── ParticipantTile.tsx
│   │   │   │   ├── PeerRatingModal.tsx
│   │   │   │   └── useGroupSession.ts
│   │   │   ├── ui/             # Radix primitives & styled components (dialog, button, table, etc.)
│   │   │   ├── AppSidebar.tsx  # Main application navigation sidebar
│   │   │   └── NotificationCenter.tsx
│   │   ├── hooks/              # Custom React hooks (useTheme, useNotifications, useMobile)
│   │   ├── lib/                # API clients, auth helpers, utility functions
│   │   │   ├── adminApi.ts     # Admin API endpoints
│   │   │   ├── api.ts          # Main backend API client
│   │   │   ├── generateAISessionReport.ts # Client report exporter
│   │   │   ├── useAISession.ts # Solo AI session hook
│   │   │   ├── useAITopic.ts   # Dynamic topic generator hook
│   │   │   ├── useCurrentUser.ts # Auth session state
│   │   │   └── utils.ts        # Tailwind class merging & formatting utilities
│   │   ├── routes/             # File-based route definitions (TanStack Router)
│   │   │   ├── __root.tsx      # Root route layout, theme provider, navigation wrapper
│   │   │   ├── index.tsx       # Landing page showcasing platform features
│   │   │   ├── login.tsx       # User authentication login
│   │   │   ├── register.tsx    # User registration
│   │   │   ├── dashboard.tsx   # User personal dashboard & overview metrics
│   │   │   ├── ai-session.tsx  # Solo AI practice session with voice interaction
│   │   │   ├── gd.$sessionId.tsx # Individual fluency assessment recording & scoring
│   │   │   ├── group-session.tsx # Group session lobby & room creation
│   │   │   ├── group-session_.$sessionId.tsx # Active group video discussion room
│   │   │   ├── history.tsx     # Past session history, search, and filtering
│   │   │   ├── profile.tsx     # User profile settings & password update
│   │   │   ├── report.$sessionId.tsx # Comprehensive performance scorecard
│   │   │   └── admin/          # Admin sub-routes (users, keys, audit, analytics, roles)
│   │   ├── main.tsx            # Vite client bootstrap
│   │   ├── router.tsx          # TanStack Router instance & global error boundary
│   │   ├── routeTree.gen.ts    # Auto-generated route tree
│   │   └── styles.css          # Design tokens, theme variables, and Tailwind CSS styles
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend Server (Node.js / Express / Socket.IO)
│   ├── src/
│   │   ├── index.js            # Express server initialization, middleware, routes, Socket.IO
│   │   ├── db.js               # MongoDB connection lifecycle with retry logic
│   │   ├── socketHandler.js    # WebRTC mesh signaling & real-time room communication
│   │   ├── sessionStore.js     # In-memory store for active session state
│   │   ├── topics.js           # Topic generator (Gemini API with offline fallback)
│   │   ├── seedAdmin.js        # Seed initial admin account
│   │   ├── promoteAdmin.js     # CLI helper to promote user to admin
│   │   ├── middleware/         # Middleware functions
│   │   │   ├── auth.js         # JWT verification & guest handling
│   │   │   ├── logger.js       # Structured request logger with request IDs
│   │   │   └── rateLimiter.js  # Configurable in-memory rate limiter
│   │   ├── models/             # Mongoose database models
│   │   │   ├── User.js         # User model with speech metrics & bcrypt password hashing
│   │   │   ├── Session.js      # Session model with participants, status, and scores
│   │   │   ├── Notification.js # Platform notification announcements
│   │   │   ├── UserNotification.js # User-specific notification states
│   │   │   ├── ApiKey.js       # Secure API key registry with latency & error tracking
│   │   │   ├── AdminUser.js    # Administrative account model
│   │   │   ├── AdminRole.js    # RBAC roles and permissions
│   │   │   ├── AuditLog.js     # Administrative action audit log
│   │   │   ├── Plan.js         # Platform subscription tiers
│   │   │   └── SystemConfig.js # Dynamic platform configuration flags
│   │   ├── routes/             # REST API route handlers
│   │   │   ├── auth.js         # Auth routes: /register, /login, /me
│   │   │   ├── sessions.js     # Session routes: create, join, leave, end, validate
│   │   │   ├── reports.js      # Performance reports & scorecards
│   │   │   ├── history.js      # Historical session queries & stats
│   │   │   ├── topics.js       # Topic discovery & generation
│   │   │   ├── chat.js         # In-session chat persistence
│   │   │   ├── peerRatings.js  # Peer assessment submissions & aggregation
│   │   │   ├── aiSession.js    # AI solo chat endpoint (Groq/Gemini)
│   │   │   ├── notifications.js# User notifications
│   │   │   └── admin/          # Admin sub-routes (analytics, users, keys, system)
│   │   └── services/           # Service integrations
│   │       ├── mlClient.js     # Client for FastAPI ML service
│   │       └── apiKeyService.js# Dynamic API key provider & rotation
│   ├── package.json
│   └── test-*.js               # Standalone automated integration test scripts
│
├── ml-server/                  # Machine Learning Microservice (FastAPI / PyTorch)
│   ├── config/
│   │   └── settings.py         # Configuration settings & environment variables
│   ├── models/
│   │   ├── crnn.py             # PyTorch FillerCRNN neural network architecture
│   │   └── filler_crnn_final.pth # Trained model weights
│   ├── routes/
│   │   ├── health.py           # Health check & model status probe
│   │   ├── analyze.py          # Audio transcription & prosody analysis endpoints
│   │   ├── evaluate.py         # Session evaluation endpoint (Gemini)
│   │   └── generate.py         # Report generation endpoint
│   ├── schemas/                # Pydantic request and response schemas
│   ├── services/
│   │   ├── audio_service.py    # Whisper transcription, Librosa prosody, CRNN filler detection
│   │   ├── scoring_service.py  # SBERT semantic similarity & Gemini scoring
│   │   └── session_service.py  # Session-wide aggregation & feedback synthesis
│   ├── utils/
│   │   ├── gemini_key.py       # Dynamic key resolution from backend
│   │   └── logging_config.py   # Structured logging configuration
│   ├── main.py                 # FastAPI application entrypoint
│   └── requirements.txt        # Python package dependencies
│
├── docker/                     # Container configuration files
│   ├── Dockerfile.frontend     # Multi-stage frontend build (Vite + Nginx)
│   └── Dockerfile.node         # Production Node.js backend container
├── scripts/                    # Platform utility scripts
│   ├── setup-ml-models.bat     # Windows batch script for downloading/copying model weights
│   └── setup-ml-models.sh      # Bash script for ML model setup
├── DEVELOPER_GUIDE.md          # Comprehensive developer guide and setup instructions
├── GD-report.md                # 1700+ line IT project report detailing requirements & specs
├── docker-compose.yml          # Multi-service local dev orchestration
├── docker-compose.staging.yml  # Staging environment orchestration
├── docker-compose.prod.yml     # Production orchestration
├── run-tests.bat               # Windows batch script running backend test suites
└── start-all.bat               # Windows batch script launching all 3 services concurrently
```
