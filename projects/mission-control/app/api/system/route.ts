import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

const WORKSPACE = '/Users/paul/.openclaw/workspace'

export async function GET() {
  let memoryLastModified = 'unknown'
  try {
    const stat = fs.statSync(path.join(WORKSPACE, 'MEMORY.md'))
    memoryLastModified = stat.mtime.toISOString()
  } catch { /* ignore */ }

  let workspaceFiles: string[] = []
  try {
    workspaceFiles = fs.readdirSync(WORKSPACE).sort()
  } catch { /* ignore */ }

  // Count .md files recursively (simplified)
  let mdCount = 0
  function countMd(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git') continue
        if (e.isDirectory()) countMd(path.join(dir, e.name))
        else if (e.name.endsWith('.md')) mdCount++
      }
    } catch { /* ignore */ }
  }
  countMd(WORKSPACE)

  return NextResponse.json({
    nodeVersion: process.version,
    platform: os.platform(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    workspacePath: WORKSPACE,
    memoryLastModified,
    workspaceFiles,
    mdCount,
    now: new Date().toISOString(),
  })
}
