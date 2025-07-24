import { useEffect, useState, useRef } from "react";
import FileImporter from './FileImporter';
import DraftSummary from './DraftSummary';
import { useAppContext } from '../context/AppContext';

export default function LongformEditor() {
  const { 
    longformState, 
    setLongformState, 
    activeChapter,
    textToInject,      // <-- NEW: Get the text to inject from context
    clearInjectedText  // <-- NEW: Get the function to clear it once done
  } = useAppContext();
  const { chapters, activeChapterId } = longformState;

  const [selection, setSelection] = useState("");
  const [showImporter, setShowImporter] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // --- NEW: Effect to handle injection ---
  // This useEffect listens for when `textToInject` changes.
  useEffect(() => {
    if (textToInject && editorRef.current && activeChapter) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const currentContent = activeChapter.content;

      // Insert the text at the current cursor position (or replace selected text)
      const newContent = 
        currentContent.slice(0, selectionStart) + 
        textToInject + 
        currentContent.slice(selectionEnd);

      // Update the global state with the new content
      handleContentChange(activeChapter.id, newContent);
      
      // Important: Clear the injection text from the context so it doesn't happen again
      clearInjectedText();
    }
  }, [textToInject]); // This effect runs only when textToInject changes

  const setActiveId = (id: string) => {
    setLongformState(prevState => ({ ...prevState, activeChapterId: id }));
  };

  const handleAddChapter = (title = `Chapter ${chapters.length + 1}`, content = "") => {
    const id = Date.now().toString();
    const newChapter = { id, title, content };
    setLongformState(prevState => ({
      ...prevState,
      chapters: [...prevState.chapters, newChapter],
      activeChapterId: id,
    }));
  };
  
  const handleFileParsed = (content: string, fileName: string) => {
    const chapterTitle = fileName.replace(/\.[^/.]+$/, "");
    handleAddChapter(chapterTitle, content);
  };

  const handleContentChange = (id: string, newContent: string) => {
    setLongformState(prevState => ({
      ...prevState,
      chapters: prevState.chapters.map((ch) => (ch.id === id ? { ...ch, content: newContent } : ch)),
    }));
  };
  
  const handleRename = (id: string, newTitle: string) => {
    setLongformState(prevState => ({
      ...prevState,
      chapters: prevState.chapters.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch)),
    }));
  };

  const handleDelete = (id: string) => {
    setLongformState(prevState => {
      const updatedChapters = prevState.chapters.filter((ch) => ch.id !== id);
      let newActiveId = prevState.activeChapterId;
      if (prevState.activeChapterId === id) {
        newActiveId = updatedChapters.length > 0 ? updatedChapters[0].id : null;
      }
      return { ...prevState, chapters: updatedChapters, activeChapterId: newActiveId };
    });
  };

  const handleSelect = () => {
    if (editorRef.current) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const selectedText = editorRef.current.value.substring(selectionStart, selectionEnd);
      setSelection(selectedText.trim());
    }
  };

  const handleInjectToEditor = () => {
    // This function will be implemented when we update HexakinEditor to use context
    if (activeChapter) {
        console.log("Injecting to editor:", selection, activeChapter.id);
    }
  };
  
  const handleExportChapter = () => {
    if (!activeChapter) return;
    const blob = new Blob([activeChapter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeChapter.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <>
      {showImporter && <FileImporter onFileParsed={handleFileParsed} onClose={() => setShowImporter(false)} />}
      {showSummary && <DraftSummary chapters={chapters} onClose={() => setShowSummary(false)} />}
      
      <div className="p-6">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📘 Draft Mode</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImporter(true)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              📥 Import
            </button>
            <button onClick={() => setShowSummary(true)} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">
              📊 Summary
            </button>
            {activeChapter && (
              <button onClick={handleExportChapter} className="bg-teal-600 text-white px-3 py-1 rounded text-sm">
                📤 Export Chapter
              </button>
            )}
            <button onClick={handleExportAll} className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
              📤 Export Full Draft
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {chapters.map((ch) => (
            <div key={ch.id} className={`px-3 py-1 rounded cursor-pointer ${ch.id === activeChapterId ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`} onClick={() => setActiveId(ch.id)}>
              <input className="bg-transparent outline-none text-sm font-semibold" value={ch.title} onChange={(e) => handleRename(ch.id, e.target.value)} />
              <button onClick={(e) => { e.stopPropagation(); handleDelete(ch.id); }} className="ml-1 text-xs text-red-500" title="Delete chapter">✕</button>
            </div>
          ))}
          <button onClick={() => handleAddChapter()} className="px-3 py-1 bg-green-600 text-white rounded text-sm">+ Add Chapter</button>
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
                onClick={handleInjectToEditor}
                className="absolute bottom-4 right-4 bg-fuchsia-600 text-white px-4 py-2 rounded shadow-lg hover:bg-fuchsia-700"
              >
                ✨ Send to Editor
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
