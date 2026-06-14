import { Redis } from '@upstash/redis'
import type { Photo } from '@/types'

const KV_KEY = 'ying:photos'
const BLOB_METADATA_PATHNAME = 'ying-portfolio/photos.json'

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

export async function getPhotosFromBlob(): Promise<Photo[]> {
  try {
    const redis = getRedis()
    if (redis) {
      const photos = await redis.get<Photo[]>(KV_KEY)
      if (photos && photos.length > 0) return photos
      // One-time migration: import existing photos from the old blob JSON
      const migrated = await readFromBlobJSON()
      if (migrated.length > 0) {
        await redis.set(KV_KEY, migrated)
        return migrated
      }
      return []
    }
    // Redis not configured — fall back to blob JSON
    return await readFromBlobJSON()
  } catch (e) {
    console.error('getPhotosFromBlob error:', e)
    return []
  }
}

export async function savePhotosToBlob(photos: Photo[]): Promise<void> {
  const redis = getRedis()
  if (redis) {
    await redis.set(KV_KEY, photos)
    return
  }
  // Redis not configured — fall back to blob JSON
  const { put } = await import('@vercel/blob')
  await put(BLOB_METADATA_PATHNAME, JSON.stringify(photos, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}

async function readFromBlobJSON(): Promise<Photo[]> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return []
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: BLOB_METADATA_PATHNAME })
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
  } catch {
    return []
  }
}
