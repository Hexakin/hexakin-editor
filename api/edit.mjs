import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, mode } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode' });
  }

  try {
    const systemPrompt =
      mode === 'Line Edit'
        ? 'You are a helpful assistant that line-edits user writing to improve clarity, flow, and correctness without altering its meaning.'
        : mode === 'Critique'
        ? 'You are a professional editor who provides honest, constructive critique on the writing provided.'
        : 'You are a helpful assistant. Improve the following text.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content || 'No response.';
    return res.status(200).json({ result });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
