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
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export async function savePhotosToBlob(photos: Photo[]): Promise<void> {
  const { put } = await import('@vercel/blob')
  await put(METADATA_PATHNAME, JSON.stringify(photos, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  })
}
