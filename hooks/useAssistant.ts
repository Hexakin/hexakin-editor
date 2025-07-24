import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string, role: "user" | "assistant" = "user") => {
    const newMessage: Message = { role, content };
    setMessages((prev) => [...prev, newMessage]);

    if (role === "assistant") return; // Don't call API if injecting from system

    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
    setLoading(false);
  };

  return {
    messages,
    sendMessage,
    loading,
  };
}
