
// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Missing or invalid message." });
  }

  // Pull last injected message from global if it exists
  const context = (global as any).HexakinLastInject || "";
  const fullPrompt = context
    ? `Based on the following editorial insight, respond to the user's request.

INSIGHT:
${context}

USER REQUEST:
${message}`
    : message;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
    });

    const result = completion.choices?.[0]?.message?.content?.trim() || "No response generated.";
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return res.status(500).json({ message: "Chat API failed." });
  }
}
