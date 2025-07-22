interface VersionPair {
  input: string;
  output: string;
  purpose: string;
  style: string;
  editorType: string;
}

export default function VersionHistory({
  history,
  onRestore,
  onClose,
}: {
  history: VersionPair[];
  onRestore: (v: VersionPair) => void;
  onClose: () => void;
}) {
  return (
    <div className="border rounded bg-white dark:bg-gray-900 shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-lg">Recent Versions</h2>
        <button onClick={onClose} className="text-sm underline hover:text-red-500">
          Close
        </button>
      </div>
      {history.length === 0 ? (
        <p>No history saved yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((v, idx) => (
            <li key={idx} className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 mb-1">
                <strong>Purpose:</strong> {v.purpose} | <strong>Style:</strong> {v.style} | <strong>Editor:</strong> {v.editorType}
              </p>
              <p className="text-sm mb-1">
                <strong>Input:</strong> {v.input.slice(0, 100)}...
              </p>
              <p className="text-sm mb-2">
                <strong>Output:</strong> {v.output.slice(0, 100)}...
              </p>
              <button onClick={() => onRestore(v)} className="text-xs underline text-blue-600 hover:text-blue-800">
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
