# 📚 Study Command Center

A complete SaaS web app for students preparing for competitive exams (JEE, NEET, UPSC, Board Exams).

## Features

- **Exam Planner** — countdown, daily chapter targets, risk level
- **Subject Tracker** — progress bars per subject with color coding
- **Chapter Management** — mark complete → auto-schedules spaced revisions
- **Today's Plan** — task list with time estimates
- **Revision Planner** — spaced repetition (Day 1, 7, 21)
- **Focus Mode** — Pomodoro timer (25/5/15 min) with session logging
- **Goals** — deadline-based goals with progress tracking
- **Analytics** — study hours chart + subject completion bar chart
- **Smart Insights** — auto-generated tips from your data

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Auth + DB**: Supabase (email/password + Google OAuth)
- **Animations**: framer-motion
- **Charts**: recharts
- **Icons**: lucide-react
- **Deployment**: Vercel-ready

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd study-command-center
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open the **SQL Editor** and run the schema below:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired'))
);

CREATE TABLE study_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO study_data (user_id, data) VALUES (NEW.id, '{}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own data" ON study_data FOR ALL USING (auth.uid() = user_id);
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Get your keys from: Supabase Dashboard → Project Settings → API

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Google OAuth (Optional)

In Supabase Dashboard → Authentication → Providers → Google:
- Enable Google provider
- Add your Google OAuth credentials
- Set redirect URL to `https://your-domain.com`

### 5. Run Locally

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

---

## Manually Activating Paid Users

When a user pays (UPI/Instamojo), activate their subscription in Supabase:

1. Go to **Supabase Dashboard → Table Editor → profiles**
2. Find the user by email
3. Set `subscription_status` to `'active'`

Or run this SQL:

```sql
UPDATE profiles
SET subscription_status = 'active'
WHERE email = 'user@example.com';
```

---

## Payment Configuration

Update these in `src/pages/PaywallPage.tsx`:
- UPI ID: Replace `yourname@upi`
- WhatsApp number: Replace `+91XXXXXXXXXX`
- Instamojo URL: Replace `https://www.instamojo.com/yourusername/studyapp`

---

## Project Structure

```
src/
├── lib/supabase.ts              ← Supabase client
├── hooks/
│   ├── useAuth.ts               ← Auth state management
│   ├── useCloudStorage.ts       ← Syncs to Supabase (debounced)
│   ├── useSubscription.ts       ← Trial/subscription checker
│   └── useClock.ts              ← Live clock for header
├── context/StudyContext.tsx     ← Global state + all actions
├── types/index.ts               ← All TypeScript interfaces
├── utils/
│   ├── calculations.ts          ← Exam forecast, risk level
│   └── date.ts                  ← Date helpers
├── pages/
│   ├── AuthPage.tsx             ← Login + signup + Google
│   └── PaywallPage.tsx          ← Trial expired, payment info
├── components/
│   ├── layout/{Header,Sidebar}
│   ├── shared/{TrialBanner,Toast}
│   └── [feature]/{Component}
├── Dashboard.tsx                ← Layout + section routing
└── App.tsx                      ← Root routing logic
```
