// pages/api/critique.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { text, purpose } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Missing or invalid text." });
  }

  const prompt = `
You are a literary critic. Your tone should match the user's purpose, which is "${purpose}".

Provide constructive, professional feedback on the following text. Focus your critique based on their intent:

- If purpose is "Line Edit": focus on grammar, clarity, and sentence structure.
- If purpose is "Fiction Improve": focus on story impact, voice, emotional depth, and pacing.
- If purpose is "Paragraph Rewrite": focus on paragraph flow, internal rhythm, and cohesion.
- If purpose is "Repetition Check": focus on repeated words or ideas, and offer suggestions to reduce redundancy.

Return:
1. Identify the biggest weakness or area for improvement.
2. Provide 2–3 actionable suggestions with examples if helpful.
3. Keep the tone friendly, clear, and editorial.

TEXT:
"""
${text}
"""
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No critique generated.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Critique API Error:", error);
    return res.status(500).json({ message: "Critique generation failed." });
  }
}
