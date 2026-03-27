import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leads } from '@/drizzle/schema'

export async function POST(req: Request) {
  const text = await req.text()
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 })
  }

  // Detect header row
  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const nameIdx = header.findIndex(h => h === 'name')
  const emailIdx = header.findIndex(h => h === 'email')
  const phoneIdx = header.findIndex(h => h === 'phone')
  const websiteIdx = header.findIndex(h => h === 'website')
  const locationIdx = header.findIndex(h => h === 'location')
  const notesIdx = header.findIndex(h => h === 'notes')

  if (nameIdx === -1 || emailIdx === -1) {
    return NextResponse.json({ error: 'CSV must have "name" and "email" columns' }, { status: 400 })
  }

  const parse = (row: string) => {
    // Handle quoted fields
    const cols: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of row) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    cols.push(cur.trim())
    return cols
  }

  const rows = lines.slice(1)
  const toInsert: typeof leads.$inferInsert[] = []
  let skipped = 0

  for (const line of rows) {
    const cols = parse(line)
    const name = cols[nameIdx]?.trim()
    const email = cols[emailIdx]?.trim().toLowerCase()
    if (!name || !email) { skipped++; continue }

    toInsert.push({
      name,
      email,
      phone: phoneIdx >= 0 ? cols[phoneIdx]?.trim() || null : null,
      website: websiteIdx >= 0 ? cols[websiteIdx]?.trim() || null : null,
      location: locationIdx >= 0 ? cols[locationIdx]?.trim() || null : null,
      notes: notesIdx >= 0 ? cols[notesIdx]?.trim() || null : null,
      status: 'not_contacted',
      source: 'csv',
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ error: 'No valid rows found', skipped }, { status: 400 })
  }

  await db.insert(leads).values(toInsert)
  return NextResponse.json({ imported: toInsert.length, skipped })
}
