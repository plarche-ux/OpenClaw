'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import matter from 'gray-matter'
import { FileText, ChevronRight, ChevronDown, Folder } from 'lucide-react'

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
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-slate-100 text-sm text-slate-600"
                onClick={() => setOpen(o => ({ ...o, [node.path]: !o[node.path] }))}
              >
                {open[node.path] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                <Folder size={13} className="text-amber-400" />
                <span className="font-medium">{node.name}</span>
              </button>
              {open[node.path] && node.children && (
                <div className="ml-4">
                  <FileTree nodes={node.children} onSelect={onSelect} selectedPath={selectedPath} />
                </div>
              )}
            </>
          ) : (
            <button
              className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                selectedPath === node.path
                  ? 'bg-amber-50 text-amber-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
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
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/tree').then(r => r.json()).then(d => setTree(d.tree || []))
  }, [])

  async function openFile(filePath: string) {
    setSelectedPath(filePath)
    setLoading(true)
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`)
      const data = await res.json()
      if (data.content) {
        const parsed = matter(data.content)
        setContent(parsed.content)
      } else {
        setContent('_File not found_')
      }
    } catch {
      setContent('_Error loading file_')
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Docs</h1>
      <div className="flex gap-6 min-h-[70vh]">
        {/* File tree */}
        <div className="w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-3 overflow-y-auto max-h-[80vh]">
          {tree.length === 0 ? (
            <p className="text-slate-400 text-sm px-2 py-2">Loading files…</p>
          ) : (
            <FileTree nodes={tree} onSelect={openFile} selectedPath={selectedPath} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 overflow-auto max-h-[80vh]">
          {!selectedPath && (
            <div className="text-slate-400 text-sm flex flex-col items-center justify-center h-40 gap-2">
              <FileText size={32} className="text-slate-300" />
              Select a file from the tree to read it
            </div>
          )}
          {loading && <p className="text-slate-400 text-sm">Loading…</p>}
          {!loading && content && (
            <div className="prose max-w-none text-sm text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
