'use client'

import { useEffect, useState } from 'react'
import { Activity, Server, Clock, Folder, FileText } from 'lucide-react'

interface SystemData {
  nodeVersion: string
  platform: string
  hostname: string
  uptime: number
  workspacePath: string
  memoryLastModified: string
  workspaceFiles: string[]
  mdCount: number
  now: string
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`
}

export default function SystemPage() {
  const [info, setInfo] = useState<SystemData | null>(null)

  useEffect(() => {
    fetch('/api/system').then(r => r.json()).then(setInfo)
  }, [])

  if (!info) return <p className="text-slate-400 text-sm">Loading system info…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Activity size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
      </div>
      <p className="text-slate-400 text-sm mb-8">
        Last refreshed: {new Date(info.now).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-3">
            <Server size={13} /> Runtime
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Node.js</span><span className="font-mono font-medium">{info.nodeVersion}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Platform</span><span className="font-mono">{info.platform}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Hostname</span><span className="font-mono">{info.hostname}</span></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-3">
            <Clock size={13} /> Uptime & Memory
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Uptime</span><span className="font-medium">{formatUptime(info.uptime)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">MEMORY.md updated</span><span className="font-medium text-xs">{new Date(info.memoryLastModified).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">.md files indexed</span><span className="font-medium">{info.mdCount}</span></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 col-span-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wide mb-3">
            <Folder size={13} /> Workspace: {info.workspacePath}
          </div>
          <div className="flex flex-wrap gap-2">
            {info.workspaceFiles.map(f => (
              <span key={f} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">
                <FileText size={10} />{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
