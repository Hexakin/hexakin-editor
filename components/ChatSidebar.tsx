
// components/ChatSidebar.tsx
import { useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatSidebar() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleUserSend = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: failed to respond." }]);
    }
  };

  // New helper to allow external components to send messages in
  const injectAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  // Expose injector globally (temporary approach)
  if (typeof window !== "undefined") {
    (window as any).HexakinChatInject = injectAssistantMessage;
  }

  return (
    <aside className="h-screen overflow-y-auto p-4 w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm">
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
    </aside>
  );
}
