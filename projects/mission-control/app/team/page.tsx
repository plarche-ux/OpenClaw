'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, UserPlus, FileText, X, Save, ChevronRight } from 'lucide-react'

interface Agent {
  id: string
  name: string
  emoji: string
  role: string
  description?: string
}

interface Task {
  id: string
  status: string
  assignee: string
}

interface AgentFile {
  name: string
  exists: boolean
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  'primary-agent': 'Primary Agent',
  'book-agent': 'Book Agent',
  'research-agent': 'Research Agent',
  'dev-agent': 'Developer Agent',
}

const ROLE_BADGE: Record<string, { bg: string; text: string; dot: string }> = {
  'primary-agent': { bg: 'bg-[#003d0f]',  text: 'text-[#00ff41]',  dot: 'bg-[#00ff41]'  },
  'book-agent':    { bg: 'bg-[#00ff41]/10',  text: 'text-[#00ff41]',  dot: 'bg-[#00ff41]'  },
  'research-agent':{ bg: 'bg-blue-950',   text: 'text-blue-400',   dot: 'bg-blue-500'   },
  'dev-agent':     { bg: 'bg-purple-950', text: 'text-purple-400', dot: 'bg-purple-500' },
}

// Agents with file viewer access (not the human owner)
const AGENT_IDS_WITH_FILES = ['neo', 'trinity', 'niobe', 'link']
const AGENT_ID_MAP: Record<string, string> = {
  neo: 'main',
  trinity: 'trinity',
  niobe: 'niobe',
  link: 'link',
}

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // File viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerAgent, setViewerAgent] = useState<Agent | null>(null)
  const [agentFiles, setAgentFiles] = useState<AgentFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [editContent, setEditContent] = useState<string>('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(d => {
        setAgents(d.agents ?? [])
        setTasks(d.tasks ?? [])
      })
  }, [])

  const openCountFor = (agentId: string) =>
    tasks.filter(t => t.assignee === agentId && t.status !== 'done').length

  // --- File viewer ---
  const openViewer = useCallback(async (agent: Agent) => {
    const apiId = AGENT_ID_MAP[agent.id] ?? agent.id
    setViewerAgent(agent)
    setViewerOpen(true)
    setSelectedFile(null)
    setFileContent('')
    setEditContent('')
    setEditing(false)
    setSaveMsg(null)
    const res = await fetch(`/api/agents/${apiId}/files`)
    if (res.ok) {
      const data = await res.json()
      setAgentFiles(data.files ?? [])
    }
  }, [])

  const loadFile = useCallback(async (agent: Agent, filename: string) => {
    const apiId = AGENT_ID_MAP[agent.id] ?? agent.id
    setSelectedFile(filename)
    setEditing(false)
    setSaveMsg(null)
    const res = await fetch(`/api/agents/${apiId}/files?file=${encodeURIComponent(filename)}`)
    if (res.ok) {
      const data = await res.json()
      setFileContent(data.content ?? '')
      setEditContent(data.content ?? '')
    }
  }, [])

  const saveFile = useCallback(async () => {
    if (!viewerAgent || !selectedFile) return
    const apiId = AGENT_ID_MAP[viewerAgent.id] ?? viewerAgent.id
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/agents/${apiId}/files?file=${encodeURIComponent(selectedFile)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      if (res.ok) {
        setFileContent(editContent)
        setSaveMsg('✅ Saved')
        setEditing(false)
      } else {
        setSaveMsg('❌ Save failed')
      }
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }, [viewerAgent, selectedFile, editContent])

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Users size={22} className="text-[#00ff41]" />
        <h1 className="text-2xl font-bold text-white">Team</h1>
      </div>
      <p className="text-[#6b7280] text-sm mb-8">Agents and collaborators.</p>

      {/* Agent grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {agents.map(agent => {
          const openTasks = openCountFor(agent.id)
          const isAgent = agent.role !== 'owner'
          const badge = ROLE_BADGE[agent.role]
          const hasFiles = AGENT_IDS_WITH_FILES.includes(agent.id)

          return (
            <div key={agent.id} className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col gap-3 hover:border-[#00ff41]/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-2xl border border-[#1f2937]">
                  {agent.emoji}
                </div>
                {badge && (
                  <span className={`inline-flex items-center gap-1.5 ${badge.bg} ${badge.text} text-xs font-medium px-2.5 py-1 rounded-full border border-[#00ff41]/20`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} inline-block`} />
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="font-semibold text-white text-base">{agent.name}</div>
                <div className="text-xs text-[#6b7280] mt-0.5">
                  {agent.description ?? ROLE_LABEL[agent.role] ?? agent.role}
                </div>
              </div>

              <div className="mt-auto pt-2 border-t border-[#1f2937] flex items-center justify-between">
                {isAgent ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6b7280]">Open tasks:</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono ${
                      openTasks > 0 ? 'bg-[#003d0f] text-[#00ff41]' : 'bg-[#1f2937] text-[#6b7280]'
                    }`}>
                      {openTasks}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[#6b7280]">{ROLE_LABEL[agent.role]}</span>
                )}
                {hasFiles && (
                  <button
                    onClick={() => openViewer(agent)}
                    className="inline-flex items-center gap-1 text-xs text-[#00ff41] hover:text-[#00cc33] font-medium hover:bg-[#003d0f] px-2 py-1 rounded-lg transition-colors"
                  >
                    <FileText size={13} />
                    Files
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Add Agent placeholder */}
        <div className="border-2 border-dashed border-[#1f2937] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-[#6b7280] hover:border-[#00ff41]/30 hover:text-[#00ff41] transition-colors cursor-default min-h-[160px]">
          <UserPlus size={24} />
          <span className="text-sm font-medium">Add Agent</span>
          <span className="text-xs text-center">Future multi-agent workflows</span>
        </div>
      </div>

      {/* File Viewer Slide-in Panel */}
      {viewerOpen && viewerAgent && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => { setViewerOpen(false); setEditing(false) }}
          />

          {/* Panel */}
          <div className="w-full max-w-2xl bg-[#0a0a0a] shadow-2xl flex flex-col h-full overflow-hidden border-l border-[#1f2937]">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1f2937] bg-[#111827]">
              <span className="text-2xl">{viewerAgent.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-white">{viewerAgent.name}</div>
                <div className="text-xs text-[#6b7280]">{viewerAgent.description ?? ROLE_LABEL[viewerAgent.role]}</div>
              </div>
              <button
                onClick={() => { setViewerOpen(false); setEditing(false) }}
                className="text-[#6b7280] hover:text-white p-1 rounded-lg hover:bg-[#1f2937] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* File list sidebar */}
              <div className="w-44 border-r border-[#1f2937] bg-[#111827] flex flex-col overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-[#6b7280] uppercase tracking-wide">Workspace Files</div>
                {agentFiles.length === 0 && (
                  <div className="px-3 py-2 text-xs text-[#6b7280]">No files found</div>
                )}
                {agentFiles.map(f => (
                  <button
                    key={f.name}
                    onClick={() => loadFile(viewerAgent, f.name)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
                      selectedFile === f.name
                        ? 'bg-[#003d0f] text-[#00ff41] font-medium border-r-2 border-[#00ff41]'
                        : 'text-[#e2e8f0] hover:bg-[#0f1117]'
                    }`}
                  >
                    <ChevronRight size={13} className={selectedFile === f.name ? 'text-[#00ff41]' : 'text-[#6b7280]'} />
                    {f.name}
                  </button>
                ))}
              </div>

              {/* File content area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
                {!selectedFile ? (
                  <div className="flex-1 flex items-center justify-center text-[#6b7280] text-sm">
                    Select a file to view
                  </div>
                ) : (
                  <>
                    {/* File toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2937] bg-[#111827]">
                      <span className="text-sm font-medium text-white font-mono">{selectedFile}</span>
                      <div className="flex items-center gap-2">
                        {saveMsg && <span className="text-xs text-[#6b7280]">{saveMsg}</span>}
                        {editing ? (
                          <>
                            <button
                              onClick={() => { setEditing(false); setEditContent(fileContent) }}
                              className="text-xs text-[#6b7280] hover:text-white px-2 py-1 rounded hover:bg-[#1f2937] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveFile}
                              disabled={saving}
                              className="inline-flex items-center gap-1 text-xs bg-[#00ff41] hover:bg-[#00cc33] text-[#0a0a0a] px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <Save size={12} />
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditing(true)}
                            className="text-xs text-[#00ff41] hover:text-[#00cc33] hover:bg-[#003d0f] px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4">
                      {editing ? (
                        <textarea
                          className="w-full h-full min-h-[400px] font-mono text-sm text-[#e2e8f0] bg-[#111827] border border-[#1f2937] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00ff41]/30 focus:border-[#00ff41] resize-none"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                        />
                      ) : (
                        <pre className="font-mono text-sm text-[#e2e8f0] whitespace-pre-wrap leading-relaxed">
                          {fileContent}
                        </pre>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
