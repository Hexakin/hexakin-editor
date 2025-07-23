// components/RefineOutput.tsx – Optional: Use this if you want modular refine logic

import { useState } from 'react'

interface Props {
  text: string
  selection: string
  instruction: string
  onRefined: (result: string) => void
}

export function RefineOutput({ text, selection, instruction, onRefined }: Props) {
  const [loading, setLoading] = useState(false)

  const handleRefine = async () => {
    if (!text || !instruction) return
    setLoading(true)
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, selected: selection, instruction }),
      })
      const data = await response.json()
      if (response.ok && data.result) {
        onRefined(data.result)
      }
    } catch (err) {
      console.error('Refine error:', err)
    }
    setLoading(false)
  }

  return (
    <button onClick={handleRefine} disabled={loading} className="bg-fuchsia-600 text-white px-4 py-2 rounded">
      {loading ? 'Refining...' : 'Refine Output'}
    </button>
  )
}
