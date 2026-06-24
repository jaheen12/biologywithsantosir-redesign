# Phase D4 — Admin Panel: Routine Manager + Attendance

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Admin layout (D1), student/batch management (D2), and payment workflow (D3) are complete.

**Now building:**
- `/admin/routine` — weekly class schedule editor per batch
- `/admin/attendance` — mark and review student attendance per class

---

## Page 1: `src/app/admin/routine/page.tsx` — রুটিন ব্যবস্থাপনা

### Data queries

```ts
// All active batches for the batch selector
const { data: batches } = await supabase
  .from('batches')
  .select('id, name')
  .eq('is_active', true)

// Routines for selected batch (default: first batch)
const selectedBatchId = searchParams.batch ?? batches?.[0]?.id

const { data: routines } = await supabase
  .from('routines')
  .select('*')
  .eq('batch_id', selectedBatchId)
  .order('day_of_week')
```

### UI

**Page title:** "সাপ্তাহিক রুটিন ব্যবস্থাপনা"

**Batch selector:** Dropdown to switch between batches. Changing updates the URL param and re-fetches.

**Weekly schedule display:**

Grouped by day (Saturday → Friday order). Each day section:

```
━━━ শনিবার ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ৪:০০ – ৫:৩০ | জীববিজ্ঞান প্রথম পত্র | Physical  [✎ সম্পাদনা] [✕ মুছুন]
  ────────────────────────────────────────────
  [+ এই দিনে ক্লাস যোগ করুন]

━━━ সোমবার ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  (কোনো ক্লাস নেই)
  [+ এই দিনে ক্লাস যোগ করুন]
```

Show all 7 days even if empty. Empty days show only the "+ যোগ করুন" button.

### Add/Edit Routine Form (Client Component: `src/components/admin/RoutineForm.tsx`)

Used as an inline form below the day, or in a modal. Fields:

| Field | Input |
|---|---|
| দিন | select (pre-filled when clicking "এই দিনে যোগ করুন") |
| শুরুর সময় | time input |
| শেষের সময় | time input |
| বিষয় | text input |
| প্ল্যাটফর্ম | radio: Physical / Zoom / Google Meet |
| ক্লাস লিংক | text input (shown only if Zoom or Google Meet selected) |

On save (create): `supabase.from('routines').insert({ batch_id, day_of_week, start_time, end_time, subject, platform, link })`

On save (edit): `supabase.from('routines').update({...}).eq('id', routineId)`

On delete: Confirm dialog "এই ক্লাস মুছে ফেলতে চান?" → `supabase.from('routines').delete().eq('id', routineId)`

After any change: `router.refresh()`

**Day labels:**
```ts
const dayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const dayBn: Record<string, string> = {
  Saturday: 'শনিবার', Sunday: 'রবিবার', Monday: 'সোমবার',
  Tuesday: 'মঙ্গলবার', Wednesday: 'বুধবার', Thursday: 'বৃহস্পতিবার', Friday: 'শুক্রবার'
}
```

---

## Page 2: `src/app/admin/attendance/page.tsx` — উপস্থিতি ব্যবস্থাপনা

Split into two views: **Mark Attendance** (for a specific class date) and **View History**.

Make the whole page a `'use client'` component with tab switching.

### Tab 1: উপস্থিতি নিন (Mark Attendance)

**Step 1 — Select class:**

```
ব্যাচ:     [HSC 2026 Batch A ▼]
তারিখ:     [2026-06-21 📅]
ক্লাস:     [শনিবার ৪:০০ — জীববিজ্ঞান প্রথম পত্র ▼]
```

The class dropdown is populated by querying `routines` for the selected batch and filtering by the day of week of the selected date:

```ts
const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
const { data: classesForDay } = await supabase
  .from('routines')
  .select('*')
  .eq('batch_id', selectedBatchId)
  .eq('day_of_week', dayOfWeek)
```

**Step 2 — Mark students:**

After selecting batch + date + class, fetch all active enrollments for the batch:

```ts
const { data: students } = await supabase
  .from('enrollments')
  .select('student_id, profiles(full_name)')
  .eq('batch_id', selectedBatchId)
  .eq('status', 'active')

// Also check if attendance already exists for this routine + date
const { data: existing } = await supabase
  .from('attendance')
  .select('student_id, status')
  .eq('routine_id', selectedRoutineId)
  .eq('date', selectedDate)
```

Display a mark-attendance table:

```
┌───────────────────────────────────────────────────────┐
│ জীববিজ্ঞান প্রথম পত্র — শনিবার, ২১ জুন ২০২৬         │
│ [✓ সকলকে উপস্থিত করুন]                               │
│────────────────────────────────────────────────────── │
│ Rafi Ahmed      ○ উপস্থিত  ○ অনুপস্থিত  ○ দেরিতে    │
│ Mitu Begum      ○ উপস্থিত  ○ অনুপস্থিত  ○ দেরিতে    │
│ Sadia Islam     ○ উপস্থিত  ○ অনুপস্থিত  ○ দেরিতে    │
│────────────────────────────────────────────────────── │
│ [সংরক্ষণ করুন]                                        │
└───────────────────────────────────────────────────────┘
```

**"সকলকে উপস্থিত করুন" button:** Sets all radio buttons to "উপস্থিত" in state.

**Pre-fill:** If attendance already exists for this routine+date (editing), pre-select existing statuses.

**On save:**
```ts
// Upsert — handles both new and re-marking
const records = students.map(s => ({
  routine_id: selectedRoutineId,
  student_id: s.student_id,
  date: selectedDate,
  status: markedStatuses[s.student_id] ?? 'absent',
  marked_by: currentAdminId,
  marked_at: new Date().toISOString(),
}))

await supabase.from('attendance').upsert(records, {
  onConflict: 'routine_id,student_id,date'
})
```

Show "উপস্থিতি সংরক্ষণ হয়েছে ✓" toast on success.

---

### Tab 2: উপস্থিতির ইতিহাস (View History)

Filters:
- Batch dropdown
- Month picker (YYYY-MM)

On filter change, query:

```ts
const { data: history } = await supabase
  .from('attendance')
  .select('*, profiles!student_id(full_name), routines(subject, day_of_week, start_time)')
  .eq('routines.batch_id', selectedBatchId) // Note: this may need a join via routine_id → routines.batch_id
  .gte('date', `${selectedMonth}-01`)
  .lte('date', `${selectedMonth}-31`)
  .order('date', { ascending: false })
```

Display as a table:

| তারিখ | শিক্ষার্থী | বিষয় | অবস্থা | চিহ্নিত করেছেন |
|---|---|---|---|---|
| ২১ জুন | Rafi Ahmed | জীববিজ্ঞান প্রথম পত্র | উপস্থিত ✓ | Admin |
| ২১ জুন | Mitu Begum | জীববিজ্ঞান প্রথম পত্র | অনুপস্থিত ✗ | Admin |

Below the table: **Summary by student** for the selected month:

| শিক্ষার্থী | উপস্থিত | অনুপস্থিত | দেরিতে | হার |
|---|---|---|---|---|
| Rafi Ahmed | 10 | 2 | 1 | 77% |

---

## Acceptance criteria

- `/admin/routine` shows all 7 days for selected batch; each day lists its class slots
- Add/edit/delete routine slots work and refresh the list
- Day selector in add form pre-fills when clicking "এই দিনে যোগ করুন"
- `/admin/attendance` mark tab: selecting batch + date + class loads all enrolled students
- "সকলকে উপস্থিত করুন" sets all to present
- Saving upserts attendance records (no duplicates on re-mark)
- History tab shows correct data filtered by batch + month
- Monthly summary per student is accurate
- `npm run build` passes

## Do NOT do in this phase

- Do not build exam/results/leaderboard admin pages yet (D5)
- Do not build roles/announcements pages yet (D6)
