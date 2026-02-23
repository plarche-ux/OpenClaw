import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET(req: NextRequest) {
  const dir = req.nextUrl.searchParams.get('dir') || ''
  const abs = path.join(WORKSPACE, dir)
  if (!abs.startsWith(WORKSPACE)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }
  try {
    const entries = fs.readdirSync(abs, { withFileTypes: true }).map(e => ({
      name: e.name,
      isDir: e.isDirectory(),
      path: dir ? `${dir}/${e.name}` : e.name,
    }))
    return NextResponse.json({ entries })
  } catch {
    return NextResponse.json({ error: 'Directory not found' }, { status: 404 })
  }
}
