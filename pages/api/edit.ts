// pages/api/edit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { input, purpose, style, editorType } = req.body;

  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ message: "Missing or invalid input text." });
  }

  const editPurpose = purpose || "Improve clarity and style.";
  const editStyle = style || "Default";
  const editType = editorType || "General document";

  const prompt = `
You are an expert writing editor tasked with improving the user's writing.

🎯 Purpose: ${editPurpose}
🖋️ Style: ${editStyle}
📝 Editor Type: ${editType}

--- BEGIN TEXT ---
${input}
--- END TEXT ---

Please return only the improved version of the text. Keep formatting and tone unless the instruction says otherwise.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
