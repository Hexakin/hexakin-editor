// pages/api/tone.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Missing or invalid text." });
  }

  const prompt = `
Analyze the following text for overall tone and formality level.

Return:
- 🎭 Tone: (e.g. optimistic, sarcastic, professional, moody, passive-aggressive)
- 🧑‍⚖️ Formality: (e.g. formal, casual, neutral)
- 💡 Suggestions: If appropriate, suggest ways to shift the tone or improve consistency.

TEXT:
"""
${text}
"""

Use clear and simple language in your response.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No analysis returned.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Tone Analyzer Error:", error);
    return res.status(500).json({ message: "Tone analysis failed." });
  }
}
