/**
 * topics.js — Dynamic topic generation via Google Gemini API.
 *
 * All demo topics and local fallback pools have been removed.
 * Topics are dynamically generated in real-time based on discussion category.
 */

export const CATEGORIES = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Software Engineering",
  "Cloud & Infrastructure",
  "Data Science",
  "Emerging Technologies",
  "Tech Policy & Ethics",
  "General Knowledge",
];

let _catIdx = Math.floor(Math.random() * CATEGORIES.length);
function nextCategory() {
  const cat = CATEGORIES[_catIdx % CATEGORIES.length];
  _catIdx++;
  return cat;
}

export function getCategories() {
  return CATEGORIES;
}

// ── Gemini call ───────────────────────────────────────────────────────────────
function buildPrompt(category) {
  return (
    "Generate one concise, thought-provoking group discussion topic.\n" +
    "Rules:\n" +
    "- Single sentence or question, 10–25 words\n" +
    "- Suitable for a structured academic or professional debate\n" +
    "- Related to IT, technology, or current tech policy\n" +
    "- Return ONLY the topic text — no numbering, no quotes, no explanation\n\n" +
    `Category: ${category}`
  );
}

function cleanTopic(raw) {
  const t = raw.trim().replace(/^["'`*\-•\d.]+\s*|["'`*\-•]+$/g, "").trim();
  if (!t || t.length < 10) throw new Error("Generated topic response was too short or empty.");
  if (t.length > 300)      throw new Error("Generated topic response was too long.");
  return t;
}

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
  return (text || "").trim();
}

async function callGemini(apiKey, category) {
  const candidateModels = [
    process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.5-flash",
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError = null;

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${GEMINI_INTERACTIONS_URL}?key=${apiKey}`, {
        method:  "POST",
        signal:  controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          input: buildPrompt(category),
          generation_config: {
            temperature: 0.9,
            max_output_tokens: 100,
          },
        }),
      });
      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const err = new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 150)}`);
        err.status = res.status;
        lastError = err;
        if (res.status === 503 || res.status === 429 || res.status === 404) {
          console.warn(`[topics] Gemini model "${model}" returned ${res.status}, trying fallback model...`);
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const raw  = extractInteractionText(json);
      return cleanTopic(raw);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (err.status === 503 || err.status === 429 || err.status === 404) continue;
      throw err;
    }
  }

  throw lastError || new Error("Gemini topic generation failed across all candidate models.");
}

/**
 * generateTopic — Purely Gemini API driven. Never falls back to local or demo data.
 */
export async function generateTopic(options = {}) {
  const category = options.category && CATEGORIES.includes(options.category)
    ? options.category
    : nextCategory();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    const err = new Error("Gemini API key is not configured. Set GEMINI_API_KEY in server/.env");
    err.status = 503;
    throw err;
  }

  try {
    const topic = await callGemini(apiKey, category);
    console.log(`[topics] ✦ Gemini [${category}]: "${topic.slice(0, 60)}…"`);
    return { topic, source: "gemini", category };
  } catch (err) {
    console.error(`[topics] Gemini topic generation failed for category "${category}":`, err.message);
    const failure = new Error(`Failed to generate topic via Gemini: ${err.message}`);
    failure.status = err.status || 502;
    throw failure;
  }
}
