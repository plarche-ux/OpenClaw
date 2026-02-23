'use client'

import { useEffect, useState } from 'react'
import { Linkedin, ExternalLink } from 'lucide-react'

export default function LinkedInPage() {
  const [rows, setRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/files?path=memory%2Fprojects%2Flinkedin-pipeline.csv')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError('Pipeline CSV not found in memory/projects/linkedin-pipeline.csv'); return }
        const lines = d.content.trim().split('\n')
        if (lines.length === 0) { setError('CSV is empty'); return }
        const parse = (line: string) => line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
        setHeaders(parse(lines[0]))
        setRows(lines.slice(1).map(parse))
      })
      .catch(() => setError('Failed to load pipeline CSV'))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Linkedin size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">LinkedIn Pipeline</h1>
        </div>
        <a
          href="https://docs.google.com/spreadsheets/d/18x3Xd5oklGNgcZw-1sFSSiuKGHCoETbikyZ_BAR1MhY"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Open in Sheets <ExternalLink size={13} />
        </a>
      </div>
      <p className="text-slate-400 text-sm mb-8">Track post drafts, status, and publishing schedule.</p>

      {error && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
          <Linkedin size={32} className="text-slate-300 mx-auto mb-3" />
          <p>{error}</p>
          <p className="text-xs mt-2 text-slate-300">Open the Google Sheet above to manage the pipeline.</p>
        </div>
      )}

      {headers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {headers.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-slate-700 border-b border-slate-100">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
