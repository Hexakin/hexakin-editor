import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onFileParsed: (content: string, fileName: string) => void;
  onClose: () => void;
}

export default function FileImporter({ onFileParsed, onClose }: Props) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target?.result;
      if (!content) return;

      try {
        let textContent = '';
        if (file.name.endsWith('.docx')) {
          // Dynamically import mammoth.js only when a .docx file is dropped
          const mammoth = (await import('mammoth')).default;
          const result = await mammoth.extractRawText({ arrayBuffer: content as ArrayBuffer });
          textContent = result.value;
        } else if (file.name.endsWith('.md')) {
          // Dynamically import marked only when a .md file is dropped
          const { marked } = await import('marked');
          textContent = await marked.parse(content as string);
        } else { // .txt files
          textContent = content as string;
        }
        onFileParsed(textContent, file.name);
        onClose();
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Sorry, there was an error parsing that file.");
      }
    };

    // Read the file based on its type
    if (file.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, [onFileParsed, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Import Document</h2>
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drag 'n' drop a .txt, .md, or .docx file here, or click to select a file</p>
          )}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-gray-300 text-black px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
