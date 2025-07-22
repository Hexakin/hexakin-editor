// pages/api/edit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { input, purpose, style, editorType } = req.body;

  if (!input || !purpose || !style || !editorType) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const prompt = `You are an intelligent, style-aware editor helping the user refine their writing.

Editing Purpose: ${purpose}
Style: ${style}
Editor Type: ${editorType}

Here is the user's text:
"""
${input}
"""

Please return the improved version of the text only. Preserve the original voice unless clarity or tone requires an adjustment.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Use "gpt-3.5-turbo" if needed
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No response from model.";

    return res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return res.status(500).json({ message: "Error calling OpenAI API." });
  }
}
