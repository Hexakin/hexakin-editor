// components/InlineCritique.tsx
import { useState } from "react";

interface InlineCritiqueProps {
  text: string;
  purpose: string;
}

export default function InlineCritique({ text, purpose }: InlineCritiqueProps) {
  const [loading, setLoading] = useState(false);

  const handleCritique = async () => {
    setLoading(true);
    try {
      await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "user",
          content: `💡 Critique this revised text for the selected purpose (${purpose}):\n\n"""${text}"""`,
        }),
      });
    } catch (error) {
      console.error("Failed to send critique to assistant:", error);
    }
    setLoading(false);
  };

  return (
    <div className="my-4 text-sm text-gray-600 text-center">
      <button
        onClick={handleCritique}
        disabled={loading}
        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 font-medium px-4 py-2 rounded transition"
      >
        💡 {loading ? "Sending..." : "Critique This"}
      </button>
      <div className="text-xs mt-1 text-gray-400">Critique will appear in the assistant chat →</div>
    </div>
  );
}
