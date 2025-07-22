import { useState, useRef, useEffect } from "react";
import FeatureTracker from "../components/FeatureTracker";
import VersionHistory from "../components/VersionHistory";
import ExportButtons from "../components/ExportButtons";
import { Clock } from "lucide-react";

const REFINE_OPTIONS = [
  "Make it more vivid",
  "Soften the tone",
  "Add emotional depth",
  "Tighten the pacing",
  "Make it humorous",
  "Custom",
];

interface VersionPair {
  input: string;
  output: string;
  purpose: string;
  style: string;
  editorType: string;
}

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
  const [versionHistory, setVersionHistory] = useState<VersionPair[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const saved = localStorage.getItem("hexakin_versions");
    if (saved) {
      setVersionHistory(JSON.parse(saved));
    }
  }, []);

  const updateHistory = (newVersion: VersionPair) => {
    const updated = [newVersion, ...versionHistory.slice(0, 4)];
    setVersionHistory(updated);
    localStorage.setItem("hexakin_versions", JSON.stringify(updated));
  };

  const restoreVersion = (version: VersionPair) => {
    setInputText(version.input);
    setEditedText(version.output);
    setPurpose(version.purpose);
    setStyle(version.style);
    setEditorType(version.editorType);
  };

  const sanitize = (text: string) => {
    return text.replace(/^['"]{1,3}/, "").replace(/['"]{1,3}$/, "").trim();
  };

  const safeReplace = (original: string, target: string, replacement: string) => {
    const index = original.indexOf(target);
    if (index === -1) return original;
    return original.slice(0, index) + replacement + original.slice(index + target.length);
  };

  const handleEdit = async () => {
    setLoading(true);
    setEditedText("");
    setError("");

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: inputText, purpose, style, editorType }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        const output = data.result;
        setEditedText(output);
        updateHistory({ input: inputText, output, purpose, style, editorType });
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
        const cleanResult = sanitize(data.result);
        if (storedSelection && editedText.includes(storedSelection)) {
          const updated = safeReplace(editedText, storedSelection, cleanResult);
          setEditedText(updated);
        } else {
          setEditedText(cleanResult);
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
          <label className="block mb-1 font-semibold" title="Why you're editing this text (e.g., improve, rewrite, check repetition)">Purpose</label>
          <select className="w-full border px-2 py-1 rounded" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option>Line Edit</option>
            <option>Paragraph Rewrite</option>
            <option>Fiction Improve</option>
            <option>Repetition Check</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" title="The tone or genre style you want for the output">Style</label>
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
          <label className="block mb-1 font-semibold" title="The type of writing this is (e.g., a novel, report, email)">Editor Type</label>
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
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {editedText && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold">Edited Output</label>
            <button
              className="flex items-center text-sm hover:underline"
              title="View Version History"
              onClick={() => setShowHistory(!showHistory)}
            >
              <Clock size={18} className="mr-1" />
              Version History
            </button>
          </div>

          <div
            ref={outputRef}
            className="w-full min-h-[150px] border px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 whitespace-pre-wrap mb-3"
          >
            {loading ? "Editing in progress..." : editedText}
          </div>

          <ExportButtons content={editedText} />

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

      {showHistory && (
        <VersionHistory
          history={versionHistory}
          onRestore={restoreVersion}
          onClose={() => setShowHistory(false)}
        />
      )}

      <FeatureTracker />
    </div>
  );
}
