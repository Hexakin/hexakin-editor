import { useEffect, useRef, useState } from "react";
import { useAssistant } from "../hooks/useAssistant";
import { useAppContext } from '../context/AppContext';

export default function ChatSidebar() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, loading } = useAssistant();
  const appContext = useAppContext();
  const { handleInjectText } = useAppContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [collapsedMap, setCollapsedMap] = useState<{ [key: number]: boolean }>({});

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message, appContext);
    setMessage("");
  };

  const handleSmartInject = (content: string) => {
    const codeBlockRegex = /```(?:[\w\s]+)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);
    const textToInject = match ? match[1].trim() : content;
    handleInjectText(textToInject);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).HexakinChatInject = (content: string) => {
        sendMessage(content, null, "assistant");
      };
    }
  }, [sendMessage]);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

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
    <div className="h-full flex flex-col relative bg-card text-card-foreground">
      <div className="p-4 border-b border-border font-semibold text-lg">📣 Assistant</div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 text-sm max-h-[calc(100vh-120px)]"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLong = msg.content.length > 300;
          const collapsed = collapsedMap[idx] ?? isLong;

          const toggleCollapse = () => {
            setCollapsedMap((prev) => ({
              ...prev,
              [idx]: !collapsed,
            }));
          };

          return (
            <div
              key={idx}
              className={`p-3 rounded-md relative ${
                isUser ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <div className="text-xs font-semibold mb-1 flex justify-between items-center">
                <span className="text-foreground">
                  {msg.role === "user"
                    ? "💬 You"
                    : msg.content.startsWith("💡")
                    ? "💡 Critique"
                    : msg.content.startsWith("🎯")
                    ? "🎯 Tone Insight"
                    : "🤖 Assistant"}
                </span>
                {!isUser && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSmartInject(msg.content)}
                      className="text-xs text-primary hover:underline font-semibold"
                      title="Inject this text into the active editor"
                    >
                      ✍️ Inject
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>

              {isLong ? (
                <>
                  <button
                    className="text-xs text-primary underline mb-1"
                    onClick={toggleCollapse}
                  >
                    {collapsed ? "Show full message" : "Hide"}
                  </button>
                  {!collapsed && (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              <div className="text-[10px] text-muted-foreground mt-1">
                {formatTimestamp(new Date())}
              </div>
            </div>
          );
        })}
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-16 right-4 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs shadow-lg"
        >
          ↓ Scroll to latest
        </button>
      )}

      <div className="p-2 border-t border-border flex gap-2">
        <input
          type="text"
          className="flex-1 border border-input px-3 py-1.5 rounded-md bg-background text-foreground"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-primary text-primary-foreground font-semibold px-3 py-1 rounded-md shadow hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
