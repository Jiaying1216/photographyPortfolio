import type { Photo } from '@/types'

const METADATA_PATHNAME = 'ying-portfolio/photos.json'

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

export async function getPhotosFromBlob(): Promise<Photo[]> {
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: METADATA_PATHNAME })
    if (blobs.length === 0) return []
    const metaBlob = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0]
    const res = await fetch(metaBlob.url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
    })
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    console.error('getPhotosFromBlob error:', e)
    return []
  }
}

export async function savePhotosToBlob(photos: Photo[]): Promise<void> {
  const { put, del, list } = await import('@vercel/blob')
  // Snapshot old blobs BEFORE writing so there is always a valid blob in the store.
  const { blobs: old } = await list({ prefix: METADATA_PATHNAME })
  // Write new blob first — readers can always find a valid metadata file.
  await put(METADATA_PATHNAME, JSON.stringify(photos, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
  // Delete old blobs only after new one is safely written.
  if (old.length > 0) {
    await Promise.all(old.map(b => del(b.url)))
  }
}
