'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { warmGradient, photoSrc } from '@/lib/utils'

const words = ['Analogue', 'stillness', 'grain', 'light']

const heroSlots = [
  { gradient: warmGradient(0), span: true },
  { gradient: warmGradient(2) },
  { gradient: warmGradient(1) },
]

export default function Hero({ heroPhotos = [] }: { heroPhotos?: string[] }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])
  const filmCount = useTransform(scrollYProgress, [0, 1], [1, 36])

  const headline = ['Telling stories', 'through light,', 'warmth &', 'detail.']

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        alignItems: 'center',
        padding: '100px 40px 60px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#faf7f2',
      }}
      className="hero-grid"
    >
      {/* Floating mood words */}
      {words.map((word, i) => (
        <span
          key={word}
          className="font-playfair"
          aria-hidden="true"
          style={{
            position: 'absolute',
            color: '#c9b49a',
            opacity: 0.06,
            fontSize: 'clamp(48px, 8vw, 96px)',
            fontStyle: 'italic',
            userSelect: 'none',
            pointerEvents: 'none',
            top: `${15 + i * 20}%`,
            right: `${5 + (i % 2) * 8}%`,
            whiteSpace: 'nowrap',
          }}
        >
          {word}
        </span>
      ))}

      {/* Left: text */}
      <div style={{ maxWidth: 540, position: 'relative', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-dm-mono"
          style={{
            color: '#9c5a3c',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: '28px',
          }}
        >
          Photography Rooted in Everyday Beauty
        </motion.p>

        <h1
          className="font-playfair"
          style={{
            fontSize: 'clamp(38px, 6vw, 76px)',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#3d2b1f',
            marginBottom: '32px',
            overflow: 'hidden',
          }}
        >
          {headline.map((line, i) => (
            <span
              key={i}
              style={{ display: 'block', overflow: 'hidden' }}
            >
              <motion.span
                style={{ display: 'block', fontStyle: i % 2 === 1 ? 'italic' : 'normal' }}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-lora"
          style={{ color: '#7a5c44', fontSize: '16px', lineHeight: 1.7, marginBottom: '40px', maxWidth: 380 }}
        >
          Singapore-based photographer specialising in lifestyle, portrait, travel, and the quiet beauty of everyday moments — shot on Fujifilm.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <a
            href="#gallery"
            className="font-dm-mono cta-btn"
            style={{
              display: 'inline-block',
              padding: '13px 28px',
              border: '1.5px solid #3d2b1f',
              color: '#3d2b1f',
              textDecoration: 'none',
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              position: 'relative',
              overflow: 'hidden',
              transition: 'color 0.3s',
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>View Gallery</span>
          </a>
          <button
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="font-dm-mono"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#9c5a3c',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: '1px solid #c9b49a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: '#c9b49a',
            }}>↓</span>
            Scroll
          </button>
        </motion.div>
      </div>

      {/* Right: photo collage */}
      <motion.div
        style={{ y }}
        className="hero-collage"
      >
        {heroSlots.map((slot, i) => (
          <div
            key={i}
            className="gallery-item"
            style={{
              background: slot.gradient,
              borderRadius: '2px',
              gridRow: slot.span ? 'span 2' : undefined,
              transition: 'transform 0.4s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.02)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
          >
            {heroPhotos[i] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc(heroPhotos[i])}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}

        {/* Film counter */}
        <motion.div
          className="font-dm-mono"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            color: '#f5f0e8',
            fontSize: '10px',
            letterSpacing: '0.1em',
            backgroundColor: 'rgba(61,43,31,0.7)',
            padding: '3px 7px',
            borderRadius: '2px',
          }}
        >
          <motion.span>{filmCount.get().toFixed(0).padStart(2, '0')}</motion.span>/36
        </motion.div>
      </motion.div>

      <style>{`
        @media (min-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 60px;
            padding: 120px 60px 80px !important;
          }
          .hero-collage {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(2, 200px);
            gap: 12px;
            position: relative;
          }
        }
        .hero-collage {
          display: none;
        }
        @media (min-width: 768px) {
          .hero-collage { display: grid !important; }
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #3d2b1f;
          transform: translateX(-101%);
          transition: transform 0.3s ease;
          z-index: 0;
        }
        .cta-btn:hover::before { transform: translateX(0); }
        .cta-btn:hover { color: #f5f0e8 !important; }
      `}</style>
    </section>
  )
}
