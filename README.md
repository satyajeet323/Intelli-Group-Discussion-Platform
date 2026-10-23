# INTELLIBOT — AI-Powered Group Discussion Platform

**Practise smarter. Communicate confidently. Improve continuously.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge)](https://intelli-gd-bot.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

INTELLIBOT is a full-stack, AI-powered web application designed to help students and professionals practise and improve their Group Discussion (GD) skills. It combines AI-powered individual practice, real-time group discussions, performance analytics, and peer evaluation in one platform.

The platform aims to provide a structured environment where users can practise communication, develop confidence, organize their thoughts, and track their progress through data-driven feedback.

> **Platform Status:** Under maintenance — system upgrades and improvements are in progress.

## 🌟 Key Features

### 1. AI-Powered Individual Practice
- Practise discussion topics with an AI-powered discussion partner.
- Generate discussion topics using Google Gemini.
- Receive AI-generated feedback on speaking turns and arguments.
- Develop fluency, vocabulary, confidence, and structured thinking.

### 2. Live Group Discussions
- Join virtual discussion rooms with other authenticated participants.
- Communicate through real-time audio and video.
- Use text chat during group sessions.
- Practise collaborative communication in a realistic discussion environment.

### 3. Performance Analytics
- Review communication performance after practice sessions.
- Analyze fluency, relevance, confidence, and filler-word usage.
- Understand strengths and areas that need improvement.
- Track progress through session-based performance insights.

### 4. Peer Evaluation
- Allow participants to evaluate one another after group discussions.
- Gather feedback about communication and participation.
- Gain a better understanding of how others perceive your discussion skills.

### 5. Session History
- Access previous discussion sessions and performance scores.
- Review historical performance information.
- Monitor improvement over time.

### 6. Learning Dashboard
- View consolidated performance statistics.
- Access session history and learning progress.
- Understand your practice activity through a centralized dashboard.

## 🎯 Practice Modes

### Mode 1: Individual AI Session

Practise independently with an AI discussion partner. The system generates a discussion topic, responds to your arguments, and provides AI-generated performance feedback.

**Best for:** Building confidence, improving fluency, expanding vocabulary, and learning to structure arguments.

### Mode 2: Group Discussion Session

Participate in a shared virtual discussion room with other users. Audio, video, and text communication help recreate a collaborative discussion environment.

**Best for:** Improving teamwork, active listening, argument development, and real-world group discussion skills.

## 🛠️ Technology Stack

The platform combines modern web technologies, AI services, and real-time communication.

| Component | Technology |
|---|---|
| Frontend | React / Next.js |
| Styling | Tailwind CSS |
| Backend | Node.js and Express.js |
| Database | MongoDB |
| AI Integration | Google Gemini API |
| Real-Time Communication | WebRTC |
| Backend AI Services | Python and FastAPI, where configured |
| Deployment | Vercel and other configured hosting services |

*The table describes the intended project architecture. Confirm the technologies and services used in your current codebase before treating this list as exhaustive.*

## 🏗️ How It Works

1. **Authenticate:** Sign in to access the platform's available features.
2. **Choose a practice mode:** Start an individual AI session or join a group discussion.
3. **Participate:** Discuss the selected topic through the available communication tools.
4. **Receive feedback:** Review AI-generated analysis and peer evaluations where supported.
5. **Track progress:** Use session history and dashboard insights to identify areas for improvement.

## 🚀 Getting Started

### Prerequisites

Install the following tools before setting up the project:

- Node.js and npm
- Python, if the AI backend is enabled
- MongoDB or a configured MongoDB Atlas database
- Google Gemini API key, if AI topic generation or evaluation is enabled
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/satyajeet323/Intelli-GD-Bot.git
cd Intelli-GD-Bot
```

Install frontend and backend dependencies according to the project's directory structure.

For a Node.js application:

```bash
npm install
```

If the project contains separate frontend and backend directories, run `npm install` in each directory containing its own `package.json`.

For a Python backend, if `ml-server/requirements.txt` exists:

```bash
cd ml-server
python -m venv venv
```

Activate the virtual environment.

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create local environment files based on the configuration required by your application.

Typical variables may include:

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

Add any additional variables required by your backend, frontend, WebRTC configuration, and deployment environment.

**Security:** Never commit `.env` files, API keys, database credentials, service-account keys, or other secrets to Git. Store production secrets in your hosting provider's environment settings.

### Run the Application

Start each service using the commands specified by its `package.json` scripts or project documentation.

For a typical Node.js application:

```bash
npm run dev
```

For a FastAPI service, if `main.py` exposes the FastAPI application as `app`:

```bash
uvicorn main:app --reload
```

These are example commands; the exact startup commands depend on your project configuration.

## 🔐 Security

- Keep API keys and database credentials private.
- Use environment variables for sensitive configuration.
- Never expose service-account credentials in frontend code.
- Configure authentication and authorization for protected routes.
- Validate user input and apply appropriate access controls.

## 🗺️ Roadmap

Potential improvements include:

- Enhanced AI discussion evaluation.
- More detailed communication analytics.
- Improved WebRTC session reliability.
- Better session history and progress visualization.
- Continued improvements to the user experience.

## 🌐 Live Demo

Visit the platform:

**[INTELLIBOT — Live Application](https://intelli-gd-bot.vercel.app/)**

The application may currently display a maintenance page while system upgrades are in progress.

## 👨‍💻 Author

**Satyajeet S. Desai**

- GitHub: [@satyajeet323](https://github.com/satyajeet323)
- Portfolio: [satyajeetdesai.vercel.app](https://satyajeetdesai.vercel.app/)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**INTELLIBOT** — An AI-powered platform for practising, evaluating, and improving group discussion skills.
