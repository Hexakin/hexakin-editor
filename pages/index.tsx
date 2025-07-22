import { useState } from "react";
import FeatureTracker from '../components/FeatureTracker';

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [mode, setMode] = useState("Line Edit");
  const [loading, setLoading] = useState(false);
const [tone, setTone] = useState("Default");
const [darkMode, setDarkMode] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    setEditedText("Working...");

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
body: JSON.stringify({ text: inputText, mode, tone }),

      });

      const data = await response.json();

      if (data.edited) {
        setEditedText(data.edited);
      } else {
        setEditedText("No edit result returned.");
      }
    } catch (error) {
      console.error("Error:", error);
      setEditedText("There was an error processing your request.");
    }

    setLoading(false);
  };

return (
  <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-white text-black min-h-screen"}>
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">Hexakin Editor</h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="ml-auto mb-4 px-4 py-2 rounded text-sm border bg-gray-200 dark:bg-gray-800 dark:text-white"
      >
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="w-full h-40 p-4 border rounded mb-4"
        placeholder="Enter text to edit..."
      />

      <div className="flex items-center gap-4 mb-4">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="mb-4 rounded border px-4 py-2"
        >
          <option value="Line Edit">Line Edit</option>
          <option value="Formal Rewording">Formal Rewording</option>
          <option value="Creative Rewrite">Creative Rewrite</option>
          <option value="Paragraph Edit">Paragraph Edit</option>
          <option value="Tense Consistency Check">Tense Consistency Check</option>
          <option value="Metaphor & Imagery Review">Metaphor & Imagery Review</option>
          <option value="Phrase Repetition Check">Phrase Repetition Check</option>
          <option value="Tone & Style Feedback">Tone & Style Feedback</option>
          <option value="Strengths & Praise Highlights">Strengths & Praise Highlights</option>
        </select>

        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="tone">Tone:</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="rounded border px-4 py-2"
            id="tone"
          >
            <option value="Default">Default</option>
            <option value="Formal">Formal</option>
            <option value="Professional">Professional</option>
            <option value="Playful">Playful</option>
            <option value="Casual">Casual</option>
            <option value="Show, don't tell">Show, don't tell</option>
          </select>
        </div>

        <button
          onClick={handleEdit}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Editing..." : "Run Edit"}
        </button>
      </div>

      <div className="bg-white p-4 rounded border dark:bg-gray-800 dark:text-white">
        <p className="font-semibold mb-2">✏️ Edited version of your text:</p>
        <pre className="whitespace-pre-wrap">{editedText}</pre>
      </div>

      <FeatureTracker />
    </main>
  </div>
);
}
