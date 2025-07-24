// components/InlineCritique.tsx
import { useState } from "react";

interface Props {
  text: string;
  purpose: string;
}

export default function InlineCritique({ text, purpose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleCritique = async () => {
    if (!text) return;
    setLoading(true);
    setError("");
    setSent(false);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "critique",
          payload: { text, purpose },
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError("Critique failed to send.");
      } else {
        setSent(true);

        // ✅ Inject into assistant chat
        if (typeof window !== "undefined" && (window as any).HexakinChatInject) {
          (window as any).HexakinChatInject("💡 *Critique Result:*\n\n" + data.result);
        }
      }
    } catch (err) {
      console.error("Critique error:", err);
      setError("Critique failed.");
    }
    setLoading(false);
  };

  return (
    <div className="my-4 text-sm text-gray-700">
      <button
        onClick={handleCritique}
        className="bg-yellow-100 text-yellow-900 font-semibold px-4 py-2 rounded hover:bg-yellow-200 transition-all"
        disabled={loading}
      >
        💡 {loading ? "Sending..." : sent ? "Sent!" : "Critique This"}
      </button>
      <div className="text-xs text-gray-500 mt-1">Critique will appear in the assistant chat →</div>
      {error && <div className="text-red-500 mt-1">{error}</div>}
    </div>
  );
}
