'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Mic, ExternalLink, FileText, Play, ChevronDown, ChevronUp,
  Calendar, AlertTriangle, Loader2,
  User, BookOpen, Monitor, Edit3, Save,
  HelpCircle, ChevronRight, X
} from 'lucide-react'

interface PodcastShow {
  id: string
  showName: string
  host: string
  hostTitle: string
  hostLinkedIn: string
  hostNotes: string
  showStats: string
  showUrl: string
  youtubeUrl: string
  status: 'upcoming' | 'confirmed' | 'pending_confirmation' | 'completed' | 'new_opportunity' | 'cancelled'
  date: string
  time: string
  timezone: string
  durationMin: number
  platform: string
  platformNotes: string
  sessionLink: string
  publicist: string
  briefingPdf: string
  briefingMd?: string
  anticipatedQuestions: string[]
  cheatSheet: {
    bookClose: string
    aiAnswer: string
    credentialDrop: string
    deliveryRules: string[]
    techChecklist: string[]
  }
  postShow: {
    recordingUrl: string
    critiqueDate: string
    scores: {
      frameworkClarity: number | null
      storytelling: number | null
      delivery: number | null
      credibilitySignals: number | null
      bookClose: number | null
    }
    topImprovements: string[]
    notes: string
  }
}

interface PodcastsData {
  version: number
  lastUpdated: string
  shows: PodcastShow[]
}

type TabId = 'host' | 'cheatSheet' | 'questions' | 'platform'

const STATUS_BADGE: Record<PodcastShow['status'], string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-blue-100 text-blue-800',
  pending_confirmation: 'bg-slate-200 text-slate-700 border border-slate-300',
  completed: 'bg-slate-200 text-slate-700',
  new_opportunity: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABEL: Record<PodcastShow['status'], string> = {
  upcoming: 'Upcoming',
  confirmed: 'Confirmed',
  pending_confirmation: 'Pending',
  completed: 'Completed',
  new_opportunity: 'New Opportunity',
  cancelled: 'Cancelled',
}

const SCORE_LABELS: Record<keyof PodcastShow['postShow']['scores'], string> = {
  frameworkClarity: 'Framework Clarity',
  storytelling: 'Storytelling',
  delivery: 'Delivery',
  credibilitySignals: 'Credibility Signals',
  bookClose: 'Book Close',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTimeET(dateStr: string, timeStr: string): string {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (!timeStr) return datePart
  return `${datePart} at ${timeStr} ET`
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-100'
  if (score >= 7) return 'bg-blue-600 text-white'
  if (score >= 4) return 'bg-blue-600'
  return 'bg-red-500'
}

function getScoreTextColor(score: number | null): string {
  if (score === null) return 'text-slate-500'
  if (score >= 7) return 'text-blue-600'
  if (score >= 4) return 'text-blue-700'
  return 'text-red-500'
}

function requiresChromeWarning(platform: string, platformNotes: string): boolean {
  const text = (platform + ' ' + platformNotes).toLowerCase()
  return text.includes('restream') || text.includes('riverside')
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 bg-slate-50 text-slate-900 px-4 py-3 rounded-xl shadow-lg border border-blue-500/30 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
      <AlertTriangle size={16} className="text-blue-600" />
      <span className="text-sm font-mono">{message}</span>
    </div>
  )
}

export default function PodcastsPage() {
  const [data, setData] = useState<PodcastsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [activeTabs, setActiveTabs] = useState<Record<string, TabId>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [completedExpanded, setCompletedExpanded] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  
  const [checkedRules, setCheckedRules] = useState<Record<string, Set<number>>>({})
  const [checkedTech, setCheckedTech] = useState<Record<string, Set<number>>>({})
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({})
  
  const [briefingModal, setBriefingModal] = useState<{ title: string; content: string } | null>(null)
  const [editingShow, setEditingShow] = useState<string | null>(null)
  const [editScores, setEditScores] = useState<Record<string, number | null>>({})
  const [editNotes, setEditNotes] = useState<Record<string, string>>({})
  const [savingShow, setSavingShow] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/podcasts')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to load podcasts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = useMemo(() => {
    if (!data) return { total: 0, upcoming: 0, completed: 0, avgDelivery: null as number | null }
    
    const shows = data.shows
    const upcoming = shows.filter(s => ['upcoming', 'confirmed', 'pending_confirmation'].includes(s.status))
    const completed = shows.filter(s => s.status === 'completed')
    
    const deliveryScores = completed
      .map(s => s.postShow.scores.delivery)
      .filter((s): s is number => s !== null)
    
    const avgDelivery = deliveryScores.length > 0
      ? Math.round((deliveryScores.reduce((a, b) => a + b, 0) / deliveryScores.length) * 10) / 10
      : null

    return { total: shows.length, upcoming: upcoming.length, completed: completed.length, avgDelivery }
  }, [data])

  const upcomingShows = useMemo(() => {
    if (!data) return []
    return data.shows
      .filter(s => ['upcoming', 'confirmed', 'pending_confirmation'].includes(s.status))
      .sort((a, b) => {
        if (!a.date && !b.date) return 0
        if (!a.date) return 1
        if (!b.date) return -1
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
  }, [data])

  const completedShows = useMemo(() => {
    if (!data) return []
    return data.shows
      .filter(s => s.status === 'completed')
      .sort((a, b) => {
        const aDate = a.date || ''
        const bDate = b.date || ''
        if (!aDate && !bDate) return 0
        if (!aDate) return 1
        if (!bDate) return -1
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
  }, [data])

  const newOpportunities = useMemo(() => {
    if (!data) return []
    return data.shows.filter(s => s.status === 'new_opportunity')
  }, [data])

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const setTab = (showId: string, tab: TabId) => {
    setActiveTabs(prev => ({ ...prev, [showId]: tab }))
  }

  const toggleQuestion = (key: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleRule = (showId: string, index: number) => {
    setCheckedRules(prev => {
      const next = { ...prev }
      const set = new Set(next[showId] || [])
      if (set.has(index)) set.delete(index)
      else set.add(index)
      next[showId] = set
      return next
    })
  }

  const toggleTech = (showId: string, index: number) => {
    setCheckedTech(prev => {
      const next = { ...prev }
      const set = new Set(next[showId] || [])
      if (set.has(index)) set.delete(index)
      else set.add(index)
      next[showId] = set
      return next
    })
  }

  const viewBriefing = async (show: PodcastShow) => {
    if (!show.briefingMd) return
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(show.briefingMd)}`)
      const json = await res.json()
      setBriefingModal({ title: `${show.showName} Briefing`, content: json.content || '' })
    } catch {
      setToast('Could not load briefing')
    }
  }

  const runPrep = async (showId: string) => {
    try {
      await fetch('/api/podcasts/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showId })
      })
      setToast('Prep request sent to Neo')
    } catch (err) {
      setToast('Failed to send prep request')
    }
  }

  const startEditingShow = (show: PodcastShow) => {
    setEditingShow(show.id)
    setEditScores({ ...show.postShow.scores })
    setEditNotes({ [show.id]: show.postShow.notes || '' })
  }

  const cancelEditingShow = () => {
    setEditingShow(null)
    setEditScores({})
    setEditNotes({})
  }

  const saveShowEdit = async (show: PodcastShow) => {
    setSavingShow(show.id)
    try {
      await fetch('/api/podcasts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: show.id,
          scores: editScores,
          notes: editNotes[show.id] || ''
        })
      })
      await load()
      setEditingShow(null)
      setToast('Changes saved')
    } catch (err) {
      setToast('Failed to save changes')
    } finally {
      setSavingShow(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm font-mono animate-pulse">
        <Loader2 size={20} className="animate-spin mr-2 text-blue-600" />
        Establishing stream…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load podcasts data
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Mic size={24} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Podcasts</h1>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Shows', value: stats.total, color: 'text-slate-900' },
          { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-400' },
          { label: 'Completed', value: stats.completed, color: 'text-blue-600' },
          { label: 'Avg Delivery', value: stats.avgDelivery ?? '—', color: stats.avgDelivery ? 'text-blue-600' : 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-400 transition-all">
            <div className={`text-2xl font-bold ${s.color} font-mono`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming & Confirmed */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          Upcoming & Confirmed
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono text-[10px] normal-case">
            {upcomingShows.length}
          </span>
        </h2>
        
        {upcomingShows.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">No signals detected</span>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingShows.map(show => {
              const isExpanded = expandedCards.has(show.id)
              const activeTab = activeTabs[show.id] || 'host'
              const needsChrome = requiresChromeWarning(show.platform, show.platformNotes)
              
              return (
                <div
                  key={show.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group"
                >
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => toggleCard(show.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{show.showName}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-sm text-slate-800">{show.host}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[show.status]}`}>
                          {STATUS_LABEL[show.status]}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar size={11} />
                          {formatDateTimeET(show.date, show.time)}
                        </span>
                        {show.platform && (
                          <span className="text-[10px] uppercase font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                            {show.platform}
                          </span>
                        )}
                        {needsChrome && (
                          <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Chrome Required
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-slate-600 group-hover:text-blue-600 transition-colors">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200">
                      {/* Quick Actions Bar */}
                      <div className="flex items-center gap-2 px-5 py-3 bg-white/50 border-b border-slate-200 flex-wrap">
                        {show.sessionLink && (
                          <a
                            href={show.sessionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 hover:border-blue-500/50 hover:text-blue-600 transition-all bg-slate-50"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={12} />
                            Session Link
                          </a>
                        )}
                        {show.briefingMd && (
                          <button
                            onClick={e => { e.stopPropagation(); viewBriefing(show) }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 hover:border-blue-500/50 hover:text-blue-600 transition-all bg-slate-50"
                          >
                            <FileText size={12} />
                            View Briefing
                          </button>
                        )}
                        {!show.briefingMd && show.briefingPdf && (
                          <a
                            href={`/api/files?path=${encodeURIComponent(show.briefingPdf)}`}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 hover:border-blue-500/50 hover:text-blue-600 transition-all bg-slate-50"
                            onClick={e => e.stopPropagation()}
                          >
                            <FileText size={12} />
                            Download PDF
                          </a>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            runPrep(show.id)
                          }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-600 hover:bg-blue-50 transition-all bg-white"
                        >
                          <Play size={12} />
                          Run Prep
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-slate-200 bg-slate-100">
                        {[
                          { id: 'host' as TabId, label: 'Host', icon: User },
                          { id: 'cheatSheet' as TabId, label: 'Cheat Sheet', icon: BookOpen },
                          { id: 'questions' as TabId, label: 'Questions', icon: HelpCircle },
                          { id: 'platform' as TabId, label: 'Platform', icon: Monitor },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setTab(show.id, tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-tighter border-b-2 transition-all ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600 bg-blue-50/10'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <tab.icon size={12} />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-5 bg-white/30">
                        {activeTab === 'host' && (
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Title</span>
                              <p className="text-sm text-slate-800 mt-0.5">{show.hostTitle || '—'}</p>
                            </div>
                            {show.showStats && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Show Stats</span>
                                <p className="text-sm text-blue-600 mt-0.5 font-mono">{show.showStats}</p>
                              </div>
                            )}
                            {show.hostNotes && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Host Notes</span>
                                <p className="text-sm text-slate-800 mt-0.5 leading-relaxed opacity-80">{show.hostNotes}</p>
                              </div>
                            )}
                            {show.hostLinkedIn && (
                              <a
                                href={show.hostLinkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <ExternalLink size={14} />
                                LinkedIn Profile
                              </a>
                            )}
                          </div>
                        )}

                        {activeTab === 'cheatSheet' && (
                          <div className="space-y-5">
                            {show.cheatSheet.bookClose && (
                              <div className="bg-blue-50/20 border border-blue-500/30 rounded-xl p-4">
                                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest font-mono">Book Close</span>
                                <p className="text-lg font-bold text-blue-600 mt-1 shadow-sm">{show.cheatSheet.bookClose}</p>
                              </div>
                            )}
                            {show.cheatSheet.aiAnswer && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">AI Answer</span>
                                <p className="text-sm text-slate-800 mt-0.5 leading-relaxed opacity-80">{show.cheatSheet.aiAnswer}</p>
                              </div>
                            )}
                            {show.cheatSheet.credentialDrop && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Credential Drop</span>
                                <p className="text-sm text-slate-800 mt-0.5 font-mono">{show.cheatSheet.credentialDrop}</p>
                              </div>
                            )}
                            {show.cheatSheet.deliveryRules.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Delivery Rules</span>
                                <div className="mt-2 space-y-1.5">
                                  {show.cheatSheet.deliveryRules.map((rule, i) => (
                                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={checkedRules[show.id]?.has(i) || false}
                                        onChange={() => toggleRule(show.id, i)}
                                        className="mt-0.5 rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500/40"
                                      />
                                      <span className={`text-sm ${checkedRules[show.id]?.has(i) ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-blue-600 transition-colors'}`}>
                                        {rule}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                            {show.cheatSheet.techChecklist.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Tech Checklist</span>
                                <div className="mt-2 space-y-1.5">
                                  {show.cheatSheet.techChecklist.map((item, i) => (
                                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={checkedTech[show.id]?.has(i) || false}
                                        onChange={() => toggleTech(show.id, i)}
                                        className="mt-0.5 rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500/40"
                                      />
                                      <span className={`text-sm ${checkedTech[show.id]?.has(i) ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-blue-600 transition-colors'}`}>
                                        {item}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'questions' && (
                          <div className="space-y-2">
                            {show.anticipatedQuestions.length === 0 ? (
                              <p className="text-sm text-slate-500 italic font-mono uppercase tracking-widest">No queries anticipated</p>
                            ) : (
                              show.anticipatedQuestions.map((q, i) => {
                                const key = `${show.id}-q-${i}`
                                const isExpandedQ = expandedQuestions.has(key)
                                return (
                                  <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-white/50">
                                    <button
                                      onClick={() => toggleQuestion(key)}
                                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-all"
                                    >
                                      <span className="text-sm text-slate-800 flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 w-5 font-mono">{String(i + 1).padStart(2, '0')}.</span>
                                        {q}
                                      </span>
                                      {isExpandedQ ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-slate-500" />}
                                    </button>
                                    {isExpandedQ && (
                                      <div className="px-4 pb-3 bg-white">
                                        <textarea
                                          placeholder="Notes for execution..."
                                          value={questionNotes[key] || ''}
                                          onChange={e => setQuestionNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                          rows={3}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none mt-1"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )}

                        {activeTab === 'platform' && (
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Platform</span>
                              <p className="text-sm text-slate-800 mt-0.5 font-bold">{show.platform || '—'}</p>
                            </div>
                            {show.platformNotes && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Platform Notes</span>
                                <p className="text-sm text-slate-500 mt-0.5 italic">{show.platformNotes}</p>
                              </div>
                            )}
                            {show.sessionLink && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Session Link</span>
                                <a
                                  href={show.sessionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-0.5 transition-colors font-mono underline underline-offset-4"
                                >
                                  <ExternalLink size={12} />
                                  Secure Connection
                                </a>
                              </div>
                            )}
                            {show.publicist && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Publicist</span>
                                <p className="text-sm text-slate-800 mt-0.5">{show.publicist}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Shows */}
      <div className="mb-8">
        <button
          onClick={() => setCompletedExpanded(v => !v)}
          className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 hover:text-slate-800 transition-colors"
        >
          {completedExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Historical Logs
          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono normal-case tracking-normal">
            {completedShows.length}
          </span>
        </button>
        
        {completedExpanded && (
          <div className="space-y-3">
            {completedShows.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">No history recorded</span>
              </div>
            ) : (
              completedShows.map(show => {
                const isEditing = editingShow === show.id
                const scores = isEditing ? editScores : show.postShow.scores
                
                return (
                  <div key={show.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-200 bg-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 text-sm">{show.showName}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-sm text-slate-800">{show.host}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                            <Calendar size={11} />
                            {formatDate(show.date)}
                          </span>
                          {show.postShow.recordingUrl && (
                            <a
                              href={show.postShow.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors underline underline-offset-2"
                            >
                              <ExternalLink size={10} />
                              Playback
                            </a>
                          )}
                        </div>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => startEditingShow(show)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 hover:border-blue-500/50 hover:text-blue-600 transition-all bg-white"
                        >
                          <Edit3 size={12} />
                          Review
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={cancelEditingShow}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#e2e8f0] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveShowEdit(show)}
                            disabled={savingShow === show.id}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all disabled:opacity-40 shadow-md"
                          >
                            {savingShow === show.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Save size={12} />
                            )}
                            Sync
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post-show Critique */}
                    <div className="p-5 bg-white/30">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4 font-mono">Execution Metrics</h4>
                      
                      {/* Score Bars */}
                      <div className="space-y-3 mb-5">
                        {(Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map(key => {
                          const score = scores[key]
                          const isEditingScore = isEditing && key in editScores
                          
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-bold text-slate-500 w-32 shrink-0 font-mono tracking-tight">{SCORE_LABELS[key]}</span>
                              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full ${getScoreColor(score)} transition-all duration-500 shadow-[0_0_8px_rgba(0,255,65,0.2)]`}
                                  style={{ width: score !== null ? `${score * 10}%` : '0%' }}
                                />
                              </div>
                              {isEditingScore ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={10}
                                  value={score ?? ''}
                                  onChange={e => {
                                    const val = e.target.value === '' ? null : Math.min(10, Math.max(0, parseInt(e.target.value) || 0))
                                    setEditScores(prev => ({ ...prev, [key]: val }))
                                  }}
                                  className="w-12 bg-white text-blue-600 font-mono text-xs text-center border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                />
                              ) : (
                                <span className={`text-xs font-bold w-8 text-right font-mono ${getScoreTextColor(score)}`}>
                                  {score ?? '—'}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Top Improvements */}
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Signal Improvements</span>
                        {show.postShow.topImprovements.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {show.postShow.topImprovements.map((imp, i) => (
                              <li key={i} className="text-sm text-slate-800 flex items-start gap-2">
                                <ChevronRight size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                {imp}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-500 mt-1 italic font-mono uppercase tracking-widest text-[10px]">No anomalies recorded</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono">Transmission Notes</span>
                        {isEditing ? (
                          <textarea
                            value={editNotes[show.id] || ''}
                            onChange={e => setEditNotes(prev => ({ ...prev, [show.id]: e.target.value }))}
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none mt-1"
                            placeholder="Input notes..."
                          />
                        ) : (
                          <p className="text-sm text-slate-500 mt-1 opacity-80 leading-relaxed">{show.postShow.notes || '—'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }))}
          </div>
        )}
      </div>

      {/* New Opportunities */}
      {newOpportunities.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            Opportunity Nodes
            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full font-mono text-[10px] normal-case">
              {newOpportunities.length}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newOpportunities.map(show => (
              <div
                key={show.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[show.status]}`}>
                    {STATUS_LABEL[show.status]}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm mb-1 transition-colors">{show.showName}</h3>
                <p className="text-sm text-slate-800 mb-2">{show.host}</p>
                {show.platformNotes && (
                  <div className="text-[10px] text-slate-500 bg-white rounded-lg p-2 font-mono uppercase tracking-wider">
                    <span className="font-bold text-slate-800">Availability:</span>
                    <p className="mt-1 whitespace-pre-line leading-relaxed">{show.platformNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Briefing Modal */}
      {briefingModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-200 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-slate-50 rounded-t-2xl z-10">
              <h2 className="font-bold text-blue-600 font-mono tracking-tight">{briefingModal.title}</h2>
              <button
                onClick={() => setBriefingModal(null)}
                className="text-slate-500 hover:text-slate-900 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 prose prose-invert prose-sm max-w-none">
              {briefingModal.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-slate-900 mt-4 mb-2 shadow-text-blue-600/20">{line.slice(2)}</h1>
                if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-blue-600 mt-5 mb-2 border-b border-slate-200 pb-1 font-mono uppercase tracking-widest">{line.slice(3)}</h2>
                if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-slate-800 mt-3 mb-1 font-mono">{line.slice(4)}</h3>
                if (line.startsWith('---')) return <hr key={i} className="border-slate-200 my-3" />
                if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                  const checked = line.startsWith('- [x] ')
                  return (
                    <div key={i} className="flex items-start gap-2 my-1">
                      <input type="checkbox" defaultChecked={checked} className="mt-0.5 rounded bg-white border-slate-200 text-blue-600 focus:ring-blue-500/40" />
                      <span className="text-sm text-slate-800">{line.slice(6)}</span>
                    </div>
                  )
                }
                if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-2 my-0.5"><span className="text-blue-600 mt-1 font-bold">›</span><span className="text-sm text-slate-800 opacity-80">{line.slice(2)}</span></div>
                if (line.startsWith('→ ')) return <div key={i} className="ml-4 text-sm text-slate-500 my-0.5 flex gap-2"><span className="text-blue-600">→</span><span>{line.slice(2)}</span></div>
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-blue-600 text-base my-2 font-mono tracking-tighter">{line.slice(2, -2)}</p>
                if (line === '') return <div key={i} className="h-2" />
                return <p key={i} className="text-sm text-slate-800 my-1 leading-relaxed opacity-70">{line}</p>
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
