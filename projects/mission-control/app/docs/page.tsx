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
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-[#111827] text-sm text-[#e2e8f0] transition-colors"
                onClick={() => setOpen(o => ({ ...o, [node.path]: !o[node.path] }))}
              >
                {open[node.path] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <Folder size={13} className="text-[#00ff41]" />
                <span className="font-medium">{node.name}</span>
              </button>
              {open[node.path] && node.children && (
                <div className="ml-4 border-l border-[#1f2937] pl-1 my-1">
                  <FileTree nodes={node.children} onSelect={onSelect} selectedPath={selectedPath} />
                </div>
              )}
            </>
          ) : (
            <button
              className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-sm transition-all ${
                selectedPath === node.path
                  ? 'bg-[#00ff41] text-[#0a0a0a] font-medium shadow-[0_0_8px_rgba(0,255,65,0.2)]'
                  : 'text-[#6b7280] hover:bg-[#111827] hover:text-[#e2e8f0]'
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
      <h1 className="text-2xl font-bold text-white mb-6">Docs</h1>
      <div className="flex gap-6 min-h-[70vh]">
        {/* File tree */}
        <div className="w-64 shrink-0 bg-[#0a0a0a] border border-[#1f2937] rounded-xl p-3 overflow-y-auto max-h-[80vh]">
          {tree.length === 0 ? (
            <p className="text-[#6b7280] text-sm px-2 py-2 font-mono animate-pulse">Scanning matrix…</p>
          ) : (
            <FileTree nodes={tree} onSelect={openFile} selectedPath={selectedPath} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden flex flex-col max-h-[80vh]">
          {/* Toolbar */}
          {selectedPath && !loading && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#1f2937] bg-[#0f1117]">
              <span className="text-xs text-[#6b7280] font-mono">{selectedPath}</span>
              <div className="flex items-center gap-2">
                {saveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-[#00ff41] font-medium">
                    <CheckCircle size={13} /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-xs text-red-500 font-medium">Save failed</span>
                )}
                {!editing && isMarkdown && (
                  <button
                    onClick={startEdit}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#00ff41] hover:bg-[#00cc33] text-[#0a0a0a] font-bold shadow-[0_0_10px_rgba(0,255,65,0.2)] transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
                {editing && (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-[#e2e8f0] font-medium transition-colors"
                    >
                      <X size={12} /> Cancel
                    </button>
                    <button
                      onClick={saveFile}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#00cc33] hover:bg-[#00ff41] text-[#0a0a0a] font-bold transition-all disabled:opacity-50"
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
              <div className="text-[#6b7280] text-sm flex flex-col items-center justify-center h-40 gap-2">
                <FileText size={32} className="text-[#1f2937]" />
                Select a file from the tree to read it
              </div>
            )}
            {loading && <p className="text-[#6b7280] text-sm font-mono animate-pulse">Decrypting content…</p>}
            {!loading && editing && (
              <textarea
                className="w-full h-full min-h-[60vh] font-mono text-sm text-[#e2e8f0] bg-[#0a0a0a] border border-[#1f2937] rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#00ff41]/30 focus:border-[#00ff41]"
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
