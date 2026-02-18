# Treadstone Climbing — Gym Management Platform

A custom-built gym management system for Treadstone Climbing with waivers, check-in, POS, members, classes, and reports.

## Features

- **Electronic Waivers** — Digital waiver signing for visitors (adult & minor)
- **Check-In** — Member/visitor check-in with waiver & membership verification
- **Point of Sale** — Day passes, punch cards, retail, rentals
- **Member Management** — Search customers, view visits, waiver status
- **Classes & Rosters** — View classes and registration rosters
- **Reports** — Today's visits, member vs day-pass breakdown, revenue

## Setup

### 1. Install Dependencies

```bash
cd gym-platform
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. In the SQL Editor, run the contents of `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and keys from Settings → API

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_STAFF_PIN=1234
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — links to Staff Portal & Waiver |
| `/waiver` | Public waiver signing (for visitors) |
| `/staff` | Staff login (PIN: 1234 by default) |
| `/staff/checkin` | Check-in members & visitors |
| `/staff/pos` | Point of sale |
| `/staff/members` | Search & manage customers |
| `/staff/classes` | Classes & rosters |
| `/staff/reports` | Daily reports |

## Database

The schema includes:

- `staff` — Staff login (PIN auth for MVP; upgrade to Supabase Auth later)
- `customers` — Members and visitors
- `waivers` — Signed waivers linked to customers
- `membership_plans` — Plan definitions
- `memberships` — Active customer subscriptions
- `products` — Day passes, punch cards, retail, rentals
- `visits` — Check-in records
- `sales` / `sale_items` — POS transactions
- `classes` / `class_registrations` — Classes and rosters

## Stripe (Optional)

For real card payments, add Stripe keys and wire up the POS to create PaymentIntents. The current POS records sales locally without processing cards (use "cash" or "other" for now).

## Production

- Deploy to [Vercel](https://vercel.com) or similar
- Set environment variables in your hosting dashboard
- Change `NEXT_PUBLIC_STAFF_PIN` to a secure value
- Consider upgrading staff auth to Supabase Auth or another provider
