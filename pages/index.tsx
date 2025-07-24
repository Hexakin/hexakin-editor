import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import HexakinEditor from "@/components/HexakinEditor";
import LongformEditor from "@/components/LongformEditor";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'editor' | 'draft'>('editor');
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // This simple effect toggles the 'dark' class on the main <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    // We use a simple bg-white dark:bg-gray-900 pattern here
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <button className={`text-2xl font-bold ${activeTab === 'editor' ? 'text-blue-600 dark:text-blue-400 underline' : 'text-gray-400 dark:text-gray-500'}`} onClick={() => setActiveTab('editor')}>
                ✨ Hexakin Editor
              </button>
              <button className={`text-2xl font-bold ${activeTab === 'draft' ? 'text-blue-600 dark:text-blue-400 underline' : 'text-gray-400 dark:text-gray-500'}`} onClick={() => setActiveTab('draft')}>
                ✍️ Draft Studio
              </button>
            </div>
            <button onClick={toggleDarkMode} className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-md text-sm">
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>
          
          <div>
            {activeTab === 'editor' ? <HexakinEditor /> : <LongformEditor />}
          </div>
        </main>
        
        <aside className="w-full md:w-[320px] border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}
