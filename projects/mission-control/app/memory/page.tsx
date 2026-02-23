'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Brain, Calendar, ChevronRight } from 'lucide-react'

export default function MemoryPage() {
  const [mainContent, setMainContent] = useState('')
  const [dailyFiles, setDailyFiles] = useState<string[]>([])
  const [selectedDaily, setSelectedDaily] = useState('')
  const [dailyContent, setDailyContent] = useState('')
  const [view, setView] = useState<'main' | 'daily'>('main')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/memory')
      .then(r => r.json())
      .then(d => {
        setMainContent(d.content || '_MEMORY.md not found_')
        setDailyFiles(d.dailyFiles || [])
      })
  }, [])

  async function openDaily(filename: string) {
    setSelectedDaily(filename)
    setView('daily')
    setLoading(true)
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(`memory/daily/${filename}`)}`)
      const d = await res.json()
      setDailyContent(d.content || '_Not found_')
    } catch {
      setDailyContent('_Error loading file_')
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Brain size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">Memory</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <button
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-2 transition-colors ${
              view === 'main' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setView('main')}
          >
            <Brain size={14} /> MEMORY.md
          </button>

          {dailyFiles.length > 0 && (
            <>
              <p className="text-xs text-slate-400 uppercase tracking-wide px-3 mt-3 mb-2">Daily Notes</p>
              {dailyFiles.map(f => (
                <button
                  key={f}
                  className={`flex items-center gap-2 w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedDaily === f && view === 'daily'
                      ? 'bg-amber-50 text-amber-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => openDaily(f)}
                >
                  <Calendar size={13} />
                  {f.replace('.md', '')}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 overflow-auto max-h-[80vh]">
          {view === 'main' && (
            <div className="prose max-w-none text-sm text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{mainContent}</ReactMarkdown>
            </div>
          )}
          {view === 'daily' && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm">
                <button className="hover:text-amber-600" onClick={() => setView('main')}>
                  Memory
                </button>
                <ChevronRight size={14} />
                <span className="font-medium text-slate-700">{selectedDaily}</span>
              </div>
              {loading ? (
                <p className="text-slate-400 text-sm">Loading…</p>
              ) : (
                <div className="prose max-w-none text-sm text-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{dailyContent}</ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
