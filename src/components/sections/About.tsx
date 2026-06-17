'use client'

import RevealOnScroll from '@/components/ui/RevealOnScroll'
import { warmGradient, photoSrc } from '@/lib/utils'

const gear = [
  { label: 'Camera',       value: 'Fujifilm X-T4' },
  { label: 'Specialities', value: 'Lifestyle · Portrait · Travel' },
  { label: 'Based in',     value: 'Singapore' },
]

export default function About({ aboutPhoto = '' }: { aboutPhoto?: string }) {
  return (
    <section
      id="about"
      style={{ backgroundColor: '#faf7f2', padding: '100px 40px' }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '60px',
          alignItems: 'start',
        }}
        className="about-grid"
      >
        {/* Left: Photo */}
        <RevealOnScroll direction="left">
          <div style={{ position: 'relative', maxWidth: 420 }}>
            {/* Shadow backdrop */}
            <div
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: -16,
                bottom: -16,
                background: warmGradient(3),
                opacity: 0.4,
                borderRadius: '2px',
                zIndex: 0,
              }}
            />

            {/* Photo */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: warmGradient(4),
                borderRadius: '2px',
                aspectRatio: '4/5',
                overflow: 'hidden',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.02)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            >
              {aboutPhoto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoSrc(aboutPhoto)}
                  alt="Ying"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>

            {/* Vertical film label */}
            <div
              className="font-dm-mono"
              style={{
                position: 'absolute',
                right: -40,
                top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                color: '#c9b49a',
                fontSize: '9px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                zIndex: 2,
              }}
            >
              Kodak Portra 400 · 35mm · SG
            </div>

            {/* Stat badge */}
            <div
              className="font-dm-mono"
              style={{
                position: 'absolute',
                bottom: -20,
                left: -12,
                backgroundColor: '#3d2b1f',
                color: '#c9b49a',
                padding: '10px 14px',
                borderRadius: '3px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                transform: 'rotate(3deg)',
                zIndex: 3,
                transition: 'transform 0.3s ease',
                cursor: 'default',
                boxShadow: '0 4px 16px rgba(61,43,31,0.3)',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.04)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'rotate(3deg)')}
            >
              <div style={{ fontSize: '18px', fontWeight: 400, color: '#f5f0e8', lineHeight: 1 }}>36</div>
              <div style={{ opacity: 0.7, marginTop: '2px' }}>exp per roll</div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Right: Bio */}
        <RevealOnScroll direction="right" delay={0.15}>
          <div style={{ paddingTop: '20px' }}>
            <p className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' }}>
              About Ying
            </p>
            <h2 className="font-playfair" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#3d2b1f', letterSpacing: '-0.02em', marginBottom: '28px', lineHeight: 1.15 }}>
              Finding the <em style={{ fontStyle: 'italic', color: '#9c5a3c' }}>extraordinary</em><br />
              in the ordinary,<br />
              one frame at a time.
            </h2>

            <div className="font-lora" style={{ color: '#7a5c44', fontSize: '16px', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
              <p>
                Hi, I&apos;m Ying — a Singapore-based photographer with a passion for capturing
                the warmth and authenticity of everyday life. My work is rooted in a genuine love
                for visual storytelling: the kind that feels real, intimate, and quietly meaningful.
              </p>
              <p>
                My style gravitates toward warm tones, natural light, and candid moments — whether
                that&apos;s a family gathering, a beautifully plated dish, a pet in afternoon light,
                or a travel scene that stopped me in my tracks. I shoot across lifestyle, portrait,
                food, travel, and street photography, always looking for the emotion within the ordinary.
              </p>
              <p>
                Self-taught and driven by curiosity, I&apos;ve developed my eye through years of shooting
                and a deep commitment to craft. Every image I make is intentional — composed with care
                and edited to feel timeless rather than trendy.
              </p>
            </div>

            {/* Gear grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', backgroundColor: 'rgba(201,180,154,0.3)', border: '1px solid rgba(201,180,154,0.3)' }}>
              {gear.map(item => (
                <div
                  key={item.label}
                  style={{ padding: '16px 20px', backgroundColor: '#faf7f2' }}
                >
                  <p className="font-dm-mono" style={{ color: '#c9b49a', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {item.label}
                  </p>
                  <p className="font-lora" style={{ color: '#3d2b1f', fontSize: '14px', fontWeight: 500 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: 2fr 3fr !important;
            gap: 80px !important;
          }
        }
      `}</style>
    </section>
  )
}
