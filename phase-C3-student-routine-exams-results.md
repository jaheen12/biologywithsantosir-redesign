# Phase C3 — Student Panel: Routine, Exams, Results Pages

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Phases A, B, C1, C2 are complete.

**Now building three pages** in one phase (all are read-only, data-display pages with minimal complexity):
- `/dashboard/routine` — weekly class schedule
- `/dashboard/exams` — upcoming and past exams
- `/dashboard/results` — marks and grades per exam

All are **Server Components**. Data is scoped to the logged-in student's batch via RLS automatically.

---

## Page 1: `src/app/dashboard/routine/page.tsx` — রুটিন

### Data query

```ts
// Get student's batch_id from profile
const { data: profile } = await supabase
  .from('profiles').select('batch_id').eq('id', user.id).single()

// Get routines for their batch
const { data: routines } = await supabase
  .from('routines')
  .select('*')
  .eq('batch_id', profile.batch_id)
  .order('day_of_week') // will sort alphabetically; reorder manually in UI
```

### UI

**Page title:** "সাপ্তাহিক ক্লাস রুটিন"

Display as a weekly table. Day order for Bangladesh: Saturday → Sunday → Monday → Tuesday → Wednesday → Thursday → Friday.

```
┌──────────────┬──────────────┬──────────┬──────────────┬──────────┐
│ দিন          │ বিষয়        │ সময়     │ প্ল্যাটফর্ম │ লিংক    │
├──────────────┼──────────────┼──────────┼──────────────┼──────────┤
│ শনিবার ★    │ জীববিজ্ঞান  │ ৪:০০–   │ Physical     │ —        │
│ (আজ)        │ প্রথম পত্র   │ ৫:৩০     │              │          │
├──────────────┼──────────────┼──────────┼──────────────┼──────────┤
│ সোমবার      │ জীববিজ্ঞান  │ ৪:০০–   │ Zoom         │ জয়েন ↗  │
│             │ দ্বিতীয় পত্র│ ৫:৩০     │              │          │
└──────────────┴──────────────┴──────────┴──────────────┴──────────┘
```

**Today highlight:** Compare `day_of_week` with `new Date().toLocaleDateString('en-US', { weekday: 'long' })`. Highlight today's row with a light green background and "আজ" badge.

**Join link:** If `platform !== 'Physical'` and `link` is set, show "জয়েন করুন ↗" button (opens in new tab). If `platform = 'Physical'`, show "—".

**Day labels in Bangla:**
```ts
const dayBn: Record<string, string> = {
  Saturday: 'শনিবার', Sunday: 'রবিবার', Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার', Wednesday: 'বুধবার', Thursday: 'বৃহস্পতিবার', Friday: 'শুক্রবার'
}
```

**Time format:** Display `start_time` and `end_time` in 12-hour format with AM/PM in Bangla (বিকাল/সন্ধ্যা/সকাল based on hour).

**Empty state:** "এই ব্যাচের জন্য কোনো রুটিন তৈরি হয়নি"

---

## Page 2: `src/app/dashboard/exams/page.tsx` — পরীক্ষা

### Data query

```ts
const { data: exams } = await supabase
  .from('exams')
  .select('*, results(marks_obtained, grade)')
  .eq('batch_id', profile.batch_id)
  .order('exam_date', { ascending: false })
```

Note: The `results` join will only return the current student's result row (RLS filters it automatically).

### UI

Split into two sections:

**Section 1: আসন্ন পরীক্ষা (Upcoming)**
Filter: `exam_date >= today`

Card per exam:
```
┌─────────────────────────────────────┐
│ মাসিক পরীক্ষা — জুলাই ২০২৬        │
│ তারিখ: ২৮ জুলাই ২০২৬              │
│ ধরন: Written    মোট নম্বর: ১০০    │
│                   [আর ৪ দিন বাকি]  │
└─────────────────────────────────────┘
```

"X দিন বাকি" countdown: `Math.ceil((examDate - today) / 86400000)` days.

**Section 2: গত পরীক্ষা (Past)**
Filter: `exam_date < today`
Table view:

| পরীক্ষার নাম | তারিখ | ধরন | মোট নম্বর | প্রাপ্ত নম্বর | গ্রেড |
|---|---|---|---|---|---|
| মাসিক পরীক্ষা — মে ২০২৬ | ২৫ মে | Written | ১০০ | ৮৫ | A+ |

If `results` join returns no row for this student (result not entered yet): show "—" in marks and grade columns.

**Exam type labels in Bangla:**
```ts
const typeBn = { mcq: 'MCQ', written: 'লিখিত', mock: 'মক টেস্ট' }
```

**Empty state (no exams at all):** "কোনো পরীক্ষার তথ্য নেই"

---

## Page 3: `src/app/dashboard/results/page.tsx` — ফলাফল

### Data query

```ts
const { data: results } = await supabase
  .from('results')
  .select('*, exams(title, exam_date, total_marks, batch_id)')
  .eq('student_id', user.id)
  .order('exams(exam_date)', { ascending: false })

// Also get class average and student's rank per exam
// Run a separate query per exam_id to get all results for that exam
// (RLS note: student can only see own results row — for averages/rank,
//  you need a Postgres function or a Supabase RPC that bypasses RLS)
```

**RPC for class stats (create in Phase B SQL or add now):**

```sql
CREATE OR REPLACE FUNCTION get_exam_stats(p_exam_id uuid, p_student_id uuid)
RETURNS TABLE (
  class_avg    numeric,
  student_rank bigint,
  total_appeared bigint
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    ROUND(AVG(r.marks_obtained), 1)        AS class_avg,
    RANK() OVER (ORDER BY r.marks_obtained DESC)
      FILTER (WHERE r.student_id = p_student_id) AS student_rank,
    COUNT(*)                                AS total_appeared
  FROM results r
  WHERE r.exam_id = p_exam_id
  GROUP BY r.exam_id
$$;
```

Call per result: `supabase.rpc('get_exam_stats', { p_exam_id, p_student_id: user.id })`

### UI

**Page title:** "পরীক্ষার ফলাফল"

One card per result:

```
┌──────────────────────────────────────────────┐
│ মাসিক পরীক্ষা — মে ২০২৬          ২৫ মে ২০২৬│
│                                              │
│  প্রাপ্ত নম্বর   শ্রেণী গড়   র‍্যাংক        │
│     ৮৫ / ১০০       ৭২.০        ১ / ৩        │
│                                              │
│  গ্রেড: A+                                   │
│  ████████████████░░░░  85%  progress bar     │
│                                              │
│  শিক্ষকের মন্তব্য: চমৎকার পারফরম্যান্স      │
└──────────────────────────────────────────────┘
```

**Progress bar:** `width: {(marks_obtained / total_marks) * 100}%`
- Green if grade A or A+
- Amber if B or C
- Red if D or F

**Grade badge colors:**
```ts
const gradeColor = {
  'A+': 'bg-green-100 text-green-800',
  'A':  'bg-green-100 text-green-700',
  'A-': 'bg-blue-100 text-blue-800',
  'B':  'bg-yellow-100 text-yellow-800',
  'C':  'bg-orange-100 text-orange-800',
  'D':  'bg-red-100 text-red-700',
  'F':  'bg-red-200 text-red-900',
}
```

**Empty state:** "এখনো কোনো পরীক্ষার ফলাফল প্রকাশিত হয়নি"

---

## Acceptance criteria

- `/dashboard/routine` shows the student's batch schedule; today's row is highlighted
- Join links appear only for Zoom/Google Meet with a valid `link` value
- `/dashboard/exams` splits exams into upcoming (with countdown) and past (with result status)
- `/dashboard/results` shows marks, grade, progress bar, class average, rank per exam
- All three pages show appropriate empty states when no data exists
- `npm run build` passes

## Do NOT do in this phase

- Do not build leaderboard, attendance, or profile pages yet (C4)
- Do not build the admin panel yet (Phase D)
