'use client'

import { useRef, useState } from 'react'
import type { Photo } from '@/types'
import { warmGradient, photoSrc } from '@/lib/utils'

export default function FilmStrip({ photos }: { photos: Photo[] }) {
  // Show only film-roll-flagged photos; fall back to all if none are flagged
  const frames = photos.filter(p => p.filmRoll).length > 0
    ? photos.filter(p => p.filmRoll)
    : photos
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const [dragged, setDragged] = useState(false)

  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return
    isDragging.current = true
    startX.current = e.pageX - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
    setDragged(false)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return
    e.preventDefault()
    const x = e.pageX - trackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    trackRef.current.scrollLeft = scrollLeft.current - walk
    if (Math.abs(walk) > 4) setDragged(true)
  }

  const onMouseUp = () => { isDragging.current = false }

  const onTouchStart = (e: React.TouchEvent) => {
    if (!trackRef.current) return
    startX.current = e.touches[0].pageX
    scrollLeft.current = trackRef.current.scrollLeft
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return
    const walk = (startX.current - e.touches[0].pageX) * 1.2
    trackRef.current.scrollLeft = scrollLeft.current + walk
  }

  const SPROCKET_SIZE = 14

  return (
    <section
      id="film"
      style={{ backgroundColor: '#3d2b1f', padding: '60px 0', overflow: 'hidden', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ padding: '0 40px 40px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Contact Sheet
          </p>
          <h2 className="font-playfair" style={{ color: '#f5f0e8', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em' }}>
            The Film Roll
          </h2>
        </div>
        <p
          className="font-dm-mono"
          style={{
            color: '#7a5c44',
            fontSize: '11px',
            letterSpacing: '0.1em',
            animation: 'pulse-hint 2s ease-in-out infinite',
          }}
        >
          ← drag to explore →
        </p>
      </div>

      {/* Sprocket holes top */}
      <div style={{ height: SPROCKET_SIZE, background: `repeating-linear-gradient(90deg, transparent, transparent 28px, #2a1e15 28px, #2a1e15 44px)`, marginBottom: '6px' }} />

      {/* Scrollable track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          padding: '0 40px',
          userSelect: 'none',
          cursor: isDragging.current ? 'grabbing' : 'grab',
        }}
      >
        {[...frames, ...frames.slice(0, Math.min(4, frames.length))].map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="gallery-item"
            style={{
              flexShrink: 0,
              width: 220,
              position: 'relative',
              background: warmGradient(i),
              border: '2px solid #2a1e15',
              overflow: 'hidden',
            }}
          >
            <div style={{ paddingTop: '120%', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc(photo.src)}
                alt={photo.alt}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            {/* Frame number */}
            <div
              className="font-dm-mono"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '6px 8px',
                backgroundColor: 'rgba(30,20,14,0.7)',
                color: '#c9b49a',
                fontSize: '9px',
                letterSpacing: '0.12em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ opacity: 0.6 }}>{photo.category.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sprocket holes bottom */}
      <div style={{ height: SPROCKET_SIZE, background: `repeating-linear-gradient(90deg, transparent, transparent 28px, #2a1e15 28px, #2a1e15 44px)`, marginTop: '6px' }} />

      <style>{`
        @keyframes pulse-hint {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  )
}
