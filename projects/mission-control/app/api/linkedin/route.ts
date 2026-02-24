import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'

const POSTS_FILE = '/Users/paul/.openclaw/workspace/memory/linkedin-posts.json'

function readData() {
  const raw = fs.readFileSync(POSTS_FILE, 'utf-8')
  return JSON.parse(raw)
}

function writeData(data: unknown) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    return NextResponse.json(readData())
  } catch {
    return NextResponse.json({ error: 'Failed to read linkedin-posts.json' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = readData()
    const now = new Date().toISOString()
    const nextNum = (data.posts.length > 0
      ? Math.max(...data.posts.map((p: { postNumber: number }) => p.postNumber)) + 1
      : 1)
    const post = {
      id: `lp-${String(nextNum).padStart(3, '0')}`,
      postNumber: nextNum,
      topic: body.topic ?? '',
      chapter: body.chapter ?? '',
      hook: body.hook ?? '',
      cta: body.cta ?? '',
      postBody: body.postBody ?? '',
      status: body.status ?? 'draft',
      scheduledDate: body.scheduledDate ?? null,
      publishedDate: body.publishedDate ?? null,
      linkedInUrl: body.linkedInUrl ?? '',
      notes: body.notes ?? '',
      createdAt: now,
      updatedAt: now,
    }
    data.posts.push(post)
    data.meta.lastUpdated = now
    writeData(data)
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const body = await req.json()
    const data = readData()
    const idx = data.posts.findIndex((p: { id: string }) => p.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    data.posts[idx] = { ...data.posts[idx], ...body, updatedAt: new Date().toISOString() }
    data.meta.lastUpdated = new Date().toISOString()
    writeData(data)
    return NextResponse.json(data.posts[idx])
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const data = readData()
    const before = data.posts.length
    data.posts = data.posts.filter((p: { id: string }) => p.id !== id)
    if (data.posts.length === before) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    data.meta.lastUpdated = new Date().toISOString()
    writeData(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
