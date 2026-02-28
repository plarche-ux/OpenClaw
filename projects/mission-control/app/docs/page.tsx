'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'
import { FileText, ChevronRight, ChevronDown, Folder, Pencil, Save, X, CheckCircle } from 'lucide-react'

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children?: TreeNode[]
}

function FileTree({
  nodes,
  onSelect,
  selectedPath,
}: {
  nodes: TreeNode[]
  onSelect: (path: string) => void
  selectedPath: string
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  return (
    <ul className="space-y-0.5">
      {nodes.map(node => (
        <li key={node.path}>
          {node.isDir ? (
            <>
              <button
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-slate-50 text-sm text-slate-800 transition-colors"
                onClick={() => setOpen(o => ({ ...o, [node.path]: !o[node.path] }))}
              >
                {open[node.path] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <Folder size={13} className="text-blue-600" />
                <span className="font-medium">{node.name}</span>
              </button>
              {open[node.path] && node.children && (
                <div className="ml-4 border-l border-slate-200 pl-1 my-1">
                  <FileTree nodes={node.children} onSelect={onSelect} selectedPath={selectedPath} />
                </div>
              )}
            </>
          ) : (
            <button
              className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-sm transition-all ${
                selectedPath === node.path
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
              onClick={() => onSelect(node.path)}
            >
              <FileText size={13} />
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function DocsPage() {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [rawContent, setRawContent] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  useEffect(() => {
    fetch('/api/tree').then(r => r.json()).then(d => setTree(d.tree || []))
  }, [])

  async function openFile(filePath: string) {
    setSelectedPath(filePath)
    setEditing(false)
    setSaveStatus('idle')
    setLoading(true)
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`)
      const data = await res.json()
      if (data.content) {
        setRawContent(data.content)
        const parsed = matter(data.content)
        setContent(parsed.content)
      } else {
        setRawContent('')
        setContent('_File not found_')
      }
    } catch {
      setContent('_Error loading file_')
    }
    setLoading(false)
  }

  function startEdit() {
    setEditContent(rawContent)
    setEditing(true)
    setSaveStatus('idle')
  }

  function cancelEdit() {
    setEditing(false)
    setSaveStatus('idle')
  }

  async function saveFile() {
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(selectedPath)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        setRawContent(editContent)
        const parsed = matter(editContent)
        setContent(parsed.content)
        setEditing(false)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
    setSaving(false)
  }

  const isMarkdown = selectedPath.endsWith('.md')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Docs</h1>
      <div className="flex gap-6 min-h-[70vh]">
        {/* File tree */}
        <div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-3 overflow-y-auto max-h-[80vh]">
          {tree.length === 0 ? (
            <p className="text-slate-500 text-sm px-2 py-2 font-mono animate-pulse">Scanning matrix…</p>
          ) : (
            <FileTree nodes={tree} onSelect={openFile} selectedPath={selectedPath} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
          {/* Toolbar */}
          {selectedPath && !loading && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-100">
              <span className="text-xs text-slate-500 font-mono">{selectedPath}</span>
              <div className="flex items-center gap-2">
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <CheckCircle size={13} /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-xs text-red-500 font-medium">Save failed</span>
                )}
                {!editing && isMarkdown && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
                {editing && (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button
                      onClick={saveFile}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-50"
                    >
                      <Save size={12} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-auto p-6">
            {!selectedPath && (
              <div className="text-slate-500 text-sm flex flex-col items-center justify-center h-40 gap-2">
                <FileText size={32} className="text-slate-600" />
                Select a file from the tree to read it
              </div>
            )}
            {loading && <p className="text-slate-500 text-sm font-mono animate-pulse">Decrypting content…</p>}
            {!loading && editing && (
              <textarea
                className="w-full h-full min-h-[60vh] font-mono text-sm text-slate-800 bg-white border border-slate-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                spellCheck={false}
              />
            )}
            {!loading && !editing && content && (
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
