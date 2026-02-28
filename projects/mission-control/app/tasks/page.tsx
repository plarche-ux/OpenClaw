'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckSquare, Plus, X, ChevronRight, Trash2, GripVertical } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  project: string
  assignee: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  color: string
}

interface Agent {
  id: string
  name: string
  emoji: string
  role: string
}

interface TaskData {
  tasks: Task[]
  projects: Project[]
  agents: Agent[]
}

const COLUMNS: { id: Task['status']; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-blue-600 text-white',
  low: 'bg-slate-400',
}

const PRIORITY_LABEL: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

const BLANK_FORM = {
  title: '',
  description: '',
  project: 'general',
  assignee: '',
  priority: 'medium' as Task['priority'],
  status: 'backlog' as Task['status'],
}

export default function TasksPage() {
  const [data, setData] = useState<TaskData | null>(null)
  const [filterAssignee, setFilterAssignee] = useState('')
  const [filterProject, setFilterProject] = useState('')

  // Modal state
  const [addModal, setAddModal] = useState<{ open: boolean; status: Task['status'] }>({ open: false, status: 'backlog' })
  const [editModal, setEditModal] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null })
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)

  // Drag state
  const [dragTaskId, setDragTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null)

  const load = useCallback(() => {
    fetch('/api/tasks').then(r => r.json()).then(setData)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = (status: Task['status']) => {
    setForm({ ...BLANK_FORM, status })
    setAddModal({ open: true, status })
  }

  const openEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      project: task.project,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
    })
    setEditModal({ open: true, task })
  }

  const closeModals = () => {
    setAddModal({ open: false, status: 'backlog' })
    setEditModal({ open: false, task: null })
    setForm(BLANK_FORM)
  }

  const saveNew = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    closeModals()
    load()
  }

  const saveEdit = async () => {
    if (!editModal.task || !form.title.trim()) return
    setSaving(true)
    await fetch(`/api/tasks?id=${editModal.task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    closeModals()
    load()
  }

  const moveTask = async (task: Task, status: Task['status']) => {
    if (status === 'review') {
      // Trigger Neo review evaluation
      await fetch(`/api/tasks/review?id=${task.id}`, { method: 'POST' })
    } else {
      await fetch(`/api/tasks?id=${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    }
    load()
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.effectAllowed = 'move'
    setDragTaskId(taskId)
  }

  const handleDragEnd = () => {
    setDragTaskId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e: React.DragEvent, colId: Task['status']) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverCol(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault()
    setDragOverCol(null)
    setDragTaskId(null)
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId || !data) return
    const task = data.tasks.find(t => t.id === taskId)
    if (!task || task.status === targetStatus) return
    await moveTask(task, targetStatus)
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
    closeModals()
    load()
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Loading…</div>
    )
  }

  const { tasks, projects, agents } = data

  const filtered = tasks.filter(t => {
    if (filterAssignee && t.assignee !== filterAssignee) return false
    if (filterProject && t.project !== filterProject) return false
    return true
  })

  const total = tasks.length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const done = tasks.filter(t => t.status === 'done').length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))
  const agentMap = Object.fromEntries(agents.map(a => [a.id, a]))

  const isModalOpen = addModal.open || editModal.open

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <CheckSquare size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
      </div>
      <p className="text-slate-500 text-sm mb-6">Kanban board — all projects</p>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: total, color: 'text-slate-900' },
          { label: 'In Progress', value: inProgress, color: 'text-blue-600' },
          { label: 'Done', value: done, color: 'text-green-500' },
          { label: 'Complete', value: `${pct}%`, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-400 transition-all">
            <div className={`text-2xl font-bold ${s.color} font-mono`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-slate-500 font-medium">Assignee:</span>
          <button
            onClick={() => setFilterAssignee('')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filterAssignee === '' ? 'bg-blue-600 text-white border-blue-500 text-white font-semibold' : 'border-slate-200 text-slate-500 hover:border-blue-500/50'
            }`}
          >
            All
          </button>
          {agents.map(a => (
            <button
              key={a.id}
              onClick={() => setFilterAssignee(filterAssignee === a.id ? '' : a.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filterAssignee === a.id ? 'bg-blue-600 text-white border-blue-500 text-white font-semibold' : 'border-slate-200 text-slate-500 hover:border-blue-500/50'
              }`}
            >
              {a.emoji} {a.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <span className="text-xs text-slate-500 font-medium">Project:</span>
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          >
            <option value="">All projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id)
          const isOver = dragOverCol === col.id
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{col.label}</h2>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openAdd(col.id)}
                  className="text-slate-500 hover:text-blue-600 transition-colors"
                  title={`Add to ${col.label}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Cards drop zone */}
              <div
                className={`flex flex-col gap-2 min-h-[120px] rounded-xl transition-colors p-1 -m-1 ${
                  isOver ? 'bg-blue-50/30 ring-2 ring-blue-500/50 ring-inset' : ''
                }`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, col.id)}
              >
                {colTasks.length === 0 && (
                  <div className={`border-2 border-dashed rounded-xl h-20 flex items-center justify-center transition-colors ${
                    isOver ? 'border-blue-500/50' : 'border-slate-200'
                  }`}>
                    <span className="text-xs text-slate-500">{isOver ? 'Drop here' : 'Empty'}</span>
                  </div>
                )}
                {colTasks.map(task => {
                  const proj = projectMap[task.project]
                  const agent = agentMap[task.assignee]
                  const isDragging = dragTaskId === task.id
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openEdit(task)}
                      className={`bg-slate-50 border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-blue-500 hover:shadow-sm transition-all group select-none ${
                        isDragging ? 'opacity-40 border-blue-500' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical size={12} className="text-slate-600 mt-1 shrink-0 group-hover:text-blue-600/50 transition-colors" />
                        <span
                          className={`w-2 h-2 rounded-full mt-1 shrink-0 ${PRIORITY_DOT[task.priority]}`}
                          title={PRIORITY_LABEL[task.priority]}
                        />
                        <span className="text-sm font-medium text-slate-900 leading-snug">{task.title}</span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 mb-2 line-clamp-1 pl-8">{task.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap pl-8">
                        {proj && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: proj.color + '22', color: proj.color }}
                          >
                            {proj.name}
                          </span>
                        )}
                        {agent && (
                          <span className="text-xs text-slate-500 ml-auto shrink-0">
                            {agent.emoji} {agent.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5 pl-8">{relativeDate(task.updatedAt)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={closeModals}>
          <div
            className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {addModal.open ? `Add to ${COLUMNS.find(c => c.id === addModal.status)?.label}` : 'Edit Task'}
              </h3>
              <button onClick={closeModals} className="text-slate-500 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Task title"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional details"
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Row: project + priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Project</label>
                  <select
                    value={form.project}
                    onChange={e => setForm(f => ({ ...f, project: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task['priority'] }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Row: assignee + status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Assignee</label>
                  <select
                    value={form.assignee}
                    onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Task['status'] }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  >
                    {COLUMNS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Move buttons (edit only) */}
              {editModal.open && editModal.task && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Move to column</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLUMNS.filter(c => c.id !== editModal.task!.status).map(c => (
                      <button
                        key={c.id}
                        onClick={async () => {
                          await moveTask(editModal.task!, c.id)
                          closeModals()
                        }}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <ChevronRight size={12} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              {editModal.open && editModal.task && (
                <button
                  onClick={() => deleteTask(editModal.task!.id)}
                  className="text-red-400 hover:text-red-500 transition-colors mr-auto"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={closeModals}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors ml-auto"
              >
                Cancel
              </button>
              <button
                onClick={addModal.open ? saveNew : saveEdit}
                disabled={!form.title.trim() || saving}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
