import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

import VersionHistory from "./VersionHistory";
import ExportButtons from "./ExportButtons";
import DiffView from "./DiffView";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAppContext } from '../context/AppContext'; // Import our new context hook

// --- Constants and Types ---
const REFINE_OPTIONS = ["Make it more vivid", "Soften the tone", "Add emotional depth", "Tighten the pacing", "Make it humorous", "Custom"];
const TONE_OPTIONS = ["", "Hopeful", "Desperate", "Detached", "Warm", "Clinical", "Ironic", "Introspective", "Playful", "Paranoid", "Authoritative", "Neutral"];
interface VersionPair { input: string; output: string; purpose: string; style: string; editorType: string; }

export default function HexakinEditor() {
  // --- Get State from Global Context ---
  const { hexakinState, setHexakinState } = useAppContext();
  const { inputText, editedText, purpose, style, editorType } = hexakinState;

  // --- Local State (not shared) ---
  const [refinePrompt, setRefinePrompt] = useState("");
  const [selectedRefine, setSelectedRefine] = useState("");
  const [storedSelection, setStoredSelection] = useState("");
  const [versionHistory, setVersionHistory] = useState<VersionPair[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [targetTone, setTargetTone] = useState("");

  const outputRef = useRef<HTMLDivElement>(null);

  // --- API Hooks ---
  const { mutate: performEdit, loading: editLoading, error: editError } = useApiMutation<{ result: string }>();
  const { mutate: performRefine, loading: refineLoading, error: refineError } = useApiMutation<{ result: string }>();
  const { mutate: sendCritique, loading: critiqueLoading, error: critiqueError } = useApiMutation<{ result: string }>();
  const { mutate: sendEcho, loading: echoLoading, error: echoError } = useApiMutation<{ result: string }>();
  const { mutate: sendTone, loading: toneLoading, error: toneError } = useApiMutation<{ result: string }>();

  // --- Effects ---
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) setStoredSelection(selection);
    };
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("hexakin_versions");
    if (saved) setVersionHistory(JSON.parse(saved));
  }, []);

  // --- Handlers that update global context state ---
  const setInputText = (text: string) => setHexakinState(prev => ({ ...prev, inputText: text }));
  const setEditedText = (text: string) => setHexakinState(prev => ({ ...prev, editedText: text }));
  const setPurpose = (p: string) => setHexakinState(prev => ({ ...prev, purpose: p }));
  const setStyle = (s: string) => setHexakinState(prev => ({ ...prev, style: s }));
  const setEditorType = (e: string) => setHexakinState(prev => ({ ...prev, editorType: e }));

  // --- Logic and Handlers ---
  const updateHistory = (newVersion: VersionPair) => {
    const updated = [newVersion, ...versionHistory.slice(0, 4)];
    setVersionHistory(updated);
    localStorage.setItem("hexakin_versions", JSON.stringify(updated));
  };

  const handleEdit = async () => {
    const body = { input: inputText, purpose, style, editorType };
    const data = await performEdit('/api/edit', body);
    if (data?.result) {
      setEditedText(data.result);
      updateHistory({ ...body, output: data.result });
    }
  };

  const handleRefine = async () => {
    if (!editedText) return;
    const instruction = selectedRefine === "Custom" ? refinePrompt : selectedRefine || "Refine the text.";
    const body = { text: editedText, selected: storedSelection || "", instruction };
    const data = await performRefine('/api/refine', body);
    if (data?.result) {
      const cleanResult = data.result.replace(/^['"]{1,3}/, "").replace(/['"]{1,3}$/, "").trim();
      const newText = storedSelection && editedText.includes(storedSelection)
        ? editedText.replace(storedSelection, cleanResult)
        : cleanResult;
      setEditedText(newText);
      setRefinePrompt("");
    }
  };
  
  const handleClear = () => {
    setInputText("");
    setEditedText("");
    setRefinePrompt("");
    setStoredSelection("");
  };

  const handleCritique = async () => {
    if (!editedText) return;
    const payload = { action: 'critique', payload: { text: editedText, purpose } };
    const data = await sendCritique('/api/assistant', payload);
    if (data?.result && typeof window !== 'undefined' && (window as any).HexakinChatInject) {
      (window as any).HexakinChatInject("💡 *Critique Result:*\n\n" + data.result);
    }
  };

  const handleEcho = async () => {
    if (!inputText) return;
    const payload = { action: 'echo', payload: { text: inputText } };
    const data = await sendEcho('/api/assistant', payload);
    if (data?.result && typeof window !== 'undefined' && (window as any).HexakinChatInject) {
      (window as any).HexakinChatInject("📊 *Echo Analysis Result:*\n\n" + data.result);
    }
  };

  const handleTone = async () => {
    if (!inputText) return;
    const payload = { action: 'tone', payload: { text: inputText, targetTone } };
    const data = await sendTone('/api/assistant', payload);
    if (data?.result && typeof window !== 'undefined' && (window as any).HexakinChatInject) {
      const label = targetTone ? `🎯 *Tone Analysis (Target: ${targetTone}):*\n\n` : "🎯 *Tone / Formality Analysis:*\n\n";
      (window as any).HexakinChatInject(label + data.result);
    }
  };
  
  const restoreVersion = (version: VersionPair) => {
    setHexakinState({
        inputText: version.input,
        editedText: version.output,
        purpose: version.purpose,
        style: version.style,
        editorType: version.editorType,
    });
  };

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
        <div ref={outputRef} className="w-full min-h-[100px] border p-2 bg-gray-50 dark:bg-gray-800 rounded whitespace-pre-wrap">
          {editLoading ? "Editing in progress..." : editedText}
          {editedText && (
            <button onClick={() => setShowDiff(!showDiff)} className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline block">
              {showDiff ? "Hide Differences" : "Show Differences"}
            </button>
          )}
          {showDiff && <DiffView original={inputText} edited={editedText} />}
        </div>
      </div>
      <ExportButtons text={editedText} />
      <div className="my-4">
        <div className="text-sm text-gray-700">
          <button onClick={handleCritique} className="bg-yellow-100 text-yellow-900 font-semibold px-4 py-2 rounded hover:bg-yellow-200 transition-all disabled:bg-gray-400" disabled={critiqueLoading}>
            💡 {critiqueLoading ? "Sending..." : "Critique This"}
          </button>
          <div className="text-xs text-gray-500 mt-1">Critique will appear in the assistant chat →</div>
          {critiqueError && <div className="text-red-500 mt-1">{critiqueError}</div>}
        </div>
      </div>
      <div className="my-4">
        <label className="block font-semibold mb-1">Refine Further</label>
        <div className="flex flex-col md:flex-row gap-2">
          <select className="border px-2 py-1 rounded bg-white dark:bg-gray-800" value={selectedRefine} onChange={(e) => setSelectedRefine(e.target.value)}>
            <option value="">Select refinement type...</option>
            {REFINE_OPTIONS.map((opt) => (<option key={opt}>{opt}</option>))}
          </select>
          {selectedRefine === "Custom" && (
            <input type="text" placeholder="Enter custom refinement" className="border px-2 py-1 rounded w-full bg-white dark:bg-gray-800" value={refinePrompt} onChange={(e) => setRefinePrompt(e.target.value)} />
          )}
          <button onClick={handleRefine} disabled={refineLoading || (!selectedRefine && !refinePrompt)} className="bg-fuchsia-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
            {refineLoading ? 'Refining...' : 'Refine Output'}
          </button>
        </div>
      </div>
      <div className="mt-6">
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1">
          <Clock size={16} /> {showHistory ? "Hide Version History" : "Show Version History"}
        </button>
        {showHistory && (
          <div className="mt-3">
            <VersionHistory history={versionHistory} onRestore={restoreVersion} onClose={() => setShowHistory(false)} />
          </div>
        )}
      </div>
      <hr className="my-6 border-gray-200 dark:border-gray-700" />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Echo / Pattern Tracker</h2>
        <button onClick={handleEcho} disabled={echoLoading} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-gray-400">
          {echoLoading ? "Analyzing..." : "Send to Assistant"}
        </button>
        {echoError && <p className="text-red-500 mt-2">{echoError}</p>}
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Tone / Formality Analysis</h2>
        <label className="block mb-1 text-sm font-medium">Desired Tone (optional)</label>
        <select value={targetTone} onChange={(e) => setTargetTone(e.target.value)} className="mb-3 w-full md:w-72 border px-2 py-1 rounded bg-white dark:bg-gray-800">
          {TONE_OPTIONS.map((tone) => (<option key={tone} value={tone}>{tone || "-- No Preference --"}</option>))}
        </select>
        <button onClick={handleTone} disabled={toneLoading} className="px-4 py-2 bg-sky-600 text-white rounded disabled:bg-gray-400">
          {toneLoading ? "Analyzing..." : "Send to Assistant"}
        </button>
        {toneError && <p className="text-red-500 mt-2">{toneError}</p>}
      </div>
    </>
  );
}
