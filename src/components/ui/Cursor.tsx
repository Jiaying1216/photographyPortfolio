'use client'

import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  const ringPos = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)

  const [visible, setVisible] = useState(false)
  const [ringSize, setRingSize] = useState(36)
  const [showLabel, setShowLabel] = useState(false)

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    setVisible(true)

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`
      }
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY + 24}px)`
      }

      const target = e.target as Element
      const isInteractive = target.closest('a, button, .gallery-item')
      setRingSize(isInteractive ? 56 : 36)
      setShowLabel(!!target.closest('.gallery-item'))
    }

    const onDown = () => setRingSize(28)
    const onUp = () => setRingSize(36)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    const animate = () => {
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.12
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.12

      if (ringRef.current) {
        const half = ringSize / 2
        ringRef.current.style.transform = `translate(${ringPos.current.x - half}px, ${ringPos.current.y - half}px)`
        ringRef.current.style.width = `${ringSize}px`
        ringRef.current.style.height = `${ringSize}px`
      }

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(rafId.current)
    }
  }, [ringSize])

  if (!visible) return null

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#9c5a3c',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          borderRadius: '50%',
          border: `1.5px solid #9c5a3c`,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform, width, height',
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
        }}
      />
      {/* "View" label */}
      <div
        ref={labelRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          fontFamily: 'var(--font-dm-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: '#9c5a3c',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: showLabel ? 1 : 0,
          transition: 'opacity 0.2s ease',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        View
      </div>
    </>
  )
}
