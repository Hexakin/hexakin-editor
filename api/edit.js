// pages/api/edit.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key' });
  }

  const { text, mode } = req.body;
  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: `You are a professional fiction editor who performs "${mode}" on the user's text.` },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      return res.status(500).json({
        error: 'OpenAI response failed',
        details: data
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', details: err.message });
  }
}
