import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [mode, setMode] = useState("Line Edit");
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    setEditedText("Working...");

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode })
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
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-4">Hexakin Editor</h1>

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
          className="p-2 border rounded"
        >
          <option value="Line Edit">Line Edit</option>
          <option value="Formal Rewording">Formal Rewording</option>
          <option value="Creative Rewrite">Creative Rewrite</option>
        </select>

        <button
          onClick={handleEdit}
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Editing..." : "Run Edit"}
        </button>
      </div>

      <div className="bg-white p-4 rounded border">
        <p className="font-semibold mb-2">✏️ Edited version of your text:</p>
        <pre className="whitespace-pre-wrap">{editedText}</pre>
      </div>
    </main>
  );
}
