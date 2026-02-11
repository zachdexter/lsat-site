## Basket LSAT

Basket LSAT is a full‑stack web app I built for a friend who tutors the LSAT. Students can learn about the service, book sessions, create accounts, and (once fully enabled) get access to a library of videos and study guides.

### Stack & architecture

- **Framework**: Next.js 16 (App Router) with React.
- **Auth & data**: Supabase (Postgres, Auth, RLS, Storage).
- **Video**: Mux (separate dev/prod environments, direct uploads, webhooks, playback IDs).
- **Payments**: Stripe (Checkout + webhook for materials access, off in the UI for now).
- **Styling**: Tailwind CSS v4 + a small amount of plain CSS.
- **Other integrations**:
  - Calendly for scheduling.
  - Google reCAPTCHA v3 on signup to help keep bots out.

On the backend side there’s some extra hardening:

- Rate limiting on a few sensitive API routes (email existence check, reCAPTCHA verify, Stripe checkout).
- Webhook signature checks for both Stripe and Mux.
- Tightened CORS for Mux direct uploads and safe origin handling for Stripe redirect URLs.
- Input validation on titles, enums, and file types/sizes to keep bad data out.

### What the site does

- **Marketing & onboarding**
  - Home, About, and Pricing pages that explain who the tutor is and how the sessions work.
  - A **Book a Session** page with an embedded Calendly widget so students can grab a timeslot without leaving the site.

- **User accounts & profiles**
  - Full **signup / login / logout** flow using Supabase Auth.
  - Each user has a profile row tied to `auth.users` with:
    - `role`: `admin`, `member`, `trial`, or `none`.
    - “Materials access” status: `active`, `trial`, or `none`.
  - Complete **forgot / reset password** flow:
    - Custom HTML email from Supabase with a reset button.
    - A dedicated `/reset-password` page that handles the Supabase tokens and lets users set a new password.

- **Admin dashboard**
  - Locked‑down `/admin` area for the tutor.
  - Shows a list of users and whether they have materials access or admin access.
  - **Video uploads**:
    - Upload LSAT videos straight from the browser using Mux Direct Uploads.
    - Webhooks from Mux update the status from “processing” to “ready”.
    - Admin can refresh status or delete videos from the dashboard.
  - **PDF uploads**:
    - Upload “Study Guides and Notes” PDFs to a Supabase Storage bucket.
    - The app tracks metadata (title, section, size, etc.) in a `pdfs` table.
    - Admin can delete PDFs, and the file + DB row stay in sync.

- **Premium materials**
  - `/materials` acts as a little hub:
    - If you don’t have access, you get a friendly explanation and a nudge toward pricing.
    - If you do, you see links to:
      - **Video Library** (`/materials/videos`)
      - **Study Guides & Notes** (`/materials/study-guides`)
  - **Video Library**:
    - Grid of LSAT videos (Intro, LR, RC, final tips).
    - Search, filter by section, and sort (newest, oldest, A–Z).
    - Plays via Mux using a modal overlay player.
  - **Study Guides & Notes**:
    - Filterable/searchable list of PDFs with section tags, file size, and date.
    - One‑click download links powered by Supabase Storage.

- **Payments (wired in, currently paused)**
  - Stripe Checkout + webhooks are set up for a one‑time “materials access” purchase.
  - The webhook flips a user’s profile to `membership_status='active'`.
  - For now, the UI shows a disabled “work in progress” button instead of letting people pay.

### Design & UX

- **Sidebar layout**
  - Sticky sidebar with links to all the main pages plus a highlighted “Premium Materials” entry.
  - Profile + logout live at the bottom; admins see an “Admin Dashboard” link as well.

- **Dark mode**
  - Sun/moon toggle in the top‑right corner.
  - Respects system preference on first visit and remembers your choice in `localStorage`.
  - Dark‑mode styles wired across pretty much everything: marketing pages, admin, materials, auth, booking, 404, etc.

- **Small UX touches**
  - Scroll‑based fade‑in animations to keep things from feeling too static.
  - Consistent hover states and focus rings instead of random defaults.
  - Thought‑through empty states and error messages instead of blank screens.



### Why I built it

My first real user‑facing product! This wasn’t just a personal playground repo, the site was created as a freelance project for an old friend who’s starting an LSAT tutoring business.

Along the way I got to:

- Design and ship an end‑to‑end flow (marketing → signup → booking → premium content).
- Glue together a bunch of third‑party services in a way that’s actually safe to run in production.
- Iterate on a real person’s feedback about dark mode, admin UX, Calendly weirdness, etc., instead of guessing what “users might want”.
