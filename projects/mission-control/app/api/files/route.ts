import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path') || ''
  if (!filePath) return NextResponse.json({ error: 'No path provided' }, { status: 400 })

  const abs = path.join(WORKSPACE, filePath)
  if (!abs.startsWith(WORKSPACE)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    // Serve PDFs as binary download
    if (abs.endsWith('.pdf')) {
      const buffer = fs.readFileSync(abs)
      const filename = path.basename(abs)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const content = fs.readFileSync(abs, 'utf-8')
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}

export async function POST(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path') || ''
  if (!filePath) return NextResponse.json({ error: 'No path provided' }, { status: 400 })

  const abs = path.join(WORKSPACE, filePath)
  if (!abs.startsWith(WORKSPACE)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Only allow .md files to be saved
  if (!filePath.endsWith('.md')) {
    return NextResponse.json({ error: 'Only .md files can be edited' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { content } = body
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }
    fs.writeFileSync(abs, content, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
