// pages/api/assistant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { action, payload } = req.body;

  if (action === "critique") {
    const { text, purpose } = payload || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, message: "Missing or invalid text." });
    }

    const prompt = `
You are a literary assistant offering editorial critique. The user is working in "${purpose}" mode.

Please provide clear, encouraging feedback, focusing on:
1. The most important area for improvement.
2. Two or three actionable suggestions (with examples if needed).
3. Keep it concise, professional, and helpful.

TEXT:
"""
${text}
"""
    `.trim();

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      });

      const critique = completion.choices?.[0]?.message?.content?.trim() || "No critique generated.";
      return res.status(200).json({ success: true, result: critique });
    } catch (error) {
      console.error("Assistant critique error:", error);
      return res.status(500).json({ success: false, message: "Critique generation failed." });
    }
  }

  // Future action types (e.g. "analyzeTone") can go here

  return res.status(400).json({ success: false, message: "Unknown action." });
}
