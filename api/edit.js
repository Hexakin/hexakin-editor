export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, mode } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Missing OpenAI API key" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `You are a helpful editor that performs '${mode}' edits.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content;

    return res.status(200).json({ result: result || "No response." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
