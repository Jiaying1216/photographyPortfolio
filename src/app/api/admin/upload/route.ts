import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

function verifyToken(req: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false
  const expected = Buffer.from(adminPassword + ':ying-admin').toString('base64')
  return req.headers.get('x-admin-token') === expected
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN not configured.' }, { status: 500 })
  }

  const form = await req.formData()
  const file = form.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `ying-portfolio/photos/${Date.now()}.${ext}`

  const blob = await put(filename, file, {
    access: 'public',
    contentType: file.type || 'image/jpeg',
  })

  return NextResponse.json({ url: blob.url })
}
