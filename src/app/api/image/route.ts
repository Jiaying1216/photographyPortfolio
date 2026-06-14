import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return new NextResponse('Not configured', { status: 500 })
  }

  // New uploads store the full blob URL
  let blobUrl = req.nextUrl.searchParams.get('url')

  if (blobUrl) {
    // SSRF guard: only allow Vercel private blob storage
    if (!blobUrl.startsWith('https://') || !blobUrl.includes('private.blob.vercel-storage.com')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  } else {
    // Old uploads stored the pathname — look up the actual URL via blob SDK
    const key = req.nextUrl.searchParams.get('key')
    if (!key) return new NextResponse('Missing url or key', { status: 400 })

    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: key })
    const match = blobs.find(b => b.pathname === key)
    if (!match) return new NextResponse('Not found', { status: 404 })
    blobUrl = match.url
  }

  const res = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    cache: 'force-cache',
  })

  if (!res.ok) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
