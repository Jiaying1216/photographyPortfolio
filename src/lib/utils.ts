export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// Converts a photo src to a displayable URL.
// Private Vercel Blob content (either full URL or pathname) can't be loaded by the
// browser directly (needs auth header), so we proxy through /api/image.
export function photoSrc(src: string): string {
  if (src.includes('private.blob.vercel-storage.com')) {
    return `/api/image?url=${encodeURIComponent(src)}`
  }
  if (src.startsWith('ying-portfolio/')) {
    return `/api/image?key=${encodeURIComponent(src)}`
  }
  return src
}

export function warmGradient(index: number): string {
  const gradients = [
    'linear-gradient(135deg, #c9b49a 0%, #7a5c44 100%)',
    'linear-gradient(135deg, #d4b896 0%, #9c5a3c 100%)',
    'linear-gradient(135deg, #e8ddd0 0%, #c9b49a 100%)',
    'linear-gradient(135deg, #b89880 0%, #7a5c44 100%)',
    'linear-gradient(135deg, #c9b49a 0%, #8a9a7e 100%)',
    'linear-gradient(135deg, #d4b896 0%, #7a5c44 100%)',
    'linear-gradient(135deg, #e0d4c4 0%, #9c5a3c 100%)',
    'linear-gradient(135deg, #c9b49a 0%, #3d2b1f 100%)',
    'linear-gradient(135deg, #d4b896 0%, #8a9a7e 100%)',
  ]
  return gradients[index % gradients.length]
}
