'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { upload } from '@vercel/blob/client'
import type { Photo } from '@/types'
import { photoSrc } from '@/lib/utils'

const CATEGORIES = ['travel', 'portrait', 'nature', 'street'] as const
const ASPECT_RATIOS = ['3/4', '4/3', '2/3', '1/1'] as const

// ── Password gate ──────────────────────────────────────────────────────────
function PasswordGate({ onAuth }: { onAuth: (token: string) => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    const data = await res.json()
    if (res.ok) {
      sessionStorage.setItem('admin-token', data.token)
      onAuth(data.token)
    } else {
      setError(data.error || 'Incorrect password.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#3d2b1f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 340, textAlign: 'center' }}>
        <h1 className="font-playfair" style={{ color: '#f5f0e8', fontSize: '32px', fontStyle: 'italic', marginBottom: '40px' }}>
          Admin
        </h1>
        <form onSubmit={submit}>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Password"
            className="font-lora"
            style={{
              width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(201,180,154,0.3)', color: '#f5f0e8', fontSize: '15px',
              outline: 'none', marginBottom: '16px', borderRadius: '2px',
            }}
          />
          {error && <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="font-dm-mono"
            style={{
              width: '100%', padding: '13px', backgroundColor: '#9c5a3c', color: '#f5f0e8',
              border: 'none', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase',
              cursor: 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Upload form ────────────────────────────────────────────────────────────
function UploadForm({ token, onUploaded }: { token: string; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [meta, setMeta] = useState({
    title: '', location: '', category: 'travel' as Photo['category'],
    year: new Date().getFullYear(), aspectRatio: '3/4' as Photo['aspectRatio'],
  })

  const pickFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) pickFile(f)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)

    try {
      // 1. Upload directly from browser to Vercel Blob (no 4MB server limit)
      setStatus('Uploading image…')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `ying-portfolio/photos/${Date.now()}.${ext}`
      const blob = await upload(filename, file, {
        access: 'private',
        handleUploadUrl: '/api/admin/upload',
        clientPayload: token, // admin token verified server-side
      })

      // 2. Save metadata
      setStatus('Saving metadata…')
      const newPhoto: Photo = {
        id: Date.now().toString(),
        src: blob.url,
        alt: `${meta.title} — ${meta.location}`,
        category: meta.category,
        location: meta.location,
        title: meta.title,
        year: meta.year,
        aspectRatio: meta.aspectRatio,
      }
      const metaRes = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ action: 'add', photo: newPhoto }),
      })
      if (!metaRes.ok) {
        const err = await metaRes.json()
        setStatus(`Error saving metadata: ${err.error}`)
        setUploading(false)
        return
      }

      setStatus('Done! Photo added.')
      setFile(null)
      setPreview(null)
      setMeta({ title: '', location: '', category: 'travel', year: new Date().getFullYear(), aspectRatio: '3/4' })
      onUploaded()
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : 'Upload failed'}`)
    } finally {
      setUploading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: '#faf7f2', border: '1px solid rgba(201,180,154,0.5)',
    color: '#3d2b1f', fontSize: '14px', fontFamily: 'var(--font-lora-body), serif',
    outline: 'none', borderRadius: '2px',
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#9c5a3c' : 'rgba(201,180,154,0.5)'}`,
          borderRadius: '4px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '24px',
          backgroundColor: dragging ? 'rgba(156,90,60,0.05)' : 'transparent',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
        />
        {preview ? (
          <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: '2px' }} />
        ) : (
          <>
            <p className="font-playfair" style={{ color: '#7a5c44', fontSize: '18px', fontStyle: 'italic', marginBottom: '8px' }}>
              Drop photo here
            </p>
            <p className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '11px', letterSpacing: '0.1em' }}>
              or click to browse
            </p>
          </>
        )}
      </div>

      {/* Metadata fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <Label>Title</Label>
          <input required value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
            style={inputStyle} placeholder="Morning Mist" />
        </div>
        <div>
          <Label>Location</Label>
          <input required value={meta.location} onChange={e => setMeta(m => ({ ...m, location: e.target.value }))}
            style={inputStyle} placeholder="Kyoto, Japan" />
        </div>
        <div>
          <Label>Category</Label>
          <select value={meta.category} onChange={e => setMeta(m => ({ ...m, category: e.target.value as Photo['category'] }))}
            style={{ ...inputStyle, appearance: 'none' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <Label>Year</Label>
          <input type="number" min="2000" max="2099" value={meta.year}
            onChange={e => setMeta(m => ({ ...m, year: parseInt(e.target.value) }))}
            style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <Label>Aspect Ratio</Label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ASPECT_RATIOS.map(r => (
              <button key={r} type="button"
                onClick={() => setMeta(m => ({ ...m, aspectRatio: r }))}
                className="font-dm-mono"
                style={{
                  padding: '8px 16px', fontSize: '11px', letterSpacing: '0.1em',
                  border: '1px solid', cursor: 'pointer',
                  borderColor: meta.aspectRatio === r ? '#9c5a3c' : 'rgba(201,180,154,0.5)',
                  backgroundColor: meta.aspectRatio === r ? '#9c5a3c' : 'transparent',
                  color: meta.aspectRatio === r ? '#f5f0e8' : '#7a5c44',
                  borderRadius: '2px',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {status && (
        <p className="font-dm-mono" style={{
          color: status.startsWith('Error') ? '#9c5a3c' : '#8a9a7e',
          fontSize: '12px', marginBottom: '16px', letterSpacing: '0.06em',
        }}>{status}</p>
      )}

      <button
        type="submit"
        disabled={!file || uploading}
        className="font-dm-mono"
        style={{
          width: '100%', padding: '14px', backgroundColor: '#3d2b1f',
          color: '#f5f0e8', border: 'none', fontSize: '11px',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          cursor: file && !uploading ? 'pointer' : 'not-allowed',
          opacity: !file || uploading ? 0.5 : 1, borderRadius: '2px',
        }}>
        {uploading ? 'Uploading…' : 'Add to Portfolio'}
      </button>
    </form>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-dm-mono" style={{
      display: 'block', color: '#9c5a3c', fontSize: '10px',
      letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px',
    }}>
      {children}
    </label>
  )
}

// ── Photo list ─────────────────────────────────────────────────────────────
function PhotoList({ photos, token, onDeleted }: { photos: Photo[]; token: string; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const deletePhoto = async (id: string) => {
    if (!confirm('Remove this photo from the portfolio?')) return
    setDeleting(id)
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'delete', photoId: id }),
    })
    setDeleting(null)
    onDeleted()
  }

  const toggleFilmRoll = async (id: string) => {
    setToggling(id)
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'toggle-film-roll', photoId: id }),
    })
    setToggling(null)
    onDeleted()
  }

  if (photos.length === 0) {
    return (
      <p className="font-lora" style={{ color: '#c9b49a', fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>
        No photos yet. Upload your first one above.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {photos.map(photo => (
        <div key={photo.id} style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 16px', backgroundColor: '#faf7f2',
          border: '1px solid rgba(201,180,154,0.3)', borderRadius: '2px',
        }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0, borderRadius: '2px', overflow: 'hidden',
            background: 'linear-gradient(135deg, #c9b49a, #7a5c44)',
            position: 'relative',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc(photo.src)}
              alt={photo.alt}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-lora" style={{ color: '#3d2b1f', fontSize: '14px', fontWeight: 500 }}>{photo.title}</p>
            <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {photo.location} · {photo.year} · {photo.category}
            </p>
          </div>
          <button
            onClick={() => toggleFilmRoll(photo.id)}
            disabled={toggling === photo.id}
            title={photo.filmRoll ? 'Remove from Film Roll' : 'Add to Film Roll'}
            className="font-dm-mono"
            style={{
              padding: '6px 10px', fontSize: '14px', letterSpacing: 0,
              border: '1px solid',
              borderColor: photo.filmRoll ? '#9c5a3c' : 'rgba(201,180,154,0.4)',
              backgroundColor: photo.filmRoll ? 'rgba(156,90,60,0.15)' : 'transparent',
              color: photo.filmRoll ? '#9c5a3c' : '#c9b49a',
              cursor: 'pointer',
              opacity: toggling === photo.id ? 0.5 : 1, borderRadius: '2px',
            }}>
            {toggling === photo.id ? '…' : '🎞'}
          </button>
          <button
            onClick={() => deletePhoto(photo.id)}
            disabled={deleting === photo.id}
            className="font-dm-mono"
            style={{
              padding: '6px 12px', fontSize: '10px', letterSpacing: '0.1em',
              textTransform: 'uppercase', border: '1px solid rgba(156,90,60,0.4)',
              backgroundColor: 'transparent', color: '#9c5a3c', cursor: 'pointer',
              opacity: deleting === photo.id ? 0.5 : 1, borderRadius: '2px',
            }}>
            {deleting === photo.id ? '…' : 'Remove'}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Main admin page ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  const loadPhotos = useCallback(async (tok: string) => {
    setLoadingPhotos(true)
    const res = await fetch('/api/admin/photos', { headers: { 'x-admin-token': tok } })
    if (res.ok) setPhotos(await res.json())
    setLoadingPhotos(false)
  }, [])

  // Read sessionStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = sessionStorage.getItem('admin-token')
    if (stored) {
      setToken(stored)
      loadPhotos(stored)
    }
  }, [loadPhotos])

  const handleAuth = (tok: string) => {
    setToken(tok)
    loadPhotos(tok)
  }

  if (!token) return <PasswordGate onAuth={handleAuth} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f0e8', padding: '60px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '48px' }}>
          <div>
            <a href="/" className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '11px', letterSpacing: '0.1em', textDecoration: 'none' }}>
              ← Back to site
            </a>
            <h1 className="font-playfair" style={{ color: '#3d2b1f', fontSize: '36px', fontStyle: 'italic', marginTop: '8px' }}>
              Upload Photos
            </h1>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem('admin-token'); setToken(null) }}
            className="font-dm-mono"
            style={{ background: 'none', border: 'none', color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>

        {/* Upload form */}
        <div style={{ backgroundColor: '#faf7f2', border: '1px solid rgba(201,180,154,0.4)', borderRadius: '4px', padding: '32px', marginBottom: '40px' }}>
          <h2 className="font-playfair" style={{ color: '#3d2b1f', fontSize: '20px', marginBottom: '24px' }}>
            Add a new photo
          </h2>
          <UploadForm token={token} onUploaded={() => loadPhotos(token)} />
        </div>

        {/* Existing photos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '20px' }}>
            <h2 className="font-playfair" style={{ color: '#3d2b1f', fontSize: '20px' }}>
              Portfolio ({photos.length} photos)
            </h2>
            <p className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '10px', letterSpacing: '0.08em' }}>
              🎞 = show in Film Roll
            </p>
          </div>
          {loadingPhotos
            ? <p className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '11px' }}>Loading…</p>
            : <PhotoList photos={photos} token={token} onDeleted={() => loadPhotos(token)} />
          }
        </div>
      </div>
    </div>
  )
}
