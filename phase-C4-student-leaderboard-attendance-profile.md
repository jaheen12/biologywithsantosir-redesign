# Phase C4 — Student Panel: Leaderboard, Attendance, Profile Pages

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Phases A, B, C1–C3 are complete.

**Now building the final three student pages:**
- `/dashboard/leaderboard` — batch rank table with full marks
- `/dashboard/attendance` — student's own attendance record
- `/dashboard/profile` — view and edit personal info

---

## Page 1: `src/app/dashboard/leaderboard/page.tsx` — র‍্যাংকিং

### Data query

Students can only see their own `results` rows (RLS). Use a `SECURITY DEFINER` RPC to get the full batch leaderboard without exposing individual result rows:

```sql
-- Add this RPC to Supabase (SQL editor) if not already created:
CREATE OR REPLACE FUNCTION get_batch_leaderboard(p_batch_id uuid)
RETURNS TABLE (
  student_id   uuid,
  full_name    text,
  total_marks  numeric,
  exams_count  bigint,
  rank         bigint
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    p.id                        AS student_id,
    p.full_name,
    COALESCE(SUM(r.marks_obtained), 0) AS total_marks,
    COUNT(r.id)                 AS exams_count,
    RANK() OVER (ORDER BY COALESCE(SUM(r.marks_obtained), 0) DESC) AS rank
  FROM profiles p
  JOIN enrollments e ON e.student_id = p.id AND e.batch_id = p_batch_id AND e.status = 'active'
  LEFT JOIN results r ON r.student_id = p.id
  LEFT JOIN exams ex ON ex.id = r.exam_id AND ex.batch_id = p_batch_id
  GROUP BY p.id, p.full_name
  ORDER BY rank;
$$;
```

In the page:
```ts
const { data: profile } = await supabase
  .from('profiles').select('batch_id').eq('id', user.id).single()

const { data: leaderboard } = await supabase
  .rpc('get_batch_leaderboard', { p_batch_id: profile.batch_id })
```

### UI

**Page title:** "ব্যাচ র‍্যাংকিং"

Full leaderboard table. Current student's row is highlighted.

```
┌──────┬──────────────────────┬─────────────┬────────────────┐
│ র‍্যাংক│ নাম                 │ মোট নম্বর  │ পরীক্ষা সংখ্যা│
├──────┼──────────────────────┼─────────────┼────────────────┤
│  🥇 1│ Rafi Ahmed           │     85      │       1        │ ← current student: highlight row
│  🥈 2│ Mitu Begum           │     72      │       1        │
│  🥉 3│ Sadia Islam          │     58      │       1        │
└──────┴──────────────────────┴─────────────┴────────────────┘
```

**Trophy icons:** rank 1 → 🥇, rank 2 → 🥈, rank 3 → 🥉, rank 4+ → plain number

**Current student highlight:** compare `row.student_id === user.id` → apply `bg-blue-50 font-semibold border-l-4 border-blue-500`

**Sticky "Your Position" banner above the table:**
```
আপনার অবস্থান: ১ম  |  মোট নম্বর: ৮৫  |  পরীক্ষা দিয়েছেন: ১টি
```

**Empty state:** "এখনো কোনো পরীক্ষার ফলাফল প্রকাশিত হয়নি — র‍্যাংকিং পরে দেখা যাবে"

---

## Page 2: `src/app/dashboard/attendance/page.tsx` — উপস্থিতি

### Data query

```ts
// Default: current month. Accept ?month=YYYY-MM query param for filtering.
const monthParam = searchParams.month ?? new Date().toISOString().slice(0, 7) // "2026-06"

const { data: records } = await supabase
  .from('attendance')
  .select('*, routines(day_of_week, subject, start_time)')
  .eq('student_id', user.id)
  .gte('date', `${monthParam}-01`)
  .lte('date', `${monthParam}-31`)
  .order('date', { ascending: false })
```

### UI

**Page title:** "উপস্থিতির রেকর্ড"

**Month filter:** A `<select>` dropdown showing last 6 months. Changing it updates the URL param and re-fetches (use `router.push` — make this a `'use client'` component or a form with GET method).

**Summary cards (3 in a row):**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│উপস্থিত  │  │অনুপস্থিত│  │ দেরিতে   │
│  ১২ দিন │  │  ২ দিন   │  │  ১ দিন   │
└──────────┘  └──────────┘  └──────────┘
```
Count by filtering `records` by `status`.

**Attendance percentage bar:**
```
উপস্থিতির হার: ৮০%
████████████████░░░░  → green if ≥ 75%, amber if 50–74%, red if < 50%
```

**Detail table:**
| তারিখ | বিষয় | সময় | অবস্থা |
|---|---|---|---|
| ২০ জুন ২০২৬ | জীববিজ্ঞান প্রথম পত্র | ৪:০০ | উপস্থিত ✓ |
| ১৮ জুন ২০২৬ | MCQ অনুশীলন | ৪:০০ | অনুপস্থিত ✗ |

**Status labels and colors:**
```ts
const statusDisplay = {
  present: { label: 'উপস্থিত ✓', color: 'text-green-600' },
  absent:  { label: 'অনুপস্থিত ✗', color: 'text-red-600' },
  late:    { label: 'দেরিতে এসেছেন', color: 'text-amber-600' },
}
```

**Empty state:** "এই মাসে কোনো উপস্থিতি রেকর্ড নেই"

---

## Page 3: `src/app/dashboard/profile/page.tsx` — প্রোফাইল

This page has a read view (Server Component) and an edit form (Client Component). Split into two components.

### `src/app/dashboard/profile/page.tsx` (Server Component)

Fetches profile:
```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('full_name, phone, avatar_url, role, created_at')
  .eq('id', user.id)
  .single()
```

Renders `<ProfileForm profile={profile} userId={user.id} />` (Client Component below).

### `src/components/dashboard/ProfileForm.tsx` (Client Component — `'use client'`)

**Display fields (always visible):**
- Full Name
- Phone
- Email (from `user.email` — not editable, comes from auth)
- Role (student/admin — display only, not editable here)
- Member since: `created_at` formatted as Bengali date

**Edit mode:** "তথ্য সম্পাদনা করুন" button toggles an inline form replacing the display view.

**Editable fields:**
- Full Name (text input)
- Phone (text input)

**On save:**
```ts
const supabase = createClient() // browser client
await supabase.from('profiles').update({ full_name, phone }).eq('id', userId)
```

Show Bangla success toast: "তথ্য সফলভাবে আপডেট হয়েছে ✓" (simple div that fades out after 3 seconds).

On error: "তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন"

**Avatar:** Display a circle with the first letter of `full_name` (or "S" fallback). No file upload for now — avatar_url reserved for future.

---

## Acceptance criteria

- `/dashboard/leaderboard` shows all batch students ranked by total marks; current student row is highlighted; trophy icons for top 3
- `/dashboard/attendance` shows correct present/absent/late counts for current month; month filter works
- `/dashboard/profile` shows current user info; edit mode allows updating name and phone; success message shown after save
- `npm run build` passes with no errors

## Do NOT do in this phase

- Do not build the admin panel yet (Phase D)
- Do not implement avatar file upload (deferred)
