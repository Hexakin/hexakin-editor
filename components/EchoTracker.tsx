// components/EchoTracker.tsx
import { useState } from "react";

interface Props {
  text: string;
}

export default function EchoTracker({ text }: Props) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setResult(data.result);
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
        className="px-4 py-2 bg-indigo-600 text-white rounded mb-3"
      >
        {loading ? "Analyzing..." : "Analyze Echoes"}
      </button>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      {result && (
        <pre className="whitespace-pre-wrap bg-gray-100 text-sm p-3 rounded border border-gray-300">
          {result}
        </pre>
      )}
    </div>
  );
}
