/**
 * Evaluation.js MongoDB model for AI session & discussion evaluations.
 *
 * Persists detailed, Gemini-generated performance reports per user and session.
 */

import { mongoose } from "../db.js";

const evaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["individual", "group"],
      default: "individual",
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    turns: {
      type: Number,
      default: 0,
    },
    transcript: {
      type: String,
      default: "",
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    vocabularyScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    clarityScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    summary: {
      type: String,
      default: "",
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    grammarSuggestions: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    contextualRelevance: {
      type: String,
      default: "",
    },
    communicationFeedback: {
      type: String,
      default: "",
    },
    rawReport: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

evaluationSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
evaluationSchema.index({ createdAt: -1 });

export const Evaluation = mongoose.model("Evaluation", evaluationSchema);
