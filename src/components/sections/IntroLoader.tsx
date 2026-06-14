'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IntroLoader() {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Only show once per session
    if (typeof window !== 'undefined' && sessionStorage.getItem('intro-seen')) {
      setShow(false)
      return
    }

    let current = 0
    const tick = () => {
      const jump = Math.floor(Math.random() * 11) + 4
      current = Math.min(current + jump, 100)
      setCount(current)
      if (current < 100) {
        setTimeout(tick, 50)
      } else {
        setTimeout(() => {
          setDone(true)
          sessionStorage.setItem('intro-seen', '1')
        }, 400)
      }
    }

    setTimeout(tick, 200)
  }, [])

  return (
    <AnimatePresence>
      {show && !done && (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#3d2b1f',
            zIndex: 9990,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '32px',
          }}
        >
          <h1
            className="font-playfair"
            style={{
              color: '#f5f0e8',
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            }}
          >
            Ying
          </h1>

          {/* Progress bar */}
          <div
            style={{
              width: 'min(280px, 60vw)',
              height: '1px',
              backgroundColor: 'rgba(201,180,154,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                backgroundColor: '#c9b49a',
                width: `${count}%`,
                transition: 'width 0.05s linear',
              }}
            />
          </div>

          {/* Counter */}
          <span
            className="font-dm-mono"
            style={{
              color: '#7a5c44',
              fontSize: '12px',
              letterSpacing: '0.15em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {String(count).padStart(3, '0')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
