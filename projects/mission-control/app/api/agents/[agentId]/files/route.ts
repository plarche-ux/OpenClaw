import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Map agent IDs to their workspace paths
const AGENT_WORKSPACES: Record<string, string> = {
  main: '/Users/paul/.openclaw/workspace',
  trinity: '/Users/paul/.openclaw/workspace-trinity',
  niobe: '/Users/paul/.openclaw/workspace-niobe',
  link: '/Users/paul/.openclaw/workspace-link',
}

// Files to show in the agent file browser
const ALLOWED_FILES = [
  'IDENTITY.md',
  'SOUL.md',
  'AGENTS.md',
  'USER.md',
  'TOOLS.md',
  'HEARTBEAT.md',
  'MEMORY.md',
]

function getWorkspace(agentId: string): string | null {
  return AGENT_WORKSPACES[agentId] ?? null
}

// GET /api/agents/[agentId]/files — list available files
// GET /api/agents/[agentId]/files?file=SOUL.md — read a specific file
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  const workspace = getWorkspace(agentId)
  if (!workspace) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 404 })
  }

  const file = req.nextUrl.searchParams.get('file')

  // List available files
  if (!file) {
    const files = ALLOWED_FILES.map(name => {
      const abs = path.join(workspace, name)
      const exists = fs.existsSync(abs)
      return { name, exists }
    }).filter(f => f.exists)
    return NextResponse.json({ agentId, workspace, files })
  }

  // Security: only allow whitelisted filenames (no path traversal)
  if (!ALLOWED_FILES.includes(file)) {
    return NextResponse.json({ error: 'File not allowed' }, { status: 403 })
  }

  const abs = path.join(workspace, file)
  if (!abs.startsWith(workspace)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const content = fs.readFileSync(abs, 'utf-8')
    return NextResponse.json({ agentId, file, content })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}

// POST /api/agents/[agentId]/files?file=SOUL.md — save a file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  const workspace = getWorkspace(agentId)
  if (!workspace) {
    return NextResponse.json({ error: 'Unknown agent' }, { status: 404 })
  }

  const file = req.nextUrl.searchParams.get('file')
  if (!file || !ALLOWED_FILES.includes(file)) {
    return NextResponse.json({ error: 'File not allowed' }, { status: 403 })
  }

  const abs = path.join(workspace, file)
  if (!abs.startsWith(workspace)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { content } = body
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
    }
    fs.writeFileSync(abs, content, 'utf-8')
    return NextResponse.json({ ok: true, agentId, file })
  } catch {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
  }
}
