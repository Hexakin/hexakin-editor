// pages/api/echo.ts
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
You are a literary pattern analyst.

Analyze the following text for ECHOES — repeated phrases, motifs, or metaphors.

Return a list of:
- ✳️ Repeated phrases (2+ words)
- 🔁 How many times they appear
- 📌 A short example usage (if possible)

TEXT TO ANALYZE:
"""
${text}
"""

Return only the findings in structured markdown like:

## Echoes Found

- "the weight of it" (3 times) — e.g. “He could feel the weight of it pressing down.”
- "turned away" (4 times) — e.g. “She turned away from the light.”
- "burning sky" (2 times) — e.g. “The city burned under a burning sky.”

Only include meaningful patterns. Skip common function words or non-pattern repetition.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No echoes found.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Echo Tracker Error:", error);
    return res.status(500).json({ message: "Echo analysis failed." });
  }
}
