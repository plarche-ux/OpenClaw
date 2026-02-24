'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus } from 'lucide-react'

interface Agent {
  id: string
  name: string
  emoji: string
  role: string
}

interface Task {
  id: string
  status: string
  assignee: string
}

interface TaskData {
  agents: Agent[]
  tasks: Task[]
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  'primary-agent': 'Primary Agent',
}

const PLANNED_AGENTS = [
  { emoji: '📚', name: 'Book Agent', description: 'Content & publishing tasks' },
  { emoji: '🔍', name: 'Research Agent', description: 'Web research & analysis' },
]

export default function TeamPage() {
  const [data, setData] = useState<TaskData | null>(null)

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading…</div>
    )
  }

  const { agents, tasks } = data

  const openCountFor = (agentId: string) =>
    tasks.filter(t => t.assignee === agentId && t.status !== 'done').length

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Users size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
      </div>
      <p className="text-slate-400 text-sm mb-8">Agents and collaborators.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {/* Registered agents */}
        {agents.map(agent => {
          const isAgent = agent.role === 'primary-agent'
          const openTasks = openCountFor(agent.id)

          return (
            <div key={agent.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">
                  {agent.emoji}
                </div>
                {isAgent && (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="font-semibold text-slate-900 text-base">{agent.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{ROLE_LABEL[agent.role] ?? agent.role}</div>
              </div>

              <div className="mt-auto flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">Open tasks:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  openTasks > 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {openTasks}
                </span>
              </div>
            </div>
          )
        })}

        {/* Planned / placeholder agents */}
        {PLANNED_AGENTS.map(a => (
          <div
            key={a.name}
            className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col gap-3 opacity-60"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl">
              {a.emoji}
            </div>
            <div>
              <div className="font-semibold text-slate-500 text-base">{a.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{a.description}</div>
            </div>
            <div className="mt-auto pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-300 italic">Not yet deployed</span>
            </div>
          </div>
        ))}

        {/* Add Agent card */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-amber-300 hover:text-amber-400 transition-colors cursor-default min-h-[160px]">
          <UserPlus size={24} />
          <span className="text-sm font-medium">Add Agent</span>
          <span className="text-xs text-center">Future multi-agent workflows</span>
        </div>
      </div>
    </div>
  )
}
