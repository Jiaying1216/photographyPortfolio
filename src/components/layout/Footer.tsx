'use client'

export default function Footer() {
  return (
    <footer
      style={{
        padding: '28px 40px',
        borderTop: '1px solid rgba(201,180,154,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3d2b1f',
      }}
    >
      <span
        className="font-playfair"
        style={{ color: '#c9b49a', fontStyle: 'italic', fontSize: '15px' }}
      >
        Ying — Photography
      </span>

      <span
        className="font-dm-mono"
        style={{ color: '#7a5c44', fontSize: '11px', letterSpacing: '0.08em' }}
      >
        © 2025 · Shot with love in SG
      </span>

      <a
        href="#top"
        className="font-dm-mono"
        style={{
          color: '#c9b49a',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => ((e.target as HTMLElement).style.color = '#9c5a3c')}
        onMouseLeave={e => ((e.target as HTMLElement).style.color = '#c9b49a')}
      >
        ↑ Back to top
      </a>
    </footer>
  )
}
