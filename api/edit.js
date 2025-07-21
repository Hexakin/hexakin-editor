
export default async function handler(req, res) {
  const { text, mode } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful writing editor for novels." },
          { role: "user", content: `Editing mode: ${mode}\n\nText:\n${text}` }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ result: data.choices?.[0]?.message?.content || "No response." });
  } catch (error) {
    res.status(500).json({ error: "Error connecting to OpenAI." });
  }
}
