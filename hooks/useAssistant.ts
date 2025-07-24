import { useState } from "react";
import { useAppContext } from '../context/AppContext'; // We need the type definition

// Define the shape of the context object that will be passed
type AppContextType = ReturnType<typeof useAppContext>;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // The sendMessage function is now updated to accept the context
  const sendMessage = async (
    content: string,
    context: AppContextType | null, // The context can be null for injected messages
    role: "user" | "assistant" = "user"
  ) => {
    const newMessage: Message = { role, content };
    setMessages((prev) => [...prev, newMessage]);

    if (role === "assistant") return;

    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: { 
            message: content,
            // We pass the entire context snapshot in the payload
            context: context 
          },
        }),
      });

      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      } else {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, the server returned an unexpected error. (Status: ${response.status})` }]);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't connect to the server. Please check the connection." }]);
    }
    setLoading(false);
  };

  return {
    messages,
    sendMessage,
    loading,
  };
}
