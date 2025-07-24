import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import HexakinEditor from "../components/HexakinEditor";
import LongformEditor from "../components/LongformEditor"; // Make sure this component exists

export default function Home() {
  // State to control the active tab
  const [activeTab, setActiveTab] = useState<'editor' | 'draft'>('editor');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-colors`}>
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            {/* Tab switching buttons */}
            <div className="flex gap-4">
              <button
                className={`text-2xl font-bold ${activeTab === 'editor' ? 'text-blue-600 underline' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                ✨ Hexakin Editor
              </button>
              <button
                className={`text-2xl font-bold ${activeTab === 'draft' ? 'text-blue-600 underline' : ''}`}
                onClick={() => setActiveTab('draft')}
              >
                ✍️ Draft Studio
              </button>
            </div>
            <button onClick={toggleDarkMode} className="border px-3 py-1 rounded">
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>
          
          {/* Conditionally render the component based on the active tab */}
          <div>
            {activeTab === 'editor' ? <HexakinEditor /> : <LongformEditor />}
          </div>

        </main>
        
        <aside className="w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}
