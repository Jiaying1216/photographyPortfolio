export type Photo = {
  id: string
  src: string
  alt: string
  category: 'travel' | 'portrait' | 'nature' | 'street' | 'pet' | 'food' | 'family' | 'graduation'
  location: string
  title: string
  year: number
  aspectRatio: '3/4' | '4/3' | '2/3' | '1/1'
  filmRoll?: boolean
}

export type NavLink = {
  label: string
  href: string
}

export type GearItem = {
  label: string
  value: string
}
