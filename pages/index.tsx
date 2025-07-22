import { useState, useRef, useEffect } from "react";
import FeatureTracker from "../components/FeatureTracker";

const REFINE_OPTIONS = [
  "Make it more vivid",
  "Soften the tone",
  "Add emotional depth",
  "Tighten the pacing",
  "Make it humorous",
  "Custom",
];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [selectedRefine, setSelectedRefine] = useState("");
  const [purpose, setPurpose] = useState("Line Edit");
  const [style, setStyle] = useState("Default");
  const [editorType, setEditorType] = useState("Novel Editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [storedSelection, setStoredSelection] = useState("");

  const outputRef = useRef<HTMLDivElement>(null);

  // Capture selection when user clicks anywhere inside the output box
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text) {
        setStoredSelection(text);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  const handleEdit = async () => {
    setLoading(true);
    setEditedText("");
    setError("");

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: inputText,
          purpose,
          style,
          editorType,
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setEditedText(data.result);
      } else {
        setError("Failed to get a response from the editor.");
      }
    } catch (err) {
      console.error("Edit error:", err);
      setError("Something went wrong during editing.");
    }

    setLoading(false);
  };

  const handleRefine = async () => {
    if (!editedText) return;
    setLoading(true);
    setError("");

    const isCustom = selectedRefine === "Custom";
    const instruction = isCustom ? refinePrompt : selectedRefine || "Refine the text.";

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editedText,
          selected: storedSelection || "",
          instruction,
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        if (storedSelection) {
          const newText = editedText.replace(storedSelection, data.result);
          setEditedText(newText);
        } else {
          setEditedText(data.result);
        }
        setRefinePrompt("");
      } else {
        setError("Refinement failed.");
      }
    } catch (err) {
      console.error("Refine error:", err);
      setError("Something went wrong during refinement.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setInputText("");
    setEditedText("");
    setRefinePrompt("");
    setStoredSelection("");
    setError("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen p-6 transition-colors`}>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Hexakin Editor</h1>
        <button onClick={toggleDarkMode} className="border px-3 py-1 rounded">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-semibold">Purpose</label>
          <select className="w-full border px-2 py-1 rounded" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option>Line Edit</option>
            <option>Paragraph Rewrite</option>
            <option>Fiction Improve</option>
            <option>Repetition Check</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Style</label>
          <select className="w-full border px-2 py-1 rounded" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option>Default</option>
            <option>Fantasy</option>
            <option>Formal</option>
            <option>Playful</option>
            <option>Science Fiction</option>
            <option>Dark Thriller</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Editor Type</label>
          <select className="w-full border px-2 py-1 rounded" value={editorType} onChange={(e) => setEditorType(e.target.value)}>
            <option>Novel Editor</option>
            <option>Email Editor</option>
            <option>Report Editor</option>
            <option>Education/Local Council Editor</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Input Text</label>
        <textarea
          className="w-full min-h-[200px] border px-3 py-2 rounded resize-y"
          placeholder="Paste or type your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={handleEdit} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {loading ? "Processing..." : "Submit"}
        </button>
        <button onClick={handleClear} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
          Clear
        </button>
        <button onClick={handleCopy} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={!editedText}>
          Copy Output
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {editedText && (
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Edited Output</label>
          <div
            ref={outputRef}
            className="w-full min-h-[150px] border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 whitespace-pre-wrap mb-3"
          >
            {loading ? "Editing in progress..." : editedText}
          </div>

          <label className="block mb-1 font-semibold">Refine Further</label>
          <div className="flex flex-col md:flex-row gap-2 mb-2">
            <select
              className="border px-3 py-2 rounded w-full md:w-1/2"
              value={selectedRefine}
              onChange={(e) => setSelectedRefine(e.target.value)}
            >
              <option value="">Select refinement type...</option>
              {REFINE_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>

            {selectedRefine === "Custom" && (
              <input
                type="text"
                placeholder="Enter your custom refinement"
                className="border px-3 py-2 rounded w-full md:w-1/2"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
              />
            )}
          </div>

          <button
            onClick={handleRefine}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            disabled={loading}
          >
            Refine Output
          </button>
        </div>
      )}

      <FeatureTracker />
    </div>
  );
}
