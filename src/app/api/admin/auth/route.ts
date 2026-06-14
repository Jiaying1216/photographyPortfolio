import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD env var not set.' }, { status: 500 })
  }
  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
  }

  // Return a simple token (password hashed with btoa, sufficient for a personal site)
  const token = Buffer.from(adminPassword + ':ying-admin').toString('base64')
  return NextResponse.json({ token })
}
