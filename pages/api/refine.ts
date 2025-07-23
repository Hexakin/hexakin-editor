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

  const { text, selected, instruction } = req.body;

  if (!text || !instruction) {
    return res.status(400).json({ message: "Missing text or instruction." });
  }

  const target = selected && selected.trim() ? selected : text;

  const prompt = `
You are an expert editor. Refine the text below according to the user's instruction.

🧠 Instruction: ${instruction}

--- BEGIN TEXT ---
${target}
--- END TEXT ---

Return only the improved version. Do not add commentary.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No refinement result.";

    return res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI Refine Error:", error);
    return res.status(500).json({ message: "Refine API failed." });
  }
}
