import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

// Import all the child components it needs using absolute paths
import VersionHistory from "@/components/VersionHistory";
import ExportButtons from "@/components/ExportButtons";
import DiffView from "@/components/DiffView";
import EchoTracker from "@/components/EchoTracker";
import ToneAnalyzer from "@/components/ToneAnalyzer";
import InlineCritique from "@/components/InlineCritique";

// Import the hook using an absolute path
import { useApiMutation } from "@/hooks/useApiMutation";

// --- Constants and Types ---
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

// --- The Component ---
export default function HexakinEditor() {
  // --- State Management ---
  // All the state from the original index.tsx is now neatly contained here.
  const [inputText, setInputText] = useState("");
  const [editedText, setEditedText] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [selectedRefine, setSelectedRefine] = useState("");
  const [purpose, setPurpose] = useState("Line Edit");
  const [style, setStyle] = useState("Default");
  const [editorType, setEditorType] = useState("Novel Editor");
  const [storedSelection, setStoredSelection] = useState("");
  const [versionHistory, setVersionHistory] = useState<VersionPair[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);

  // --- API Hooks ---
  // We use our custom hook to handle API calls, loading, and errors.
  const { mutate: performEdit, loading: editLoading, error: editError } = useApiMutation<{ result: string }>();
  const { mutate: performRefine, loading: refineLoading, error: refineError } = useApiMutation<{ result: string }>();

  // --- Effects ---
  // This effect listens for text selections on the page.
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

  // This effect loads the version history from the browser's local storage on startup.
  useEffect(() => {
    const saved = localStorage.getItem("hexakin_versions");
    if (saved) {
      setVersionHistory(JSON.parse(saved));
    }
  }, []);

  // --- Logic and Handlers ---
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

  // API call handlers are now much simpler.
  const handleEdit = async () => {
    const body = { input: inputText, purpose, style, editorType };
    const data = await performEdit('/api/edit', body);
    if (data?.result) {
      const output = data.result;
      setEditedText(output);
      updateHistory({ input: inputText, output, purpose, style, editorType });
    }
  };

  const handleRefine = async () => {
    if (!editedText || (!selectedRefine && !refinePrompt)) return;
    const isCustom = selectedRefine === "Custom";
    const instruction = isCustom ? refinePrompt : selectedRefine || "Refine the text.";
    
    const body = {
      text: editedText,
      selected: storedSelection || "",
      instruction,
    };
    const data = await performRefine('/api/refine', body);

    if (data?.result) {
      const cleanResult = sanitize(data.result);
      if (storedSelection && editedText.includes(storedSelection)) {
        const updated = safeReplace(editedText, storedSelection, cleanResult);
        setEditedText(updated);
      } else {
        setEditedText(cleanResult);
      }
      setRefinePrompt("");
    }
  };

  const handleClear = () => {
    setInputText("");
    setEditedText("");
    setRefinePrompt("");
    setStoredSelection("");
    // We can clear errors from the hooks if we add a clear function to them,
    // but for now, they will clear on the next API call.
  };

  // --- JSX ---
  // This is the complete UI from your original file.
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-semibold" title="Why you're editing this text">Purpose</label>
          <select className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-800" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option title="Improve grammar, flow, and clarity">Line Edit</option>
            <option title="Rebuild the paragraph's structure and tone">Paragraph Rewrite</option>
            <option title="Boost storytelling, emotion, and immersion">Fiction Improve</option>
            <option title="Detect and reduce word/phrase repetition">Repetition Check</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" title="Stylistic tone for the rewrite">Style</label>
          <select className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-800" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option title="Balanced, neutral editing">Default</option>
            <option title="Epic, whimsical, or magical tone">Fantasy</option>
            <option title="Professional, clean, academic tone">Formal</option>
            <option title="Light, clever, amusing style">Playful</option>
            <option title="Futuristic, sleek, or technical">Science Fiction</option>
            <option title="Gritty, suspenseful, moody tone">Dark Thriller</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" title="Text type to adjust the model’s behavior">Editor Type</label>
          <select className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-800" value={editorType} onChange={(e) => setEditorType(e.target.value)}>
            <option title="Best for creative writing and storytelling">Novel Editor</option>
            <option title="Helpful for email drafts and replies">Email Editor</option>
            <option title="Focuses on clarity for business reports">Report Editor</option>
            <option title="Supports forms, EHCPs, and local council docs">Education/Local Council Editor</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Input Text</label>
        <textarea
          className="w-full h-32 border px-2 py-1 rounded bg-white dark:bg-gray-800"
          placeholder="Paste or type your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={handleEdit} disabled={editLoading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
          {editLoading ? 'Editing...' : 'Submit'}
        </button>
        <button onClick={handleClear} className="bg-gray-300 text-black px-4 py-2 rounded">
          Clear
        </button>
      </div>

      {(editError || refineError) && <p className="text-red-500 mb-4">{editError || refineError}</p>}

      <div className="mb-4">
        <label className="block font-semibold mb-1">Edited Output</label>
        <div
          ref={outputRef}
          className="w-full min-h-[100px] border p-2 bg-gray-50 dark:bg-gray-800 rounded whitespace-pre-wrap"
        >
          {editLoading ? "Editing in progress..." : editedText}
          {editedText && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline block"
            >
              {showDiff ? "Hide Differences" : "Show Differences"}
            </button>
          )}
          {showDiff && (
            <DiffView original={inputText} edited={editedText} />
          )}
        </div>
      </div>

      <ExportButtons text={editedText} />

      <div className="my-4">
        <InlineCritique text={editedText} purpose={purpose} />
      </div>

      <div className="my-4">
        <label className="block font-semibold mb-1">Refine Further</label>
        <div className="flex flex-col md:flex-row gap-2">
          <select
            className="border px-2 py-1 rounded bg-white dark:bg-gray-800"
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
              className="border px-2 py-1 rounded w-full bg-white dark:bg-gray-800"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
            />
          )}

          <button
            onClick={handleRefine}
            disabled={refineLoading || (!selectedRefine && !refinePrompt)}
            className="bg-fuchsia-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {refineLoading ? 'Refining...' : 'Refine Output'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1"
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
  );
}
