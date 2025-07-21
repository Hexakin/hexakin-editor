export default function FeatureTracker() {
  return (
    <div className="mt-10 p-4 border-t border-gray-300 text-sm text-gray-600">
      <h2 className="font-semibold mb-2">🚧 Live Feature Tracker</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>✓ Line Edit Mode (Working)</li>
        <li>⌛ Paragraph Edit Mode (Coming Soon)</li>
        <li>⬇ Download Edited Text (Planned)</li>
        <li>🌓 Light/Dark Mode Toggle (Planned)</li>
        <li>📋 Version History (Planned)</li>
      </ul>
    </div>
  );
}
