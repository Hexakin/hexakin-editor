
// components/ChatSidebar.tsx
import { useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  const handleUserSend = async () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setUserInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Assistant failed to reply." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Network error." }]);
    }
  };

  // Allow injection of assistant messages externally
  const injectAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  if (typeof window !== "undefined") {
    (window as any).HexakinChatInject = injectAssistantMessage;
  }

  return (
    <aside className="h-screen flex flex-col overflow-hidden w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm">
      <div className="p-4 overflow-y-auto flex-1">
        <h2 className="font-semibold text-lg mb-3">Assistant</h2>
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-900"
                  : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Editor"}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUserSend()}
          placeholder="Ask something..."
          className="flex-1 border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={handleUserSend}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Send
        </button>
      </div>
    </aside>
  );
}
