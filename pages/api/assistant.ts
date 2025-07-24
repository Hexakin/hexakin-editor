import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- Helper function to format the context object into a readable string ---
const formatContext = (context: any): string => {
  if (!context) return "No additional context provided.";

  const { hexakinState, activeChapter } = context;
  let contextString = "--- START OF CONTEXT ---\n\n";

  // 1. Add Hexakin Editor context if available
  if (hexakinState && hexakinState.inputText) {
    contextString += "## HEXAKIN EDITOR DATA:\n";
    contextString += `- Input Text: "${hexakinState.inputText.substring(0, 200)}..."\n`;
    if (hexakinState.editedText) {
      contextString += `- Edited Output: "${hexakinState.editedText.substring(0, 200)}..."\n`;
    }
    contextString += `- Purpose: ${hexakinState.purpose}\n`;
    contextString += `- Style: ${hexakinState.style}\n\n`;
  }

  // 2. Add Draft Studio context if a chapter is active
  if (activeChapter) {
    contextString += "## DRAFT STUDIO DATA:\n";
    contextString += `- Active Chapter Title: "${activeChapter.title}"\n`;
    // THE FIX: Increased the character limit significantly to provide more context.
    contextString += `- Active Chapter Content (first 3000 chars): "${activeChapter.content.substring(0, 3000)}..."\n\n`;
  }
  
  contextString += "--- END OF CONTEXT ---\n\n";
  return contextString;
};

const PROMPTS = {
  critique: (text: string, purpose: string) => `You are a literary critic... [Your critique prompt here]`, // Truncated for brevity
  echo: (text: string) => `You are a literary pattern analyst... [Your echo prompt here]`,
  tone: (text: string, targetTone?: string) => `Analyze the text for tone... [Your tone prompt here]`,
  // The chat prompt is now built dynamically
};

// Define a broader type for the system message object
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
      chat: { role: "system", content: "You are an insightful and context-aware writing assistant. Use the provided context to give the most relevant and helpful answers possible. Address the user directly." },
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
        // THE FIX: Refined the prompt structure for better clarity for the AI.
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
