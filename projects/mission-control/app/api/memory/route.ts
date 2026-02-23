import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET() {
  try {
    const content = fs.readFileSync(path.join(WORKSPACE, 'MEMORY.md'), 'utf-8')
    
    // List daily notes
    const dailyDir = path.join(WORKSPACE, 'memory', 'daily')
    let dailyFiles: string[] = []
    try {
      dailyFiles = fs.readdirSync(dailyDir)
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
    } catch { /* no daily dir */ }

    return NextResponse.json({ content, dailyFiles })
  } catch {
    return NextResponse.json({ error: 'MEMORY.md not found' }, { status: 404 })
  }
}
