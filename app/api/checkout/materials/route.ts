import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { rateLimit, getClientIdentifier } from '../../../../lib/rateLimit';

// Rate limit: 5 checkout attempts per 15 minutes per IP
const checkoutLimiter = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(req);
  const limitResult = checkoutLimiter(identifier);

  if (!limitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Too many checkout attempts. Please try again later.',
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
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token by calling Supabase's user endpoint
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const user = await response.json();

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Always use environment variable for origin (never trust headers - they can be spoofed)
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    
    // Validate origin is configured
    if (!origin) {
      console.error('Missing site URL: NEXT_PUBLIC_SITE_URL not set');
      return NextResponse.json({ error: 'Missing site URL configuration' }, { status: 500 });
    }
    
    // Validate URL format
    let originUrl: URL;
    try {
      originUrl = new URL(origin);
    } catch (e) {
      console.error('Invalid site URL format:', origin);
      return NextResponse.json({ error: 'Invalid site URL configuration' }, { status: 500 });
    }
    
    // Additional security: Validate origin is HTTPS (except for localhost)
    if (originUrl.protocol !== 'https:' && originUrl.hostname !== 'localhost') {
      console.error('Site URL must use HTTPS in production:', origin);
      return NextResponse.json({ error: 'Invalid site URL configuration' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'LSAT Materials Access (Lifetime)',
              description: 'Lifetime access to Basket LSAT video library, study guides, and all future additions.',
            },
            unit_amount: 45000, // $450.00
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/materials?purchase=success`,
      cancel_url: `${origin}/pricing?purchase=cancelled`,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    return NextResponse.json({ error: 'Unable to start checkout session' }, { status: 500 });
  }
}

