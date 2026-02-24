import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST() {
  try {
    execSync(
      `openclaw system event --text "AMAZON_ADS_SYNC_REQUEST | Fetch fresh campaign metrics, keyword performance, and search term report from Amazon Ads API. Update memory/amazon-ads-data.json with latest data. Report ACoS, spend, sales, and any new keyword recommendations." --mode now`,
      { timeout: 5000 }
    )
    return NextResponse.json({ ok: true, message: 'Sync requested. Neo will fetch fresh data and update the dashboard.' })
  } catch {
    return NextResponse.json({ error: 'Failed to trigger sync' }, { status: 500 })
  }
}
