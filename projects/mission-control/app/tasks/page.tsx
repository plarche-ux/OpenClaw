'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Square, Inbox } from 'lucide-react'

interface TaskData {
  todo: string[]
  done: string[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskData | null>(null)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setTasks)
  }, [])

  const isEmpty = tasks && tasks.todo.length === 0 && tasks.done.length === 0

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      </div>
      <p className="text-slate-400 text-sm mb-8">Parsed from HEARTBEAT.md</p>

      {!tasks && <p className="text-slate-400 text-sm">Loading…</p>}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Inbox size={40} className="text-slate-300" />
          <p className="text-sm">No tasks in HEARTBEAT.md right now.</p>
          <p className="text-xs text-slate-300">Add checklist items with <code className="bg-slate-100 px-1 rounded">- [ ] task</code> syntax.</p>
        </div>
      )}

      {tasks && !isEmpty && (
        <div className="grid grid-cols-2 gap-6">
          {/* To Do */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Square size={14} className="text-slate-400" /> To Do
              <span className="ml-auto bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                {tasks.todo.length}
              </span>
            </h2>
            <div className="space-y-2">
              {tasks.todo.length === 0 && (
                <p className="text-slate-300 text-sm italic">All clear!</p>
              )}
              {tasks.todo.map((t, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 flex items-start gap-2">
                  <Square size={14} className="text-slate-300 mt-0.5 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Done */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckSquare size={14} className="text-green-500" /> Done
              <span className="ml-auto bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full">
                {tasks.done.length}
              </span>
            </h2>
            <div className="space-y-2">
              {tasks.done.length === 0 && (
                <p className="text-slate-300 text-sm italic">Nothing completed yet</p>
              )}
              {tasks.done.map((t, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 text-sm text-slate-400 flex items-start gap-2 line-through">
                  <CheckSquare size={14} className="text-green-400 mt-0.5 shrink-0 no-underline" style={{ textDecoration: 'none' }} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
