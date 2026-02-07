This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stripe setup for $450 materials access

To enable payments for the materials package, you need to configure Stripe environment variables locally and in production:

- `STRIPE_SECRET_KEY` – your Stripe secret key (starts with `sk_...`)
- `STRIPE_WEBHOOK_SECRET` – your Stripe webhook signing secret (starts with `whsec_...`)
- `SUPABASE_SERVICE_ROLE_KEY` – your Supabase service role key (starts with `eyJ...`, found in Supabase Dashboard → Settings → API)
- `NEXT_PUBLIC_SITE_URL` – the full base URL of your site in production (e.g. `https://basket-lsat.com`)
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` – your Google reCAPTCHA v3 site key (starts with `6L...`)
- `RECAPTCHA_SECRET_KEY` – your Google reCAPTCHA v3 secret key (starts with `6L...`)

Locally, create a `.env.local` file in the project root:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Get this from Stripe Dashboard → Developers → Webhooks
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Get this from Supabase Dashboard → Settings → API → service_role key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6L...  # Get from Google reCAPTCHA (see below)
RECAPTCHA_SECRET_KEY=6L...  # Get from Google reCAPTCHA (see below)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then restart the dev server.

### Payment Flow

When a user clicks **"Purchase materials access"** on the pricing page:

1. The browser calls `POST /api/checkout/materials`.
2. The route handler creates a Stripe Checkout session for **$450** and returns the session URL.
3. The browser redirects the user to Stripe Checkout.
4. On success, Stripe sends the user back to `/materials?purchase=success`, or `/pricing?purchase=cancelled` if they abandon the checkout.
5. **Stripe sends a webhook** to `/api/webhooks/stripe` when payment is completed.
6. The webhook handler updates the user's `membership_status` to `'active'` in Supabase, granting them access to premium materials.

### Setting up Stripe Webhooks

Webhooks are how Stripe tells your server when a payment is completed. You need to set this up differently for local development vs production.

#### For Local Development (Testing) - DO THIS NOW

Since Stripe can't reach `localhost`, you'll use the Stripe CLI to forward webhooks to your local server. Follow these steps **in order**:

**Step 1: Install the Stripe CLI**
- **Windows:** Download the installer from https://github.com/stripe/stripe-cli/releases/latest (download `stripe_X.X.X_windows_x86_64.zip`, extract it, and add `stripe.exe` to your PATH, or just run it from the extracted folder)
- **Mac:** Run `brew install stripe/stripe-cli/stripe` in Terminal, or download from the releases page
- **Linux:** Download from https://github.com/stripe/stripe-cli/releases/latest

To verify it's installed, open a new terminal and run:
```bash
stripe --version
```
You should see a version number. If you get an error, the CLI isn't installed correctly.

**Step 2: Login to Stripe**
Open a terminal and run:
```bash
stripe login
```
- This will open your browser
- Click "Allow access" to authenticate
- You should see "Done! The Stripe CLI is configured" in your terminal

**Step 3: Get your Stripe Secret Key**
1. Go to https://dashboard.stripe.com/test/apikeys (make sure you're in **Test mode** - toggle in top right)
2. Find **"Secret key"** (starts with `sk_test_...`)
3. Click "Reveal test key" and copy it
4. Add it to your `.env.local` file:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

**Step 4: Get your Supabase Service Role Key**
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon in left sidebar) → **API**
4. Find **"service_role"** key (starts with `eyJ...` - it's the long JWT token)
5. **⚠️ WARNING:** This key bypasses all security - never expose it to the client!
6. Copy it and add to your `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxx
   ```

**Step 5: Start your Next.js dev server**
In your project directory, run:
```bash
npm run dev
```
Keep this terminal open. Your server should be running at `http://localhost:3000`

**Step 6: Start Stripe webhook forwarding (in a NEW terminal)**
Open a **second terminal window** (keep your dev server running in the first one) and run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**Step 7: Copy the webhook secret**
- Look for the line that says `Your webhook signing secret is whsec_...`
- Copy that entire `whsec_...` value
- Add it to your `.env.local` file:
  ```bash
  STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
  ```

**Step 8: Restart your dev server**
- Go back to your first terminal (where `npm run dev` is running)
- Press `Ctrl+C` to stop it
- Run `npm run dev` again to restart with the new environment variable

**Step 9: Verify your `.env.local` file**
Your `.env.local` should now have all of these:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 10: Test the flow**
1. Make sure both terminals are running:
   - Terminal 1: `npm run dev` (your Next.js server)
   - Terminal 2: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (webhook forwarding)
2. Go to http://localhost:3000/pricing
3. Click "Purchase materials access"
4. Use Stripe's test card: `4242 4242 4242 4242`, any future expiry date, any CVC, any ZIP
5. Complete the checkout
6. You should:
   - Be redirected to `/materials?purchase=success`
   - See a success message
   - See webhook events in Terminal 2
   - Have your membership status updated to `'active'` in Supabase

**Troubleshooting:**
- If webhooks aren't working, check Terminal 2 for error messages
- Make sure both terminals are running simultaneously
- Verify all environment variables are in `.env.local` (not `.env`)
- Check that you're using test mode keys (they start with `sk_test_` and `whsec_`)

#### For Production (When Deployed)

Once your site is deployed (e.g., on Vercel), set up the webhook in Stripe Dashboard:

1. **Go to Stripe Dashboard:**
   - Visit https://dashboard.stripe.com
   - Make sure you're in **Test mode** for testing, or **Live mode** for real payments

2. **Navigate to Webhooks:**
   - Click **Developers** in the left sidebar
   - Click **Webhooks**

3. **Add Endpoint:**
   - Click **"Add endpoint"** button (top right)
   - Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
     - Replace `yourdomain.com` with your actual domain
   - Click **"Add endpoint"**

4. **Select Events:**
   - In the "Select events to listen to" section, click **"Select events"**
   - Check the box for: **`checkout.session.completed`**
   - Click **"Add events"**

5. **Copy the Signing Secret:**
   - After creating the endpoint, click on it to view details
   - Find the **"Signing secret"** section
   - Click **"Reveal"** and copy the secret (starts with `whsec_...`)
   - Add this to your production environment variables (e.g., in Vercel Dashboard → Settings → Environment Variables)

6. **Test the Webhook:**
   - In the webhook endpoint page, you can click **"Send test webhook"** to test it
   - Or make a real test purchase and check the webhook logs

**Important Notes:**
- You'll need **separate webhooks** for Test mode and Live mode
- The webhook secret is different for each endpoint
- Make sure your production site is deployed and accessible before creating the webhook

### Setting up Google reCAPTCHA v3

reCAPTCHA v3 protects the signup form from spam and abuse. It runs invisibly in the background.

**Step 1: Get reCAPTCHA keys**
1. Go to https://www.google.com/recaptcha/admin/create
2. Fill out the form:
   - **Label**: Basket LSAT (or your site name)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains:
     - `localhost` (for local testing)
     - `yourdomain.com` (for production)
     - `www.yourdomain.com` (if you use www)
3. Accept the terms and click **Submit**

**Step 2: Copy your keys**
- **Site Key** (starts with `6L...`) - This is public, add to `.env.local` as `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Secret Key** (starts with `6L...`) - This is private, add to `.env.local` as `RECAPTCHA_SECRET_KEY`

**Step 3: Add to environment variables**
```bash
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxx
```

**Step 4: Restart your dev server** so it picks up the new environment variables.

**Note:** reCAPTCHA v3 is invisible - users won't see a checkbox. It analyzes user behavior and gives a score (0.0 to 1.0). Scores below 0.5 are considered suspicious and will be blocked.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
