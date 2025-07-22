// pages/api/refine.ts

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Data = {
  result?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, selected, instruction } = req.body;

  if (!text || !instruction) {
    return res.status(400).json({ error: "Missing input text or instruction." });
  }

  const hasSelection = selected?.trim().length > 0;

  const prompt = hasSelection
    ? `You are a precise editor. Revise the selected text based on the user's instruction.\n\nInstruction: ${instruction}\n\nSelected Text: "${selected}"\n\nReturn ONLY the rewritten version. Do not include the original or any commentary.`
    : `You are a helpful editor. Revise the following passage based on the user's instruction.\n\nInstruction: ${instruction}\n\nText:\n${text}\n\nReturn ONLY the rewritten version of the full passage.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a precise and helpful writing assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    let result = completion.choices[0].message.content?.trim() || "";

    // Sanitize GPT’s output (e.g., remove stray quotes or repeated text)
    result = result.replace(/^["']+|["']+$/g, "").replace(/\s+/g, " ").trim();

    res.status(200).json({ result });
  } catch (error: any) {
    console.error("Refine API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
