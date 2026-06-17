'use client'

import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Work',    href: '#gallery' },
  { label: 'Film',    href: '#film' },
  { label: 'About',   href: '#about' },
  { label: 'Contact', href: '#contact' },
]

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const handleLink = (href: string) => {
    onClose()
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }, 350)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#3d2b1f',
            zIndex: 9000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top bar — always occupies the same row as the nav */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '18px 24px',
            flexShrink: 0,
          }}>
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              aria-label="Close menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              {[0, 1].map(i => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '22px',
                    height: '1.5px',
                    backgroundColor: '#c9b49a',
                    transform: i === 0 ? 'translateY(3.25px) rotate(45deg)' : 'translateY(-3.25px) rotate(-45deg)',
                  }}
                />
              ))}
            </motion.button>
          </div>

          {/* Centred links area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="font-dm-mono"
              style={{ color: '#c9b49a', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '-20px' }}
            >
              Ying · Singapore · Fujifilm X-T4
            </motion.p>

            {links.map((link, i) => (
              <motion.button
                key={link.label}
                onClick={() => handleLink(link.href)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="font-playfair"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f5f0e8',
                  fontSize: 'clamp(36px, 8vw, 64px)',
                  fontStyle: 'italic',
                  cursor: 'pointer',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#c9b49a')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#f5f0e8')}
              >
                {link.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
