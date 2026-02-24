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
  upcoming: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  pending_confirmation: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  new_opportunity: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-600',
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
  if (score === null) return 'bg-slate-200'
  if (score >= 7) return 'bg-green-500'
  if (score >= 4) return 'bg-amber-400'
  return 'bg-red-500'
}

function getScoreTextColor(score: number | null): string {
  if (score === null) return 'text-slate-400'
  if (score >= 7) return 'text-green-600'
  if (score >= 4) return 'text-amber-600'
  return 'text-red-600'
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
    <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
      <AlertTriangle size={16} className="text-green-400" />
      <span className="text-sm">{message}</span>
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
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Failed to load podcasts data
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Mic size={24} className="text-amber-500" />
        <h1 className="text-2xl font-bold text-slate-900">Podcasts</h1>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Shows', value: stats.total, color: 'text-slate-700' },
          { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600' },
          { label: 'Avg Delivery', value: stats.avgDelivery ?? '—', color: stats.avgDelivery ? 'text-amber-600' : 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming & Confirmed */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          Upcoming & Confirmed
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium normal-case">
            {upcomingShows.length}
          </span>
        </h2>
        
        {upcomingShows.length === 0 ? (
          <div className="border-2 border-dashed border-slate-100 rounded-xl h-20 flex items-center justify-center">
            <span className="text-xs text-slate-300">No upcoming shows</span>
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
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-amber-300 transition-colors"
                >
                  {/* Card Header */}
                  <div
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleCard(show.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{show.showName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-sm text-slate-600">{show.host}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[show.status]}`}>
                          {STATUS_LABEL[show.status]}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDateTimeET(show.date, show.time)}
                        </span>
                        {show.platform && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {show.platform}
                          </span>
                        )}
                        {needsChrome && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Chrome Required
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-slate-300">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {/* Quick Actions Bar */}
                      <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex-wrap">
                        {show.sessionLink && (
                          <a
                            href={show.sessionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink size={12} />
                            Session Link
                          </a>
                        )}
                        {show.briefingMd && (
                          <button
                            onClick={e => { e.stopPropagation(); viewBriefing(show) }}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                          >
                            <FileText size={12} />
                            View Briefing
                          </button>
                        )}
                        {!show.briefingMd && show.briefingPdf && (
                          <a
                            href={`/api/files?path=${encodeURIComponent(show.briefingPdf)}`}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
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
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Play size={12} />
                          Run Prep
                        </button>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b border-slate-100">
                        {[
                          { id: 'host' as TabId, label: 'Host', icon: User },
                          { id: 'cheatSheet' as TabId, label: 'Cheat Sheet', icon: BookOpen },
                          { id: 'questions' as TabId, label: 'Questions', icon: HelpCircle },
                          { id: 'platform' as TabId, label: 'Platform', icon: Monitor },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setTab(show.id, tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                              activeTab === tab.id
                                ? 'border-amber-400 text-amber-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <tab.icon size={12} />
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-5">
                        {activeTab === 'host' && (
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs font-medium text-slate-400 uppercase">Title</span>
                              <p className="text-sm text-slate-700 mt-0.5">{show.hostTitle || '—'}</p>
                            </div>
                            {show.showStats && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Show Stats</span>
                                <p className="text-sm text-slate-700 mt-0.5">{show.showStats}</p>
                              </div>
                            )}
                            {show.hostNotes && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Host Notes</span>
                                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{show.hostNotes}</p>
                              </div>
                            )}
                            {show.hostLinkedIn && (
                              <a
                                href={show.hostLinkedIn}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
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
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <span className="text-xs font-medium text-amber-600 uppercase">Book Close</span>
                                <p className="text-lg font-medium text-amber-700 mt-1">{show.cheatSheet.bookClose}</p>
                              </div>
                            )}
                            {show.cheatSheet.aiAnswer && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">AI Answer</span>
                                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{show.cheatSheet.aiAnswer}</p>
                              </div>
                            )}
                            {show.cheatSheet.credentialDrop && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Credential Drop</span>
                                <p className="text-sm text-slate-600 mt-0.5">{show.cheatSheet.credentialDrop}</p>
                              </div>
                            )}
                            {show.cheatSheet.deliveryRules.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Delivery Rules</span>
                                <div className="mt-2 space-y-1.5">
                                  {show.cheatSheet.deliveryRules.map((rule, i) => (
                                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={checkedRules[show.id]?.has(i) || false}
                                        onChange={() => toggleRule(show.id, i)}
                                        className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                      />
                                      <span className={`text-sm ${checkedRules[show.id]?.has(i) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                        {rule}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                            {show.cheatSheet.techChecklist.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Tech Checklist</span>
                                <div className="mt-2 space-y-1.5">
                                  {show.cheatSheet.techChecklist.map((item, i) => (
                                    <label key={i} className="flex items-start gap-2 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={checkedTech[show.id]?.has(i) || false}
                                        onChange={() => toggleTech(show.id, i)}
                                        className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                      />
                                      <span className={`text-sm ${checkedTech[show.id]?.has(i) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
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
                              <p className="text-sm text-slate-400 italic">No anticipated questions yet</p>
                            ) : (
                              show.anticipatedQuestions.map((q, i) => {
                                const key = `${show.id}-q-${i}`
                                const isExpandedQ = expandedQuestions.has(key)
                                return (
                                  <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => toggleQuestion(key)}
                                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                                    >
                                      <span className="text-sm text-slate-700 flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400 w-5">{i + 1}.</span>
                                        {q}
                                      </span>
                                      {isExpandedQ ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                                    </button>
                                    {isExpandedQ && (
                                      <div className="px-4 pb-3 bg-slate-50/50">
                                        <textarea
                                          placeholder="Answer notes..."
                                          value={questionNotes[key] || ''}
                                          onChange={e => setQuestionNotes(prev => ({ ...prev, [key]: e.target.value }))}
                                          rows={3}
                                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none mt-1"
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
                              <span className="text-xs font-medium text-slate-400 uppercase">Platform</span>
                              <p className="text-sm text-slate-700 mt-0.5">{show.platform || '—'}</p>
                            </div>
                            {show.platformNotes && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Platform Notes</span>
                                <p className="text-sm text-slate-600 mt-0.5">{show.platformNotes}</p>
                              </div>
                            )}
                            {show.sessionLink && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Session Link</span>
                                <a
                                  href={show.sessionLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                                >
                                  <ExternalLink size={12} />
                                  Open Link
                                </a>
                              </div>
                            )}
                            {show.publicist && (
                              <div>
                                <span className="text-xs font-medium text-slate-400 uppercase">Publicist</span>
                                <p className="text-sm text-slate-600 mt-0.5">{show.publicist}</p>
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
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 hover:text-slate-700 transition-colors"
        >
          {completedExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          Completed Shows
          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium normal-case">
            {completedShows.length}
          </span>
        </button>
        
        {completedExpanded && (
          <div className="space-y-3">
            {completedShows.length === 0 ? (
              <div className="border-2 border-dashed border-slate-100 rounded-xl h-20 flex items-center justify-center">
                <span className="text-xs text-slate-300">No completed shows</span>
              </div>
            ) : (
              completedShows.map(show => {
                const isEditing = editingShow === show.id
                const scores = isEditing ? editScores : show.postShow.scores
                
                return (
                  <div key={show.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm">{show.showName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-sm text-slate-600">{show.host}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDate(show.date)}
                          </span>
                          {show.postShow.recordingUrl && (
                            <a
                              href={show.postShow.recordingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <ExternalLink size={10} />
                              Recording
                            </a>
                          )}
                        </div>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => startEditingShow(show)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                        >
                          <Edit3 size={12} />
                          Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={cancelEditingShow}
                            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveShowEdit(show)}
                            disabled={savingShow === show.id}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-white transition-colors disabled:opacity-40"
                          >
                            {savingShow === show.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Save size={12} />
                            )}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post-show Critique */}
                    <div className="p-5">
                      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">Post-show Critique</h4>
                      
                      {/* Score Bars */}
                      <div className="space-y-3 mb-5">
                        {(Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map(key => {
                          const score = scores[key]
                          const isEditingScore = isEditing && key in editScores
                          
                          return (
                            <div key={key} className="flex items-center gap-3">
                              <span className="text-xs text-slate-500 w-32 shrink-0">{SCORE_LABELS[key]}</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getScoreColor(score)} transition-all duration-300`}
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
                                  className="w-12 text-xs text-center border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                              ) : (
                                <span className={`text-xs font-medium w-8 text-right ${getScoreTextColor(score)}`}>
                                  {score ?? '—'}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Top Improvements */}
                      <div className="mb-4">
                        <span className="text-xs font-medium text-slate-400 uppercase">Top Improvements</span>
                        {show.postShow.topImprovements.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {show.postShow.topImprovements.map((imp, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <ChevronRight size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                {imp}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-400 mt-1 italic">No improvements recorded</p>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <span className="text-xs font-medium text-slate-400 uppercase">Notes</span>
                        {isEditing ? (
                          <textarea
                            value={editNotes[show.id] || ''}
                            onChange={e => setEditNotes(prev => ({ ...prev, [show.id]: e.target.value }))}
                            rows={3}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none mt-1"
                            placeholder="Add notes..."
                          />
                        ) : (
                          <p className="text-sm text-slate-600 mt-1">{show.postShow.notes || '—'}</p>
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
            New Opportunities
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium normal-case">
              {newOpportunities.length}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newOpportunities.map(show => (
              <div
                key={show.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[show.status]}`}>
                    {STATUS_LABEL[show.status]}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">{show.showName}</h3>
                <p className="text-sm text-slate-600 mb-2">{show.host}</p>
                {show.platformNotes && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                    <span className="font-medium">Available Dates:</span>
                    <p className="mt-1 whitespace-pre-line">{show.platformNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Briefing Modal */}
      {briefingModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-semibold text-slate-800">{briefingModal.title}</h2>
              <button
                onClick={() => setBriefingModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 prose prose-sm max-w-none">
              {briefingModal.content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-slate-800 mt-4 mb-2">{line.slice(2)}</h1>
                if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold text-slate-700 mt-5 mb-2 border-b border-slate-100 pb-1">{line.slice(3)}</h2>
                if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-slate-700 mt-3 mb-1">{line.slice(4)}</h3>
                if (line.startsWith('---')) return <hr key={i} className="border-slate-100 my-3" />
                if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
                  const checked = line.startsWith('- [x] ')
                  return (
                    <div key={i} className="flex items-start gap-2 my-1">
                      <input type="checkbox" defaultChecked={checked} className="mt-0.5 rounded border-slate-300 text-amber-500" />
                      <span className="text-sm text-slate-700">{line.slice(6)}</span>
                    </div>
                  )
                }
                if (line.startsWith('- ')) return <div key={i} className="flex items-start gap-2 my-0.5"><span className="text-amber-400 mt-1">›</span><span className="text-sm text-slate-600">{line.slice(2)}</span></div>
                if (line.startsWith('→ ')) return <div key={i} className="ml-4 text-sm text-slate-600 my-0.5 flex gap-2"><span className="text-amber-500">→</span><span>{line.slice(2)}</span></div>
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-amber-700 text-base my-2">{line.slice(2, -2)}</p>
                if (line === '') return <div key={i} className="h-2" />
                return <p key={i} className="text-sm text-slate-700 my-1 leading-relaxed">{line}</p>
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
