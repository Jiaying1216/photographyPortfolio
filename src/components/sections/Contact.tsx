'use client'

import { useState, useEffect, useRef } from 'react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const phrases = [
  'Open to collaborations and creative projects.',
  'Available for portrait and lifestyle shoots.',
  "Let's create something meaningful together.",
  "Brand work, events, travel — let's talk ✦",
]

const enquiryTypes = [
  'Portrait Session',
  'Brand / Commercial',
  'Event Coverage',
  'Travel / Lifestyle',
  'Collaboration',
  'General Enquiry',
]

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/yings.png' },
  { label: 'Email',     href: 'mailto:l.jiaying1216@gmail.com' },
]

function Typewriter({ active }: { active: boolean }) {
  const [display, setDisplay] = useState('')
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [typing, setTyping] = useState(true)
  const [charIdx, setCharIdx] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true

    let currentPhrase = 0
    let currentChar = 0
    let isTyping = true
    let timeoutId: ReturnType<typeof setTimeout>

    const tick = () => {
      const phrase = phrases[currentPhrase]

      if (isTyping) {
        currentChar++
        setDisplay(phrase.slice(0, currentChar))
        setCharIdx(currentChar)

        if (currentChar >= phrase.length) {
          isTyping = false
          timeoutId = setTimeout(tick, 2200)
          return
        }
        timeoutId = setTimeout(tick, 42)
      } else {
        currentChar--
        setDisplay(phrase.slice(0, currentChar))
        setCharIdx(currentChar)

        if (currentChar <= 0) {
          isTyping = true
          currentPhrase = (currentPhrase + 1) % phrases.length
          setPhraseIdx(currentPhrase)
          timeoutId = setTimeout(tick, 300)
          return
        }
        timeoutId = setTimeout(tick, 22)
      }

      setTyping(isTyping)
    }

    timeoutId = setTimeout(tick, 600)
    return () => clearTimeout(timeoutId)
  }, [active])

  return (
    <span className="font-lora" style={{ color: '#9c5a3c', fontStyle: 'italic' }}>
      {display}
      <span style={{ borderRight: '1.5px solid #9c5a3c', marginLeft: '1px', animation: 'blink 1s step-end infinite' }} />
    </span>
  )
}

export default function Contact() {
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [form, setForm] = useState({ name: '', email: '', enquiry: '', message: '' })

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire up to email service
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(201,180,154,0.4)',
    color: '#3d2b1f',
    fontSize: '15px',
    fontFamily: 'var(--font-lora-body), Georgia, serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ backgroundColor: '#f5f0e8', padding: '100px 40px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Giant decorative HELLO */}
      <div
        className="font-playfair"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(120px, 20vw, 240px)',
          fontStyle: 'italic',
          color: '#c9b49a',
          opacity: 0.05,
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}
      >
        HELLO
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <RevealOnScroll>
          {/* Eyebrow with lines */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,180,154,0.5)', maxWidth: 80 }} />
            <span className="font-dm-mono" style={{ color: '#9c5a3c', fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              Say hello
            </span>
            <span style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,180,154,0.5)', maxWidth: 80 }} />
          </div>

          <h2 className="font-playfair" style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 400, color: '#3d2b1f', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Let&apos;s work on something <em style={{ fontStyle: 'italic', color: '#9c5a3c' }}>together.</em>
          </h2>

          <p className="font-lora" style={{ color: '#7a5c44', fontSize: '16px', marginBottom: '48px', lineHeight: 1.7 }}>
            <Typewriter active={inView} />
          </p>
        </RevealOnScroll>

        {/* Form */}
        <RevealOnScroll delay={0.15}>
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginBottom: '28px' }} className="form-row">
              {(['name', 'email'] as const).map(field => (
                <div key={field}>
                  <label className="font-dm-mono" style={{ display: 'block', color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {field === 'name' ? 'Your Name' : 'Email Address'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    required
                    placeholder={field === 'name' ? 'Your name' : 'your@email.com'}
                    value={form[field]}
                    onChange={handleChange}
                    style={inputStyle}
                    onFocus={e => {
                      e.target.style.borderBottomColor = '#9c5a3c'
                      e.target.style.boxShadow = '0 2px 0 rgba(156,90,60,0.2)'
                    }}
                    onBlur={e => {
                      e.target.style.borderBottomColor = 'rgba(201,180,154,0.4)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label className="font-dm-mono" style={{ display: 'block', color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Enquiry Type
              </label>
              <select
                name="enquiry"
                value={form.enquiry}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: 'none', cursor: 'none' }}
                onFocus={e => {
                  e.target.style.borderBottomColor = '#9c5a3c'
                }}
                onBlur={e => {
                  e.target.style.borderBottomColor = 'rgba(201,180,154,0.4)'
                }}
              >
                <option value="">Select one…</option>
                {enquiryTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <label className="font-dm-mono" style={{ display: 'block', color: '#9c5a3c', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Message
              </label>
              <textarea
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project or idea..."
              style={{ ...inputStyle, resize: 'none' }}
                onFocus={e => {
                  e.target.style.borderBottomColor = '#9c5a3c'
                  e.target.style.boxShadow = '0 2px 0 rgba(156,90,60,0.2)'
                }}
                onBlur={e => {
                  e.target.style.borderBottomColor = 'rgba(201,180,154,0.4)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                className="font-dm-mono send-btn"
                style={{
                  padding: '14px 40px',
                  backgroundColor: '#3d2b1f',
                  color: '#f5f0e8',
                  border: 'none',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'color 0.3s',
                }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>Send Message →</span>
              </button>
            </div>
          </form>
        </RevealOnScroll>

        {/* Social links */}
        <RevealOnScroll delay={0.25}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '56px' }}>
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="font-dm-mono social-link"
                style={{
                  color: '#7a5c44',
                  textDecoration: 'none',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  paddingBottom: '2px',
                  borderBottom: '1px solid transparent',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </RevealOnScroll>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .send-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #9c5a3c;
          transform: translateX(-101%);
          transition: transform 0.3s ease;
        }
        .send-btn:hover::before { transform: translateX(0); }
        .social-link:hover {
          color: #9c5a3c !important;
          border-color: #c9b49a !important;
        }
        @media (max-width: 580px) {
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
