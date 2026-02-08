import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabaseServer';
import { rateLimit, getClientIdentifier } from '../../../lib/rateLimit';

// Rate limit: 5 requests per 5 minutes per IP
const checkEmailLimiter = rateLimit({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
});

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(req);
  const limitResult = checkEmailLimiter(identifier);

  if (!limitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((limitResult.resetAt - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((limitResult.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': limitResult.resetAt.toString(),
        },
      }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use service role to check if user exists
    const supabase = createServerSupabaseClient();
    
    // Check if a user with this email exists using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking email:', error);
      // If we can't check, assume it doesn't exist to allow signup
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const emailLower = email.toLowerCase().trim();
    const emailExists = users?.some(user => user.email?.toLowerCase() === emailLower) || false;

    return NextResponse.json(
      { exists: emailExists },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'X-RateLimit-Reset': limitResult.resetAt.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Error in check-email route:', error);
    // On error, assume email doesn't exist to allow signup
    return NextResponse.json(
      { exists: false },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
          'X-RateLimit-Reset': limitResult.resetAt.toString(),
        },
      }
    );
  }
}
