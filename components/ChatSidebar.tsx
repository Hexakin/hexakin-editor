import { useEffect, useRef, useState } from "react";
import { useAssistant } from "../hooks/useAssistant";

export default function ChatSidebar() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, loading } = useAssistant();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage("");
  };

  // Register HexakinChatInject for external system messages
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).HexakinChatInject = (content: string) => {
        sendMessage(content, "assistant");
      };
    }
  }, [sendMessage]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Show "scroll to latest" button when not at bottom
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!atBottom);
  };

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const formatTimestamp = (date: Date) =>
    `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      alert("Copy failed.");
    });
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-4 border-b font-semibold text-lg">📣 Assistant</div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 text-sm max-h-[calc(100vh-120px)]"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const time = formatTimestamp(new Date());
          const isLong = msg.content.length > 300;
          const [collapsed, setCollapsed] = useState(isLong);

          return (
            <div
              key={idx}
              className={`p-3 rounded relative ${
                isUser ? "bg-blue-100 text-blue-900" : "bg-gray-100 text-black"
              }`}
            >
              <div className="text-xs font-semibold mb-1">
                {msg.role === "user"
                  ? "💬 You"
                  : msg.content.startsWith("💡")
                  ? "💡 Critique"
                  : msg.content.startsWith("🎯")
                  ? "🎯 Tone Insight"
                  : "🤖 Assistant"}
              </div>

              {isLong ? (
                <div>
                  <button
                    className="text-xs text-blue-600 underline mb-1"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? "Show full message" : "Hide"}
                  </button>
                  {!collapsed && <div className="whitespace-pre-wrap">{msg.content}</div>}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              <div className="text-[10px] text-gray-500 mt-1">{time}</div>

              {msg.role !== "user" && (
                <button
                  onClick={() => copyToClipboard(msg.content)}
                  className="absolute top-2 right-2 text-xs text-gray-400 hover:text-black"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-16 right-4 bg-blue-600 text-white px-2 py-1 rounded text-xs shadow"
        >
          ↓ Scroll to latest
        </button>
      )}

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
