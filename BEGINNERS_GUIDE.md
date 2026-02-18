# Treadstone Climbing — Beginner's Guide to Your Gym Platform

Welcome! This guide assumes you've never coded before. We'll go step by step and I'll explain *why* we do each thing, not just *what* to do.

---

## Part 1: What Is This Thing We Built?

### The Big Picture

Imagine your gym needs a **digital filing cabinet** that can:

1. **Store waivers** — When someone signs on a tablet or phone, it saves to the cloud instead of a paper stack
2. **Track who's here** — "Is this person a member? Did they sign a waiver? Let me check in 2 seconds"
3. **Ring up sales** — Day passes, punch cards, chalk bags — like a cash register, but digital
4. **Remember everything** — Who came when, how much you made today, who's signed up for Ladies Night

That's what we built. It's a **website** that runs on the internet. Your staff uses it on a computer or tablet at the front desk. Visitors can sign waivers on their phone before they arrive.

---

## Part 2: The Pieces (In Plain English)

### 1. **The Code (What We Wrote)**

Code is like a recipe. It's a set of instructions that tell the computer exactly what to do. We wrote instructions in a language called **TypeScript** (a version of JavaScript). The computer reads those instructions and builds your website.

- **Frontend** = What people *see* (buttons, forms, colors)
- **Backend** = What happens *behind the scenes* (saving to the database, checking if someone has a waiver)

### 2. **The Database (Where Data Lives)**

A database is like an Excel spreadsheet, but smarter. Instead of one sheet, you have many "tables":

| Table      | What it stores                          |
|-----------|------------------------------------------|
| customers | Names, emails, phone numbers             |
| waivers   | Who signed, when, and their signature   |
| visits    | Every time someone checks in            |
| sales     | Every purchase (day pass, retail, etc.) |
| products  | Your prices (day pass $18, chalk $25…)  |

When someone signs a waiver, we **insert a new row** into the `waivers` table. When they check in, we **insert a row** into `visits`. The database remembers everything.

### 3. **Supabase (Your Database Host)**

Supabase is a service that **hosts** your database in the cloud. You don't need to run a server in your gym — it lives on the internet. You create an account, create a "project," and they give you a URL and a secret key. Your website uses those to talk to the database.

**Analogy:** Supabase is like a storage unit company. You rent a unit (your database), they give you a key (your API key), and you can put things in and take things out whenever you want.

### 4. **Next.js (The Website Framework)**

Next.js is a tool that turns our code into a real website. It handles:

- **Pages** — Each URL (like `/waiver` or `/staff`) shows a different screen
- **API routes** — Special URLs that don't show a page; they *do something* (like save a waiver)

When a visitor goes to `yoursite.com/waiver`, Next.js runs our waiver code and shows the form. When they click "Submit," it sends the data to an API route, which saves it to Supabase.

---

## Part 3: The Flow — What Happens When Someone Signs a Waiver?

Let's trace one action so you see how the pieces connect.

**Visitor goes to your website and signs the waiver.**

1. **Their browser** loads the waiver page (we wrote that in `waiver/page.tsx`)
2. They fill in name, email, date of birth, etc.
3. They type their name to "sign" and click Submit
4. **The browser** sends that data to our server at `/api/waiver`
5. **Our API** (in `api/waiver/route.ts`) receives it and says:
   - "Do we already have this person in the `customers` table?"
   - If yes: use their existing ID. If no: create a new customer.
   - Insert a new row into the `waivers` table with their signature and customer ID
6. **Supabase** saves it to the database
7. **Our API** sends back "Success!" to the browser
8. **The visitor** sees a green checkmark: "Waiver signed! Head to the front desk."

Every feature works this way: **Page → User action → API → Database → Response**

---

## Part 4: Your Project Folder — What's What

```
gym-platform/
├── src/
│   ├── app/                    ← All your PAGES and API routes
│   │   ├── page.tsx            ← Home page (the first thing people see)
│   │   ├── waiver/             ← Waiver signing flow
│   │   ├── staff/              ← Everything staff sees (check-in, POS, etc.)
│   │   └── api/                ← The "behind the scenes" routes
│   ├── lib/                    ← Shared tools (database connection, etc.)
│   └── types/                  ← Definitions so TypeScript knows our data shape
├── supabase/
│   └── migrations/             ← The SQL that creates your database tables
├── package.json                ← List of "ingredients" (libraries we use)
├── .env.example                ← Template for your secret keys (you copy this to .env.local)
└── README.md                   ← Setup instructions
```

**Key idea:** `page.tsx` = a screen users see. `route.ts` = code that runs when the server gets a request (no screen, just logic).

---

## Part 5: Setting Up — Step by Step (With Explanations)

### Step 1: Install Node.js

**What it is:** Node.js lets you run JavaScript on your computer (not just in a browser). Our tools (Next.js, npm) need it.

**What to do:** Go to [nodejs.org](https://nodejs.org). Download the "LTS" version. Run the installer. Restart your computer if it asks.

**How to check it worked:** Open the Terminal (on Mac: press Cmd+Space, type "Terminal," press Enter). Type:

```
node --version
```

You should see something like `v20.10.0`. If you see "command not found," Node isn't installed or isn't in your path.

---

### Step 2: Install Your Project's Dependencies

**What it is:** Our project uses other people's code (libraries) — like Supabase's client, React for the UI, etc. `package.json` lists them. `npm install` downloads all of them into a folder called `node_modules`.

**What to do:** In Terminal, go to your project folder and run:

```
cd /Users/andrewswitzer/Desktop/Treadstone\ Climbing/gym-platform
npm install
```

**What you'll see:** A bunch of text scrolling. When it's done, you'll have a `node_modules` folder. You rarely need to look inside it — it's just the "ingredients" for your app.

---

### Step 3: Create a Supabase Project

**What it is:** You need a place for your database to live. Supabase gives you that for free (with limits).

**What to do:**

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project"
3. Give it a name (e.g., "Treadstone Gym")
4. Choose a password for the database (save it somewhere safe)
5. Pick a region close to you (e.g., East US)
6. Click "Create project" — wait a minute or two

**Next:** Go to **Project Settings** (gear icon) → **API**. You'll see:
- **Project URL** — like `https://xxxxx.supabase.co`
- **anon public** key — safe to use in the browser
- **service_role** key — secret, never put in the browser

**Why two keys?** The anon key can only do what we allow (e.g., sign waivers). The service_role key can do everything. Our API runs on the server, so it uses the service_role key for admin stuff.

---

### Step 4: Create Your Database Tables

**What it is:** Right now your Supabase project has an empty database. We need to create the tables (customers, waivers, visits, etc.). The file `supabase/migrations/001_initial_schema.sql` contains the instructions.

**What to do:**

1. In Supabase, go to **SQL Editor**
2. Click **New query**
3. Open the file `gym-platform/supabase/migrations/001_initial_schema.sql` in Cursor (or any text editor)
4. Copy ALL of its contents
5. Paste into the Supabase SQL Editor
6. Click **Run**

**What happened:** You just created tables and inserted default products (day pass $18, 5-punch card $75, etc.) and membership plans. Your database is ready.

---

### Step 5: Connect Your App to the Database

**What it is:** Your app needs to know *where* the database is and *how* to authenticate. We put that in a file called `.env.local` (the "local" means it's only on your computer — never commit it to git).

**What to do:**

1. In the `gym-platform` folder, copy `.env.example` to `.env.local`:
   - On Mac: In Terminal, from the gym-platform folder: `cp .env.example .env.local`
2. Open `.env.local` in Cursor
3. Replace the placeholder values with your real Supabase values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STAFF_PIN=1234
```

**Why NEXT_PUBLIC_?** In Next.js, only variables that start with `NEXT_PUBLIC_` are visible in the browser. The URL and anon key are safe because they're limited. The service_role key does NOT have that prefix — so it never gets sent to the browser.

---

### Step 6: Run Your App

**What it is:** `npm run dev` starts a development server. It compiles your code and serves it at `http://localhost:3000`. "Localhost" means "this computer."

**What to do:**

```
npm run dev
```

**What you'll see:** "Ready in X ms" and a URL. Open your browser and go to `http://localhost:3000`.

**What you should see:** Your home page with "Staff Portal" and "Sign Waiver" buttons. Click "Sign Waiver" and try signing one. Then go to Supabase → **Table Editor** → `waivers`. You should see the row you just created!

---

## Part 6: Key Concepts to Remember

| Concept | Simple Explanation |
|---------|---------------------|
| **Frontend** | What users see and click |
| **Backend / API** | The logic that runs on the server (saving data, checking memberships) |
| **Database** | Where data is stored (tables and rows) |
| **Environment variables** | Secret keys and URLs stored in `.env.local` — never commit to git |
| **Request / Response** | User does something → browser sends a request → server responds with data or a new page |

---

## Part 7: What to Do Next

1. **Play with it** — Sign a waiver, do a check-in (you'll need to add a customer first — we can do that next), run a sale in the POS
2. **Ask questions** — "What does this file do?" "Why does this break?" I'm here to explain
3. **Change something small** — Edit the waiver text, change a button label. See what happens. That's how you learn.

---

## Quick Reference: Where to Find Things

| I want to… | Look here |
|------------|-----------|
| Change the home page | `src/app/page.tsx` |
| Change the waiver text | `src/app/waiver/page.tsx` (the `WAIVER_TEXT` constant) |
| Change the staff PIN | `.env.local` → `NEXT_PUBLIC_STAFF_PIN` |
| Add a new product (e.g., 20-punch card) | Supabase → Table Editor → `products` → Insert row |
| See what's in the database | Supabase → Table Editor → pick a table |

---

You're not "just using" this — you're learning how it works. Every time you change something and see the result, you're building your mental model. Take it slow, and ask whenever something doesn't make sense.
