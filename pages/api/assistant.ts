// pages/api/assistant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define prompts in a separate, manageable object
const PROMPTS = {
  critique: (text: string, purpose: string) => `You are a literary critic. Your tone should match the user's purpose, which is "${purpose}". Provide constructive, professional feedback on the following text. Focus on the biggest weakness and 2-3 actionable suggestions.\n\nTEXT:\n"""\n${text}\n"""`,
  echo: (text: string) => `You are a literary pattern analyst. Analyze the following text for ECHOES (repeated phrases/motifs). Return a markdown list of findings.\n\nTEXT:\n"""\n${text}\n"""`,
  tone: (text: string, targetTone?: string) => `Analyze the text for tone and formality. ${targetTone ? `Compare it to the desired tone of "${targetTone}".` : ''}\n\nTEXT:\n"""\n${text}\n"""`,
  chat: (message: string) => message,
};

// 👇 THE FIX IS HERE: We add "as const" to make the types specific.
const systemMessages = {
  chat: { role: "system", content: "You are an insightful writing assistant." },
  default: { role: "system", content: "You are an expert writing editor." },
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { action, payload } = req.body;

    const actionKey = action as keyof typeof PROMPTS;
    if (!actionKey || !payload || !PROMPTS[actionKey]) {
      return res.status(400).json({ message: 'Invalid action or payload.' });
    }

    let promptContent = "";
    let systemMessage: (typeof systemMessages)[keyof typeof systemMessages] = systemMessages.default;

    switch (actionKey) {
      case 'critique':
        promptContent = PROMPTS.critique(payload.text, payload.purpose);
        break;
      case 'echo':
        promptContent = PROMPTS.echo(payload.text);
        break;
      case 'tone':
        promptContent = PROMPTS.tone(payload.text, payload.targetTone);
        break;
      case 'chat':
        promptContent = PROMPTS.chat(payload.message);
        systemMessage = systemMessages.chat;
        break;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      // Now, TypeScript knows systemMessage.role is "system", not "string"
      messages: [systemMessage, { role: 'user', content: promptContent }],
      temperature: 0.6,
    });
    
    const result = completion.choices[0].message?.content?.trim() || 'No response generated.';
    return res.status(200).json({ result });

  } catch (error) {
    console.error(`API Action "${req.body.action}" Error:`, error);
    return res.status(500).json({ message: 'Request failed.' });
  }
}