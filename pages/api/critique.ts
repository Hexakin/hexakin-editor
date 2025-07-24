
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

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Missing or invalid text." });
  }

  const prompt = `
You are a literary critic. Provide constructive, professional feedback on the following text.

First, identify the biggest weakness or area for improvement.
Second, give 2–3 clear, actionable suggestions for improving that part.
Avoid general advice; be specific and concise.

TEXT:
${text}

Respond only with your critique.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No critique generated.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Critique API error:", error);
    return res.status(500).json({ message: "Critique API failed." });
  }
}
