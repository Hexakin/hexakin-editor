// pages/api/assistant.ts
    import type { NextApiRequest, NextApiResponse } from "next";
    import { OpenAI } from "openai";

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
      }

      const { action, payload } = req.body;

      if (action === "critique") {
        const { text, purpose } = payload;

        if (!text || typeof text !== "string") {
          return res.status(400).json({ message: "Missing or invalid text." });
        }

        const prompt = \`
You are a literary critic. Provide constructive, professional feedback on the following text.

First, identify the biggest weakness or area for improvement.

Then, give 2–3 actionable suggestions the writer could use to improve the piece.

Editing Purpose: \${purpose || "General"}

TEXT:
\"\""
\${text}
\"\""
\`;

        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
          });

          const critique = completion.choices?.[0]?.message?.content?.trim();

          if (!critique) {
            return res.status(500).json({ success: false, message: "No critique returned." });
          }

          return res.status(200).json({
            success: true,
            result: {
              role: "assistant",
              content: \`Editor: 💬 *Critique Result:* \${critique}\`,
            },
          });
        } catch (err) {
          console.error("Critique API error:", err);
          return res.status(500).json({ success: false, message: "Critique API failed." });
        }
      } else {
        return res.status(400).json({ success: false, message: "Unknown action." });
      }
    }