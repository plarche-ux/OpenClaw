'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText, Brain, CheckSquare, Wrench, TrendingUp,
  Linkedin, Activity, Users, Zap, FolderOpen
} from 'lucide-react'

interface SystemInfo {
  mdCount: number
  nodeVersion: string
  uptime: number
  workspacePath: string
  now: string
}

const sections = [
  { href: '/docs', label: 'Docs', icon: FileText, desc: 'Browse workspace .md files' },
  { href: '/memory', label: 'Memory', icon: Brain, desc: 'Long-term memory & daily notes' },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, desc: 'Heartbeat task board' },
  { href: '/tools', label: 'Tools', icon: Wrench, desc: 'Launch linked tools' },
  { href: '/amazon-ads', label: 'Amazon Ads', icon: TrendingUp, desc: 'Ad campaign summary' },
  { href: '/linkedin', label: 'LinkedIn', icon: Linkedin, desc: 'Post pipeline tracker' },
  { href: '/system', label: 'System', icon: Activity, desc: 'Workspace & node status' },
  { href: '/team', label: 'Team', icon: Users, desc: 'Agents & collaborators' },
]

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

export default function Dashboard() {
  const [info, setInfo] = useState<SystemInfo | null>(null)

  useEffect(() => {
    fetch('/api/system').then(r => r.json()).then(setInfo).catch(() => {})
  }, [])

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Zap className="text-[#00ff41]" size={28} />
        <h1 className="text-3xl font-bold text-white">Mission Control</h1>
      </div>
      <p className="text-[#6b7280] mb-8 text-sm">OpenClaw · Neo's workspace dashboard</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-5 hover:border-[#00ff41]/30 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-wide mb-1">
            <FolderOpen size={14} /> Workspace Files
          </div>
          <div className="text-3xl font-bold text-white font-mono">{info?.mdCount ?? '—'}</div>
          <div className="text-xs text-[#6b7280] mt-1">.md files indexed</div>
        </div>
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-5 hover:border-[#00ff41]/30 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-wide mb-1">
            <Activity size={14} /> System Uptime
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {info ? formatUptime(info.uptime) : '—'}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">since last restart</div>
        </div>
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-5 hover:border-[#00ff41]/30 transition-all">
          <div className="flex items-center gap-2 text-[#6b7280] text-xs uppercase tracking-wide mb-1">
            <Zap size={14} /> Node Version
          </div>
          <div className="text-3xl font-bold text-white font-mono">{info?.nodeVersion ?? '—'}</div>
          <div className="text-xs text-[#6b7280] mt-1">runtime</div>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wide mb-4">Sections</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sections.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-[#111827] rounded-xl border border-[#1f2937] p-5 hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.15)] transition-all group"
          >
            <Icon size={20} className="text-[#00ff41] mb-3" />
            <div className="font-semibold text-white group-hover:text-[#00ff41] mb-1 transition-colors">{label}</div>
            <div className="text-xs text-[#6b7280]">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
