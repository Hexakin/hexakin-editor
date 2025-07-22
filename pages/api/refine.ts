import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { text, selected, instruction } = req.body;

  if (!text || !instruction) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const refiningText = selected?.trim() || text;

    const prompt = `Refine the following text based on this instruction:

Instruction: ${instruction}

Text:
"""
${refiningText}
"""

Return only the revised version.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No result";

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Refine error:", error);
    return res.status(500).json({ message: "Refinement failed." });
  }
}
