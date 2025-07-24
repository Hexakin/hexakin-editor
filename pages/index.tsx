import { useState, useEffect } from "react";
import ChatSidebar from "@/components/ChatSidebar";
import HexakinEditor from "@/components/HexakinEditor";
import LongformEditor from "@/components/LongformEditor";
import { useAppContext, Theme } from '@/context/AppContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'editor' | 'draft'>('editor');
  const { theme, setTheme } = useAppContext();

  // --- THE FIX ---
  // This useEffect will apply the selected theme class to the main <html> tag
  // ensuring that our CSS variables are available everywhere.
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-rose');
    root.classList.add(theme);
  }, [theme]);

  return (
    // We no longer need the theme class here, but we now use the theme-aware
    // background and foreground colours from our tailwind.config.js
    <div className="bg-background text-foreground min-h-screen transition-colors">
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 p-6">
          <header className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              <button className={`text-2xl font-bold ${activeTab === 'editor' ? 'text-primary underline' : 'text-muted-foreground'}`} onClick={() => setActiveTab('editor')}>
                ✨ Hexakin Editor
              </button>
              <button className={`text-2xl font-bold ${activeTab === 'draft' ? 'text-primary underline' : 'text-muted-foreground'}`} onClick={() => setActiveTab('draft')}>
                ✍️ Draft Studio
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <label htmlFor="theme-select" className="text-sm font-medium">Theme</label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="border border-border bg-card text-card-foreground px-2 py-1 rounded-md text-sm"
              >
                <option value="theme-dark">Dark</option>
                <option value="theme-light">Light</option>
                <option value="theme-rose">Rose</option>
              </select>
            </div>
          </header>
          
          <div>
            {activeTab === 'editor' ? <HexakinEditor /> : <LongformEditor />}
          </div>
        </main>
        
        <aside className="w-full md:w-[320px] border-l border-border bg-card">
          <ChatSidebar />
        </aside>
      </div>
    </div>
  );
}
