'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
  ExternalLink, Clock, Tag, Zap, BarChart2, BookOpen
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface BookInfo {
  title: string | null
  asin: string | null
  price: number | null
  royaltyPerSale: number | null
  breakevenAcos: number | null
}

interface Metrics {
  window: string
  asOf: string | null
  spend: number | null
  sales: number | null
  acos: number | null
  roas: number | null
  impressions: number | null
  clicks: number | null
  ctr: number | null
  unitsAttributed: number | null
  targetAcos: number | null
}

interface HistoryEntry {
  date: string
  spend: number | null
  sales: number | null
  acos: number | null
  unitsAttributed: number | null
  note: string | null
}

interface Keyword {
  term: string
  matchType: string | null
  status: string | null
  impressions: number | null
  clicks: number | null
  spend: number | null
  sales: number | null
  acos: number | null
  reason: string | null
  addedDate: string | null
  pausedDate: string | null
}

interface Campaign {
  name: string
  type: string | null
  pillar: number | null
  status: string | null
  dailyBudget: number | null
  notes: string | null
}

interface Competitor {
  title: string
  author: string
  asin: string
  targeting: string | null
}

interface OptimizationEntry {
  date: string
  type: string
  detail: string
  impact: string | null
}

interface Recommendation {
  priority: string
  category: string
  title: string
  detail: string
  effort: string
}

interface AdsData {
  lastSync: string | null
  attributionLagHours: number
  book: BookInfo
  metrics: Metrics
  history: HistoryEntry[]
  keywords: Keyword[]
  campaigns: Campaign[]
  competitorWatchlist: Competitor[]
  optimizationLog: OptimizationEntry[]
  recommendations: Recommendation[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt$( v: number | null | undefined ) {
  if (v == null) return '—'
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct( v: number | null | undefined ) {
  if (v == null) return '—'
  return v.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%'
}

function fmtNum( v: number | null | undefined ) {
  if (v == null) return '—'
  return v.toLocaleString('en-US')
}

function acosColor( v: number | null ) {
  if (v == null) return 'text-slate-500'
  if (v <= 35) return 'text-blue-600'
  if (v <= 100) return 'text-blue-700'
  return 'text-red-500'
}

function acosBarColor( v: number | null ) {
  if (v == null) return 'bg-slate-100'
  if (v <= 35) return 'bg-blue-600 text-white'
  if (v <= 100) return 'bg-blue-600'
  return 'bg-red-500'
}

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-950/40 text-red-400 border border-red-500/30',
  medium: 'bg-blue-50 text-blue-600 border border-blue-500/30',
  low:    'bg-slate-100 text-slate-500 border border-slate-300',
}

const EFFORT_COLORS: Record<string, string> = {
  low:    'bg-blue-50 text-blue-600',
  medium: 'bg-blue-100 text-blue-800',
  high:   'bg-red-100 text-red-800',
}

const LOG_TYPE_COLORS: Record<string, string> = {
  keyword_paused:   'bg-red-100 text-red-800',
  keyword_added:    'bg-blue-50 text-blue-600',
  bid_adjusted:     'bg-blue-100 text-blue-800',
  campaign_created: 'bg-purple-100 text-purple-800',
}

const TARGETING_COLORS: Record<string, string> = {
  pending: 'bg-blue-50 text-blue-600',
  active:  'bg-blue-100 text-blue-800',
  paused:  'bg-slate-100 text-slate-500',
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-50 text-slate-900 text-sm px-4 py-3 rounded-xl shadow-lg border border-blue-500/30 flex items-center gap-2 animate-in slide-in-from-bottom-4">
      <Zap size={14} className="text-blue-600" />
      {msg}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AmazonAdsPage() {
  const [data, setData] = useState<AdsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showAllRec, setShowAllRec] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcPrice, setCalcPrice] = useState('')
  const [calcRoyalty, setCalcRoyalty] = useState('')

  useEffect(() => {
    fetch('/api/amazon-ads')
      .then(r => r.json())
      .then((d: AdsData) => {
        setData(d)
        setCalcPrice(String(d.book?.price ?? ''))
        setCalcRoyalty(String(d.book?.royaltyPerSale ?? ''))
      })
      .finally(() => setLoading(false))
  }, [])

  const triggerSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/amazon-ads/sync', { method: 'POST' })
      setToast('Sync requested')
    } catch {
      setToast('Sync failed — try again')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono animate-pulse">
        Initializing ad stream…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Link dropped. Failed to load data.
      </div>
    )
  }

  const { metrics, book, history, keywords, competitorWatchlist, optimizationLog, recommendations } = data

  const sortedRecs = [...recommendations].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
  })
  const visibleRecs = showAllRec ? sortedRecs : sortedRecs.slice(0, 3)

  // ACoS bar math (cap at 150% for display)
  const currentAcos = metrics.acos ?? 0
  const breakevenAcos = book.breakevenAcos ?? 31.6
  const targetAcos = metrics.targetAcos ?? 35
  const barMax = Math.max(150, currentAcos + 10)
  const currentPct = Math.min((currentAcos / barMax) * 100, 100)
  const breakevenPct = (breakevenAcos / barMax) * 100
  const targetPct = (targetAcos / barMax) * 100

  // Breakeven calculator
  const calcBE = (() => {
    const p = parseFloat(calcPrice)
    const r = parseFloat(calcRoyalty)
    if (!p || !r || p === 0) return null
    return (r / p) * 100
  })()

  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date))
  const sortedLog = [...optimizationLog].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={22} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Amazon Ads</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Campaign intelligence for <span className="text-slate-800 font-medium">{book.title ?? 'your book'}</span>
          </p>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-2 text-sm font-medium border border-slate-200 text-slate-800 hover:border-blue-500/50 hover:text-blue-600 px-4 py-2 rounded-lg transition-all disabled:opacity-50 shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin text-blue-600' : ''} />
          {syncing ? 'Requesting…' : 'Sync Data'}
        </button>
      </div>

      {/* Attribution lag banner */}
      <div className="flex items-start gap-3 bg-blue-50/20 border border-blue-500/30 rounded-xl p-3.5 text-sm text-blue-600">
        <AlertCircle size={15} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold font-mono">Attribution lag detected.</span>{' '}
          Data is delayed — conversions from the last 2 days may not yet appear.
          {data.lastSync && (
            <span className="ml-1 text-blue-700 opacity-70">Last sync: {data.lastSync}.</span>
          )}
        </div>
      </div>

      {/* ── 1. Key Metrics Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Spend (30d)',
            value: fmt$(metrics.spend),
            color: 'text-blue-600',
            sub: metrics.asOf ? `as of ${metrics.asOf}` : null,
          },
          {
            label: 'Sales (30d)',
            value: fmt$(metrics.sales),
            color: 'text-blue-400',
            sub: null,
          },
          {
            label: 'ACoS',
            value: fmtPct(metrics.acos),
            color: acosColor(metrics.acos),
            sub: metrics.targetAcos ? `target ${metrics.targetAcos}%` : null,
          },
          {
            label: 'ROAS',
            value: metrics.roas != null ? metrics.roas.toFixed(2) + 'x' : '—',
            color: metrics.roas != null && metrics.roas >= 1 ? 'text-blue-600' : 'text-red-400',
            sub: 'sales ÷ spend',
          },
          {
            label: 'Units',
            value: fmtNum(metrics.unitsAttributed),
            color: 'text-slate-800',
            sub: 'attributed',
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-400 transition-all">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1 font-mono opacity-70">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── 2. ACoS Health Bar ───────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} className="text-blue-600" />
          <h2 className="font-semibold text-slate-900">ACoS Health</h2>
        </div>

        <div className="relative h-8 bg-white rounded-full overflow-visible mb-6 border border-slate-200">
          {/* Green zone: 0 → breakeven */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 text-white/10 rounded-l-full"
            style={{ width: `${breakevenPct}%` }}
          />
          {/* Amber zone: breakeven → target */}
          <div
            className="absolute top-0 h-full bg-blue-600 text-white/5"
            style={{ left: `${breakevenPct}%`, width: `${targetPct - breakevenPct}%` }}
          />

          {/* Current ACoS fill bar */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all shadow-[0_0_15px_rgba(0,255,65,0.2)] ${acosBarColor(metrics.acos)}`}
            style={{ width: `${currentPct}%`, opacity: 0.8 }}
          />

          {/* Breakeven marker */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${breakevenPct}%` }}
          >
            <div className="w-0.5 h-full bg-blue-600 text-white shadow-md" />
            <span className="absolute -top-6 text-xs text-blue-600 font-mono whitespace-nowrap -translate-x-1/2">
              BE {breakevenAcos}%
            </span>
          </div>

          {/* Target marker */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${targetPct}%` }}
          >
            <div className="w-0.5 h-full bg-blue-400" />
            <span className="absolute -bottom-6 text-xs text-blue-400 font-mono whitespace-nowrap -translate-x-1/2">
              Target {targetAcos}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-slate-500 font-mono">0%</span>
          <span className={`font-bold text-base font-mono ${acosColor(metrics.acos)}`}>
            Current ACoS: {fmtPct(metrics.acos)}
          </span>
          <span className="text-slate-500 font-mono">{barMax}%</span>
        </div>
      </div>

      {/* ── 3. Recommendations Panel ─────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Recommendations</h2>
            <span className="ml-auto text-xs text-slate-500 font-mono">{recommendations.length} total</span>
          </div>
          <div className="space-y-3">
            {visibleRecs.map((rec, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500/40 transition-all group">
                <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[rec.priority] ?? PRIORITY_COLORS.low}`}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {rec.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-auto ${EFFORT_COLORS[rec.effort] ?? EFFORT_COLORS.medium}`}>
                    {rec.effort} effort
                  </span>
                </div>
                <div className="font-semibold text-slate-800 group-hover:text-blue-600 text-sm mb-1 transition-colors">{rec.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{rec.detail}</div>
              </div>
            ))}
          </div>
          {recommendations.length > 3 && (
            <button
              onClick={() => setShowAllRec(v => !v)}
              className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {showAllRec ? (
                <><ChevronUp size={14} /> Show less</>
              ) : (
                <><ChevronDown size={14} /> Show all {recommendations.length} items</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── 4. Keyword Performance Table ─────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-blue-600" />
          <h2 className="font-semibold text-slate-900">Keyword Performance</h2>
          <span className="ml-auto text-xs text-slate-500 font-mono">{keywords.length} nodes</span>
        </div>
        {keywords.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6 font-mono">No keyword data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Keyword', 'Match', 'Status', 'Clicks', 'Spend', 'Sales', 'ACoS'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {keywords.map((kw, i) => (
                  <tr key={i} className="hover:bg-slate-100 transition-colors group">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-800 group-hover:text-slate-900 transition-colors">{kw.term}</div>
                      {kw.reason && (
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-snug font-mono uppercase opacity-70">{kw.reason}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        {kw.matchType ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                        kw.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-800'
                      }`}>
                        {kw.status ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 font-mono">{fmtNum(kw.clicks)}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono">{fmt$(kw.spend)}</td>
                    <td className="py-3 pr-4 text-slate-500 font-mono">{fmt$(kw.sales)}</td>
                    <td className={`py-3 font-bold font-mono ${acosColor(kw.acos)}`}>{fmtPct(kw.acos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Competitor Watchlist ───────────────────────────────────── */}
      {competitorWatchlist.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Competitor Watchlist</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Book', 'Author', 'ASIN', 'Targeting'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {competitorWatchlist.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-100 transition-colors group">
                    <td className="py-2.5 pr-4 font-medium text-slate-800 group-hover:text-slate-900 transition-colors">{c.title}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{c.author}</td>
                    <td className="py-2.5 pr-4">
                      {c.asin ? (
                        <a
                          href={`https://www.amazon.com/dp/${c.asin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-xs"
                        >
                          {c.asin}
                          <ExternalLink size={11} />
                        </a>
                      ) : '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                        TARGETING_COLORS[c.targeting ?? ''] ?? TARGETING_COLORS.pending
                      }`}>
                        {c.targeting ?? 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 6. Optimization Log ──────────────────────────────────────── */}
      {sortedLog.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Optimization Log</h2>
          </div>
          <div className="space-y-3">
            {sortedLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600 text-white mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,255,65,0.4)]" />
                  {i < sortedLog.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                <div className="pb-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-slate-500 font-mono">{entry.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      LOG_TYPE_COLORS[entry.type] ?? 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                    {entry.impact && entry.impact !== 'pending' && (
                      <span className="text-xs text-slate-500 italic opacity-70 font-mono text-[10px] uppercase">{entry.impact}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. Performance History ───────────────────────────────────── */}
      {sortedHistory.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-blue-600" />
            <h2 className="font-semibold text-slate-900">Performance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Date', 'Spend', 'Sales', 'ACoS', 'Units', 'Note'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-100 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-slate-800 font-mono">{row.date}</td>
                    <td className="py-2.5 pr-4 text-slate-500 font-mono">{fmt$(row.spend)}</td>
                    <td className="py-2.5 pr-4 text-slate-500 font-mono">{fmt$(row.sales)}</td>
                    <td className={`py-2.5 pr-4 font-bold font-mono ${acosColor(row.acos)}`}>{fmtPct(row.acos)}</td>
                    <td className="py-2.5 pr-4 text-slate-500 font-mono">{fmtNum(row.unitsAttributed)}</td>
                    <td className="py-2.5 text-xs text-slate-500 italic">{row.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedHistory.length < 2 && (
            <p className="text-[10px] text-slate-500 mt-3 text-center uppercase font-mono tracking-widest">Awaiting historical data accumulation…</p>
          )}
        </div>
      )}

      {/* ── 8. Breakeven Calculator ──────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setCalcOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-100 transition-all"
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-blue-600" />
            <span className="font-semibold text-slate-900">Profitability Calculator</span>
            {calcBE != null && (
              <span className="text-xs text-slate-500 font-mono ml-2 border-l border-slate-200 pl-2 uppercase">
                BE: {calcBE.toFixed(1)}%
              </span>
            )}
          </div>
          {calcOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </button>

        {calcOpen && (
          <div className="px-5 pb-5 border-t border-slate-200 bg-white/40">
            <p className="text-[10px] text-slate-500 mt-4 mb-4 uppercase font-mono tracking-wider">
              Calculation: (Royalty ÷ Price) × 100. Determines zero-sum ad cost.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase font-mono tracking-tighter">Market Price ($)</label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={e => setCalcPrice(e.target.value)}
                  placeholder="18.99"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5 uppercase font-mono tracking-tighter">Net Royalty ($)</label>
                <input
                  type="number"
                  value={calcRoyalty}
                  onChange={e => setCalcRoyalty(e.target.value)}
                  placeholder="6.00"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>
            {calcBE != null ? (
              <div className="bg-blue-50/20 border border-blue-500/30 rounded-xl p-4">
                <div className="text-lg font-bold text-blue-600 mb-1 font-mono">
                  Breakeven Point: {calcBE.toFixed(1)}%
                </div>
                {metrics.acos != null && (
                  <div className="text-sm text-blue-600 opacity-90">
                    Current ACoS ({fmtPct(metrics.acos)}) is{' '}
                    <span className="font-bold underline">
                      {(metrics.acos / calcBE).toFixed(1)}×
                    </span>
                    {metrics.acos > calcBE
                      ? ' the threshold. Net loss per ad sale.'
                      : ' the threshold. Generating profit.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-3 font-mono uppercase">
                Input market variables to execute calculation.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  )
}
