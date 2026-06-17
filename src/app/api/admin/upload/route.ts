import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

function isValidToken(token: string | null): boolean {
  if (!token || !process.env.ADMIN_PASSWORD) return false
  const expected = Buffer.from(process.env.ADMIN_PASSWORD + ':ying-admin').toString('base64')
  return token === expected
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      // Called before Vercel generates an upload token for the client.
      // clientPayload is the admin token we pass from the browser.
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!isValidToken(clientPayload ?? null)) {
          throw new Error('Unauthorized')
        }
        const isSite = pathname.startsWith('ying-portfolio/site/')
        return {
          access: 'private' as const,
          addRandomSuffix: false,
          ...(isSite && { allowOverwrite: true }),
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Vercel calls this webhook after the upload lands.
        // Used for server-side post-processing if needed.
        console.log('Blob upload completed:', blob.pathname)
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
