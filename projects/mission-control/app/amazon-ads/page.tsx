import { TrendingUp, ExternalLink, AlertCircle } from 'lucide-react'

export default function AmazonAdsPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-900">Amazon Ads</h1>
      </div>
      <p className="text-slate-400 text-sm mb-8">Campaign performance for "The Divided Brain"</p>

      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <p>Live data syncs via the Amazon Ads skill. There is a 24-48 hour attribution lag. Next check: Monday, Feb 23, 2026.</p>
      </div>

      {/* Stats snapshot */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Spend (30d)', value: '$116.66', sub: 'as of Feb 22, 2026' },
          { label: 'Total Sales (30d)', value: '$3.99', sub: '1 unit attributed' },
          { label: 'ACoS', value: '2923%', sub: 'target: <100%' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Actions taken */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-3">Surgical Cuts Applied (Feb 21)</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✕</span> Paused broad keyword: "branding" (high spend, zero conversions)</li>
          <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Added: "decision making" (targeted, lower competition)</li>
          <li className="flex items-start gap-2"><span className="text-green-500 font-bold">+</span> Added: "behavioral psychology" (on-topic audience)</li>
        </ul>
      </div>

      <a
        href="https://docs.google.com/spreadsheets/d/1AcEqHFvH87X2DDXwWnS3O05Ewqp02HoBpUWaMTCh7pY"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-slate-700 transition-colors"
      >
        Open Full Dashboard <ExternalLink size={14} />
      </a>
    </div>
  )
}
