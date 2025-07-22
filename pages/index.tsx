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
            <option title="Polish grammar, sentence flow and clarity">Line Edit</option>
            <option title="Rewrite a whole paragraph with style and flow">Paragraph Rewrite</option>
            <option title="Enhance narrative tone, pacing, and immersion">Fiction Improve</option>
            <option title="Identify and reduce repetition of phrases">Repetition Check</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" title="The tone or genre style you want for the output">Style</label>
          <select className="w-full border px-2 py-1 rounded" value={style} onChange={(e) => setStyle(e.target.value)}>
            <option title="Balanced, professional tone">Default</option>
            <option title="Whimsical, magical or medieval tones">Fantasy</option>
            <option title="Academic or business style">Formal</option>
            <option title="Light, witty, humorous">Playful</option>
            <option title="Futuristic and technical voice">Science Fiction</option>
            <option title="Gritty, dark, suspenseful">Dark Thriller</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" title="The type of writing this is (e.g., a novel, report, email)">Editor Type</label>
          <select className="w-full border px-2 py-1 rounded" value={editorType} onChange={(e) => setEditorType(e.target.value)}>
            <option title="Best for story chapters, character prose and fiction scenes">Novel Editor</option>
            <option title="Formal yet friendly email drafting">Email Editor</option>
            <option title="Clarity and structure for formal business reports">Report Editor</option>
            <option title="Precision for forms, EHCPs, education documents">Education/Local Council Editor</option>
          </select>
        </div>
      </div>

      <FeatureTracker />
    </div>
  );
}
