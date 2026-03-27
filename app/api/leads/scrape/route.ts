import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/drizzle/schema'

const APIFY_TOKEN = process.env.APPIFY_TOKEN

export async function POST(req: Request) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APPIFY_TOKEN not configured' }, { status: 500 })
  }

  const body = await req.json()
  const { keyword, location, maxResults = 20 } = body

  if (!keyword || !location) {
    return NextResponse.json({ error: 'keyword and location are required' }, { status: 400 })
  }

  const searchQuery = `${keyword} ${location}`

  // Start Apify Google Maps actor and wait up to 120s for result
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=${APIFY_TOKEN}&waitForFinish=120`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchStringsArray: [searchQuery],
        maxCrawledPlacesPerSearch: Number(maxResults),
        language: 'en',
        exportPlaceUrls: false,
        includeHistogram: false,
        includeOpeningHours: false,
        includePeopleAlsoSearch: false,
        additionalInfo: false,
      }),
    }
  )

  if (!runRes.ok) {
    const err = await runRes.text()
    return NextResponse.json({ error: `Apify error: ${err}` }, { status: 502 })
  }

  const run = await runRes.json()
  const datasetId = run?.data?.defaultDatasetId

  if (!datasetId) {
    return NextResponse.json({ error: 'No dataset returned from Apify' }, { status: 502 })
  }

  // Fetch dataset items
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}&clean=true&format=json`,
    { method: 'GET' }
  )

  if (!itemsRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch scrape results' }, { status: 502 })
  }

  const items: Record<string, unknown>[] = await itemsRes.json()

  if (!items.length) {
    return NextResponse.json({ imported: 0, skipped: 0 })
  }

  const toInsert: typeof leads.$inferInsert[] = []
  let skipped = 0

  for (const item of items) {
    const name = (item.title as string)?.trim()
    // Use first scraped email or skip email (leave blank placeholder for manual fill)
    const emails = item.emails as string[] | undefined
    const email = emails?.[0]?.trim().toLowerCase() ?? ''

    if (!name) { skipped++; continue }

    toInsert.push({
      name,
      email: email || `noemail+${Date.now()}-${Math.random().toString(36).slice(2, 6)}@placeholder.local`,
      phone: (item.phone as string)?.trim() || null,
      website: (item.website as string)?.trim() || null,
      location: (item.address as string)?.trim() || (item.city as string)?.trim() || null,
      notes: null,
      status: 'not_contacted',
      source: 'google_maps',
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ imported: 0, skipped })
  }

  await db.insert(leads).values(toInsert)
  return NextResponse.json({ imported: toInsert.length, skipped })
}
