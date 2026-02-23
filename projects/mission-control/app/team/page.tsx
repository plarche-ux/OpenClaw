import { Users, Zap } from 'lucide-react'

export default function TeamPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Users size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">Team</h1>
      </div>
      <p className="text-slate-400 text-sm mb-12">Agents and collaborators.</p>

      <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <Zap size={28} className="text-amber-300" />
        </div>
        <h2 className="text-slate-700 font-semibold text-lg">Neo — Primary Agent</h2>
        <p className="text-sm text-center max-w-xs">
          Currently operating as sole agent. Additional team members can be added here when multi-agent workflows are enabled.
        </p>
        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
          Active
        </span>
      </div>
    </div>
  )
}
