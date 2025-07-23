
// components/InlineCritique.tsx
import { useState } from "react";

interface Props {
  text: string;
}

export default function InlineCritique({ text }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCritique = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        if (typeof window !== "undefined" && (window as any).HexakinChatInject) {
          (window as any).HexakinChatInject("💬 *Critique Result:*\n\n" + data.result);
        }
      } else {
        setError("No critique result returned.");
      }
    } catch (err) {
      console.error("Critique error:", err);
      setError("Critique request failed.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleCritique}
        disabled={loading}
        className="px-4 py-2 bg-purple-700 text-white rounded"
      >
        {loading ? "Analyzing..." : "💡 Critique This"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
