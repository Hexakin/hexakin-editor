// pages/api/refine.ts

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, selected, instruction } = req.body;

  if (!text || !instruction) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const context = selected
    ? `Refine just the selected portion of the text according to the instruction.\n\nSelected Text:\n"""${selected}"""\n\nInstruction: ${instruction}`
    : `Refine the entire text based on the following instruction: ${instruction}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert editor. Return only the refined version of the selected or full text. Do not explain or summarize.",
        },
        {
          role: "user",
          content: `${context}\n\nFull Text:\n"""${text}"""`,
        },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || "";
    res.status(200).json({ result });
  } catch (error) {
    console.error("Refine error:", error);
    res.status(500).json({ error: "Failed to refine text" });
  }
}
