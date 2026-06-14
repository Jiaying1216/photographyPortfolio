import { NextRequest, NextResponse } from 'next/server'
import { getPhotosFromBlob, savePhotosToBlob, isBlobConfigured } from '@/lib/blob-photos'
import { photos as staticPhotos } from '@/data/photos'

function verifyToken(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const expected = Buffer.from(adminPassword + ':ying-admin').toString('base64')
  return req.headers.get('x-admin-token') === expected
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const photos = isBlobConfigured() ? await getPhotosFromBlob() : staticPhotos
  return NextResponse.json(photos)
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isBlobConfigured()) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured.' }, { status: 500 })
  }

  const { action, photo, photoId } = await req.json()

  const current = await getPhotosFromBlob()

  if (action === 'add') {
    const updated = [photo, ...current]
    await savePhotosToBlob(updated)
    return NextResponse.json({ ok: true })
  }

  if (action === 'delete') {
    const updated = current.filter(p => p.id !== photoId)
    await savePhotosToBlob(updated)
    return NextResponse.json({ ok: true })
  }

  if (action === 'toggle-film-roll') {
    const updated = current.map(p =>
      p.id === photoId ? { ...p, filmRoll: !p.filmRoll } : p
    )
    await savePhotosToBlob(updated)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
}
