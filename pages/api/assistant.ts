import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "Missing or invalid text." });
  }

  const prompt = `
You are a helpful editorial writing assistant. Respond clearly and constructively to the user's message below.

User Message:
"""
${text}
"""
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No response.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Assistant API error:", error);
    return res.status(500).json({ message: "Assistant failed to respond." });
  }
}