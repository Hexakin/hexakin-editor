import { useState, useRef, useEffect } from "react";
import { Clock, Edit, Trash2, Send, Zap } from "lucide-react";

import VersionHistory from "./VersionHistory";
import ExportButtons from "./ExportButtons";
import DiffView from "./DiffView";
import { useApiMutation } from "../hooks/useApiMutation";
import { useAppContext } from '../context/AppContext';

// --- Constants and Types ---
const REFINE_OPTIONS = ["Make it more vivid", "Soften the tone", "Add emotional depth", "Tighten the pacing", "Make it humorous", "Custom"];
const TONE_OPTIONS = ["", "Hopeful", "Desperate", "Detached", "Warm", "Clinical", "Ironic", "Introspective", "Playful", "Paranoid", "Authoritative", "Neutral"];
interface VersionPair { input: string; output: string; purpose: string; style: string; editorType: string; }

export default function HexakinEditor() {
  const { hexakinState, setHexakinState } = useAppContext();
  const { inputText, editedText, purpose, style, editorType } = hexakinState;

  // This local state is fine as it's specific to this component's UI logic
  const [refinePrompt, setRefinePrompt] = useState("");
  const [selectedRefine, setSelectedRefine] = useState("");
  const [storedSelection, setStoredSelection] = useState("");
  const [versionHistory, setVersionHistory] = useState<VersionPair[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [targetTone, setTargetTone] = useState("");

  const outputRef = useRef<HTMLDivElement>(null);

  // API Hooks remain the same
  const { mutate: performEdit, loading: editLoading, error: editError } = useApiMutation<{ result: string }>();
  const { mutate: performRefine, loading: refineLoading, error: refineError } = useApiMutation<{ result: string }>();
  const { mutate: sendCritique, loading: critiqueLoading, error: critiqueError } = useApiMutation<{ result: string }>();
  const { mutate: sendEcho, loading: echoLoading, error: echoError } = useApiMutation<{ result: string }>();
  const { mutate: sendTone, loading: toneLoading, error: toneError } = useApiMutation<{ result: string }>();

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

  // Handlers now update the global context state
  const setInputText = (text: string) => setHexakinState(prev => ({ ...prev, inputText: text }));
  const setEditedText = (text: string) => setHexakinState(prev => ({ ...prev, editedText: text }));
  const setPurpose = (p: string) => setHexakinState(prev => ({ ...prev, purpose: p }));
  const setStyle = (s: string) => setHexakinState(prev => ({ ...prev, style: s }));
  const setEditorType = (e: string) => setHexakinState(prev => ({ ...prev, editorType: e }));

  // Other logic handlers remain the same
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
    <div className="space-y-8">
      {/* --- Section 1: Core Editor --- */}
      <div className="p-6 border border-border rounded-lg bg-card text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-4">Core Editor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-semibold">Purpose</label>
            <select className="w-full border border-input px-2 py-1.5 rounded-md bg-background" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option>Line Edit</option>
              <option>Paragraph Rewrite</option>
              <option>Fiction Improve</option>
              <option>Repetition Check</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Style</label>
            <select className="w-full border border-input px-2 py-1.5 rounded-md bg-background" value={style} onChange={(e) => setStyle(e.target.value)}>
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
            <select className="w-full border border-input px-2 py-1.5 rounded-md bg-background" value={editorType} onChange={(e) => setEditorType(e.target.value)}>
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
            className="w-full h-32 border border-input px-3 py-2 rounded-md bg-background"
            placeholder="Paste or type your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={handleEdit} disabled={editLoading} className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md shadow hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Edit size={16} /> {editLoading ? 'Editing...' : 'Submit'}
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 bg-secondary text-secondary-foreground font-semibold px-4 py-2 rounded-md shadow hover:bg-secondary/80 transition-colors">
            <Trash2 size={16} /> Clear
          </button>
        </div>
        {(editError || refineError) && <p className="text-destructive mb-4">{editError || refineError}</p>}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Edited Output</label>
          <div ref={outputRef} className="w-full min-h-[100px] border border-input p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
            {editLoading ? "Editing in progress..." : editedText}
            {editedText && (
              <button onClick={() => setShowDiff(!showDiff)} className="mt-2 text-sm text-primary underline block">
                {showDiff ? "Hide Differences" : "Show Differences"}
              </button>
            )}
            {showDiff && <DiffView original={inputText} edited={editedText} />}
          </div>
        </div>
        <ExportButtons text={editedText} />
      </div>

      {/* --- Section 2: Refinement & Analysis --- */}
      <div className="p-6 border border-border rounded-lg bg-card text-card-foreground shadow-sm">
        <h2 className="text-xl font-bold mb-4">Refinement & Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Refine Further</h3>
            <div className="flex flex-col gap-2">
              <select className="border border-input px-2 py-1.5 rounded-md bg-background" value={selectedRefine} onChange={(e) => setSelectedRefine(e.target.value)}>
                <option value="">Select refinement type...</option>
                {REFINE_OPTIONS.map((opt) => (<option key={opt}>{opt}</option>))}
              </select>
              {selectedRefine === "Custom" && (
                <input type="text" placeholder="Enter custom refinement" className="border border-input px-2 py-1.5 rounded-md w-full bg-background" value={refinePrompt} onChange={(e) => setRefinePrompt(e.target.value)} />
              )}
              <button onClick={handleRefine} disabled={refineLoading || (!selectedRefine && !refinePrompt)} className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-md shadow hover:bg-primary/90 transition-colors disabled:opacity-50">
                <Zap size={16} /> {refineLoading ? 'Refining...' : 'Refine Output'}
              </button>
            </div>
            <div className="mt-6">
              <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Clock size={16} /> {showHistory ? "Hide History" : "Show History"}
              </button>
              {showHistory && (
                <div className="mt-3">
                  <VersionHistory history={versionHistory} onRestore={restoreVersion} onClose={() => setShowHistory(false)} />
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Analysis Tools</h3>
            <div className="space-y-4">
              <div className="text-sm">
                <button onClick={handleCritique} className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground font-semibold px-4 py-2 rounded-md shadow hover:bg-accent/90 transition-all disabled:opacity-50" disabled={critiqueLoading}>
                  💡 {critiqueLoading ? "Sending..." : "Critique This"}
                </button>
                {critiqueError && <div className="text-destructive mt-1">{critiqueError}</div>}
              </div>
              <div>
                <h4 className="font-semibold mb-1">Echo / Pattern Tracker</h4>
                <button onClick={handleEcho} disabled={echoLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md shadow hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  <Send size={16} /> {echoLoading ? "Analyzing..." : "Send to Assistant"}
                </button>
                {echoError && <p className="text-destructive mt-2">{echoError}</p>}
              </div>
              <div>
                <h4 className="font-semibold mb-1">Tone / Formality Analysis</h4>
                <select value={targetTone} onChange={(e) => setTargetTone(e.target.value)} className="mb-2 w-full border border-input px-2 py-1.5 rounded-md bg-background">
                  {TONE_OPTIONS.map((tone) => (<option key={tone} value={tone}>{tone || "-- No Preference --"}</option>))}
                </select>
                <button onClick={handleTone} disabled={toneLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md shadow hover:bg-secondary/80 transition-colors disabled:opacity-50">
                  <Send size={16} /> {toneLoading ? "Analyzing..." : "Send to Assistant"}
                </button>
                {toneError && <p className="text-destructive mt-2">{toneError}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
