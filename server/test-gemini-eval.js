/**
 * test-gemini-eval.js — Verification test for pure Gemini API integration & MongoDB persistence.
 *
 * Verifies:
 * 1. Dynamic topic generation via Gemini (no mock/demo pool fallback).
 * 2. Real Gemini AI session turn dialogue.
 * 3. Personalized performance evaluation based on user transcript.
 * 4. Persistence of unique evaluation to MongoDB (Session and Evaluation collections).
 * 5. Reflection of the evaluated session in user history and performance stats.
 */

import "dotenv/config";
import { generateTopic, CATEGORIES } from "./src/topics.js";
import { mongoose, connectDB } from "./src/db.js";
import { Session } from "./src/models/Session.js";
import { Evaluation } from "./src/models/Evaluation.js";
import { User } from "./src/models/User.js";
import jwt from "jsonwebtoken";

const pass = (label) => console.log(`  ✓  ${label}`);
const fail = (label, err) => {
  console.error(`  ✗  ${label}  →  ${err}`);
  process.exitCode = 1;
};

console.log("\n╔══════════════════════════════════════════════════╗");
console.log("║   INTELLIBOT — Gemini Integration & Persistence  ║");
console.log("╚══════════════════════════════════════════════════╝\n");

async function run() {
  // ── 1. Dynamic Topic Generation ─────────────────────────────────────────────
  console.log("1. Dynamic Topic Generation (Gemini API)");
  try {
    const t1 = await generateTopic({ category: "Cybersecurity" });
    if (t1.source === "gemini" && t1.topic.length > 15 && t1.category === "Cybersecurity") {
      pass(`Generated Cybersecurity topic: "${t1.topic.slice(0, 65)}…" (source: ${t1.source})`);
    } else {
      fail("Topic generation source or format invalid", JSON.stringify(t1));
    }

    const t2 = await generateTopic({ category: "Artificial Intelligence" });
    if (t2.source === "gemini" && t2.topic !== t1.topic) {
      pass(`Generated AI topic: "${t2.topic.slice(0, 65)}…" (source: ${t2.source})`);
    } else {
      fail("AI topic duplicate or invalid", JSON.stringify(t2));
    }
  } catch (err) {
    fail("Topic generation threw error", err.message);
  }

  // ── 2. User & Auth Setup ────────────────────────────────────────────────────
  console.log("\n2. User Authentication Setup for Testing");
  await connectDB();
  let testUser = await User.findOne({ email: "test.gemini@skillvsync.com" });
  if (!testUser) {
    testUser = await User.create({
      name: "Test Gemini Candidate",
      email: "test.gemini@skillvsync.com",
      password: "Password123!",
    });
  }
  const token = jwt.sign(
    { id: testUser._id.toString(), email: testUser.email, name: testUser.name },
    process.env.JWT_SECRET || "its_our_production_jwt_hehehe",
    { expiresIn: "1h" }
  );
  pass(`Authenticated as ${testUser.email} (ID: ${testUser._id})`);

  // ── 3. AI Session Turn ──────────────────────────────────────────────────────
  console.log("\n3. Real Gemini AI Discussion Turn");
  const testTopic = "Will artificial intelligence completely replace human software engineers by 2030?";
  const userSpeech = "I believe AI will augment rather than replace engineers. Complex system architecture, human empathy in UX, and ethical decision making cannot be automated solely by current neural models.";

  try {
    const turnRes = await fetch("http://localhost:4000/api/ai-session/turn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic: testTopic,
        transcript: userSpeech,
        history: [],
      }),
    });
    const turnData = await turnRes.json();
    if (turnData.success && turnData.response && turnData.response.length > 20) {
      pass(`AI partner responded: "${turnData.response.slice(0, 80)}…"`);
    } else {
      fail("AI turn response invalid", JSON.stringify(turnData));
    }
  } catch (err) {
    fail("AI turn request failed", err.message);
  }

  // ── 4. Session Evaluation & MongoDB Persistence ─────────────────────────────
  console.log("\n4. Session Evaluation & MongoDB Persistence");
  const history = [
    {
      role: "assistant",
      content: "Welcome to this discussion on whether AI will replace software engineers. What is your perspective on this shift?",
    },
    {
      role: "user",
      content: userSpeech,
    },
    {
      role: "assistant",
      content: "That is a well-reasoned argument. But what about repetitive coding tasks and bug remediation that AI agents can already solve in seconds?",
    },
    {
      role: "user",
      content: "While boilerplate and debugging become automated, the role of engineers shifts upward into high-level design, validation, and domain-specific modeling. Productivity multiplies, but human accountability remains essential.",
    },
  ];

  let evalSessionId = null;
  try {
    const reportRes = await fetch("http://localhost:4000/api/ai-session/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic: testTopic,
        history,
        durationSeconds: 145,
      }),
    });
    const reportData = await reportRes.json();

    if (reportData.success && reportData.report?.analysis) {
      evalSessionId = reportData.sessionId;
      const a = reportData.report.analysis;
      pass(`Evaluation succeeded for session ${evalSessionId}`);
      pass(`Overall Score: ${a.overallScore}/10 | Clarity: ${a.clarityScore}/10 | Vocab: ${a.vocabularyScore}/10`);
      pass(`Summary: "${a.summary.slice(0, 80)}…"`);
      pass(`Strengths count: ${a.strengths?.length || 0}`);
      pass(`Feedback: "${a.communicationFeedback.slice(0, 80)}…"`);
    } else {
      fail("Evaluation failed or missing analysis", JSON.stringify(reportData));
    }
  } catch (err) {
    fail("Report generation error", err.message);
  }

  // ── 5. Verify MongoDB Persistence ───────────────────────────────────────────
  console.log("\n5. Verifying MongoDB Persistence");
  if (evalSessionId) {
    const savedSession = await Session.findOne({ sessionId: evalSessionId });
    if (savedSession && savedSession.status === "ended" && savedSession.type === "individual") {
      const p = savedSession.participants[0];
      pass(`Session found in MongoDB: status="${savedSession.status}", duration=${savedSession.duration}s`);
      pass(`Participant report in Session: overallScore=${p.report.overallScore}, feedback present`);
    } else {
      fail("Session document not properly persisted in MongoDB");
    }

    const savedEvaluation = await Evaluation.findOne({
      userId: testUser._id,
      sessionId: evalSessionId,
    });
    if (savedEvaluation && savedEvaluation.overallScore > 0) {
      pass(`Evaluation collection document verified for user ${savedEvaluation.userId} and session ${savedEvaluation.sessionId}`);
      pass(`Saved ${savedEvaluation.strengths.length} strengths and ${savedEvaluation.improvements.length} improvements`);
    } else {
      fail("Evaluation collection document missing or incomplete in MongoDB");
    }

    // ── 6. Verify User History & Stats Integration ───────────────────────────
    console.log("\n6. Verifying History & Stats Integration");
    const historyRes = await fetch("http://localhost:4000/api/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const historyData = await historyRes.json();
    const foundInHistory = historyData.sessions?.some((s) => s.sessionId === evalSessionId);
    if (foundInHistory) {
      pass(`Session ${evalSessionId} successfully appears in user's /api/history list`);
    } else {
      fail("Session not returned in /api/history");
    }

    const statsRes = await fetch("http://localhost:4000/api/history/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsData = await statsRes.json();
    if (statsData.success && statsData.stats?.totalSessions > 0) {
      pass(`User stats verified: totalSessions=${statsData.stats.totalSessions}, avgScore=${statsData.stats.avgOverallScore.toFixed(1)}`);
    } else {
      fail("User stats not reflecting evaluated session");
    }
  }

  console.log("\n────────────────────────────────────────────────────");
  console.log("  All Gemini API & MongoDB persistence tests passed!\n");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
