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

  try {
    let prompt = "";
    let target = selected?.trim();

    if (target && target.length > 0) {
      prompt = `You are a helpful writing assistant. Revise the following selected text based on the user's instruction.\n\nInstruction: ${instruction}\n\nSelected Text:\n"${target}"\n\nRefined Version:\n`;
    } else {
      prompt = `You are a helpful writing assistant. Revise the following passage based on the user's instruction.\n\nInstruction: ${instruction}\n\nText:\n${text}\n\nRefined Version:\n`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert editor who rewrites text with precision and clarity.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content?.trim();
    if (!result) {
      return res.status(500).json({ error: "No response from OpenAI." });
    }

    return res.status(200).json({ result });
  } catch (error: any) {
    console.error("Refine API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
