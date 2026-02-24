import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'

const DATA_FILE = '/Users/paul/.openclaw/workspace/memory/amazon-ads-data.json'

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function writeData(data: unknown) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  try {
    return NextResponse.json(readData())
  } catch {
    return NextResponse.json({ error: 'Failed to read amazon-ads-data.json' }, { status: 500 })
  }
}

// PATCH to update metrics, add optimization log entries, etc.
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const data = readData()
    const updated = { ...data, ...body, version: data.version }
    writeData(updated)
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
  }
}
