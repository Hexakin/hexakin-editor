import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setLoading(true);
    const updatedMessages = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: data.result },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: "Something went wrong." },
        ]);
      }
    } catch (err) {
      console.error("Assistant error:", err);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Error talking to assistant." },
      ]);
    }
    setLoading(false);
  };

  return { messages, sendMessage, loading };
}