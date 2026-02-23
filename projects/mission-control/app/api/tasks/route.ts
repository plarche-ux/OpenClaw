import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET() {
  try {
    const content = fs.readFileSync(path.join(WORKSPACE, 'HEARTBEAT.md'), 'utf-8')
    const lines = content.split('\n')
    const todo: string[] = []
    const done: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('- [ ] ')) {
        todo.push(trimmed.replace('- [ ] ', ''))
      } else if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
        done.push(trimmed.replace(/- \[[xX]\] /, ''))
      }
    }

    return NextResponse.json({ todo, done })
  } catch {
    return NextResponse.json({ todo: [], done: [], error: 'HEARTBEAT.md not found' })
  }
}
