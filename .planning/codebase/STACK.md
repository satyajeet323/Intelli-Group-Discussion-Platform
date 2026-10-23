# Technology Stack

## Overview
INTELLI BOT (RoxGD) is an AI-powered Group Discussion Practice and Evaluation Platform featuring real-time WebRTC audio/video conferencing, speech fluency analytics, AI discussion bots, and comprehensive performance reporting.

## 1. Frontend (client)
- **Framework:** React 19 (`^19.2.0`), React DOM (`^19.2.0`)
- **Routing & Fullstack Layer:** TanStack Start (`^1.167.14`), TanStack Router (`^1.168.0`), TanStack Router Plugin (`^1.167.29`)
- **State & Data Fetching:** TanStack React Query (`^5.83.0`), React Hook Form (`^7.71.2`), `@hookform/resolvers` (`^5.2.2`)
- **Validation:** Zod (`^3.24.2`)
- **UI Components & Primitives:** Radix UI (`@radix-ui/react-*`), Lucide React icons (`^0.575.0`), CMDK (`^1.1.1`), Vaul drawer (`^1.1.2`), Embla Carousel (`^8.6.0`), React Resizable Panels (`^4.6.5`)
- **Styling:** TailwindCSS v4 (`@tailwindcss/vite` `^4.2.1`, `tailwindcss` `^4.2.1`), `tailwind-merge` (`^3.5.0`), `class-variance-authority` (`^0.7.1`), `clsx` (`^2.1.1`), `tw-animate-css` (`^1.3.4`)
- **Visualization:** Recharts (`^2.15.4`)
- **Real-time Client:** `socket.io-client` (`^4.8.3`)
- **Notifications:** Sonner toast (`^2.0.7`)
- **Date Handling:** `date-fns` (`^4.1.0`), `react-day-picker` (`^9.14.0`)
- **Build Tool:** Vite 7 (`^7.3.1`), TypeScript 5.8 (`^5.8.3`), `@vitejs/plugin-react` (`^5.0.4`), `vite-tsconfig-paths` (`^6.0.2`)
- **Linting & Formatting:** ESLint 9 (`^9.32.0`), Prettier 3 (`^3.7.3`), `typescript-eslint` (`^8.56.1`)

## 2. Backend Orchestration Server (server)
- **Runtime:** Node.js (v18+ / v20+), ECMAScript Modules (`"type": "module"`)
- **Web Framework:** Express 4 (`^4.19.2`)
- **Real-time Engine:** Socket.IO 4 (`^4.7.5`) for WebSockets and WebRTC mesh signaling
- **Database ODM:** Mongoose 8 (`^8.4.0`) for MongoDB 7
- **Authentication:** `jsonwebtoken` (`^9.0.2`), `bcryptjs` (`^2.4.3`)
- **Validation:** `express-validator` (`^7.1.0`)
- **File Uploads:** Multer 2 (`^2.1.1`), `form-data` (`^4.0.5`)
- **HTTP Client:** Axios (`^1.16.1`)
- **External AI SDK:** `groq-sdk` (`^1.2.0`)
- **Environment & Utilities:** `dotenv` (`^16.4.5`), `cors` (`^2.8.5`), `uuid` (`^10.0.0`)

## 3. Machine Learning Microservice (ml-server)
- **Language / Runtime:** Python 3.10+ / 3.13
- **Framework:** FastAPI (`0.115.0`), Uvicorn (`0.30.6`), `python-multipart` (`0.0.12`)
- **Deep Learning / Audio:**
  - PyTorch (`2.5.1`), Torchaudio (`2.5.1`)
  - OpenAI Whisper (`20231117`) for speech transcription
  - Librosa (`0.10.2`), SoundFile (`0.12.1`), Scipy (`1.13.1`), NumPy (`1.26.4`)
  - `imageio-ffmpeg` (`0.5.1`), `ffmpeg-python` (`0.2.0`)
  - Custom PyTorch CRNN acoustic filler word detector (`filler_crnn_final.pth`)
- **NLP & Semantic Similarity:**
  - `sentence-transformers` (`3.0.1`) with `all-MiniLM-L6-v2` model
  - NLTK (`3.9.1`)
- **Generative AI:**
  - `google-genai` (`0.3.0`) for Gemini evaluation and scoring
- **Config & Networking:** `python-dotenv` (`1.0.1`), `requests` (`2.32.3`)

## 4. External Services & Cloud APIs
- **Google Gemini API:** AI-powered topic generation, multi-criteria group discussion scoring, grammatical/fluency evaluation.
- **Groq Cloud API:** High-throughput Llama 3 models powering the interactive 1-on-1 AI discussion partner.
- **ElevenLabs API:** Natural text-to-speech voice generation for the AI partner (`eleven_turbo_v2`).
- **MongoDB:** Primary persistent data store (local replica/standalone or Atlas).

## 5. Infrastructure & Deployment
- **Docker Compose:** Multi-container configuration for `mongodb` (mongo:7), `ml-server` (FastAPI), `backend-node` (Node.js Express), and `frontend` (Nginx/Vite).
- **Environment Management:** Environment variable separation via `.env` files in root, `server/`, and `ml-server/`.
- **Operating Scripts:** Windows batch scripts (`start-all.bat`, `run-tests.bat`, `scripts/setup-ml-models.bat`) and Bash scripts (`scripts/setup-ml-models.sh`).
