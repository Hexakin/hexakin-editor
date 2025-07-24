import { useEffect, useState } from "react";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export default function LongformEditor() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("hexakin_chapters");
    if (saved) {
      const parsed = JSON.parse(saved);
      setChapters(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    } else {
      handleAddChapter(); // initialize with 1
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("hexakin_chapters", JSON.stringify(chapters));
  }, [chapters]);

  const handleAddChapter = () => {
    const id = Date.now().toString();
    const newChapter = { id, title: `Chapter ${chapters.length + 1}`, content: "" };
    setChapters([...chapters, newChapter]);
    setActiveId(id);
  };

  const handleRename = (id: string, newTitle: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch))
    );
  };

  const handleContentChange = (id: string, newContent: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, content: newContent } : ch))
    );
  };

  const handleDelete = (id: string) => {
    const updated = chapters.filter((ch) => ch.id !== id);
    setChapters(updated);
    if (activeId === id && updated.length > 0) {
      setActiveId(updated[0].id);
    } else if (updated.length === 0) {
      handleAddChapter();
    }
  };

  const active = chapters.find((ch) => ch.id === activeId);

  const handleExportAll = () => {
    const fullText = chapters.map((ch) => `# ${ch.title}\n\n${ch.content}`).join("\n\n---\n\n");
    const blob = new Blob([fullText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "manuscript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📘 Draft Mode</h1>
        <button onClick={handleExportAll} className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
          📤 Export Full Draft
        </button>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {chapters.map((ch) => (
          <div
            key={ch.id}
            className={`px-3 py-1 rounded cursor-pointer ${
              ch.id === activeId ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveId(ch.id)}
          >
            <input
              className="bg-transparent outline-none text-sm font-semibold"
              value={ch.title}
              onChange={(e) => handleRename(ch.id, e.target.value)}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ch.id);
              }}
              className="ml-1 text-xs text-red-500"
              title="Delete chapter"
            >
              ✕
            </button>
          </div>
        ))}
        <button onClick={handleAddChapter} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
          + Add Chapter
        </button>
      </div>

      {/* Editor */}
      {active && (
        <textarea
          className="w-full h-[60vh] border px-3 py-2 rounded text-black"
          value={active.content}
          onChange={(e) => handleContentChange(active.id, e.target.value)}
          placeholder="Start writing..."
        />
      )}
    </div>
  );
}
