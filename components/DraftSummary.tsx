import { useMemo } from 'react';

// Define the shape of a Chapter, which this component will receive
interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Props {
  chapters: Chapter[];
  onClose: () => void;
}

// A simple utility function to count words
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function DraftSummary({ chapters, onClose }: Props) {
  // useMemo ensures these expensive calculations only run when the chapters change
  const stats = useMemo(() => {
    const totalWordCount = chapters.reduce((sum, ch) => sum + countWords(ch.content), 0);
    const totalCharacterCount = chapters.reduce((sum, ch) => sum + ch.content.length, 0);
    const chapterStats = chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      wordCount: countWords(ch.content),
    }));

    return { totalWordCount, totalCharacterCount, chapterStats };
  }, [chapters]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📊 Draft Summary</h2>
          <button onClick={onClose} className="text-xl font-bold hover:text-red-500">&times;</button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold">{chapters.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Chapters</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold">{stats.totalWordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Words</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-3xl font-bold">{stats.totalCharacterCount.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Characters</div>
          </div>
        </div>

        {/* Per-Chapter Stats */}
        <div className="max-h-64 overflow-y-auto pr-2">
          <h3 className="font-semibold mb-2">Word Count per Chapter</h3>
          <ul className="space-y-2">
            {stats.chapterStats.map(ch => (
              <li key={ch.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                <span className="font-medium">{ch.title}</span>
                <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-md text-sm">{ch.wordCount.toLocaleString()} words</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
