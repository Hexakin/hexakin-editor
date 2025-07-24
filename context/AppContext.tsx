import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- Define the shape of all the data we want to share ---

// 1. Data from the Hexakin Editor
interface HexakinEditorState {
  inputText: string;
  editedText: string;
  purpose: string;
  style: string;
  editorType: string;
}

// 2. Data from the Longform Editor (Draft Studio)
interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface LongformEditorState {
  chapters: Chapter[];
  activeChapterId: string | null;
}

// 3. Combine everything into a single "Context" shape
interface IAppContext {
  hexakinState: HexakinEditorState;
  setHexakinState: React.Dispatch<React.SetStateAction<HexakinEditorState>>;

  longformState: LongformEditorState;
  setLongformState: React.Dispatch<React.SetStateAction<LongformEditorState>>;
  
  activeChapter: Chapter | undefined;

  // --- NEW: State and function for injecting text from the chat ---
  textToInject: string | null;
  handleInjectText: (text: string) => void;
  clearInjectedText: () => void;
}

// --- Create the Context ---
const AppContext = createContext<IAppContext | undefined>(undefined);


// --- Create the Provider Component ---
export function AppProvider({ children }: { children: ReactNode }) {
  const [hexakinState, setHexakinState] = useState<HexakinEditorState>({
    inputText: '',
    editedText: '',
    purpose: 'Line Edit',
    style: 'Default',
    editorType: 'Novel Editor',
  });

  const [longformState, setLongformState] = useState<LongformEditorState>({
    chapters: [],
    activeChapterId: null,
  });
  
  // --- NEW: State for injection ---
  const [textToInject, setTextToInject] = useState<string | null>(null);

  // Load chapters from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hexakin_chapters");
      if (saved) {
        const parsed: Chapter[] = JSON.parse(saved);
        setLongformState({
            chapters: parsed,
            activeChapterId: parsed.length > 0 ? parsed[0].id : null
        });
      }
    } catch (error) {
        console.error("Failed to parse chapters from localStorage", error);
        localStorage.removeItem("hexakin_chapters");
    }
  }, []);

  // Save chapters to localStorage
  useEffect(() => {
    if (longformState.chapters.length > 0) {
      localStorage.setItem("hexakin_chapters", JSON.stringify(longformState.chapters));
    }
  }, [longformState.chapters]);

  const activeChapter = longformState.chapters.find(
    (ch) => ch.id === longformState.activeChapterId
  );
  
  // --- NEW: Injection handler functions ---
  const handleInjectText = (text: string) => {
    setTextToInject(text);
  };

  const clearInjectedText = () => {
    setTextToInject(null);
  };

  const value = {
    hexakinState,
    setHexakinState,
    longformState,
    setLongformState,
    activeChapter,
    textToInject,
    handleInjectText,
    clearInjectedText,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- Create a Custom Hook for easy access ---
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
