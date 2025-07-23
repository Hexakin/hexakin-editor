// components/DiffView.tsx
import { useEffect, useState } from "react";
import { diff_match_patch, Diff } from "diff-match-patch";

interface DiffViewProps {
  original: string;
  edited: string;
}

export default function DiffView({ original, edited }: DiffViewProps) {
  const [diffHtml, setDiffHtml] = useState<string>("");

  useEffect(() => {
    const dmp = new diff_match_patch();

    // Word-level diff: split by word and join with unique character
    const wordSeparator = "␟";
    const originalWords = original.split(/\s+/).join(wordSeparator);
    const editedWords = edited.split(/\s+/).join(wordSeparator);

    const diffs: Diff[] = dmp.diff_main(originalWords, editedWords, false);
    dmp.diff_cleanupSemantic(diffs);

    const html = diffs
      .map(([type, text]) => {
        const words = text.split(wordSeparator);
        return words
          .map((word) => {
            if (!word.trim()) return "";
            if (type === -1)
              return `<del class="bg-red-200 text-red-900 font-semibold px-1 rounded-sm">${word} </del>`;
            if (type === 1)
              return `<ins class="bg-green-200 text-green-900 font-semibold px-1 rounded-sm">${word} </ins>`;
            return `<span>${word} </span>`;
          })
          .join("");
      })
      .join("");

    setDiffHtml(html);
  }, [original, edited]);

  return (
    <div className="border mt-4 p-3 rounded bg-white text-sm prose max-w-none">
      <h2 className="font-semibold mb-2">Differences</h2>
      <div
        className="whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
}
