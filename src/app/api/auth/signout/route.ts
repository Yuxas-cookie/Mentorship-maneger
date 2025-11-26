import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return NextResponse.redirect(new URL('/login', origin))
}
