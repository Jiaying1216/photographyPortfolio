import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import IntroLoader from '@/components/sections/IntroLoader'
import Hero from '@/components/sections/Hero'
import Gallery from '@/components/sections/Gallery'
import FilmStrip from '@/components/sections/FilmStrip'
import About from '@/components/sections/About'
import Contact from '@/components/sections/Contact'
import { photos as staticPhotos } from '@/data/photos'
import { isBlobConfigured, getPhotosFromBlob, getSitePhotos } from '@/lib/blob-photos'

async function getPhotos() {
  if (isBlobConfigured()) {
    const blobPhotos = await getPhotosFromBlob()
    if (blobPhotos.length > 0) return blobPhotos
  }
  return staticPhotos
}

export default async function Home() {
  const [photos, sitePhotos] = await Promise.all([
    getPhotos(),
    isBlobConfigured() ? getSitePhotos() : Promise.resolve({ hero: [], about: '' }),
  ])

  return (
    <>
      <IntroLoader />
      <Nav />
      <main>
        <Hero heroPhotos={sitePhotos.hero} />
        <Gallery photos={photos} />
        <FilmStrip photos={photos} />
        <About aboutPhoto={sitePhotos.about} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
