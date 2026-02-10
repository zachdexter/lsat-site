import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

// Use Stripe's default API version for this SDK release to avoid type mismatches.
// If you want to pin a specific version later, update both package.json (stripe version)
// and this apiVersion string to match the allowed literal type.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

