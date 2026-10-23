/**
 * categories.ts / mock-data.ts — Topic category definitions.
 *
 * All demo topics, hardcoded topic pools, and mock responses have been removed.
 * Topics are dynamically generated in real-time by the Google Gemini API.
 */

export const TOPIC_CATEGORIES = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Software Engineering",
  "Cloud & Infrastructure",
  "Data Science",
  "Emerging Technologies",
  "Tech Policy & Ethics",
  "General Knowledge",
] as const;

export function getTopicCategories(): string[] {
  return [...TOPIC_CATEGORIES];
}
