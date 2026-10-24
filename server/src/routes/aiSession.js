/**
 * aiSession.js AI Session routes
 *
 * POST /api/ai-session/start     Generate topic + opening AI message
 * POST /api/ai-session/turn      Send user transcript, get AI response
 * POST /api/ai-session/report    Delegate session evaluation to ML service
 */

import { Router } from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { generateTopic } from "../topics.js";
import Groq from "groq-sdk";
import { evaluateSession } from "../services/mlClient.js";
import { Session } from "../models/Session.js";
import { Evaluation } from "../models/Evaluation.js";

const router = Router();

// ── Groq client ───────────────────────────────────────────────────────────────
let _groq = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// ── Gemini REST helper (using new Interactions API) ──────────────────────────
const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

function extractInteractionText(json) {
  let text = json?.output_text;
  if (!text && Array.isArray(json?.steps)) {
    for (const step of json.steps) {
      if (step.type === "model_output" && Array.isArray(step.content)) {
        const textPart = step.content.find((c) => c.text)?.text;
        if (textPart) {
          text = textPart;
          break;
        }
      }
    }
  }
  if (!text) {
    text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  return text.trim();
}

async function callGeminiRest(systemPrompt, messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw Object.assign(
      new Error("No AI API keys configured. Set GEMINI_API_KEY or GROQ_API_KEY in server/.env"),
      { status: 503 }
    );
  }

  // Build a single input prompt combining system + conversation
  let fullPrompt = systemPrompt + "\n\n";
  messages.forEach((m) => {
    const speaker = m.role === "user" ? "User" : "Assistant";
    fullPrompt += `${speaker}: ${m.content}\n`;
  });
  fullPrompt += "\nAssistant:";

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${GEMINI_INTERACTIONS_URL}?key=${apiKey}`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          input: fullPrompt,
          generation_config: {
            temperature: 0.85,
            max_output_tokens: 350,
          },
        }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 200)}`);
        err.status = res.status;
        lastError = err;
        // On high demand (503) or rate limit (429), try next candidate model
        if (res.status === 503 || res.status === 429) {
          console.warn(`[ai-session] Gemini model "${model}" returned ${res.status}, trying fallback model...`);
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const extracted = extractInteractionText(json);
      if (extracted) return extracted;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (err.status === 503 || err.status === 429) continue;
      throw err;
    }
  }

  throw lastError || new Error("Gemini AI request failed across all candidate models.");
}

// ── Primary AI call: Groq first, Gemini fallback ──────────────────────────────
async function callAI(messages, systemPrompt) {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groq = getGroq();
      const groqModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
      const completion = await groq.chat.completions.create({
        model: groqModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 300,
        temperature: 0.85,
      });
      return completion.choices[0]?.message?.content?.trim() ?? "";
    } catch (err) {
      console.warn("[ai-session] Groq failed, trying Gemini:", err.message);
    }
  }
  return callGeminiRest(systemPrompt, messages);
}

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt(topic) {
  return `You are an expert discussion facilitator and debate partner in a professional group discussion.

The discussion topic is: "${topic}"

Your role:
- Be an engaged, intelligent discussion partner
- Ask probing follow-up questions to deepen the conversation
- Challenge opinions respectfully with counter-arguments
- Share your own perspective when relevant
- Keep responses concise (2-4 sentences max)
- Maintain natural conversational flow
- Reference what the user said to show you are listening
- Occasionally summarise key points made so far

Tone: Professional yet conversational. Intellectually stimulating. Encouraging.
Never be preachy. Never lecture. Keep it a dialogue.`;
}

// ── POST /api/ai-session/start ────────────────────────────────────────────────
router.post("/start", requireAuth, async (req, res) => {
  try {
    const { category } = req.body;
    const { topic, source } = await generateTopic({ category });

    const systemPrompt = buildSystemPrompt(topic);
    const messages = [
      {
        role: "user",
        content: `The discussion topic is: "${topic}". Please open the discussion with an engaging question or statement to get us started. Keep it to 2-3 sentences.`,
      },
    ];

    const opening = await callAI(messages, systemPrompt);

    res.json({ success: true, topic, source, opening });
  } catch (err) {
    console.error("[ai-session] start:", err.message);
    res.status(err.status ?? 500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai-session/turn ─────────────────────────────────────────────────
router.post("/turn", requireAuth, async (req, res) => {
  try {
    const { topic, transcript, history } = req.body;

    if (!topic || !transcript) {
      return res.status(400).json({ success: false, message: "topic and transcript are required." });
    }

    const systemPrompt = buildSystemPrompt(topic);
    const recentHistory = (history ?? []).slice(-12);
    const messages = [...recentHistory, { role: "user", content: transcript }];

    const response = await callAI(messages, systemPrompt);

    res.json({ success: true, response });
  } catch (err) {
    console.error("[ai-session] turn:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/ai-session/report ───────────────────────────────────────────────
router.post("/report", requireAuth, async (req, res) => {
  try {
    const { topic, history, durationSeconds, sessionId: clientSessionId } = req.body;

    if (!topic || !history?.length) {
      return res.status(400).json({ success: false, message: "topic and history are required." });
    }

    // Delegate all ML-based evaluation to the FastAPI ML service
    const { report } = await evaluateSession(topic, history, durationSeconds ?? 0);

    // Ensure evaluations are unique to each user and session
    const sessionId = (
      clientSessionId || `AI-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
    ).toUpperCase();

    const duration = durationSeconds ?? 0;
    const startedAt = new Date(Date.now() - duration * 1000);
    const endedAt = new Date();

    const participantReport = {
      fluency: Number(report.analysis?.clarityScore ?? report.analysis?.overallScore ?? 0),
      relevance: Number(report.analysis?.overallScore ?? 0),
      confidence: Number(report.analysis?.engagementScore ?? report.analysis?.overallScore ?? 0),
      fillerWords: 0,
      turns: Number(report.turns ?? 0),
      overallScore: Number(report.analysis?.overallScore ?? 0),
      feedback: report.analysis?.summary ?? "",
      aiFeedback: report.analysis?.communicationFeedback ?? "",
      analysis: report.analysis ?? null,
    };

    // 1. Save or update Session document so user history & stats reflect the session
    let session = await Session.findOne({ sessionId });
    if (!session) {
      session = await Session.create({
        sessionId,
        type: "individual",
        topic,
        topicSource: "gemini",
        hostId: req.user.id,
        maxParticipants: 1,
        status: "ended",
        startedAt,
        endedAt,
        duration,
        participants: [
          {
            userId: req.user.id,
            name: req.user.name,
            email: req.user.email,
            joinedAt: startedAt,
            leftAt: endedAt,
            isActive: false,
            report: participantReport,
          },
        ],
        messages: history.map((m) => ({
          senderId: m.role === "user" ? req.user.id.toString() : "intellibot",
          senderName: m.role === "user" ? req.user.name : "IntelliBot",
          text: m.content,
          ts: new Date(),
        })),
      });
    } else {
      session.status = "ended";
      session.endedAt = endedAt;
      session.duration = duration;
      const pIdx = session.participants.findIndex(
        (p) => p.userId?.toString() === req.user.id
      );
      if (pIdx !== -1) {
        session.participants[pIdx].report = participantReport;
        session.participants[pIdx].isActive = false;
        session.participants[pIdx].leftAt = endedAt;
      } else {
        session.participants.push({
          userId: req.user.id,
          name: req.user.name,
          email: req.user.email,
          joinedAt: startedAt,
          leftAt: endedAt,
          isActive: false,
          report: participantReport,
        });
      }
      await session.save();
    }

    // 2. Save structured record in Evaluation collection
    await Evaluation.findOneAndUpdate(
      { userId: req.user.id, sessionId },
      {
        userId: req.user.id,
        sessionId,
        type: "individual",
        topic,
        duration,
        turns: report.turns ?? 0,
        transcript: report.transcript ?? "",
        overallScore: report.analysis?.overallScore ?? 0,
        vocabularyScore: report.analysis?.vocabularyScore ?? 0,
        clarityScore: report.analysis?.clarityScore ?? 0,
        engagementScore: report.analysis?.engagementScore ?? 0,
        summary: report.analysis?.summary ?? "",
        strengths: report.analysis?.strengths ?? [],
        weaknesses: report.analysis?.weaknesses ?? [],
        grammarSuggestions: report.analysis?.grammarSuggestions ?? [],
        improvements: report.analysis?.improvements ?? [],
        contextualRelevance: report.analysis?.contextualRelevance ?? "",
        communicationFeedback: report.analysis?.communicationFeedback ?? "",
        rawReport: report,
      },
      { upsert: true, new: true }
    );

    console.log(`[ai-session] Saved report to MongoDB for user ${req.user.email} (session: ${sessionId})`);

    res.json({ success: true, sessionId, report });
  } catch (err) {
    console.error("[ai-session] report error:", err.message);
    const status = err.status ?? 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

export default router;
