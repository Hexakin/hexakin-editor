
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { text, mode } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OpenAI API key");
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful writing editor for novels." },
          { role: "user", content: `Editing mode: ${mode}\n\nText:\n${text}` },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return res.status(500).json({ error: data.error.message || "OpenAI API error" });
    }

    res.status(200).json({ result: data.choices?.[0]?.message?.content || "No response." });

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
