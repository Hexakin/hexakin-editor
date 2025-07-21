import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('Line Edit');
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });

      const data = await res.json();
      setResult(data.result || 'No result returned.');
    } catch (error) {
      setResult('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-8 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Hexakin Editor</h1>
        <p className="text-sm text-gray-600">Your AI-assisted line editor and critique tool</p>
      </header>

      <div className="max-w-3xl mx-auto space-y-4">
        <textarea
          className="w-full p-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[160px]"
          placeholder="Paste your writing here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <select
            className="p-2 rounded border border-gray-300 focus:outline-none"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="Line Edit">Line Edit</option>
            <option value="Critique">Critique</option>
          </select>

          <button
            onClick={handleEdit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={loading || !text.trim()}
          >
            {loading ? 'Processing...' : 'Run Edit'}
          </button>
        </div>

        {result && (
          <div className="bg-white border border-gray-200 p-4 rounded shadow-sm whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>

      <footer className="mt-12 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Hexakin · AI Editing Prototype
      </footer>
    </main>
  );
}
