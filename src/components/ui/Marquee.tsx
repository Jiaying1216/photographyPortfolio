interface MarqueeProps {
  text: string
  separator?: string
  className?: string
  speed?: number
  style?: React.CSSProperties
}

import type React from 'react'

export default function Marquee({
  text,
  separator = '·',
  className = '',
  style,
}: MarqueeProps) {
  const repeated = Array(8).fill(`${text} ${separator} `).join('')

  return (
    <div
      style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}
      className={className}
    >
      <span
        style={{
          display: 'inline-block',
          animation: 'marquee 28s linear infinite',
        }}
      >
        {repeated}
        {repeated}
      </span>
    </div>
  )
}
