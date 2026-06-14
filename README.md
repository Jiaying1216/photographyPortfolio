# Ying — Photography Portfolio

Personal photography portfolio for Ying, a Singapore-based film photographer.
Built with Next.js 16, Tailwind CSS 4, and Framer Motion.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS 4 + custom design tokens
- **Animations** — Framer Motion
- **Storage** — Vercel Blob (for uploaded photos)
- **Fonts** — Playfair Display · Lora · DM Mono

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding Photos

### Local (development)
Drop your photos into `public/photos/` and update `src/data/photos.ts` with the filenames and metadata.

### Production (via admin UI)
1. Go to `/admin` on the live site
2. Enter your admin password
3. Drag & drop a photo, fill in the details, click **Add to Portfolio**

## Environment Variables

Create a `.env.local` file for local development (never commit this file):

```
BLOB_READ_WRITE_TOKEN=   # from Vercel Storage dashboard
ADMIN_PASSWORD=          # password for /admin upload page
```

Set the same variables in your Vercel project settings for production.

## Deployment

Push to GitHub and connect the repo to [Vercel](https://vercel.com). Set the environment variables in Project Settings → Environment Variables, then deploy.

## Project Structure

```
src/
  app/
    admin/          # Password-protected photo upload UI
    api/admin/      # Upload, auth, and metadata API routes
    layout.tsx      # Root layout (fonts, grain overlay, cursor)
    page.tsx        # Main page
  components/
    ui/             # Cursor, GrainOverlay, Marquee, RevealOnScroll
    layout/         # Nav, MobileMenu, Footer
    sections/       # Hero, Gallery, FilmStrip, About, Contact
  data/
    photos.ts       # Static placeholder data (fallback when Blob not configured)
  lib/
    blob-photos.ts  # Vercel Blob read/write helpers
    utils.ts        # cn, clamp, warmGradient
  types/
    index.ts        # Shared TypeScript types
public/
  photos/           # Local photo files (development only)
```
