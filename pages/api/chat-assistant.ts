// pages/api/chat-assistant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { role, content } = req.body;

  if (!content || !role) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an insightful writing assistant and editor." },
        { role, content },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message?.content?.trim() || "No response.";
    return res.status(200).json({ result: reply });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return res.status(500).json({ message: "Failed to generate assistant response." });
  }
}
