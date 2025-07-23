
// components/EchoTracker.tsx
import { useState } from "react";

interface Props {
  text: string;
}

export default function EchoTracker({ text }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        if (typeof window !== "undefined" && (window as any).HexakinChatInject) {
          (window as any).HexakinChatInject("📊 *Echo Analysis Result:*\n\n" + data.result);
        }
      } else {
        setError("No echoes found.");
      }
    } catch (err) {
      console.error("Echo analysis failed:", err);
      setError("Failed to analyze echoes.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Echo / Pattern Tracker</h2>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        {loading ? "Analyzing..." : "Send to Assistant"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
