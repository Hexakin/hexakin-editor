import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// --- Define the shape of all the data we want to share ---

// 1. Data from the Hexakin Editor
interface HexakinEditorState {
  inputText: string;
  editedText: string;
  purpose: string;
  style: string;
  editorType: string;
  // We'll add more state here as we refactor
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
  // Hexakin Editor state and a function to update it
  hexakinState: HexakinEditorState;
  setHexakinState: React.Dispatch<React.SetStateAction<HexakinEditorState>>;

  // Longform Editor state and a function to update it
  longformState: LongformEditorState;
  setLongformState: React.Dispatch<React.SetStateAction<LongformEditorState>>;
  
  // A helper to easily get the currently active chapter object
  activeChapter: Chapter | undefined;
}

// --- Create the Context ---
// This is the actual context object that components will use.
const AppContext = createContext<IAppContext | undefined>(undefined);


// --- Create the Provider Component ---
// This special component will hold all the state logic and "provide" it
// to all the child components wrapped inside it.
export function AppProvider({ children }: { children: ReactNode }) {
  // All the state that was previously scattered across different components
  // will now live here, in one central place.
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

  // We keep the logic for loading and saving chapters from localStorage here.
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
        localStorage.removeItem("hexakin_chapters"); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    if (longformState.chapters.length > 0) {
      localStorage.setItem("hexakin_chapters", JSON.stringify(longformState.chapters));
    }
  }, [longformState.chapters]);

  // This is a "derived" piece of state - it calculates the active chapter
  // based on the activeChapterId.
  const activeChapter = longformState.chapters.find(
    (ch) => ch.id === longformState.activeChapterId
  );

  // We bundle up all the state and functions into a single "value" object
  // to pass down to the rest of the app.
  const value = {
    hexakinState,
    setHexakinState,
    longformState,
    setLongformState,
    activeChapter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// --- Create a Custom Hook for easy access ---
// Instead of components having to import `useContext` and `AppContext` every time,
// they can just use this simple hook to get access to all the shared data.
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
