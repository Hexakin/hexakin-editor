import { useState, useRef, useEffect } from "react";
import FeatureTracker from "../components/FeatureTracker";
import VersionHistory from "../components/VersionHistory";
import ExportButtons from "../components/ExportButtons";
import { Clock } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar";
import DiffView from "../components/DiffView";
import EchoTracker from "../components/EchoTracker";
import ToneAnalyzer from "../components/ToneAnalyzer";
import InlineCritique from "../components/InlineCritique";
import LongformEditor from "../components/LongformEditor";

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
  const [activeTab, setActiveTab] = useState<"editor" | "draft">("editor");

  // Editor Mode State
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
  const [showDiff, setShowDiff] = useState(false);

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
    if (!editedText || (!selectedRefine && !refinePrompt)) return;
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-colors`}>
      {/* TAB SWITCHER */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex gap-4">
          <button
            className={`font-semibold ${activeTab === "editor" ? "text-blue-600 underline" : ""}`}
            onClick={() => setActiveTab("editor")}
          >
            ✨ Hexakin Editor
          </button>
          <button
            className={`font-semibold ${activeTab === "draft" ? "text-blue-600 underline" : ""}`}
            onClick={() => setActiveTab("draft")}
          >
            ✍️ Draft Studio
          </button>
        </div>
        <button onClick={toggleDarkMode} className="border px-3 py-1 rounded">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6">
          {activeTab === "editor" ? (
            <>
              {/* ✨ Hexakin Editor Mode */}
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
                <label className="block font-semibold mb-1">Input Text</label>
                <textarea
                  className="w-full h-32 border px-2 py-1 rounded"
                  placeholder="Paste or type your text here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mb-6">
                <button onClick={handleEdit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Submit
                </button>
                <button onClick={handleClear} className="bg-gray-300 text-black px-4 py-2 rounded">
                  Clear
                </button>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <div className="mb-4">
                <label className="block font-semibold mb-1">Edited Output</label>
                <div
                  ref={outputRef}
                  className="w-full min-h-[100px] border px-2 py-2 bg-gray-50 rounded whitespace-pre-wrap"
                >
                  {loading ? "Editing in progress..." : editedText}
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className="mt-2 text-sm text-blue-700 underline"
                  >
                    {showDiff ? "Hide Differences" : "Show Differences"}
                  </button>
                  {showDiff && (
                    <DiffView original={inputText} edited={editedText} />
                  )}
                </div>
              </div>

              <ExportButtons text={editedText} />
              <InlineCritique text={editedText} purpose={purpose} />

              <div className="my-4">
                <label className="block font-semibold mb-1">Refine Further</label>
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    className="border px-2 py-1 rounded"
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
                      placeholder="Enter custom refinement"
                      className="border px-2 py-1 rounded w-full"
                      value={refinePrompt}
                      onChange={(e) => setRefinePrompt(e.target.value)}
                    />
                  )}

                  <button
                    onClick={handleRefine}
                    disabled={loading || (!selectedRefine && !refinePrompt)}
                    className="bg-fuchsia-600 text-white px-4 py-2 rounded"
                  >
                    Refine Output
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-sm text-blue-700 hover:underline flex items-center gap-1"
                >
                  <Clock size={16} /> {showHistory ? "Hide Version History" : "Show Version History"}
                </button>
                {showHistory && (
                  <div className="mt-3">
                    <VersionHistory history={versionHistory} onRestore={restoreVersion} onClose={() => setShowHistory(false)} />
                  </div>
                )}
              </div>

              <EchoTracker text={inputText} />
              <ToneAnalyzer text={inputText} />
            </>
          ) : (
            <LongformEditor />
          )}
        </div>
        <div className="w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800">
          <ChatSidebar />
        </div>
      </div>
    </div>
  );
}
