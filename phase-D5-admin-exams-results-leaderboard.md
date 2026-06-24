# Phase D5 — Admin Panel: Exams, Results Entry, Leaderboard

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Admin layout (D1), student/batch (D2), payments (D3), routine/attendance (D4) are complete.

**Now building:**
- `/admin/exams` — create and manage exams per batch
- `/admin/results` — bulk marks entry per exam
- `/admin/leaderboard` — admin view of all-batch leaderboards

---

## Page 1: `src/app/admin/exams/page.tsx` — পরীক্ষা ব্যবস্থাপনা

### Data queries

```ts
// All exams, most recent first, with batch name
const { data: exams } = await supabase
  .from('exams')
  .select('*, batches(name)')
  .order('exam_date', { ascending: false })

// Batches for the create form
const { data: batches } = await supabase
  .from('batches').select('id, name').eq('is_active', true)
```

### UI

**Page title:** "পরীক্ষা তালিকা"

**Exam table:**

| পরীক্ষার নাম | ব্যাচ | তারিখ | ধরন | মোট নম্বর | ফলাফল প্রবেশ | অ্যাকশন |
|---|---|---|---|---|---|---|
| মাসিক পরীক্ষা — মে ২০২৬ | HSC 2026 A | ২৫ মে ২০২৬ | লিখিত | ১০০ | ৩/৩ প্রবেশ করা | সম্পাদনা |

**"ফলাফল প্রবেশ" column:** Shows `{results_count} / {enrolled_count}` to show how many students' marks are entered. Link → `/admin/results?exam_id={id}`

**Results count query** — add to the main select:
```ts
.select('*, batches(name), results(count)')
```
Then `exam.results[0].count` gives number of results entered.

**Create/Edit Exam Form (Client Component: `src/components/admin/ExamForm.tsx`)**

Fields:

| Field | Input | Notes |
|---|---|---|
| পরীক্ষার নাম | text | e.g. "মাসিক পরীক্ষা — জুন ২০২৬" |
| ব্যাচ | select | required |
| তারিখ | date | required |
| ধরন | radio: MCQ / লিখিত / মক টেস্ট | maps to 'mcq'/'written'/'mock' |
| মোট নম্বর | number | default 100 |

On create: `supabase.from('exams').insert({...})`
On edit: `supabase.from('exams').update({...}).eq('id', id)`
On delete: Confirm "এই পরীক্ষা মুছে ফেলবেন? সকল ফলাফলও মুছে যাবে।" → `supabase.from('exams').delete().eq('id', id)` (CASCADE deletes results)

---

## Page 2: `src/app/admin/results/page.tsx` — ফলাফল প্রবেশ

This is the bulk marks entry page. URL param `?exam_id=` pre-selects the exam.

### Data queries

```ts
const examId = searchParams.exam_id

// All exams for the exam selector
const { data: exams } = await supabase
  .from('exams').select('id, title, exam_date, total_marks, batch_id, batches(name)').order('exam_date', { ascending: false })

const selectedExam = exams?.find(e => e.id === examId) ?? exams?.[0]

// All students enrolled in the selected exam's batch
const { data: enrolled } = await supabase
  .from('enrollments')
  .select('student_id, profiles(full_name)')
  .eq('batch_id', selectedExam?.batch_id)
  .eq('status', 'active')

// Existing results for this exam (to pre-fill)
const { data: existingResults } = await supabase
  .from('results')
  .select('student_id, marks_obtained, grade, remarks')
  .eq('exam_id', selectedExam?.id)
```

### UI

**Page title:** "ফলাফল প্রবেশ করুন"

**Exam selector dropdown:** Shows exam title + date. On change, re-fetches enrolled students and existing results.

**Marks entry form:**

```
পরীক্ষা: মাসিক পরীক্ষা — মে ২০২৬ (মোট নম্বর: ১০০)
ব্যাচ: HSC 2026 Batch A

┌──────────────────┬─────────────┬───────┬────────────────────┐
│ শিক্ষার্থী       │ প্রাপ্ত নম্বর│ গ্রেড │ মন্তব্য             │
├──────────────────┼─────────────┼───────┼────────────────────┤
│ Rafi Ahmed       │ [85      ]  │ A+    │ [চমৎকার          ] │
│ Mitu Begum       │ [72      ]  │ A     │ [              __ ] │
│ Sadia Islam      │ [58      ]  │ B     │ [              __ ] │
└──────────────────┴─────────────┴───────┴────────────────────┘
                                   [সকলের ফলাফল সংরক্ষণ করুন]
```

**Grade column:** Auto-updates as marks are typed (client-side calculation matching DB trigger logic):
```ts
function calcGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100
  if (pct >= 80) return 'A+'
  if (pct >= 70) return 'A'
  if (pct >= 60) return 'A-'
  if (pct >= 50) return 'B'
  if (pct >= 40) return 'C'
  if (pct >= 33) return 'D'
  return 'F'
}
```

**Validation:**
- Marks must be between 0 and `total_marks`. Show red border if exceeded.
- Empty marks field = "প্রবেশ করা হয়নি" — skip this student on save (don't insert null)

**On save:**
```ts
// Upsert — handles both new entry and correction
const records = enrolledStudents
  .filter(s => marksMap[s.student_id] !== '')  // skip empty
  .map(s => ({
    exam_id: selectedExam.id,
    student_id: s.student_id,
    marks_obtained: Number(marksMap[s.student_id]),
    remarks: remarksMap[s.student_id] ?? null,
    // grade is auto-computed by DB trigger — do NOT send grade here
  }))

await supabase.from('results').upsert(records, { onConflict: 'exam_id,student_id' })
```

Show "ফলাফল সংরক্ষণ হয়েছে ✓ ({count} জনের ফলাফল)" on success.

**Pre-fill:** If `existingResults` has data, pre-fill marks and remarks inputs.

**Already-entered indicator:** If a student already has a result, show a green "✓" next to their name.

---

## Page 3: `src/app/admin/leaderboard/page.tsx` — র‍্যাংকিং (Admin View)

### Data

```ts
const { data: batches } = await supabase
  .from('batches').select('id, name').eq('is_active', true)

const selectedBatchId = searchParams.batch ?? batches?.[0]?.id

// Reuse the same RPC as student leaderboard
const { data: leaderboard } = await supabase
  .rpc('get_batch_leaderboard', { p_batch_id: selectedBatchId })
```

### UI

**Page title:** "ব্যাচ র‍্যাংকিং"

**Batch selector:** Dropdown to switch between batches.

**Full leaderboard table (same as student view but without current-user highlighting):**

| র‍্যাংক | নাম | মোট নম্বর | পরীক্ষা সংখ্যা |
|---|---|---|---|
| 🥇 ১ | Rafi Ahmed | ৮৫ | ১ |
| 🥈 ২ | Mitu Begum | ৭২ | ১ |
| 🥉 ৩ | Sadia Islam | ৫৮ | ১ |

**Export CSV button** (top right):
```ts
// Client-side CSV download
const csv = [
  ['Rank', 'Name', 'Total Marks', 'Exams'],
  ...leaderboard.map(r => [r.rank, r.full_name, r.total_marks, r.exams_count])
].map(row => row.join(',')).join('\n')

const blob = new Blob([csv], { type: 'text/csv' })
const url = URL.createObjectURL(blob)
// trigger download
```

**Below the table:** Per-exam breakdown — a second table showing how each student scored per exam:

```ts
const { data: perExamResults } = await supabase
  .from('results')
  .select('student_id, marks_obtained, grade, exams(title, total_marks, exam_date)')
  .in('student_id', leaderboard.map(r => r.student_id))
  // Admin can see all results (RLS admin policy allows)
```

Show as a pivot-style table:

| নাম | মে পরীক্ষা | জুন পরীক্ষা | মোট |
|---|---|---|---|
| Rafi Ahmed | ৮৫ (A+) | — | ৮৫ |
| Mitu Begum | ৭২ (A) | — | ৭২ |

---

## Acceptance criteria

- `/admin/exams` shows exam list with results entry count; create/edit/delete work
- `/admin/results` — selecting exam loads all enrolled students for that batch
- Marks input auto-shows grade client-side as user types
- Saving upserts results without duplicates; pre-fills if results already exist
- Marks out of range show validation error
- `/admin/leaderboard` — batch selector works; leaderboard updates; CSV export downloads
- Per-exam breakdown table renders correctly
- `npm run build` passes

## Do NOT do in this phase

- Do not build announcements/roles pages yet (D6)
