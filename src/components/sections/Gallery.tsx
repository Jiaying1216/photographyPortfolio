'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import type { Photo } from '@/types'
import { warmGradient, photoSrc } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Marquee from '@/components/ui/Marquee'

type Filter = 'all' | Photo['category']
const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',        value: 'all' },
  { label: 'Travel',     value: 'travel' },
  { label: 'Portrait',   value: 'portrait' },
  { label: 'Nature',     value: 'nature' },
  { label: 'Street',     value: 'street' },
  { label: 'Pet',        value: 'pet' },
  { label: 'Food',       value: 'food' },
  { label: 'Family',     value: 'family' },
  { label: 'Graduation', value: 'graduation' },
]

function GalleryCard({ photo, index, onClick }: { photo: Photo; index: number; onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const [hovered, setHovered] = useState(false)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotX.set(((e.clientY - cy) / rect.height) * -12)
    rotY.set(((e.clientX - cx) / rect.width) * 12)
  }, [rotX, rotY])

  const onMouseLeave = () => {
    rotX.set(0)
    rotY.set(0)
    setHovered(false)
  }

  const aspectPad: Record<Photo['aspectRatio'], string> = {
    '3/4':  '133%',
    '4/3':  '75%',
    '2/3':  '150%',
    '1/1':  '100%',
  }

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="gallery-item"
      style={{
        marginBottom: '16px',
        breakInside: 'avoid',
        position: 'relative',
        cursor: 'none',
        perspective: '800px',
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Corner brackets */}
        {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
          <span
            key={pos}
            style={{
              position: 'absolute',
              width: hovered ? 20 : 12,
              height: hovered ? 20 : 12,
              borderColor: '#f5f0e8',
              borderStyle: 'solid',
              zIndex: 2,
              transition: 'width 0.2s, height 0.2s',
              ...(pos === 'tl' ? { top: 8, left: 8, borderWidth: '1px 0 0 1px' } :
                  pos === 'tr' ? { top: 8, right: 8, borderWidth: '1px 1px 0 0' } :
                  pos === 'bl' ? { bottom: 8, left: 8, borderWidth: '0 0 1px 1px' } :
                                 { bottom: 8, right: 8, borderWidth: '0 1px 1px 0' }),
            }}
          />
        ))}

        {/* Image area */}
        <div
          style={{
            position: 'relative',
            paddingTop: aspectPad[photo.aspectRatio],
            background: warmGradient(index),
            overflow: 'hidden',
            borderRadius: '2px',
          }}
        >
          {/* Real photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(photo.src)}
            alt={photo.alt}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(61,43,31,0.85) 0%, transparent 50%)',
              zIndex: 1,
            }}
          />

          {/* Caption */}
          <motion.div
            animate={{ y: hovered ? 0 : 12, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              zIndex: 2,
            }}
          >
            <p
              className="font-playfair"
              style={{ color: '#f5f0e8', fontSize: '15px', fontStyle: 'italic', marginBottom: '2px' }}
            >
              {photo.title}
            </p>
            <p
              className="font-dm-mono"
              style={{ color: '#c9b49a', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {photo.location} · {photo.year}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <motion.div
      key="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30,20,14,0.96)',
        zIndex: 9500,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}
    >
      <motion.div
        key={photo.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        onClick={e => e.stopPropagation()}
        style={{ textAlign: 'center', maxWidth: '80vw', maxHeight: '75vh' }}
      >
        <div
          style={{
            background: warmGradient(parseInt(photo.id) - 1),
            width: 'min(600px, 80vw)',
            height: 'min(400px, 60vh)',
            margin: '0 auto',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc(photo.src)}
            alt={photo.alt}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
        <p className="font-playfair" style={{ color: '#f5f0e8', fontSize: '18px', fontStyle: 'italic', marginTop: '20px' }}>
          {photo.title}
        </p>
        <p className="font-dm-mono" style={{ color: '#7a5c44', fontSize: '11px', letterSpacing: '0.1em', marginTop: '6px', textTransform: 'uppercase' }}>
          {photo.location} · {photo.year} · {photo.category}
        </p>
        <p className="font-dm-mono" style={{ color: '#7a5c44', fontSize: '10px', marginTop: '8px' }}>
          {index + 1} / {total}
        </p>
      </motion.div>

      {/* Navigation */}
      <button onClick={e => { e.stopPropagation(); onPrev() }} style={navBtnStyle}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={e => { e.stopPropagation(); onNext() }} style={{ ...navBtnStyle, right: 24, left: 'auto' }}>
        <ChevronRight size={20} />
      </button>

      {/* Close */}
      <button onClick={onClose} style={closeBtnStyle}>
        <X size={18} />
      </button>
    </motion.div>
  )
}

const navBtnStyle: React.CSSProperties = {
  position: 'fixed',
  left: 24,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(201,180,154,0.1)',
  border: '1px solid rgba(201,180,154,0.3)',
  color: '#c9b49a',
  width: 44,
  height: 44,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'none',
  transition: 'background 0.2s',
}

const closeBtnStyle: React.CSSProperties = {
  position: 'fixed',
  top: 24,
  right: 24,
  background: 'rgba(201,180,154,0.1)',
  border: '1px solid rgba(201,180,154,0.3)',
  color: '#c9b49a',
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'none',
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = filter === 'all' ? photos : photos.filter(p => p.category === filter)

  const openLightbox = (i: number) => setLightboxIndex(i)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto = () => setLightboxIndex(i => i === null ? null : (i - 1 + filtered.length) % filtered.length)
  const nextPhoto = () => setLightboxIndex(i => i === null ? null : (i + 1) % filtered.length)

  return (
    <section id="gallery" style={{ backgroundColor: '#f5f0e8', paddingBottom: '80px' }}>
      {/* Marquee divider */}
      <div style={{ backgroundColor: '#3d2b1f', padding: '12px 0', overflow: 'hidden' }}>
        <Marquee
          text="Photography · Film · Travel · Portrait · Nature · Street"
          className="font-dm-mono"
          style={{ color: '#c9b49a', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' } as React.CSSProperties}
        />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px 0' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Selected Work
          </p>
          <h2 className="font-playfair" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#3d2b1f', letterSpacing: '-0.02em' }}>
            The <em style={{ fontStyle: 'italic', color: '#9c5a3c' }}>Portfolio</em>
          </h2>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="font-dm-mono"
              style={{
                padding: '7px 18px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: '1px solid',
                borderColor: filter === f.value ? '#9c5a3c' : 'rgba(122,92,68,0.3)',
                backgroundColor: filter === f.value ? '#9c5a3c' : 'transparent',
                color: filter === f.value ? '#f5f0e8' : '#7a5c44',
                cursor: 'none',
                borderRadius: '2px',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div
          style={{
            columns: '3',
            columnGap: '16px',
          }}
          className="masonry-grid"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, i) => (
              <GalleryCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => openLightbox(i)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photo={filtered[lightboxIndex]}
            index={lightboxIndex}
            total={filtered.length}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px)  { .masonry-grid { columns: 1 !important; } }
        @media (min-width: 641px) and (max-width: 1023px) { .masonry-grid { columns: 2 !important; } }
      `}</style>
    </section>
  )
}
