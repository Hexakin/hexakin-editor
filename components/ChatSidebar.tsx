import { useEffect, useState } from "react";
import { useAssistant } from "../hooks/useAssistant";

export default function ChatSidebar() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, loading } = useAssistant();

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage("");
  };

  // ✅ This makes injected system messages show up in the chat
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).HexakinChatInject = (content: string) => {
        sendMessage(content, "assistant");
      };
    }
  }, [sendMessage]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-semibold text-lg">📣 Assistant</div>
<div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm max-h-[calc(100vh-120px)] overflow-scroll">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-gray-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
