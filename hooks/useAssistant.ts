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

    if (role === "assistant") return;

    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          payload: { message: content },
        }),
      });

      // --- THE FIX IS HERE ---
      // First, check if the response is actually JSON before trying to parse it.
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.result }]);
      } else {
        // If it's not JSON, it's likely an HTML error page.
        const errorText = await response.text(); // Get the error text from the HTML page
        console.error("API Error Response:", errorText); // Log the full error for debugging
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
