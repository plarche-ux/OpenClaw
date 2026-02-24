import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const topic = body.topic?.trim() || ''

    const msg = topic
      ? `LINKEDIN_GENERATE_REQUEST | topic:${topic}`
      : `LINKEDIN_GENERATE_REQUEST | topic:auto`

    execSync(`openclaw system event --text "${msg.replace(/"/g, "'")}" --mode now`, {
      timeout: 5000,
    })

    return NextResponse.json({ ok: true, message: 'Neo is drafting your post. You will receive it on Telegram shortly.' })
  } catch {
    return NextResponse.json({ error: 'Failed to trigger post generation' }, { status: 500 })
  }
}
