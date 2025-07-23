
// components/ToneAnalyzer.tsx
import { useState } from "react";

interface Props {
  text: string;
}

const TONE_OPTIONS = [
  "",
  "Hopeful",
  "Desperate",
  "Detached",
  "Warm",
  "Clinical",
  "Ironic",
  "Introspective",
  "Playful",
  "Paranoid",
  "Authoritative",
  "Neutral",
];

export default function ToneAnalyzer({ text }: Props) {
  const [targetTone, setTargetTone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetTone }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        if (typeof window !== "undefined" && (window as any).HexakinChatInject) {
          const label = targetTone
            ? `🎯 *Tone Analysis (Target: ${targetTone}):*\n\n`
            : "🎯 *Tone / Formality Analysis:*\n\n";
          (window as any).HexakinChatInject(label + data.result);
        }
      } else {
        setError("No analysis returned.");
      }
    } catch (err) {
      console.error("Tone analysis failed:", err);
      setError("Failed to analyze tone.");
    }

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Tone / Formality Analysis</h2>

      {/* Desired Tone Selector */}
      <label className="block mb-1 text-sm font-medium">Desired Tone (optional)</label>
      <select
        value={targetTone}
        onChange={(e) => setTargetTone(e.target.value)}
        className="mb-3 w-full md:w-72 border px-2 py-1 rounded"
      >
        {TONE_OPTIONS.map((tone) => (
          <option key={tone} value={tone}>
            {tone || "-- No Preference --"}
          </option>
        ))}
      </select>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-4 py-2 bg-sky-600 text-white rounded"
      >
        {loading ? "Analyzing..." : "Send to Assistant"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
