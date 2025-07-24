import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- NEW: Export the Theme type so other files can use it ---
export type Theme = "theme-dark" | "theme-light" | "theme-rose";

interface HexakinEditorState {
  inputText: string;
  editedText: string;
  purpose: string;
  style: string;
  editorType: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface LongformEditorState {
  chapters: Chapter[];
  activeChapterId: string | null;
}

interface IAppContext {
  hexakinState: HexakinEditorState;
  setHexakinState: React.Dispatch<React.SetStateAction<HexakinEditorState>>;
  longformState: LongformEditorState;
  setLongformState: React.Dispatch<React.SetStateAction<LongformEditorState>>;
  activeChapter: Chapter | undefined;
  textToInject: string | null;
  handleInjectText: (text: string) => void;
  clearInjectedText: () => void;
  // --- NEW: Add the theme properties to the interface ---
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

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
  
  const [textToInject, setTextToInject] = useState<string | null>(null);
  
  // --- NEW: Theme state management ---
  const [theme, setTheme] = useState<Theme>('theme-dark');

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
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
