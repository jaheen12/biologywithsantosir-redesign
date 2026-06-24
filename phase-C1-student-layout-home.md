# Phase C1 — Student Panel: Layout + Dashboard Home

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Auth (Phase A) and database (Phase B) are complete.

**Now building:** The student-facing dashboard. Students land here after login. All pages under `/dashboard/*` are protected by middleware (only logged-in users reach them).

**Data available:** After login, the student's `profiles` row is accessible via `supabase.auth.getUser()` → then query `profiles` by `id`. Their enrollment gives `batch_id` which connects to most other data.

**Component style:** Server Components by default. Use `'use client'` only when needed (event handlers, state). Tailwind CSS for all styling. Keep the UI clean and readable — many students use mobile.

---

## What to build

### 1. `src/app/dashboard/layout.tsx` — Persistent sidebar layout

This is a **Server Component**. It wraps all `/dashboard/*` pages.

**Responsibilities:**
- Fetch the logged-in user with `createClient()` from `@/lib/supabase/server`
- Fetch their `profiles` row: `full_name`, `role`, `batch_id`
- Query `payment_due` view for this student to get current month's `status`
- Render a left sidebar with nav links
- Render the page content (`{children}`) on the right

**Sidebar nav links:**
| Label | Path | Icon hint |
|---|---|---|
| ড্যাশবোর্ড | `/dashboard` | home |
| ফি ও পেমেন্ট | `/dashboard/payments` | credit card — show red dot badge if `payment_due.status ≠ 'paid'` |
| রুটিন | `/dashboard/routine` | calendar |
| পরীক্ষা | `/dashboard/exams` | clipboard |
| ফলাফল | `/dashboard/results` | chart |
| র‍্যাংকিং | `/dashboard/leaderboard` | trophy |
| উপস্থিতি | `/dashboard/attendance` | check square |
| প্রোফাইল | `/dashboard/profile` | user |

**Layout structure:**
```
<div class="flex min-h-screen">
  <aside class="w-56 sidebar">  ← fixed left sidebar
    logo / student name
    nav links
  </aside>
  <main class="flex-1 p-6">
    {children}
  </main>
</div>
```

On mobile (< md breakpoint): sidebar collapses, show hamburger menu toggle. This requires a `'use client'` wrapper component for the toggle state — extract the sidebar into `src/components/dashboard/Sidebar.tsx`.

**If user has no active enrollment:** Show a notice "আপনি এখনো কোনো ব্যাচে ভর্তি হননি" instead of the normal sidebar links.

---

### 2. `src/app/dashboard/page.tsx` — Dashboard home

**Server Component.** Queries:
- `profiles` for student name and batch
- `payment_due` for current month status
- `routines` for next upcoming class (today or after, in order)
- `exams` for next upcoming exam
- `results` joined with `exams` for latest result (most recent exam_date)
- `announcements` for latest 3 (batch-specific or global)

**UI sections (top to bottom):**

#### Payment alert banner
Conditional — only show if not fully paid:
- `status = 'overdue'` → red banner: "⚠️ এই মাসের বেতন বাকি আছে (৳{monthly_fee} টাকা)"
- `status = 'partial'` → amber banner: "এই মাসের আংশিক পেমেন্ট হয়েছে। বাকি: ৳{outstanding} টাকা"
- Link in banner: "পেমেন্ট বিবরণ দেখুন →" → `/dashboard/payments`

#### Welcome card
```
স্বাগতম, {full_name}!
ব্যাচ: HSC 2026 Batch A
```

#### Summary cards (3 in a row, responsive grid)
1. **পরবর্তী ক্লাস** — day + time + subject. If no upcoming class today: "আজ কোনো ক্লাস নেই"
2. **পরবর্তী পরীক্ষা** — title + date. If none: "কোনো পরীক্ষা নির্ধারিত নেই"
3. **সর্বশেষ ফলাফল** — exam name + marks/total + grade. If none: "এখনো কোনো পরীক্ষা হয়নি"

#### Announcements
Title: "নোটিশ বোর্ড"
List of latest 3 announcements: title (bold) + first 80 chars of body + date.
If none: "কোনো নোটিশ নেই"

---

## Data fetching pattern

Use server-side Supabase in each Server Component:

```ts
import { createClient } from '@/lib/supabase/server'

// In the component:
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

const { data: paymentStatus } = await supabase
  .from('payment_due')
  .select('*')
  .eq('student_id', user.id)
  .single()
```

---

## Acceptance criteria

- `/dashboard` loads and shows the logged-in student's name
- Red/amber banner appears correctly based on `payment_due.status`
- Sidebar link "ফি ও পেমেন্ট" shows a red dot if payment is not 'paid'
- Sidebar is responsive (collapses on mobile)
- Unauthenticated users are redirected to `/login` (middleware handles this, but layout also falls back)
- `npm run build` passes

## Do NOT do in this phase

- Do not build other dashboard sub-pages yet (those are C2–C5)
- Do not build the admin panel yet (Phase D)
