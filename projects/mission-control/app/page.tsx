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
        <Zap className="text-amber-400" size={28} />
        <h1 className="text-3xl font-bold text-slate-900">Mission Control</h1>
      </div>
      <p className="text-slate-500 mb-8 text-sm">OpenClaw · Neo's workspace dashboard</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-1">
            <FolderOpen size={14} /> Workspace Files
          </div>
          <div className="text-3xl font-bold text-slate-900">{info?.mdCount ?? '—'}</div>
          <div className="text-xs text-slate-400 mt-1">.md files indexed</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-1">
            <Activity size={14} /> System Uptime
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {info ? formatUptime(info.uptime) : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1">since last restart</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wide mb-1">
            <Zap size={14} /> Node Version
          </div>
          <div className="text-3xl font-bold text-slate-900">{info?.nodeVersion ?? '—'}</div>
          <div className="text-xs text-slate-400 mt-1">runtime</div>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Sections</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sections.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <Icon size={20} className="text-amber-400 mb-3" />
            <div className="font-semibold text-slate-900 group-hover:text-amber-600 mb-1">{label}</div>
            <div className="text-xs text-slate-400">{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
