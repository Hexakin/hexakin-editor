// components/DiffView.tsx
import { diff_match_patch, Diff } from 'diff-match-patch'
import { useEffect, useState } from 'react'

interface DiffViewProps {
  original: string
  edited: string
}

export default function DiffView({ original, edited }: DiffViewProps) {
  const [diffHtml, setDiffHtml] = useState<string>('')

  useEffect(() => {
    const dmp = new diff_match_patch()
    const diffs: Diff[] = dmp.diff_main(original, edited)
    dmp.diff_cleanupSemantic(diffs)

    const html = diffs
      .map(([type, text]) => {
        if (type === -1) return `<del class="bg-red-100 text-red-800">${text}</del>`
        if (type === 1) return `<ins class="bg-green-100 text-green-800">${text}</ins>`
        return `<span>${text}</span>`
      })
      .join('')

    setDiffHtml(html)
  }, [original, edited])

  return (
    <div className="border mt-4 p-3 rounded bg-white text-sm prose max-w-none">
      <h2 className="font-semibold mb-2">Differences</h2>
      <div dangerouslySetInnerHTML={{ __html: diffHtml }} />
    </div>
  )
}
