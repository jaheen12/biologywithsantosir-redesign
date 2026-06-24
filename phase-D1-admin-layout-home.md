# Phase D1 — Admin Panel: Layout + Dashboard Home

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Phases A–C are complete (auth, database, student panel).

**Now building:** The admin panel. All `/admin/*` routes are protected by middleware — only users with `app_metadata.role = 'admin'` can access them.

**Admin panel purpose:** Santosir (the teacher/owner) manages students, enrollments, payments, batches, exams, results, attendance, and roles from here. This is an internal tool — desktop-first layout is acceptable, but should still be usable on tablet.

---

## What to build

### 1. `src/app/admin/layout.tsx` — Admin layout (Server Component)

**Responsibilities:**
- Verify `app_metadata.role === 'admin'`; if not, redirect to `/dashboard`
- Fetch admin's own profile: `full_name`
- Render a wider left sidebar (w-64) with grouped navigation
- Render `{children}` in the main content area

**Sidebar nav groups:**

```
👥 শিক্ষার্থী
  → /admin/students       শিক্ষার্থী তালিকা
  → /admin/enrollments    ভর্তি ব্যবস্থাপনা
  → /admin/attendance     উপস্থিতি

💰 পেমেন্ট
  → /admin/payments        পেমেন্ট লেজার
  → /admin/payments/new    নতুন পেমেন্ট
  → /admin/payments/reconcile  bKash যাচাই

🏫 ব্যাচ ও কোর্স
  → /admin/batches         ব্যাচ ব্যবস্থাপনা
  → /admin/routine         রুটিন

📝 পরীক্ষা
  → /admin/exams           পরীক্ষা
  → /admin/results         ফলাফল প্রবেশ
  → /admin/leaderboard     র‍্যাংকিং

📢 অন্যান্য
  → /admin/announcements   নোটিশ
  → /admin/roles           রোল ব্যবস্থাপনা
```

**Active link styling:** Highlight the current path link with `bg-indigo-100 text-indigo-700 font-medium`.

**Layout structure:**
```
<div class="flex min-h-screen bg-gray-50">
  <aside class="w-64 bg-white border-r shadow-sm">
    Admin sidebar
  </aside>
  <main class="flex-1 p-8">
    {children}
  </main>
</div>
```

Top of sidebar: Show admin's name and "Admin" badge. Bottom: "ড্যাশবোর্ডে ফিরুন" link → `/dashboard`.

---

### 2. `src/app/admin/page.tsx` — Admin Dashboard Home (Server Component)

This is the command center. It shows the most important operational data at a glance.

**Data queries:**

```ts
// KPI data
const { count: totalStudents } = await supabase
  .from('enrollments').select('*', { count: 'exact', head: true })
  .eq('status', 'active')

// Revenue this month
const currentMonth = format(new Date(), 'MMMM yyyy') // e.g. "June 2026"
const { data: revenueData } = await supabase
  .from('payments').select('amount').eq('month', currentMonth)
const revenueThisMonth = revenueData?.reduce((s, r) => s + r.amount, 0) ?? 0

// Overdue students count
const { count: overdueCount } = await supabase
  .from('payment_due').select('*', { count: 'exact', head: true })
  .eq('status', 'overdue')

// Unreconciled bKash/Nagad payments count
const { count: unreconciledCount } = await supabase
  .from('payments').select('*', { count: 'exact', head: true })
  .eq('reconciled', false)
  .in('method', ['bKash', 'Nagad'])

// Overdue student list (top 10)
const { data: overdueStudents } = await supabase
  .from('payment_due').select('*').eq('status', 'overdue').limit(10)

// Unreconciled payment list (top 5)
const { data: unreconciledPayments } = await supabase
  .from('payments')
  .select('*, profiles(full_name, phone)')
  .eq('reconciled', false)
  .in('method', ['bKash', 'Nagad'])
  .order('created_at', { ascending: false })
  .limit(5)

// Upcoming exams (next 7 days)
const { data: upcomingExams } = await supabase
  .from('exams')
  .select('*, batches(name)')
  .gte('exam_date', new Date().toISOString().split('T')[0])
  .order('exam_date')
  .limit(5)

// Batch capacity overview
const { data: batches } = await supabase
  .from('batches_with_counts')
  .select('name, enrolled_count, capacity')
  .eq('is_active', true)
```

**UI Sections:**

#### KPI Cards (4 in a row)
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ মোট শিক্ষার্থী│ │ এ মাসের আয় │ │ বেতন বাকি   │ │ যাচাই বাকি  │
│     42       │ │  ৳ 28,400   │ │   8 জন       │ │  3 টি        │
│ সক্রিয়       │ │ June 2026    │ │ এই মাসে      │ │ bKash/Nagad  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```
- Card 3 (overdue): red text if > 0
- Card 4 (unreconciled): amber text if > 0

#### Due/Overdue Alert Table
Title: "⚠️ এই মাসের বেতন বাকি আছে"
Only show if `overdueCount > 0`, otherwise show green "সকলের পেমেন্ট সম্পন্ন ✓"

Table: Name | Phone | Batch | Outstanding | Action
Action button: "পেমেন্ট নিন →" → links to `/admin/payments/new?student_id={id}`

#### Unreconciled Payments Feed
Title: "bKash যাচাই বাকি"
Only show if `unreconciledCount > 0`.

Compact list: Student Name | Amount | TrxID | Date | "যাচাই করুন →" link to `/admin/payments/reconcile`

#### Upcoming Exams Widget
Title: "আসন্ন পরীক্ষা"
Simple list: Exam title | Batch | Date
"পরীক্ষা পরিচালনা করুন →" link to `/admin/exams`

#### Batch Capacity Overview
Title: "ব্যাচের আসন"
One row per active batch:
```
HSC 2026 Batch A   ████████████████░░░░  32 / 40
HSC 2026 Batch B   ████████░░░░░░░░░░░░  15 / 40  ← green if > 10 seats, red if ≤ 5
```

---

## Acceptance criteria

- `/admin` redirects to `/dashboard` for non-admin users
- `/admin` loads for admin users with all 4 KPI cards populated
- Overdue alert table shows correct students (matches `payment_due` view with status='overdue')
- Unreconciled feed shows bKash/Nagad payments with `reconciled = false`
- Batch capacity bars render correctly
- Upcoming exams list works
- Sidebar active link is highlighted for current route
- `npm run build` passes

## Do NOT do in this phase

- Do not build any admin sub-pages yet (D2–D6)
- Do not build the payment form yet (D3)
