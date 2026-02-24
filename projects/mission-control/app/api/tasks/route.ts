import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TASKS_FILE = '/Users/paul/.openclaw/workspace/memory/tasks.json'

function readData() {
  const raw = fs.readFileSync(TASKS_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeData(data: unknown) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const data = readData()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to read tasks.json' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = readData()
    const now = new Date().toISOString()
    const task = {
      id: `t-${Date.now()}`,
      title: body.title,
      description: body.description ?? '',
      status: body.status ?? 'backlog',
      priority: body.priority ?? 'medium',
      project: body.project ?? 'general',
      assignee: body.assignee ?? '',
      tags: body.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    data.tasks.push(task)
    writeData(data)
    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json()
    const data = readData()
    const idx = data.tasks.findIndex((t: { id: string }) => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    data.tasks[idx] = { ...data.tasks[idx], ...body, updatedAt: new Date().toISOString() }
    writeData(data)
    return NextResponse.json(data.tasks[idx])
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const data = readData()
    const before = data.tasks.length
    data.tasks = data.tasks.filter((t: { id: string }) => t.id !== id)
    if (data.tasks.length === before) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    writeData(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
