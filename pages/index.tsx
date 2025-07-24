import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import HexakinEditor from "../components/HexakinEditor";
import LongformEditor from "../components/LongformEditor";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'editor' | 'draft'>('editor');
  const [darkMode, setDarkMode] = useState(false);

  // --- Injection State Bridge ---
  // This state lives in the parent and connects the two editors.
  const [injectedText, setInjectedText] = useState("");
  const [originChapterId, setOriginChapterId] = useState<string | null>(null);
  const [originSelection, setOriginSelection] = useState("");

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- Injection Handlers ---
  const handleInjectToEditor = (selection: string, chapterId: string) => {
    setInjectedText(selection);
    setOriginSelection(selection); // Keep a copy of the original
    setOriginChapterId(chapterId);
    setActiveTab("editor"); // Switch to the editor tab
  };

  const handleInjectBackToDraft = (newText: string) => {
    if (!originChapterId) return;

    // Update the chapters in localStorage
    const raw = localStorage.getItem("hexakin_chapters");
    if (raw) {
      const chapters = JSON.parse(raw);
      const chapterIndex = chapters.findIndex((c: any) => c.id === originChapterId);
      if (chapterIndex !== -1) {
        // Replace the original selection with the new, edited text
        chapters[chapterIndex].content = chapters[chapterIndex].content.replace(originSelection, newText);
        localStorage.setItem("hexakin_chapters", JSON.stringify(chapters));
      }
    }

    // Clear the injection bridge and switch back to the draft tab
    setInjectedText("");
    setOriginSelection("");
    setOriginChapterId(null);
    setActiveTab("draft");
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-colors`}>
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <button className={`text-2xl font-bold ${activeTab === 'editor' ? 'text-blue-600 underline' : ''}`} onClick={() => setActiveTab('editor')}>
                ✨ Hexakin Editor
              </button>
              <button className={`text-2xl font-bold ${activeTab === 'draft' ? 'text-blue-600 underline' : ''}`} onClick={() => setActiveTab('draft')}>
                ✍️ Draft Studio
              </button>
            </div>
            <button onClick={toggleDarkMode} className="border px-3 py-1 rounded">
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>
          
          <div>
            {activeTab === 'editor' ? (
              <HexakinEditor
                injectedText={injectedText}
                onInjectBack={handleInjectBackToDraft}
                originChapterId={originChapterId}
              />
            ) : (
              <LongformEditor onInjectToEditor={handleInjectToEditor} />
            )}
          </div>
        </main>
        
        <aside className="w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}
