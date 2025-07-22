// pages/api/refine.ts

import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { text, selected, instruction } = req.body;

  if (!text || !selected || !instruction) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const prompt = `
You're a helpful editor. Refine only the selected text below based on the instruction. 
Do not rephrase the full context — just rewrite the selected section. Return only the updated selection, nothing else.

Instruction: ${instruction}

Context:
${text}

Selected Text:
"${selected}"

Improved Selection:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = response.choices[0].message.content?.trim();
    res.status(200).json({ result });
  } catch (err) {
    console.error("Refine error:", err);
    res.status(500).json({ error: "Failed to process refinement." });
  }
}
