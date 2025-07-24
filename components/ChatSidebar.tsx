
import { useState } from "react";

export default function ChatSidebar() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error: No reply." }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Network error." },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 p-2 rounded"
                : "bg-gray-100 text-black p-2 rounded"
            }
          >
            <strong>{msg.role === "user" ? "You" : "Editor"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded text-black"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
