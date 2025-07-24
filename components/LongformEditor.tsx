import { useEffect, useState, useRef } from "react";
import FileImporter from './FileImporter';
import DraftSummary from './DraftSummary';
import { useAppContext } from '../context/AppContext';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export default function LongformEditor() {
  const { 
    longformState, 
    setLongformState, 
    activeChapter,
    textToInject,
    clearInjectedText
  } = useAppContext();
  const { chapters, activeChapterId } = longformState;

  const [selection, setSelection] = useState("");
  const [showImporter, setShowImporter] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textToInject && editorRef.current && activeChapter) {
      const { selectionStart, selectionEnd } = editorRef.current;
      const currentContent = activeChapter.content;
      const newContent = 
        currentContent.slice(0, selectionStart) + 
        textToInject + 
        currentContent.slice(selectionEnd);
      handleContentChange(activeChapter.id, newContent);
      clearInjectedText();
    }
  }, [textToInject, activeChapter, clearInjectedText]);

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
      
      <div className="p-6 bg-card text-card-foreground border border-border rounded-lg">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">📘 Draft Mode</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowImporter(true)} className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-primary/90">
              📥 Import
            </button>
            <button onClick={() => setShowSummary(true)} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-secondary/80">
              📊 Summary
            </button>
            {activeChapter && (
              <button onClick={handleExportChapter} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-secondary/80">
                📤 Export Chapter
              </button>
            )}
            <button onClick={handleExportAll} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-secondary/80">
              📤 Export Full Draft
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {chapters.map((ch) => (
            <div key={ch.id} className={`px-3 py-1 rounded-md cursor-pointer transition-colors ${ch.id === activeChapterId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`} onClick={() => setActiveId(ch.id)}>
              <input className="bg-transparent outline-none text-sm font-semibold w-24" value={ch.title} onChange={(e) => handleRename(ch.id, e.target.value)} />
              <button onClick={(e) => { e.stopPropagation(); handleDelete(ch.id); }} className="ml-1 text-xs text-destructive" title="Delete chapter">✕</button>
            </div>
          ))}
          <button onClick={() => handleAddChapter()} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-semibold shadow hover:bg-primary/90">+ Add Chapter</button>
        </div>

        {activeChapter && (
          <div className="relative">
            <textarea
              ref={editorRef}
              className="w-full h-[60vh] border border-input p-3 rounded-md bg-background text-foreground"
              value={activeChapter.content}
              onChange={(e) => handleContentChange(activeChapter.id, e.target.value)}
              onSelect={handleSelect}
              placeholder="Start writing..."
            />
            {selection && (
              <button
                onClick={handleInjectToEditor}
                className="absolute bottom-4 right-4 bg-accent text-accent-foreground px-4 py-2 rounded-md shadow-lg font-semibold hover:bg-accent/90"
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
