'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { upload } from '@vercel/blob/client'
import type { Photo } from '@/types'
import { photoSrc } from '@/lib/utils'

const CATEGORIES = ['travel', 'portrait', 'nature', 'street', 'pet', 'food', 'family', 'graduation'] as const
const ASPECT_RATIOS = ['3/4', '4/3', '2/3', '1/1'] as const

// Resize + compress image in the browser before uploading.
// Caps longest side at 2400px and converts to JPEG @ 85% quality.
// A 15MB RAW export typically comes out under 600KB — 20× faster upload.
function compressImage(file: File, maxPx = 2400, quality = 0.85): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => blob
          ? resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = reject
    img.src = objectUrl
  })
}

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
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [meta, setMeta] = useState({
    title: '', location: '', category: 'travel' as Photo['category'],
    year: new Date().getFullYear(), aspectRatio: '3/4' as Photo['aspectRatio'],
  })

  const pickFiles = useCallback((picked: File[]) => {
    const images = picked.filter(f => f.type.startsWith('image/'))
    if (images.length === 0) return
    setPreviews(prev => {
      prev.forEach(URL.revokeObjectURL)
      return images.map(f => URL.createObjectURL(f))
    })
    setFiles(images)
    setStatus('')
  }, [])

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setFiles(fs => fs.filter((_, idx) => idx !== i))
    setPreviews(ps => ps.filter((_, idx) => idx !== i))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    pickFiles(Array.from(e.dataTransfer.files))
  }, [pickFiles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return
    setUploading(true)

    const newPhotos: Photo[] = []
    const errors: string[] = []

    // Step 1: upload all files to Vercel Blob (compress → upload, one by one)
    for (let i = 0; i < files.length; i++) {
      try {
        setStatus(`Compressing ${i + 1}/${files.length}…`)
        const compressed = await compressImage(files[i])
        const kb = Math.round(compressed.size / 1024)
        setStatus(`Uploading ${i + 1}/${files.length} (${kb} KB)…`)

        const filename = `ying-portfolio/photos/${Date.now()}-${i}.jpg`
        const blob = await upload(filename, compressed, {
          access: 'private',
          handleUploadUrl: '/api/admin/upload',
          clientPayload: token,
        })

        const title = files.length > 1 ? `${meta.title} ${i + 1}` : meta.title
        newPhotos.push({
          id: `${Date.now()}-${i}`,
          src: blob.url,
          alt: `${title} — ${meta.location}`,
          category: meta.category,
          location: meta.location,
          title,
          year: meta.year,
          aspectRatio: meta.aspectRatio,
        })
      } catch (err) {
        errors.push(`Photo ${i + 1}: ${err instanceof Error ? err.message : 'failed'}`)
      }
    }

    // Step 2: write all new photos to metadata in a single API call
    if (newPhotos.length > 0) {
      setStatus('Saving…')
      const metaRes = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ action: 'add-multiple', photos: newPhotos }),
      })
      if (!metaRes.ok) {
        const err = await metaRes.json()
        errors.push(`Metadata: ${err.error}`)
      }
    }

    if (errors.length > 0) {
      setStatus(`Done with errors: ${errors.join(' · ')}`)
    } else {
      setStatus(`Done! ${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added.`)
      previews.forEach(URL.revokeObjectURL)
      setFiles([])
      setPreviews([])
      setMeta({ title: '', location: '', category: 'travel', year: new Date().getFullYear(), aspectRatio: '3/4' })
    }
    setUploading(false)
    onUploaded()
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
          padding: previews.length > 0 ? '16px' : '40px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: '24px',
          backgroundColor: dragging ? 'rgba(156,90,60,0.05)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => pickFiles(Array.from(e.target.files ?? []))}
        />
        {previews.length > 0 ? (
          <div>
            {/* Thumbnail grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}
                  onClick={ev => ev.stopPropagation()}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px', display: 'block' }} />
                  <button type="button" onClick={() => removeFile(i)} style={{
                    position: 'absolute', top: 2, right: 2, width: 18, height: 18,
                    background: 'rgba(61,43,31,0.85)', color: '#f5f0e8', border: 'none',
                    borderRadius: '50%', fontSize: '10px', cursor: 'pointer', lineHeight: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}>✕</button>
                </div>
              ))}
            </div>
            <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.1em' }}>
              {files.length} photo{files.length > 1 ? 's' : ''} selected · click to change
            </p>
          </div>
        ) : (
          <>
            <p className="font-playfair" style={{ color: '#7a5c44', fontSize: '18px', fontStyle: 'italic', marginBottom: '8px' }}>
              Drop photos here
            </p>
            <p className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '11px', letterSpacing: '0.1em' }}>
              or click to browse · select multiple at once
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
        disabled={files.length === 0 || uploading}
        className="font-dm-mono"
        style={{
          width: '100%', padding: '14px', backgroundColor: '#3d2b1f',
          color: '#f5f0e8', border: 'none', fontSize: '11px',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          cursor: files.length > 0 && !uploading ? 'pointer' : 'not-allowed',
          opacity: files.length === 0 || uploading ? 0.5 : 1, borderRadius: '2px',
        }}>
        {uploading ? status : files.length > 1 ? `Add ${files.length} Photos to Portfolio` : 'Add to Portfolio'}
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

// ── Single draggable photo row ──────────────────────────────────────────────
function PhotoRow({
  photo, token, onDelete, onToggle, onUpdate,
}: {
  photo: Photo
  token: string
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string) => Promise<void>
  onUpdate: () => void
}) {
  const dragControls = useDragControls()
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({
    title: photo.title,
    location: photo.location,
    category: photo.category,
    year: photo.year,
    aspectRatio: photo.aspectRatio,
  })

  const saveEdit = async () => {
    setSaving(true)
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'update', photo: { ...photo, ...draft } }),
    })
    setSaving(false)
    setEditing(false)
    onUpdate()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px',
    background: '#fff', border: '1px solid rgba(201,180,154,0.5)',
    color: '#3d2b1f', fontSize: '13px', fontFamily: 'var(--font-lora-body), serif',
    outline: 'none', borderRadius: '2px',
  }

  return (
    <Reorder.Item
      value={photo}
      id={photo.id}
      dragControls={dragControls}
      dragListener={false}
      style={{ listStyle: 'none' }}
    >
      {/* ── Row header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', backgroundColor: editing ? '#f0ebe0' : '#faf7f2',
        border: '1px solid', borderColor: editing ? '#c9b49a' : 'rgba(201,180,154,0.3)',
        borderRadius: editing ? '2px 2px 0 0' : '2px',
        userSelect: 'none', transition: 'background 0.15s',
      }}>
        {/* Drag handle */}
        <div
          onPointerDown={e => dragControls.start(e)}
          style={{ cursor: 'grab', color: '#c9b49a', flexShrink: 0, touchAction: 'none', fontSize: '18px', lineHeight: 1, paddingBottom: '2px' }}
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Thumbnail */}
        <div style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: '2px', overflow: 'hidden',
          background: 'linear-gradient(135deg, #c9b49a, #7a5c44)', position: 'relative',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(photo.src)}
            alt={photo.alt}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="font-lora" style={{ color: '#3d2b1f', fontSize: '14px', fontWeight: 500 }}>{photo.title}</p>
          <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {photo.location} · {photo.year} · {photo.category}
          </p>
        </div>

        {/* Edit toggle */}
        <button
          onClick={() => { setEditing(e => !e); setDraft({ title: photo.title, location: photo.location, category: photo.category, year: photo.year, aspectRatio: photo.aspectRatio }) }}
          className="font-dm-mono"
          style={{
            padding: '6px 12px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            border: '1px solid', borderColor: editing ? '#9c5a3c' : 'rgba(201,180,154,0.4)',
            backgroundColor: editing ? 'rgba(156,90,60,0.1)' : 'transparent',
            color: editing ? '#9c5a3c' : '#7a5c44', cursor: 'pointer', borderRadius: '2px', flexShrink: 0,
          }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>

        {/* Film roll toggle */}
        <button
          onClick={async () => { setToggling(true); await onToggle(photo.id); setToggling(false) }}
          disabled={toggling}
          title={photo.filmRoll ? 'Remove from Film Roll' : 'Add to Film Roll'}
          className="font-dm-mono"
          style={{
            padding: '6px 10px', fontSize: '14px', letterSpacing: 0, border: '1px solid',
            borderColor: photo.filmRoll ? '#9c5a3c' : 'rgba(201,180,154,0.4)',
            backgroundColor: photo.filmRoll ? 'rgba(156,90,60,0.15)' : 'transparent',
            color: photo.filmRoll ? '#9c5a3c' : '#c9b49a',
            cursor: 'pointer', opacity: toggling ? 0.5 : 1, borderRadius: '2px', flexShrink: 0,
          }}>
          {toggling ? '…' : '🎞'}
        </button>

        {/* Delete */}
        <button
          onClick={async () => { setDeleting(true); await onDelete(photo.id); setDeleting(false) }}
          disabled={deleting}
          className="font-dm-mono"
          style={{
            padding: '6px 12px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
            border: '1px solid rgba(156,90,60,0.4)', backgroundColor: 'transparent',
            color: '#9c5a3c', cursor: 'pointer', opacity: deleting ? 0.5 : 1, borderRadius: '2px', flexShrink: 0,
          }}>
          {deleting ? '…' : 'Remove'}
        </button>
      </div>

      {/* ── Inline edit form ── */}
      {editing && (
        <div style={{
          padding: '20px', backgroundColor: '#faf7f2',
          border: '1px solid #c9b49a', borderTop: 'none', borderRadius: '0 0 2px 2px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <Label>Title</Label>
              <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <Label>Location</Label>
              <input value={draft.location} onChange={e => setDraft(d => ({ ...d, location: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <Label>Category</Label>
              <select value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value as Photo['category'] }))}
                style={{ ...inputStyle, appearance: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Year</Label>
              <input type="number" min="2000" max="2099" value={draft.year}
                onChange={e => setDraft(d => ({ ...d, year: parseInt(e.target.value) }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Label>Aspect Ratio</Label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {ASPECT_RATIOS.map(r => (
                <button key={r} type="button" onClick={() => setDraft(d => ({ ...d, aspectRatio: r }))}
                  className="font-dm-mono"
                  style={{
                    padding: '6px 14px', fontSize: '11px', letterSpacing: '0.1em', border: '1px solid', cursor: 'pointer',
                    borderColor: draft.aspectRatio === r ? '#9c5a3c' : 'rgba(201,180,154,0.5)',
                    backgroundColor: draft.aspectRatio === r ? '#9c5a3c' : 'transparent',
                    color: draft.aspectRatio === r ? '#f5f0e8' : '#7a5c44', borderRadius: '2px',
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button onClick={saveEdit} disabled={saving} className="font-dm-mono"
            style={{
              padding: '9px 24px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
              backgroundColor: '#3d2b1f', color: '#f5f0e8', border: 'none',
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: '2px',
            }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
    </Reorder.Item>
  )
}

// ── Photo list ─────────────────────────────────────────────────────────────
function PhotoList({ photos, token, onDeleted }: { photos: Photo[]; token: string; onDeleted: () => void }) {
  const [items, setItems] = useState<Photo[]>(photos)
  const [saving, setSaving] = useState(false)

  // Sync local order when photos are added/deleted from outside
  useEffect(() => { setItems(photos) }, [photos])

  const isDirty = items.map(p => p.id).join() !== photos.map(p => p.id).join()

  const saveOrder = async () => {
    setSaving(true)
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'reorder', photos: items }),
    })
    setSaving(false)
    onDeleted()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from the portfolio?')) return
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'delete', photoId: id }),
    })
    onDeleted()
  }

  const handleToggleFilmRoll = async (id: string) => {
    await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ action: 'toggle-film-roll', photoId: id }),
    })
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
    <div>
      {isDirty && (
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={saveOrder}
            disabled={saving}
            className="font-dm-mono"
            style={{
              padding: '8px 20px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
              backgroundColor: '#3d2b1f', color: '#f5f0e8', border: 'none',
              cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1, borderRadius: '2px',
            }}>
            {saving ? 'Saving…' : 'Save Order'}
          </button>
          <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.08em' }}>
            Order changed — click to save
          </p>
        </div>
      )}
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}
      >
        {items.map(photo => (
          <PhotoRow
            key={photo.id}
            photo={photo}
            token={token}
            onDelete={handleDelete}
            onToggle={handleToggleFilmRoll}
            onUpdate={onDeleted}
          />
        ))}
      </Reorder.Group>
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
