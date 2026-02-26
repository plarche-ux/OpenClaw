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

  if (!info) return <p className="text-[#6b7280] text-sm font-mono animate-pulse">Scanning system nodes…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Activity size={22} className="text-[#00ff41]" />
        <h1 className="text-2xl font-bold text-white">System Status</h1>
      </div>
      <p className="text-[#6b7280] text-sm mb-8 font-mono">
        Last sync: {new Date(info.now).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#00ff41]/30 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-widest mb-4 font-mono">
            <Server size={13} /> Runtime Environment
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#1f2937] pb-2"><span className="text-[#6b7280] font-mono">Node Engine</span><span className="font-mono font-bold text-[#00ff41]">{info.nodeVersion}</span></div>
            <div className="flex justify-between border-b border-[#1f2937] pb-2"><span className="text-[#6b7280] font-mono">OS Platform</span><span className="font-mono text-[#e2e8f0] uppercase">{info.platform}</span></div>
            <div className="flex justify-between pb-2"><span className="text-[#6b7280] font-mono">Host ID</span><span className="font-mono text-[#e2e8f0]">{info.hostname}</span></div>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 hover:border-[#00ff41]/30 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-widest mb-4 font-mono">
            <Clock size={13} /> Temporal & Memory
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-[#1f2937] pb-2"><span className="text-[#6b7280] font-mono">Uptime</span><span className="font-mono font-bold text-[#e2e8f0]">{formatUptime(info.uptime)}</span></div>
            <div className="flex justify-between border-b border-[#1f2937] pb-2"><span className="text-[#6b7280] font-mono">Memory Modified</span><span className="font-mono text-[#e2e8f0]">{new Date(info.memoryLastModified).toLocaleDateString()}</span></div>
            <div className="flex justify-between pb-2"><span className="text-[#6b7280] font-mono">MD Node Count</span><span className="font-mono font-bold text-[#00ff41]">{info.mdCount}</span></div>
          </div>
        </div>

        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 col-span-2 hover:border-[#00ff41]/20 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-widest mb-4 font-mono">
            <Folder size={13} /> Active Workspace Root
          </div>
          <div className="text-xs text-[#00ff41] font-mono mb-4 p-2 bg-[#0a0a0a] rounded border border-[#1f2937]">
            {info.workspacePath}
          </div>
          <div className="flex flex-wrap gap-2">
            {info.workspaceFiles.map(f => (
              <span key={f} className="inline-flex items-center gap-1 bg-[#1f2937] text-[#e2e8f0] text-[10px] font-mono px-2.5 py-1 rounded-full border border-transparent hover:border-[#00ff41]/40 transition-colors">
                <FileText size={10} className="text-[#00ff41]" />{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
