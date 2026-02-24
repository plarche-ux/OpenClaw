import { readFile, writeFile } from 'fs/promises'
import { NextRequest } from 'next/server'
import { join } from 'path'

const MEMORY_PATH = '/Users/paul/.openclaw/workspace/memory/podcasts.json'

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

async function readPodcasts(): Promise<PodcastsData> {
  const content = await readFile(MEMORY_PATH, 'utf-8')
  return JSON.parse(content)
}

async function writePodcasts(data: PodcastsData): Promise<void> {
  data.lastUpdated = new Date().toISOString().split('T')[0]
  await writeFile(MEMORY_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const data = await readPodcasts()
    return Response.json(data)
  } catch (err) {
    console.error('Failed to read podcasts:', err)
    return Response.json({ error: 'Failed to read podcasts data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 })
    }

    const data = await readPodcasts()
    const showIndex = data.shows.findIndex(s => s.id === id)

    if (showIndex === -1) {
      return Response.json({ error: 'Show not found' }, { status: 404 })
    }

    // Only allow updating postShow fields
    const allowedFields = ['recordingUrl', 'scores', 'topImprovements', 'notes']
    
    for (const key of allowedFields) {
      if (key in updates) {
        if (key === 'scores') {
          data.shows[showIndex].postShow.scores = { ...data.shows[showIndex].postShow.scores, ...updates[key] }
        } else {
          data.shows[showIndex].postShow[key as keyof typeof data.shows[0]['postShow']] = updates[key]
        }
      }
    }

    await writePodcasts(data)
    return Response.json({ success: true, show: data.shows[showIndex] })
  } catch (err) {
    console.error('Failed to update podcast:', err)
    return Response.json({ error: 'Failed to update podcast' }, { status: 500 })
  }
}
