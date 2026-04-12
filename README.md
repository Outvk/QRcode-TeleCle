# QRLinks — Your socials in one scan

A clean, free, self-hosted link-in-bio app with QR code generation.
Built with **Next.js 14**, **Supabase**, **shadcn/ui**, and **Tailwind CSS**.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Login & signup |
| `/dashboard` | Edit profile + generate QR |
| `/[username]` | Public showcase page (scanned from QR) |

---

## Setup in 5 steps

### 1. Clone & install

```bash
git clone <your-repo>
cd qrlinks
npm install
```

---

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project → **SQL Editor** → paste the contents of `supabase-schema.sql` and run it
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon public` key

---

### 3. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 4. Enable Email Auth in Supabase

1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. (Optional) Disable "Confirm email" for easier testing during development:
   **Authentication → Settings → Disable email confirmations**

---

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

Set your environment variables in the Vercel dashboard under **Settings → Environment Variables**, and update `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://qrlinks.vercel.app`).

---

## Project structure

```
qrlinks/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Login + signup
│   ├── dashboard/page.tsx    # Edit profile + QR generator
│   ├── [username]/page.tsx   # Public profile page
│   ├── not-found.tsx         # 404 page
│   ├── layout.tsx            # Root layout + theme provider
│   └── globals.css           # Tailwind + shadcn CSS variables
├── components/
│   ├── ThemeToggle.tsx       # Light/dark mode toggle
│   └── ui/                   # shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── lib/
│   ├── supabase.ts           # Supabase browser client
│   └── utils.ts              # cn() helper + social platforms config
├── supabase-schema.sql       # Run this in Supabase SQL editor
├── .env.example              # Copy to .env.local
└── tailwind.config.js
```

---

## Database schema

Single table: `profiles`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | References `auth.users.id` |
| `username` | text | Unique slug — used in URL and QR |
| `display_name` | text | Shown on profile page |
| `bio` | text | Short bio |
| `avatar_url` | text | (optional) profile photo |
| `links` | jsonb | `{ instagram, tiktok, facebook, ... }` |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Updated on save |

Row-level security is enabled — users can only edit their own profile. Public read is allowed so showcase pages work without login.

---

## Adding more social platforms

Edit `lib/utils.ts` → `SOCIAL_PLATFORMS` array. Add an entry:

```ts
{ key: 'snapchat', label: 'Snapchat', placeholder: 'https://snapchat.com/add/username', color: '#FFFC00' }
```

Then add the icon SVG in `app/[username]/page.tsx` → `ICONS` object.

---

## QR code permanence

QR codes point directly to `yourdomain.com/username`. As long as your domain is active, QR codes **never expire**. No third-party URL shorteners involved.
