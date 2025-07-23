import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing API key" });

  try {
    const chatCompletion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an editorial assistant helping writers brainstorm, plan, and improve their text. Be helpful, creative, and supportive.",
          },
          ...(messages || []),
        ],
        temperature: 0.7,
      }),
    });

    const data = await chatCompletion.json();
    const result = data.choices?.[0]?.message?.content;
    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Request failed." });
  }
}
