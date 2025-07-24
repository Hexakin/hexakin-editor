import { useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import HexakinEditor from "../components/HexakinEditor"; // The new component

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen transition-colors`}>
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">✨ Hexakin</h1>
            <button onClick={toggleDarkMode} className="border px-3 py-1 rounded">
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </header>
          
          {/* The HexakinEditor component now contains all the complexity,
            keeping this main page file clean and simple.
          */}
          <HexakinEditor />

        </main>
        
        <aside className="w-full md:w-[320px] border-l border-gray-300 dark:border-gray-800">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}