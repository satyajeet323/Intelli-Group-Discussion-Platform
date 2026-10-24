/**
 * chat.js AI discussion chat endpoint.
 *
 * POST /api/chat/gd
 *
 * Uses Gemini (gemini-3.7-flash) via new Interactions API for AI responses + per-turn scoring.
 * Groq removed key was returning 403 Forbidden.
 * Returns 503 if Gemini fails no local fallback.
 */

import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { countFillerWords, calculateOverallScore } from "../lib/scoreCalculator.js";

const router  = Router();
const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
const TIMEOUT_MS = 12000;

function buildSystemPrompt(topic) {
  return `You are an expert group discussion facilitator and debate partner for the topic: "${topic}".

Your role:
- Engage the user in a structured, intellectual discussion
- Ask probing follow-up questions to deepen the conversation
- Present counter-arguments when appropriate
- Keep responses concise (2–4 sentences) and conversational
- Stay strictly on the topic

After each user message, evaluate their speaking turn.
Scoring criteria (0–10 scale):
- fluency: smoothness and clarity of expression
- relevance: how on-topic the response was
- confidence: assertiveness and conviction
- fillerWords: count of filler words (um, uh, like, you know, basically, etc.)
- feedback: one sentence of constructive feedback

Return ONLY valid JSON in this exact format:
{
  "reply": "your conversational response here",
  "scores": {
    "fluency": 7.5,
    "relevance": 8.0,
    "confidence": 7.0,
    "fillerWords": 2,
    "feedback": "Good point try to support it with a specific example."
  }
}`;
}

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

async function callGemini(apiKey, topic, messages) {
  // Build full prompt with conversation history
  let fullPrompt = buildSystemPrompt(topic) + "\n\n";
  messages.forEach((m) => {
    const speaker = m.role === "assistant" ? "AI" : "User";
    fullPrompt += `${speaker}: ${m.content}\n`;
  });
  fullPrompt += "\nRespond with valid JSON containing 'reply' and 'scores' fields as specified.";

  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${GEMINI_INTERACTIONS_URL}?key=${apiKey}`, {
        method:  "POST",
        signal:  controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          input: fullPrompt,
          response_format: {
            type: "text",
            mime_type: "application/json"
          },
          generation_config: {
            temperature: 0.8,
            max_output_tokens: 400,
          },
        }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 100)}`);
        err.status = res.status;
        lastError = err;
        if (res.status === 503 || res.status === 429) {
          console.warn(`[chat] Gemini model "${model}" returned ${res.status}, trying fallback model...`);
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const raw  = extractInteractionText(json);
      const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (err.status === 503 || err.status === 429) continue;
      throw err;
    }
  }

  throw lastError || new Error("Gemini AI request failed across all candidate models.");
}

router.post(
  "/gd",
  [
    body("topic").isString().trim().notEmpty().withMessage("topic is required"),
    body("messages").isArray({ min: 1 }).withMessage("messages must be a non-empty array"),
    body("messages.*.role").isIn(["user", "assistant"]).withMessage("invalid role"),
    body("messages.*.content").isString().trim().notEmpty().withMessage("message content is required"),
  ],
  validate,
  async (req, res) => {
    const { topic, messages } = req.body;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const userText    = lastUserMsg?.content ?? "";
    const turnCount   = messages.filter((m) => m.role === "user").length;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return res.status(503).json({ success: false, message: "AI service is not configured. Set GEMINI_API_KEY." });
    }

    try {
      const parsed = await callGemini(apiKey, topic, messages);
      if (!parsed?.reply) {
        return res.status(502).json({ success: false, message: "AI returned an empty response. Please try again." });
      }

      const { reply, scores = null } = parsed;
      const detectedFillers = countFillerWords(userText);
      if (scores && detectedFillers > (scores.fillerWords ?? 0)) scores.fillerWords = detectedFillers;
      if (scores) scores.overallScore = calculateOverallScore(scores);

      console.log(`[chat] Gemini | turn ${turnCount} | score: ${scores?.overallScore ?? "n/a"}`);
      return res.json({ reply, scores });
    } catch (err) {
      console.error(`[chat] Gemini error: ${err.message}`);
      return res.status(503).json({ success: false, message: "AI service is temporarily unavailable. Please try again." });
    }
  }
);

export default router;
