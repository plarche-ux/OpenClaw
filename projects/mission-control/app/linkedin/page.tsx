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
  draft: 'bg-slate-100 text-slate-500',
  approved: 'bg-blue-100 text-blue-600',
  scheduled: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-600',
  archived: 'bg-red-50 text-red-400',
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
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>
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
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          ✍️ Create New Post
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Posts', value: totalPosts, color: 'text-slate-700' },
          { label: 'Published', value: publishedCount, color: 'text-green-600' },
          { label: 'Upcoming', value: upcomingCount, color: 'text-amber-600' },
          { label: 'Week Streak', value: `${streak} wk${streak !== 1 ? 's' : ''}`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming & Drafts */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          Upcoming &amp; Drafts
          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium normal-case">
            {upcomingPosts.length}
          </span>
        </h2>
        {upcomingPosts.length === 0 ? (
          <div className="border-2 border-dashed border-slate-100 rounded-xl h-20 flex items-center justify-center">
            <span className="text-xs text-slate-300">No upcoming posts — create one above</span>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {upcomingPosts.map(post => (
              <div
                key={post.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-300 hover:shadow-sm transition-all shrink-0 w-80 flex flex-col"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[post.status]}`}>
                    {STATUS_LABEL[post.status]}
                  </span>
                  <span className="text-xs text-slate-400">#{post.postNumber}</span>
                </div>

                {/* Topic */}
                <div className="font-semibold text-slate-800 text-sm mb-1">
                  {post.topic || 'Untitled'}
                </div>

                {/* Hook */}
                {post.hook && (
                  <p className="text-xs text-slate-500 mb-2 italic line-clamp-2">{post.hook}</p>
                )}

                {/* Post body preview */}
                {post.postBody && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-4 leading-relaxed flex-1 whitespace-pre-line">
                    {post.postBody}
                  </p>
                )}

                {/* Scheduled date */}
                {post.scheduledDate && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                    <Calendar size={11} />
                    {formatDate(post.scheduledDate)}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                  {/* Copy full post */}
                  <button
                    onClick={() => copyPost(post)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${
                      copiedId === post.id
                        ? 'border-slate-300 bg-slate-100 text-slate-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    title="Copy full post to clipboard"
                  >
                    {copiedId === post.id ? <ClipboardCheck size={11} /> : <Copy size={11} />}
                    {copiedId === post.id ? 'Copied!' : 'Copy'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(post)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>

                  {/* Posted — marks as published */}
                  <button
                    onClick={() => quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-green-200 text-green-600 hover:border-green-300 hover:bg-green-50 transition-colors font-medium"
                  >
                    <CheckCircle2 size={11} />
                    Posted
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => quickDelete(post)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-red-400 hover:border-red-300 hover:bg-red-50 transition-colors ml-auto"
                    title="Delete"
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
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 hover:text-slate-700 transition-colors"
        >
          {archiveOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Post Archive
          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium normal-case">
            {archivePosts.length}
          </span>
        </button>
        {archiveOpen && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {archivePosts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">No posts yet</div>
            ) : (
              archivePosts.map((post, i) => (
                <div key={post.id} className={i > 0 ? 'border-t border-slate-100' : ''}>
                  <div
                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => toggleRow(post.id)}
                  >
                    <span className="text-xs font-mono text-slate-400 w-8 shrink-0">#{post.postNumber}</span>
                    {/* Status badge */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[post.status]}`}>
                      {STATUS_LABEL[post.status]}
                    </span>
                    <span className="text-sm font-medium text-slate-700 w-32 shrink-0 truncate">
                      {post.topic || 'Untitled'}
                    </span>
                    <span className="text-xs text-slate-400 flex-1 truncate">{post.hook}</span>
                    <span className="text-xs text-slate-400 shrink-0 w-24 text-right">
                      {post.status === 'published'
                        ? formatDate(post.publishedDate)
                        : post.scheduledDate
                          ? <span className="flex items-center gap-1 justify-end"><Calendar size={10} />{formatDate(post.scheduledDate)}</span>
                          : <span className="text-slate-300 italic">unscheduled</span>
                      }
                    </span>
                    {/* Mark Published button for non-published posts */}
                    {post.status !== 'published' && post.status !== 'archived' ? (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })
                        }}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors shrink-0"
                        title="Mark as Published"
                      >
                        <CheckCircle2 size={11} />
                        Published
                      </button>
                    ) : post.linkedInUrl ? (
                      <a
                        href={post.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-700 shrink-0"
                        title="View on LinkedIn"
                      >
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="w-[13px] shrink-0" />
                    )}
                    <span className="shrink-0 text-slate-300">
                      {expandedRows.has(post.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  {expandedRows.has(post.id) && (
                    <div className="px-5 pb-4 bg-slate-50/60 border-t border-slate-100">
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed mt-3">
                        {post.postBody || 'No content.'}
                      </pre>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => openEdit(post)}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                        >
                          Edit post →
                        </button>
                        {post.status !== 'published' && post.status !== 'archived' && (
                          <button
                            onClick={() => quickPatch(post, { status: 'published', publishedDate: new Date().toISOString() })}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
                          >
                            <CheckCircle2 size={12} />
                            Mark as Published
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
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeCreate}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Create New Post</h3>
              <button onClick={closeCreate} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            {createSuccess ? (
              <div className="text-center py-6">
                <div className="text-green-500 text-4xl mb-3">✓</div>
                <div className="font-semibold text-slate-800 mb-1">Draft requested!</div>
                <p className="text-sm text-slate-400">
                  Neo is researching the manuscript and will deliver a draft to Telegram shortly.
                </p>
                <button
                  onClick={closeCreate}
                  className="mt-5 px-5 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Topic (optional)</label>
                  <input
                    type="text"
                    value={createTopic}
                    onChange={e => setCreateTopic(e.target.value)}
                    placeholder="What topic? (leave blank for Neo to choose)"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && !createLoading) generatePost() }}
                  />
                </div>
                <p className="text-xs text-slate-400 mb-5">
                  Neo will research the manuscript, check for duplicates, and deliver a draft to Telegram.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={closeCreate}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generatePost}
                    disabled={createLoading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-40"
                  >
                    {createLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <FileText size={14} />}
                    {createLoading ? 'Generating…' : 'Generate Post'}
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
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Post #{editModal.post.postNumber}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[editModal.post.status]}`}>
                    {STATUS_LABEL[editModal.post.status]}
                  </span>
                </div>
                {editModal.post.topic && (
                  <p className="text-xs text-slate-400 mt-0.5">{editModal.post.topic}</p>
                )}
              </div>
              <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 shrink-0 ml-4">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Topic</label>
                  <input
                    type="text"
                    value={editForm.topic}
                    onChange={e => setEditForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Chapter</label>
                  <input
                    type="text"
                    value={editForm.chapter}
                    onChange={e => setEditForm(f => ({ ...f, chapter: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Hook</label>
                <input
                  type="text"
                  value={editForm.hook}
                  onChange={e => setEditForm(f => ({ ...f, hook: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">CTA</label>
                <input
                  type="text"
                  value={editForm.cta}
                  onChange={e => setEditForm(f => ({ ...f, cta: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Post Body</label>
                <textarea
                  value={editForm.postBody}
                  onChange={e => setEditForm(f => ({ ...f, postBody: e.target.value }))}
                  rows={9}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Scheduled Date</label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={e => setEditForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value as Post['status'] }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
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
                <label className="text-xs font-medium text-slate-500 mb-1 block">LinkedIn URL</label>
                <input
                  type="url"
                  value={editForm.linkedInUrl}
                  onChange={e => setEditForm(f => ({ ...f, linkedInUrl: e.target.value }))}
                  placeholder="https://www.linkedin.com/posts/…"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-500 font-medium">Confirm delete?</span>
                  <button
                    onClick={deletePost}
                    className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="text-xs px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
