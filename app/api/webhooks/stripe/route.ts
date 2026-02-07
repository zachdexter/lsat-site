import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { createServerSupabaseClient } from '../../../../lib/supabaseServer';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get the user_id from the session metadata
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error('No user_id found in checkout session metadata');
      return NextResponse.json({ error: 'Missing user_id in session metadata' }, { status: 400 });
    }

    try {
      // Update the user's membership status in Supabase
      const supabase = createServerSupabaseClient();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ membership_status: 'active' })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating membership status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update membership status', details: updateError.message },
          { status: 500 }
        );
      }

      console.log(`Successfully updated membership status to 'active' for user ${userId}`);
      return NextResponse.json({ received: true, userId });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // Return a 200 response for other event types
  return NextResponse.json({ received: true });
}
