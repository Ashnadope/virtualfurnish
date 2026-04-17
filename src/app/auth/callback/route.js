import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 * Supabase redirects here after email confirmation (PKCE flow).
 * Exchanges the code for a session then redirects to the customer dashboard.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/customer-dashboard';

  // Derive origin from the forwarded host (ngrok, reverse proxy) or fallback to request.url.
  // request.url uses the server's bound address (e.g. 0.0.0.0:4028) which is unreachable externally.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Code exchange failed — most likely the PKCE code_verifier cookie is missing
    // because the user opened the confirmation email on a different device/browser.
    // The email IS confirmed by Supabase at this point, so redirect to login with
    // a friendly message instead of an error.
    console.warn('[auth/callback] Code exchange failed (likely cross-device PKCE):', error.message);
    return NextResponse.redirect(
      `${origin}/login?message=Email confirmed! Please log in with your credentials.`
    );
  }

  // No code at all — genuinely broken link
  console.error('[auth/callback] No code parameter in URL. Search params:', Object.fromEntries(searchParams));
  return NextResponse.redirect(
    `${origin}/login?message=Email confirmation failed. Please try again or contact support.`
  );
}
