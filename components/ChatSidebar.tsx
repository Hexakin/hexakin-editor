import { useState } from "react";

export default function ChatSidebar() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user" as "user", content: input }
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/editor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(-5) }), // Only send last 5 messages for lightweight context
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setMessages([...newMessages, { role: "assistant", content: data.result }]);
      } else {
        setError("Something went wrong with the assistant response.");
      }
    } catch (err) {
      setError("Failed to connect to the assistant.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full md:w-[320px] border-l p-4 bg-gray-50 dark:bg-gray-900 text-sm flex flex-col">
      <h2 className="text-lg font-semibold mb-2">🧠 Editorial Chat Assistant</h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${msg.role === "user" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-200 dark:bg-gray-700"}`}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <p className="italic text-gray-500">Thinking...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for help..."
          className="flex-1 border px-2 py-1 rounded"
        />
        <button onClick={handleSend} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
