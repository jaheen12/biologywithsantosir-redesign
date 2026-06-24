# Phase D2 — Admin Panel: Students, Enrollments, Batches Pages

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Admin layout is complete (Phase D1).

**Now building three student/batch management pages:**
- `/admin/students` — searchable student list with payment status
- `/admin/enrollments` — enrollment management with capacity enforcement
- `/admin/batches` — batch creation and capacity management

All mutating forms use Client Components. Data display uses Server Components. Wrap pages with a Server Component outer shell that passes data to a `'use client'` inner component where needed.

---

## Page 1: `src/app/admin/students/page.tsx` — শিক্ষার্থী তালিকা

### Data query

```ts
// Fetch all profiles with enrollment info and payment status
const { data: students } = await supabase
  .from('profiles')
  .select(`
    id, full_name, phone, role, created_at,
    enrollments(status, batch_id, batches(name)),
    payment_due(status, outstanding, paid_this_month, monthly_fee)
  `)
  .eq('role', 'student')
  .order('full_name')
```

### UI

**Page title:** "শিক্ষার্থী তালিকা"

**Search bar** (client-side filter): text input that filters `full_name` or `phone` as the user types. Make this a `'use client'` wrapper or use URL search params.

**Filter dropdown:** "সকল" | "সক্রিয়" | "বাকি আছে" | "সম্পূর্ণ পরিশোধিত" — filters by enrollment status + payment status combined.

**Student table:**

| নাম | ফোন | ব্যাচ | ভর্তির অবস্থা | পেমেন্ট | অ্যাকশন |
|---|---|---|---|---|---|
| Rafi Ahmed | 01711... | HSC 2026 A | সক্রিয় | আংশিক (৳400 বাকি) | বিস্তারিত |

**Payment status badge:**
- `'paid'` → green "সম্পূর্ণ ✓"
- `'partial'` → amber "আংশিক (৳{outstanding} বাকি)"
- `'overdue'` → red "বাকি আছে (৳{monthly_fee})"
- No enrollment → gray "ভর্তি নেই"

**"বিস্তারিত" link:** Opens `/admin/students/{id}` — a simple detail page (Server Component) showing:
- Full profile info
- All enrollments
- Last 5 payments with receipt links
- Attendance summary (present/absent/late this month)

**"নতুন পেমেন্ট নিন" quick button** on each student row → links to `/admin/payments/new?student_id={id}`

---

## Page 2: `src/app/admin/enrollments/page.tsx` — ভর্তি ব্যবস্থাপনা

Split into two parts: the enrollment list and the new enrollment form.

### Enrollment list (Server Component data)

```ts
const { data: enrollments } = await supabase
  .from('enrollments')
  .select('*, profiles(full_name, phone), batches(name)')
  .order('enrolled_at', { ascending: false })
```

Table:

| শিক্ষার্থী | ফোন | ব্যাচ | ভর্তির তারিখ | অবস্থা | অ্যাকশন |
|---|---|---|---|---|---|
| Rafi Ahmed | 01711... | HSC 2026 A | ১ জানু ২০২৬ | সক্রিয় | পরিবর্তন |

**Status change buttons** (inline, Client Component):
- Active → "বাদ দিন" (dropped) | "সম্পন্ন" (completed)
- Dropped → "পুনরায় সক্রিয়" (active)

On status change: `supabase.from('enrollments').update({ status }).eq('id', id)` then `router.refresh()`

### New enrollment form (Client Component: `src/components/admin/NewEnrollmentForm.tsx`)

```
┌─────────────────────────────────────────┐
│ নতুন ভর্তি                              │
│                                         │
│ শিক্ষার্থী: [searchable select ▼]       │
│ ব্যাচ:      [select ▼]                  │
│             HSC 2026 Batch A            │
│             আসন বাকি: ৩৭ / ৪০          │
│                                         │
│ [ভর্তি করুন]                            │
└─────────────────────────────────────────┘
```

**Batch select behavior:**
- Query `batches_with_counts` for all active batches
- Show each option as: "HSC 2026 Batch A (৩৭ আসন বাকি)"
- If `seats_remaining = 0`: disable the option and show "(পূর্ণ)"

**Submission logic:**
1. Check `seats_remaining > 0` client-side before submitting
2. If 0: show toast "এই ব্যাচে আর কোনো আসন নেই"
3. On submit: `supabase.from('enrollments').insert({ student_id, batch_id, status: 'active' })`
4. Also update `profiles.batch_id = batch_id` for the student
5. On success: show "ভর্তি সফল হয়েছে ✓" and reset form
6. On duplicate (unique constraint error): show "এই শিক্ষার্থী ইতিমধ্যে এই ব্যাচে ভর্তি আছেন"

---

## Page 3: `src/app/admin/batches/page.tsx` — ব্যাচ ব্যবস্থাপনা

### Data

```ts
const { data: batches } = await supabase
  .from('batches_with_counts')
  .select('*')
  .order('created_at', { ascending: false })
```

### Batch list

Table:

| ব্যাচের নাম | মাসিক ফি | শুরু | শেষ | আসন | ভর্তি | বাকি | সক্রিয় | অ্যাকশন |
|---|---|---|---|---|---|---|---|---|
| HSC 2026 A | ৳800 | ১ জান | ৩১ ডিস | ৪০ | ৩২ | ৮ | ✓ | সম্পাদনা |

**Capacity bar** per row:
```
████████████████░░░░  32/40
```
- Green if `seats_remaining > 10`
- Amber if `seats_remaining` 1–10
- Red if `seats_remaining = 0` (show "পূর্ণ" badge)

**Toggle active status:** Inline checkbox on each row → updates `is_active`

### Create/Edit Batch Form (Client Component: `src/components/admin/BatchForm.tsx`)

Used for both create and edit. Fields:

| Field | Input | Notes |
|---|---|---|
| ব্যাচের নাম | text | required |
| মাসিক ফি (BDT) | number | required, min 0 |
| আসন সংখ্যা | number | required, min 1, default 40 |
| শুরুর তারিখ | date | |
| শেষের তারিখ | date | |
| সক্রিয় | checkbox | default true |

On create: `supabase.from('batches').insert({...})`
On edit: `supabase.from('batches').update({...}).eq('id', id)`
After save: `router.refresh()`

Show "ব্যাচ তৈরি হয়েছে ✓" / "ব্যাচ আপডেট হয়েছে ✓" success message.

---

## Also build: `src/app/admin/students/[id]/page.tsx` — Student Detail

Simple Server Component.

```ts
const { data: student } = await supabase
  .from('profiles')
  .select(`
    *, 
    enrollments(*, batches(name)),
    payments(amount, month, method, paid_on, receipt_number, id)
  `)
  .eq('id', params.id)
  .single()

const { data: attendanceSummary } = await supabase
  .from('attendance')
  .select('status')
  .eq('student_id', params.id)
  .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
```

Display: profile info card, payment table (last 5, with receipt link), attendance summary (this month: X present, Y absent).

---

## Acceptance criteria

- `/admin/students` shows all students with correct payment status badges
- Search filters by name and phone
- `/admin/enrollments` — creating enrollment with a full batch shows "আর কোনো আসন নেই" message
- `/admin/enrollments` — status change buttons work (active ↔ dropped)
- `/admin/batches` — capacity bars render with correct colors
- `/admin/batches` — create form creates a new batch visible in the list
- `/admin/students/{id}` — detail page shows profile, last 5 payments, attendance summary
- `npm run build` passes

## Do NOT do in this phase

- Do not build payment forms yet (D3)
- Do not build exam/results pages yet (D4)
