import { useEffect, useState, useRef } from "react";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Props {
  onInjectToEditor: (selection: string, chapterId: string) => void;
}

export default function LongformEditor({ onInjectToEditor }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [selection, setSelection] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("hexakin_chapters");
    if (saved) {
      const parsed: Chapter[] = JSON.parse(saved);
      setChapters(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }
  }, []);

  // Auto-save on any change
  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem("hexakin_chapters", JSON.stringify(chapters));
    }
  }, [chapters]);

  const handleAddChapter = () => {
    const id = Date.now().toString();
    const newChapter = { id, title: `Chapter ${chapters.length + 1}`, content: "" };
    const updated = [...chapters, newChapter];
    setChapters(updated);
    setActiveId(id);
  };

  const handleContentChange = (id: string, newContent: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, content: newContent } : ch)));
  };
  
  const handleRename = (id: string, newTitle: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch)));
  };

  const handleDelete = (id: string) => {
    const updated = chapters.filter((ch) => ch.id !== id);
    setChapters(updated);
    if (activeId === id && updated.length > 0) {
      setActiveId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveId("");
    }
  };

  const handleSelect = () => {
    if (editorRef.current) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const selectedText = editorRef.current.value.substring(selectionStart, selectionEnd);
      setSelection(selectedText.trim());
    }
  };

  const activeChapter = chapters.find((ch) => ch.id === activeId);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📘 Draft Mode</h1>
      </header>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {chapters.map((ch) => (
          <div key={ch.id} className={`px-3 py-1 rounded cursor-pointer ${ch.id === activeId ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`} onClick={() => setActiveId(ch.id)}>
            <input className="bg-transparent outline-none text-sm font-semibold" value={ch.title} onChange={(e) => handleRename(ch.id, e.target.value)} />
            <button onClick={(e) => { e.stopPropagation(); handleDelete(ch.id); }} className="ml-1 text-xs text-red-500" title="Delete chapter">✕</button>
          </div>
        ))}
        <button onClick={handleAddChapter} className="px-3 py-1 bg-green-600 text-white rounded text-sm">+ Add Chapter</button>
      </div>

      {activeChapter && (
        <div className="relative">
          <textarea
            ref={editorRef}
            className="w-full h-[60vh] border px-3 py-2 rounded text-black bg-white dark:bg-gray-800 dark:text-white"
            value={activeChapter.content}
            onChange={(e) => handleContentChange(activeChapter.id, e.target.value)}
            onSelect={handleSelect}
            placeholder="Start writing..."
          />
          {selection && (
            <button
              onClick={() => onInjectToEditor(selection, activeChapter.id)}
              className="absolute bottom-4 right-4 bg-fuchsia-600 text-white px-4 py-2 rounded shadow-lg hover:bg-fuchsia-700"
            >
              ✨ Send to Editor
            </button>
          )}
        </div>
      )}
    </div>
  );
}
