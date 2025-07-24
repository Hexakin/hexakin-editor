import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useApiMutation } from "../hooks/useApiMutation"; // Step 1
import DiffView from "./DiffView";
import ExportButtons from "./ExportButtons";
import InlineCritique from "./InlineCritique";
import EchoTracker from "./EchoTracker";
import ToneAnalyzer from "./ToneAnalyzer";
import VersionHistory from "./VersionHistory";

// Types and constants can live here or be moved to a separate constants.ts file
const REFINE_OPTIONS = [ "Make it more vivid", "Soften the tone", "Add emotional depth", "Tighten the pacing", "Make it humorous", "Custom"];
interface VersionPair { input: string; output: string; purpose: string; style: string; editorType: string; }

export default function HexakinEditor() {
  // All editor-specific state is now here
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

  // Use our new custom hook!
  const { mutate: performEdit, loading: editLoading, error: editError } = useApiMutation<{ result: string }>();
  const { mutate: performRefine, loading: refineLoading, error: refineError } = useApiMutation<{ result: string }>();

  // Effect for capturing text selection
  useEffect(() => {
    const handleSelection = () => {
      const text = window.getSelection()?.toString().trim();
      if (text) setStoredSelection(text);
    };
    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, []);

  // Effect for loading version history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hexakin_versions");
    if (saved) setVersionHistory(JSON.parse(saved));
  }, []);

  const updateHistory = (newVersion: VersionPair) => {
    const updated = [newVersion, ...versionHistory.slice(0, 4)];
    setVersionHistory(updated);
    localStorage.setItem("hexakin_versions", JSON.stringify(updated));
  };

  const handleEdit = async () => {
    const body = { input: inputText, purpose, style, editorType };
    const data = await performEdit('/api/edit', body); // Simplified call
    if (data?.result) {
      setEditedText(data.result);
      updateHistory({ ...body, output: data.result });
    }
  };
  
  const handleRefine = async () => {
    if (!editedText) return;
    const instruction = selectedRefine === "Custom" ? refinePrompt : selectedRefine;
    const body = { text: editedText, selected: storedSelection, instruction };
    const data = await performRefine('/api/refine', body);
    if(data?.result) {
      // Logic to replace selection or whole text
      setEditedText(data.result);
    }
  }

  // Other handlers like restoreVersion, handleClear etc. would also live here.

  return (
    <>
      {/* All the JSX from the original index.tsx goes here */}
      {/* For example: */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Purpose, Style, EditorType dropdowns */}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Input Text</label>
        <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} />
      </div>
       <div className="flex gap-2 mb-6">
        <button onClick={handleEdit} disabled={editLoading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {editLoading ? 'Editing...' : 'Submit'}
        </button>
      </div>
      {(editError || refineError) && <p className="text-red-500 mb-4">{editError || refineError}</p>}
      
      {/* ... and so on for the rest of the UI */}
      {/* You would render EchoTracker, ToneAnalyzer, etc. here */}
    </>
  );
}