// pages/api/refine.ts
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

  if (!text) {
    return res.status(400).json({ message: "Missing text to refine." });
  }

  try {
    const prompt = `The following text was previously edited. Please refine it further by improving sentence flow, eliminating clunky phrasing, and subtly enhancing its tone and clarity. Keep the voice consistent.

"""
${text}
"""

Return only the improved version.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No result";

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Refine error:", error);
    return res.status(500).json({ message: "Refinement failed." });
  }
}
