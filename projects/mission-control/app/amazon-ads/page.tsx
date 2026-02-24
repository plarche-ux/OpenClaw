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
  if (v == null) return 'text-slate-400'
  if (v <= 35) return 'text-green-600'
  if (v <= 100) return 'text-amber-600'
  return 'text-red-600'
}

function acosBarColor( v: number | null ) {
  if (v == null) return 'bg-slate-300'
  if (v <= 35) return 'bg-green-500'
  if (v <= 100) return 'bg-amber-400'
  return 'bg-red-500'
}

const PRIORITY_COLORS: Record<string, string> = {
  high:   'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-amber-100 text-amber-700 border border-amber-200',
  low:    'bg-slate-100 text-slate-600 border border-slate-200',
}

const EFFORT_COLORS: Record<string, string> = {
  low:    'bg-green-50 text-green-700',
  medium: 'bg-amber-50 text-amber-700',
  high:   'bg-red-50 text-red-700',
}

const LOG_TYPE_COLORS: Record<string, string> = {
  keyword_paused:   'bg-red-100 text-red-700',
  keyword_added:    'bg-green-100 text-green-700',
  bid_adjusted:     'bg-amber-100 text-amber-700',
  campaign_created: 'bg-blue-100 text-blue-700',
}

const TARGETING_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active:  'bg-green-100 text-green-700',
  paused:  'bg-slate-100 text-slate-500',
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
      <Zap size={14} className="text-amber-400" />
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
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading Amazon Ads data…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Failed to load data.
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
            <TrendingUp size={22} className="text-amber-400" />
            <h1 className="text-2xl font-bold text-slate-900">Amazon Ads</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Campaign intelligence for <span className="text-slate-600 font-medium">{book.title ?? 'your book'}</span>
          </p>
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-2 text-sm font-medium border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Requesting…' : 'Sync Data'}
        </button>
      </div>

      {/* Attribution lag banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
        <AlertCircle size={15} className="shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">48-hour attribution lag.</span>{' '}
          Data is delayed — conversions from the last 2 days may not yet appear.
          {data.lastSync && (
            <span className="ml-1 text-amber-600">Last sync: {data.lastSync}.</span>
          )}
        </div>
      </div>

      {/* ── 1. Key Metrics Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Spend (30d)',
            value: fmt$(metrics.spend),
            color: 'text-amber-500',
            sub: metrics.asOf ? `as of ${metrics.asOf}` : null,
          },
          {
            label: 'Sales (30d)',
            value: fmt$(metrics.sales),
            color: 'text-green-600',
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
            color: metrics.roas != null && metrics.roas >= 1 ? 'text-green-600' : 'text-red-500',
            sub: 'sales ÷ spend',
          },
          {
            label: 'Units',
            value: fmtNum(metrics.unitsAttributed),
            color: 'text-slate-700',
            sub: 'attributed',
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── 2. ACoS Health Bar ───────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={16} className="text-amber-400" />
          <h2 className="font-semibold text-slate-900">ACoS Health</h2>
        </div>

        <div className="relative h-8 bg-slate-100 rounded-full overflow-visible mb-6">
          {/* Green zone: 0 → breakeven */}
          <div
            className="absolute top-0 left-0 h-full bg-green-100 rounded-l-full"
            style={{ width: `${breakevenPct}%` }}
          />
          {/* Amber zone: breakeven → target */}
          <div
            className="absolute top-0 h-full bg-amber-50"
            style={{ left: `${breakevenPct}%`, width: `${targetPct - breakevenPct}%` }}
          />

          {/* Current ACoS fill bar */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all ${acosBarColor(metrics.acos)}`}
            style={{ width: `${currentPct}%`, opacity: 0.8 }}
          />

          {/* Breakeven marker */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${breakevenPct}%` }}
          >
            <div className="w-0.5 h-full bg-green-600" />
            <span className="absolute -top-6 text-xs text-green-700 font-medium whitespace-nowrap -translate-x-1/2">
              Breakeven {breakevenAcos}%
            </span>
          </div>

          {/* Target marker */}
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${targetPct}%` }}
          >
            <div className="w-0.5 h-full bg-amber-500" />
            <span className="absolute -bottom-6 text-xs text-amber-700 font-medium whitespace-nowrap -translate-x-1/2">
              Target {targetAcos}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-slate-500">0%</span>
          <span className={`font-bold text-base ${acosColor(metrics.acos)}`}>
            Current ACoS: {fmtPct(metrics.acos)}
          </span>
          <span className="text-slate-500">{barMax}%</span>
        </div>
      </div>

      {/* ── 3. Recommendations Panel ─────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-400" />
            <h2 className="font-semibold text-slate-900">Recommendations</h2>
            <span className="ml-auto text-xs text-slate-400">{recommendations.length} total</span>
          </div>
          <div className="space-y-3">
            {visibleRecs.map((rec, i) => (
              <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[rec.priority] ?? PRIORITY_COLORS.low}`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                    {rec.category.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ml-auto ${EFFORT_COLORS[rec.effort] ?? EFFORT_COLORS.medium}`}>
                    {rec.effort} effort
                  </span>
                </div>
                <div className="font-semibold text-slate-800 text-sm mb-1">{rec.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{rec.detail}</div>
              </div>
            ))}
          </div>
          {recommendations.length > 3 && (
            <button
              onClick={() => setShowAllRec(v => !v)}
              className="mt-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              {showAllRec ? (
                <><ChevronUp size={14} /> Show less</>
              ) : (
                <><ChevronDown size={14} /> Show all {recommendations.length} recommendations</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── 4. Keyword Performance Table ─────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-amber-400" />
          <h2 className="font-semibold text-slate-900">Keyword Performance</h2>
          <span className="ml-auto text-xs text-slate-400">{keywords.length} keywords</span>
        </div>
        {keywords.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No keywords yet — awaiting sync.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Keyword', 'Match', 'Status', 'Clicks', 'Spend', 'Sales', 'ACoS'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {keywords.map((kw, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-800">{kw.term}</div>
                      {kw.reason && (
                        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{kw.reason}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded capitalize">
                        {kw.matchType ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        kw.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {kw.status ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{fmtNum(kw.clicks)}</td>
                    <td className="py-3 pr-4 text-slate-600">{fmt$(kw.spend)}</td>
                    <td className="py-3 pr-4 text-slate-600">{fmt$(kw.sales)}</td>
                    <td className={`py-3 font-medium ${acosColor(kw.acos)}`}>{fmtPct(kw.acos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. Competitor Watchlist ───────────────────────────────────── */}
      {competitorWatchlist.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-amber-400" />
            <h2 className="font-semibold text-slate-900">Competitor Watchlist</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Book', 'Author', 'ASIN', 'Targeting'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {competitorWatchlist.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{c.title}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{c.author}</td>
                    <td className="py-2.5 pr-4">
                      {c.asin ? (
                        <a
                          href={`https://www.amazon.com/dp/${c.asin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-mono text-xs"
                        >
                          {c.asin}
                          <ExternalLink size={11} />
                        </a>
                      ) : '—'}
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
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
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-400" />
            <h2 className="font-semibold text-slate-900">Optimization Log</h2>
          </div>
          <div className="space-y-3">
            {sortedLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-300 mt-1.5 shrink-0" />
                  {i < sortedLog.length - 1 && (
                    <div className="w-px flex-1 bg-slate-100 mt-1" style={{ minHeight: 20 }} />
                  )}
                </div>
                <div className="pb-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-slate-400">{entry.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      LOG_TYPE_COLORS[entry.type] ?? 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.type.replace(/_/g, ' ')}
                    </span>
                    {entry.impact && entry.impact !== 'pending' && (
                      <span className="text-xs text-slate-500 italic">{entry.impact}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 7. Performance History ───────────────────────────────────── */}
      {sortedHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-amber-400" />
            <h2 className="font-semibold text-slate-900">Performance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Date', 'Spend', 'Sales', 'ACoS', 'Units', 'Note'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedHistory.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 font-medium text-slate-700">{row.date}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{fmt$(row.spend)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{fmt$(row.sales)}</td>
                    <td className={`py-2.5 pr-4 font-medium ${acosColor(row.acos)}`}>{fmtPct(row.acos)}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{fmtNum(row.unitsAttributed)}</td>
                    <td className="py-2.5 text-xs text-slate-400 italic">{row.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedHistory.length < 2 && (
            <p className="text-xs text-slate-400 mt-3 text-center">More history will appear as weekly data accumulates.</p>
          )}
        </div>
      )}

      {/* ── 8. Breakeven Calculator ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setCalcOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-amber-400" />
            <span className="font-semibold text-slate-900">Breakeven Calculator</span>
            {calcBE != null && (
              <span className="text-xs text-slate-400 font-normal">
                Breakeven: {calcBE.toFixed(1)}%
              </span>
            )}
          </div>
          {calcOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {calcOpen && (
          <div className="px-5 pb-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 mt-4 mb-4">
              Breakeven ACoS = Royalty ÷ Price × 100. At this ACoS, ads break even — each sale covers its own cost.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Book Price ($)</label>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={e => setCalcPrice(e.target.value)}
                  placeholder="18.99"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Royalty per Sale ($)</label>
                <input
                  type="number"
                  value={calcRoyalty}
                  onChange={e => setCalcRoyalty(e.target.value)}
                  placeholder="6.00"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>
            {calcBE != null ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="text-lg font-bold text-amber-700 mb-1">
                  Breakeven ACoS: {calcBE.toFixed(1)}%
                </div>
                {metrics.acos != null && (
                  <div className="text-sm text-amber-700">
                    Your current ACoS ({fmtPct(metrics.acos)}) is{' '}
                    <span className="font-semibold">
                      {(metrics.acos / calcBE).toFixed(1)}× your breakeven
                    </span>
                    {metrics.acos > calcBE
                      ? ' — ads are not yet profitable.'
                      : ' — ads are profitable.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-400 text-center py-3">
                Enter both values to calculate.
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
