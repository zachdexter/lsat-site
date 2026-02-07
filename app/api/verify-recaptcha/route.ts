import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing reCAPTCHA token' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set');
      return NextResponse.json({ error: 'reCAPTCHA not configured' }, { status: 500 });
    }

    // Verify the token with Google
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    console.log('reCAPTCHA verification response:', {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      'error-codes': data['error-codes'],
    });

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return NextResponse.json({ error: 'reCAPTCHA verification failed', details: data['error-codes'] }, { status: 400 });
    }

    // Check the score (v3 returns a score from 0.0 to 1.0)
    // Lower scores indicate more suspicious activity
    const score = data.score || 0;
    const threshold = 0.5; // Adjust this threshold as needed (0.5 is a common default)

    console.log(`reCAPTCHA score: ${score}, threshold: ${threshold}`);

    if (score < threshold) {
      console.warn(`reCAPTCHA score ${score} is below threshold ${threshold}`);
      return NextResponse.json({ error: 'reCAPTCHA verification failed', score }, { status: 400 });
    }

    console.log('reCAPTCHA verification passed');
    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
