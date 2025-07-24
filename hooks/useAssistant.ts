
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.result },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "⚠️ Error: No response from assistant." },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "⚠️ Network error." },
      ]);
    }

    setLoading(false);
  };

  const injectMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  return { messages, sendMessage, injectMessage, loading };
}
