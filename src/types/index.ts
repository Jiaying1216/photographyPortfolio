export type Photo = {
  id: string
  src: string
  alt: string
  category: 'travel' | 'portrait' | 'nature' | 'street'
  location: string
  title: string
  year: number
  aspectRatio: '3/4' | '4/3' | '2/3' | '1/1'
}

export type NavLink = {
  label: string
  href: string
}

export type GearItem = {
  label: string
  value: string
}
