interface ExportProps {
  text: string;
}

export default function ExportButtons({ text }: ExportProps) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited-output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=600,height=600");
    if (printWindow) {
      printWindow.document.write(`<pre>${text}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch((err) => {
        alert("Copy failed: " + err);
      });
    } else {
      alert("Copy not supported on this browser.");
    }
  };

  return (
    <div className="flex gap-2 mb-3">
      <button
        onClick={handleCopy}
        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 text-sm"
      >
        Copy
      </button>
      <button
        onClick={handleDownload}
        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 text-sm"
      >
        Download
      </button>
      <button
        onClick={handlePrint}
        className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 text-sm"
      >
        Print
      </button>
    </div>
  );
}
