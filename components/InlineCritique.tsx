// components/InlineCritique.tsx
import { useState } from "react";

interface InlineCritiqueProps {
  text: string;
  purpose: string;
}

export default function InlineCritique({ text, purpose }: InlineCritiqueProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCritique = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, purpose }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        window.dispatchEvent(
          new CustomEvent("push-to-sidebar", {
            detail: {
              role: "assistant",
              content: `💡 *Critique Result:* ${data.result}`,
            },
          })
        );
      } else {
        setError("Critique failed.");
      }
    } catch (err) {
      console.error("Critique error:", err);
      setError("Something went wrong during critique.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1 mt-4">
      <button
        onClick={handleCritique}
        disabled={!text.trim() || loading}
        className="bg-yellow-100 text-yellow-900 px-3 py-2 rounded text-sm font-medium"
      >
        💡 Critique This
      </button>
      <span className="text-xs text-gray-500 ml-1">
        Critique will appear in the assistant chat →
      </span>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
