// pages/api/edit.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
const { text, mode, tone } = req.body;


  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
messages: [
  {
    role: "system",
    content:
      mode === "Paragraph Edit"
        ? "You are a helpful and precise editor. Edit the text with paragraph-level fluency and clarity improvements. Avoid changing the author’s style unless clarity is at risk."
        : `You are a helpful and precise editor. Please rewrite the user's text with the following style: ${mode}`,
  },
  {
    role: "user",
    content: text,
  },
],


        temperature: 0.7
      })
    });

    const data = await completion.json();
    const edited = data.choices?.[0]?.message?.content || "No response";

    res.status(200).json({ edited });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
