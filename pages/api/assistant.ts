// pages/api/assistant.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const formatContext = (context: any): string => {
  if (!context) return "No additional context provided.";

  const { hexakinState, activeChapter } = context;
  let contextString = "--- START OF CONTEXT ---\n\n";

  if (hexakinState && hexakinState.inputText) {
    contextString += "## HEXAKIN EDITOR DATA:\n";
    contextString += `- Input Text: "${hexakinState.inputText.substring(0, 200)}..."\n`;
    if (hexakinState.editedText) {
      contextString += `- Edited Output: "${hexakinState.editedText.substring(0, 200)}..."\n`;
    }
    contextString += `- Purpose: ${hexakinState.purpose}\n`;
    contextString += `- Style: ${hexakinState.style}\n\n`;
  }

  if (activeChapter) {
    contextString += "## DRAFT STUDIO DATA:\n";
    contextString += `- Active Chapter Title: "${activeChapter.title}"\n`;
    contextString += `- Active Chapter Content (first 3000 chars): "${activeChapter.content.substring(0, 3000)}..."\n\n`;
  }
  
  contextString += "--- END OF CONTEXT ---\n\n";
  return contextString;
};

// --- CORRECTED PROMPTS ---
const PROMPTS = {
  critique: (text: string, purpose: string) => `You are a literary critic. Your task is to provide a constructive critique of the following text, keeping in mind the author's stated purpose is "${purpose}". Focus on providing actionable feedback and specific examples. Do not rewrite the text, only critique it.

--- TEXT TO CRITIQUE ---
${text}
--- END TEXT ---`,

  echo: (text: string) => `You are a literary pattern analyst. Your task is to meticulously dissect the following text to identify repeated words (excluding common stop words like "the", "a", "is"), recurring phrases, and sentence openers. Present your findings clearly, perhaps in a list, to help the author see these "echoes" in their work.

--- TEXT TO ANALYSE ---
${text}
--- END TEXT ---`,

  tone: (text: string, targetTone?: string) => `You are a tone and sentiment analyst. Analyse the tone, mood, and formality of the following text. ${targetTone ? `The author's desired tone is "${targetTone}". Compare the actual tone to the desired tone and provide suggestions for alignment.` : ''} Give a clear summary of your findings.

--- TEXT TO ANALYSE ---
${text}
--- END TEXT ---`,
};

type SystemMessage = {
    readonly role: "system";
    readonly content: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { action, payload } = req.body;

    if (!action || !payload) {
      return res.status(400).json({ message: 'Invalid action or payload.' });
    }

    let promptContent = "";
    const systemMessages = {
      chat: { role: "system", content: "You are a writing assistant. First, provide a brief, friendly conversational opening. Then, if the user is asking for a writing suggestion, provide ONLY the suggested text inside a single markdown code block. Example: 'Of course, here is a suggestion:\\n\\n```\\nThe crimson sun bled across the horizon.\\n```'" },
      default: { role: "system", content: "You are an expert writing editor." },
    } as const;
    
    let systemMessage: SystemMessage = systemMessages.default;

    switch (action) {
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
        const contextText = formatContext(payload.context);
        promptContent = `Given the following context about what the user is working on, please answer their question.\n\n${contextText}User's Question: "${payload.message}"`;
        systemMessage = systemMessages.chat;
        break;
      default:
        return res.status(400).json({ message: 'Unknown action.' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
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