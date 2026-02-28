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

  if (!info) return <p className="text-slate-500 text-sm font-mono animate-pulse">Scanning system nodes…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Activity size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
      </div>
      <p className="text-slate-500 text-sm mb-8 font-mono">
        Last sync: {new Date(info.now).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-all">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-4 font-mono">
            <Server size={13} /> Runtime Environment
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-mono">Node Engine</span><span className="font-mono font-bold text-blue-600">{info.nodeVersion}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-mono">OS Platform</span><span className="font-mono text-slate-800 uppercase">{info.platform}</span></div>
            <div className="flex justify-between pb-2"><span className="text-slate-500 font-mono">Host ID</span><span className="font-mono text-slate-800">{info.hostname}</span></div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-400 transition-all">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-4 font-mono">
            <Clock size={13} /> Temporal & Memory
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-mono">Uptime</span><span className="font-mono font-bold text-slate-800">{formatUptime(info.uptime)}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-2"><span className="text-slate-500 font-mono">Memory Modified</span><span className="font-mono text-slate-800">{new Date(info.memoryLastModified).toLocaleDateString()}</span></div>
            <div className="flex justify-between pb-2"><span className="text-slate-500 font-mono">MD Node Count</span><span className="font-mono font-bold text-blue-600">{info.mdCount}</span></div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 col-span-2 hover:border-blue-500/20 transition-all">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest mb-4 font-mono">
            <Folder size={13} /> Active Workspace Root
          </div>
          <div className="text-xs text-blue-600 font-mono mb-4 p-2 bg-white rounded border border-slate-200">
            {info.workspacePath}
          </div>
          <div className="flex flex-wrap gap-2">
            {info.workspaceFiles.map(f => (
              <span key={f} className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[10px] font-mono px-2.5 py-1 rounded-full border border-transparent hover:border-blue-500/40 transition-colors">
                <FileText size={10} className="text-blue-600" />{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
