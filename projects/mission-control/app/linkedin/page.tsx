'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Linkedin, Check, Calendar, Trash2, X, ChevronDown, ChevronUp,
  ExternalLink, Send, FileText, Loader2, CheckCircle2, Pencil, Copy, ClipboardCheck,
} from 'lucide-react'

interface Post {
  id: string
  postNumber: number
  topic: string
  chapter: string
  hook: string
  cta: string
  postBody: string
  status: 'draft' | 'approved' | 'scheduled' | 'published' | 'archived'
  scheduledDate: string
  publishedDate: string
  linkedInUrl: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface Meta {
  targetFrequency: string
  preferredDays: string[]
  lastUpdated: string
}

interface LinkedInData {
  meta: Meta
  posts: Post[]
}

const STATUS_BADGE: Record<Post['status'], string> = {
  draft: 'bg-slate-200 text-slate-700',
  approved: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-blue-100 text-blue-800 border border-blue-300',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800',
}

const STATUS_LABEL: Record<Post['status'], string> = {
  draft: 'Draft',
  approved: 'Approved',
  scheduled: 'Scheduled',
  published: 'Published',
  archived: 'Archived',
}

function computeStreak(posts: Post[]): number {
  const published = posts.filter(p => p.status === 'published' && p.publishedDate)
  if (published.length === 0) return 0

  const EPOCH = new Date('2020-01-06').getTime() // a Monday
  const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7

  const weekSet = new Set<number>()
  for (const p of published) {
    const wk = Math.floor((new Date(p.publishedDate).getTime() - EPOCH) / MS_PER_WEEK)
    weekSet.add(wk)
  }

  const currentWeek = Math.floor((Date.now() - EPOCH) / MS_PER_WEEK)
  const weeks = Array.from(weekSet).sort((a, b) => b - a)

  // Streak must start from current or previous week
  if (weeks[0] !== currentWeek && weeks[0] !== currentWeek - 1) return 0

  let streak = 0
  let expected = weeks[0]
  for (const w of weeks) {
    if (w === expected) {
      streak++
      expected--
    } else {
      break
    }
  }
  return streak
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const BLANK_EDIT = {
  topic: '',
  chapter: '',
  hook: '',
  cta: '',
  postBody: '',
  scheduledDate: '',
  status: 'draft' as Post['status'],
  linkedInUrl: '',
  notes: '',
}

export default function LinkedInPage() {
  const [data, setData] = useState<LinkedInData | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyPost = (post: Post) => {
    const text = post.postBody || ''
    // Fallback for non-HTTPS (e.g. local IP access)
    const fallback = () => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.top = '-9999px'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(fallback)
    } else {
      fallback()
    }
    setCopiedId(post.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Create modal
  const [createModal, setCreateModal] = useState(false)
  const [createTopic, setCreateTopic] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(false)

  // Edit modal
  const [editModal, setEditModal] = useState<{ open: boolean; post: Post | null }>({ open: false, post: null })
  const [editForm, setEditForm] = useState(BLANK_EDIT)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const load = useCallback(() => {
    fetch('/api/linkedin').then(r => r.json()).then(setData)
  }, [])

  useEffect(() => { load() }, [load])

  // ── Edit modal ──────────────────────────────────────────────────────────────

  const openEdit = (post: Post) => {
    setEditForm({
      topic: post.topic || '',
      chapter: post.chapter || '',
      hook: post.hook || '',
      cta: post.cta || '',
      postBody: post.postBody || '',
      scheduledDate: post.scheduledDate ? post.scheduledDate.split('T')[0] : '',
      status: post.status,
      linkedInUrl: post.linkedInUrl || '',
      notes: post.notes || '',
    })
    setDeleteConfirm(false)
    setEditModal({ open: true, post })
  }

  const closeEdit = () => {
    setEditModal({ open: false, post: null })
    setEditForm(BLANK_EDIT)
    setDeleteConfirm(false)
  }

  const saveEdit = async () => {
    if (!editModal.post) return
    setSaving(true)
    await fetch(`/api/linkedin?id=${editModal.post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setSaving(false)
    closeEdit()
    load()
  }

  const deletePost = async () => {
    if (!editModal.post) return
    await fetch(`/api/linkedin?id=${editModal.post.id}`, { method: 'DELETE' })
    closeEdit()
    load()
  }

  // ── Quick actions ───────────────────────────────────────────────────────────

  const quickPatch = async (post: Post, body: object) => {
    await fetch(`/api/linkedin?id=${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    load()
  }

  const quickDelete = async (post: Post) => {
    await fetch(`/api/linkedin?id=${post.id}`, { method: 'DELETE' })
    load()
  }

  // ── Create modal ────────────────────────────────────────────────────────────

  const generatePost = async () => {
    setCreateLoading(true)
    await fetch('/api/linkedin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: createTopic.trim() || undefined }),
    })
    setCreateLoading(false)
    setCreateSuccess(true)
    load()
  }

  const closeCreate = () => {
    setCreateModal(false)
    setCreateTopic('')
    setCreateSuccess(false)
    setCreateLoading(false)
  }

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono animate-pulse">Initializing transmission…</div>
    )
  }

  const { posts } = data

  const totalPosts = posts.length
  const publishedCount = posts.filter(p => p.status === 'published').length
  const upcomingCount = posts.filter(p => p.status === 'scheduled' || p.status === 'approved').length
  const streak = computeStreak(posts)

  const upcomingPosts = posts
    .filter(p => ['draft', 'approved', 'scheduled'].includes(p.status))
    .sort((a, b) => {
      if (!a.scheduledDate && !b.scheduledDate) return 0
      if (!a.scheduledDate) return 1
      if (!b.scheduledDate) return -1
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    })

  // Archive = all posts; published ones by publishedDate desc, then others by scheduledDate/createdAt
  const archivePosts = posts.slice().sort((a, b) => {
    const aDate = a.publishedDate || a.scheduledDate || a.createdAt || ''
    const bDate = b.publishedDate || b.scheduledDate || b.createdAt || ''
    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Linkedin size={22} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900">LinkedIn Pipeline</h1>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
        >
          ✍️ Generate Post
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts', value: totalPosts, color: 'text-slate-900' },
          { label: 'Published', value: publishedCount, color: 'text-green-400' },
          { label: 'Upcoming', value: upcomingCount, color: 'text-blue-600' },
          { label: 'Week Streak', value: `${streak} wk${streak !== 1 ? 's' : ''}`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-400 transition-all">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming & Drafts */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          Upcoming &amp; Drafts
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono text-[10px] normal-case">
            {upcomingPosts.length}
          </span>
        </h2>
        {upcomingPosts.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">No data in buffer</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {upcomingPosts.map(post => (
              <div
                key={post.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-md transition-all shrink-0 w-80 flex flex-col group"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full ${STATUS_BADGE[post.status]}`}>
                    {STATUS_LABEL[post.status]}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">NODE #{String(post.postNumber).padStart(3, '0')}</span>
                </div>

                {/* Topic */}
                <div className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm mb-1 transition-colors">
                  {post.topic || 'Untitled'}
                </div>

                {/* Hook */}
                {post.hook && (
                  <p className="text-xs text-slate-500 mb-2 italic line-clamp-2 leading-relaxed opacity-80">{post.hook}</p>
                )}

                {/* Post body preview */}
                {post.postBody && (
                  <p className="text-xs text-slate-800/70 mb-3 line-clamp-4 leading-relaxed flex-1 whitespace-pre-line overflow-hidden border-l border-slate-200 pl-3">
                    {post.postBody}
                  </p>
                )}

                {/* Scheduled date */}
                {post.scheduledDate && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 mb-3 font-mono">
                    <Calendar size={11} />
                    {formatDate(post.scheduledDate)}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-slate-200" onClick={e => e.stopPropagation()}>
                  {/* Copy full post */}
                  <button
                    onClick={() => copyPost(post)}
                    className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                      copiedId === post.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                    }`}
                    title="Copy to buffer"
                  >
                    {copiedId === post.id ? <ClipboardCheck size={11} /> : <Copy size={11} />}
                    {copiedId === post.id ? 'Synced' : 'Copy'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(post)}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-blue-600 hover:border-blue-500/50 hover:bg-blue-50/20 transition-all"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>

                  {/* Posted — marks as published */}
                  <button
                    onClick={() => quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-950/20 transition-all"
                  >
                    <CheckCircle2 size={11} />
                    Push
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => quickDelete(post)}
                    className="flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-red-400 hover:border-red-500/50 hover:bg-red-950/20 transition-all ml-auto"
                    title="Purge"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Posts Archive */}
      <div>
        <button
          onClick={() => setArchiveOpen(v => !v)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 hover:text-slate-800 transition-colors"
        >
          {archiveOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Historical Archive
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono normal-case tracking-normal">
            {archivePosts.length}
          </span>
        </button>
        {archiveOpen && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            {archivePosts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-500 font-mono">Archive empty</div>
            ) : (
              archivePosts.map((post, i) => (
                <div key={post.id} className={i > 0 ? 'border-t border-slate-200' : ''}>
                  <div
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-100/50 cursor-pointer transition-colors group"
                    onClick={() => toggleRow(post.id)}
                  >
                    <span className="text-xs font-mono text-slate-500 w-8 shrink-0">#{String(post.postNumber).padStart(3, '0')}</span>
                    {/* Status badge */}
                    <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                    <span className="text-sm font-medium text-slate-900 w-32 shrink-0 truncate group-hover:text-blue-600 transition-colors">
                      {post.topic || 'Untitled'}
                    </span>
                    <span className="text-xs text-slate-600 flex-1 truncate font-mono italic">{post.hook}</span>
                    <span className="text-xs text-slate-500 shrink-0 w-24 text-right font-mono">
                      {post.status === 'published'
                        ? formatDate(post.publishedDate)
                        : post.scheduledDate
                          ? <span className="flex items-center gap-1 justify-end"><Calendar size={10} />{formatDate(post.scheduledDate)}</span>
                          : <span className="text-slate-500 italic">unscheduled</span>
                      }
                    </span>
                    {/* Mark Published button for non-published posts */}
                    {post.status !== 'published' && post.status !== 'archived' ? (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })
                        }}
                        className="flex items-center gap-1 text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-950/20 transition-all shrink-0"
                        title="Mark as Published"
                      >
                        <CheckCircle2 size={11} />
                        Push
                      </button>
                    ) : post.linkedInUrl ? (
                      <a
                        href={post.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-blue-400 hover:text-blue-300 shrink-0 transition-colors"
                        title="View Transmission"
                      >
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="w-[13px] shrink-0" />
                    )}
                    <span className="shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors">
                      {expandedRows.has(post.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  {expandedRows.has(post.id) && (
                    <div className="px-5 pb-5 bg-white/30 border-t border-slate-200 animate-in slide-in-from-top-1 duration-200">
                      <pre className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed mt-4 p-4 bg-white rounded-lg border border-slate-200 opacity-90">
                        {post.postBody || 'No encrypted data.'}
                      </pre>
                      <div className="flex items-center gap-4 mt-4 pl-4">
                        <button
                          onClick={() => openEdit(post)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider transition-colors"
                        >
                          Modify Node →
                        </button>
                        {post.status !== 'published' && post.status !== 'archived' && (
                          <button
                            onClick={() => quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })}
                            className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-bold uppercase tracking-wider transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            Commit Transmission
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Create New Post Modal ────────────────────────────────────────────── */}
      {createModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeCreate}
        >
          <div
            className="bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight">Generate Node Content</h3>
              <button onClick={closeCreate} className="text-slate-500 hover:text-slate-900 transition-colors">
                <X size={18} />
              </button>
            </div>
            {createSuccess ? (
              <div className="text-center py-6">
                <div className="text-blue-600 text-4xl mb-3 shadow-[0_0_15px_rgba(0,255,65,0.3)] inline-block px-4">✓</div>
                <div className="font-bold text-slate-900 mb-1 uppercase tracking-widest">Protocol Initiated</div>
                <p className="text-sm text-slate-500 font-mono leading-relaxed">
                  Neo is accessing manuscript data and will deliver encrypted draft to Telegram.
                </p>
                <button
                  onClick={closeCreate}
                  className="mt-6 px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Input Vector Topic</label>
                  <input
                    type="text"
                    value={createTopic}
                    onChange={e => setCreateTopic(e.target.value)}
                    placeholder="Enter topic (or leave for auto-select)"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && !createLoading) generatePost() }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mb-6 font-mono uppercase leading-relaxed tracking-wider">
                  System will cross-reference manuscript nodes to prevent duplicate transmission.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={closeCreate}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-bold uppercase"
                  >
                    Abort
                  </button>
                  <button
                    onClick={generatePost}
                    disabled={createLoading}
                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-40"
                  >
                    {createLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <FileText size={14} />}
                    {createLoading ? 'Executing…' : 'Initialize'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Post Detail / Edit Modal ─────────────────────────────────────────── */}
      {editModal.open && editModal.post && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-200 shrink-0 bg-white/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 font-mono">
                    NODE #{String(editModal.post.postNumber).padStart(3, '0')}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full ${STATUS_BADGE[editModal.post.status]}`}>
                    {STATUS_LABEL[editModal.post.status]}
                  </span>
                </div>
                {editModal.post.topic && (
                  <p className="text-xs text-blue-600 mt-0.5 font-mono opacity-80">{editModal.post.topic}</p>
                )}
              </div>
              <button onClick={closeEdit} className="text-slate-500 hover:text-slate-900 shrink-0 ml-4 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 bg-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Topic</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={e => setEditForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Chapter</label>
                  <input
                    type="text"
                    value={editForm.chapter}
                    onChange={e => setEditForm(f => ({ ...f, chapter: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Hook Signal</label>
                <input
                  type="text"
                  value={editForm.hook}
                  onChange={e => setEditForm(f => ({ ...f, hook: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">CTA Directive</label>
                <input
                  type="text"
                  value={editForm.cta}
                  onChange={e => setEditForm(f => ({ ...f, cta: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Decrypted Content</label>
                <textarea
                  value={editForm.postBody}
                  onChange={e => setEditForm(f => ({ ...f, postBody: e.target.value }))}
                  rows={9}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-y leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Transmission Date</label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={e => setEditForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 invert-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Sync Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Post['status'] }))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Live Link URL</label>
                <input
                  type="url"
                  value={editForm.linkedInUrl}
                  onChange={e => setEditForm(f => ({ ...f, linkedInUrl: e.target.value }))}
                  placeholder="https://www.linkedin.com/posts/…"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-widest font-mono">Internal Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 shrink-0 bg-white/50">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} />
                  Purge
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-400 font-bold uppercase font-mono">Confirm Purge?</span>
                  <button
                    onClick={deletePost}
                    className="text-[10px] px-3 py-1.5 bg-red-600 hover:bg-red-500 text-slate-900 rounded-lg transition-colors font-bold uppercase"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="text-[10px] px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:border-slate-300 transition-colors font-bold uppercase"
                  >
                    Abort
                  </button>
                </div>
              )}
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-bold uppercase"
                >
                  Discard
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-40"
                >
                  {saving ? 'Syncing…' : 'Commit Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
