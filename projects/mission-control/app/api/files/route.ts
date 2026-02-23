import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('path') || ''
  if (!filePath) return NextResponse.json({ error: 'No path provided' }, { status: 400 })

  const abs = path.join(WORKSPACE, filePath)
  // Security: ensure it stays within workspace
  if (!abs.startsWith(WORKSPACE)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const content = fs.readFileSync(abs, 'utf-8')
    return NextResponse.json({ content })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
