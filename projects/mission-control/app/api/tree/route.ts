import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const WORKSPACE = '/Users/paul/.openclaw/workspace'
const EXCLUDE = new Set(['node_modules', '.git', '.next'])

export interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children?: TreeNode[]
}

function buildTree(dir: string, relBase: string): TreeNode[] {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const nodes: TreeNode[] = []
  for (const entry of entries) {
    if (EXCLUDE.has(entry.name) || entry.name.startsWith('.')) continue
    const relPath = relBase ? `${relBase}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      nodes.push({
        name: entry.name,
        path: relPath,
        isDir: true,
        children: buildTree(path.join(dir, entry.name), relPath),
      })
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.csv') || entry.name.endsWith('.json') || entry.name.endsWith('.txt')) {
      nodes.push({ name: entry.name, path: relPath, isDir: false })
    }
  }
  return nodes.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export async function GET() {
  const tree = buildTree(WORKSPACE, '')
  return NextResponse.json({ tree })
}
