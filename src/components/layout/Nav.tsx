'use client'

import { useState, useEffect } from 'react'
import MobileMenu from './MobileMenu'

const links = [
  { label: 'Work',    href: '#gallery' },
  { label: 'Film',    href: '#film' },
  { label: 'About',   href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = ['gallery', 'film', 'about', 'contact']
    const observers: IntersectionObserver[] = []

    sections.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(`#${id}`) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 8000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: scrolled ? '14px 40px' : '22px 40px',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          backgroundColor: scrolled ? 'rgba(250,247,242,0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid rgba(201,180,154,0.3)' : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <a
          href="#top"
          className="font-playfair"
          style={{
            color: '#3d2b1f',
            fontStyle: 'italic',
            fontSize: '20px',
            fontWeight: 500,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          Ying's Photography Portfolio
        </a>

        {/* Desktop links */}
        <div
          style={{ display: 'flex', gap: '36px', alignItems: 'center' }}
          className="hidden md:flex"
        >
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="font-dm-mono nav-link"
              data-active={active === link.href}
              style={{
                color: active === link.href ? '#9c5a3c' : '#7a5c44',
                textDecoration: 'none',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                position: 'relative',
                paddingBottom: '2px',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '1px',
                  width: active === link.href ? '100%' : '0%',
                  backgroundColor: '#9c5a3c',
                  transition: 'width 0.25s ease',
                }}
              />
            </a>
          ))}
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden"
          aria-label="Toggle menu"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'none',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                backgroundColor: '#3d2b1f',
                transition: 'all 0.3s ease',
                transformOrigin: 'center',
                transform: menuOpen
                  ? i === 0 ? 'translateY(6.5px) rotate(45deg)'
                  : i === 2 ? 'translateY(-6.5px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
              }}
            />
          ))}
        </button>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      <style>{`
        @media (min-width: 768px) {
          .hidden { display: none; }
          .md\\:flex { display: flex !important; }
          .md\\:hidden { display: none !important; }
        }
        .nav-link:hover > span { width: 100% !important; }
        .nav-link:hover { color: #9c5a3c !important; }
      `}</style>
    </>
  )
}
