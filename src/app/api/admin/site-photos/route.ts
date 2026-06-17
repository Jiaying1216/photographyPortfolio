import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getSitePhotos, saveSitePhotos, isBlobConfigured } from '@/lib/blob-photos'
import type { SitePhotos } from '@/lib/blob-photos'

function verifyToken(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const expected = Buffer.from(adminPassword + ':ying-admin').toString('base64')
  return req.headers.get('x-admin-token') === expected
}

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await getSitePhotos()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isBlobConfigured()) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  try {
    const { sitePhotos } = await req.json() as { sitePhotos: SitePhotos }
    await saveSitePhotos(sitePhotos)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
