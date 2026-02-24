import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { execSync } from 'child_process'

const TASKS_FILE = '/Users/paul/.openclaw/workspace/memory/tasks.json'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  project: string
  assignee: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export async function POST(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const raw = fs.readFileSync(TASKS_FILE, 'utf-8')
    const data = JSON.parse(raw)
    const idx = data.tasks.findIndex((t: Task) => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    const task: Task = data.tasks[idx]

    // Update status to review
    data.tasks[idx] = { ...task, status: 'review', updatedAt: new Date().toISOString() }
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8')

    // Fire openclaw system event to wake Neo for evaluation
    const msg = [
      `TASK_REVIEW_REQUEST`,
      `id:${task.id}`,
      `title:${task.title}`,
      `description:${task.description || 'none'}`,
      `project:${task.project}`,
      `priority:${task.priority}`,
      `assignee:${task.assignee}`,
    ].join(' | ')

    try {
      execSync(`openclaw system event --text "${msg.replace(/"/g, "'")}" --mode now`, {
        timeout: 5000,
      })
    } catch {
      // Event fire failed — task is still moved to review, evaluation will happen on next heartbeat
      console.error('Failed to fire openclaw event for review')
    }

    return NextResponse.json({ ok: true, task: data.tasks[idx] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to trigger review' }, { status: 500 })
  }
}
