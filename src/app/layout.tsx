import type { Metadata } from 'next'
import { Playfair_Display, Lora, DM_Mono } from 'next/font/google'
import './globals.css'
import GrainOverlay from '@/components/ui/GrainOverlay'
import Cursor from '@/components/ui/Cursor'

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const lora = Lora({
  variable: '--font-lora-body',
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ying — Photography',
  description: 'Personal photography portfolio by Ying. Travel, portrait, nature and street photography based in Singapore.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      id="top"
      className={`${playfairDisplay.variable} ${lora.variable} ${dmMono.variable}`}
    >
      <body>
        <GrainOverlay />
        <Cursor />
        {children}
      </body>
    </html>
  )
}
