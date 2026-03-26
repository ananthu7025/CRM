import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { db } from '@/lib/db'
import { files } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [file] = await db.select().from(files).where(eq(files.id, id))
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete from Vercel Blob
  await del(file.url)

  // Delete from DB
  await db.delete(files).where(eq(files.id, id))

  return NextResponse.json({ success: true })
}
