# Phase D3 — Admin Panel: Payment Entry, Receipt, Reconciliation

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Admin layout (D1) and student/batch management (D2) are complete.

**Now building the payment workflow — the most critical part of the admin panel:**
- `/admin/payments` — full ledger with due/overdue tab
- `/admin/payments/new` — unified cash + bKash payment entry form
- `/admin/payments/[id]/receipt` — printable receipt page
- `/admin/payments/reconcile` — bKash/Nagad TrxID verification queue

---

## Page 1: `src/app/admin/payments/page.tsx` — Payment Ledger

### Data queries

```ts
// All payments with related info
const { data: payments } = await supabase
  .from('payments')
  .select('*, profiles(full_name, phone), batches(name, fee)')
  .order('created_at', { ascending: false })

// Due/overdue students
const { data: dueStudents } = await supabase
  .from('payment_due')
  .select('*')
  .in('status', ['overdue', 'partial'])
  .order('status') // overdue first
```

### UI — Two Tabs

Make this a `'use client'` component for tab switching.

**Tab 1: সকল পেমেন্ট**

Filter bar (client-side):
- Batch dropdown
- Month text input (e.g. "June 2026")
- Method: All | bKash | Nagad | Cash | Bank
- Reconciled: All | যাচাই হয়নি | যাচাই হয়েছে

Payment table:

| শিক্ষার্থী | মাস | কিস্তি | পরিমাণ | পদ্ধতি | TrxID | যাচাই | তারিখ | রশিদ |
|---|---|---|---|---|---|---|---|---|
| Rafi Ahmed | June 2026 | কিস্তি ১ | ৳400 | bKash | BK...ABCD | ⏳ যাচাই বাকি | ১০ জুন | RCP-2026-0002 ↗ |
| Mitu Begum | June 2026 | পূর্ণ | ৳800 | নগদ | — | ✓ | ০২ জুন | RCP-2026-0001 ↗ |

- Unreconciled rows: amber left border + "⏳ যাচাই বাকি" badge
- Reconciled rows: "✓ যাচাই হয়েছে" in green
- Receipt link: opens `/admin/payments/{id}/receipt` in a new tab
- Export to CSV button (top right): triggers client-side CSV download of filtered data

**Tab 2: বাকি / বেতন অবস্থা**

Table from `payment_due`:

| শিক্ষার্থী | ফোন | ব্যাচ | মাস | পরিশোধিত | বাকি | অবস্থা | অ্যাকশন |
|---|---|---|---|---|---|---|---|
| Sadia Islam | 0171... | HSC 2026 A | June 2026 | ৳0 | ৳800 | 🔴 বাকি আছে | পেমেন্ট নিন |
| Rafi Ahmed | 0172... | HSC 2026 A | June 2026 | ৳400 | ৳400 | 🟡 আংশিক | পেমেন্ট নিন |

"পেমেন্ট নিন" button → `/admin/payments/new?student_id={id}&prefill_amount={outstanding}`

Batch filter dropdown at top.

---

## Page 2: `src/app/admin/payments/new/page.tsx` — Payment Entry Form

**Client Component.** Accepts optional URL params: `?student_id=...&prefill_amount=...`

### Step 1: Read URL params and pre-fill

```ts
const searchParams = useSearchParams()
const prefillStudentId = searchParams.get('student_id')
const prefillAmount = searchParams.get('prefill_amount')
```

### Form fields

```
┌─────────────────────────────────────────────┐
│ নতুন পেমেন্ট রেকর্ড করুন                    │
│                                             │
│ শিক্ষার্থী:  [searchable select ▼]           │
│              (auto-filled if URL param)     │
│                                             │
│ ব্যাচ:       [auto-filled from enrollment]  │
│                                             │
│ মাস:         [select: June 2026 ▼]          │
│              (current month pre-selected)   │
│                                             │
│ পেমেন্ট পদ্ধতি:                             │
│  ○ bKash  ○ Nagad  ○ নগদ (Cash)  ○ ব্যাংক │
│                                             │
│ পরিমাণ (BDT): [________]                   │
│ (বাকি: ৳400 — auto-filled from due view)   │
│                                             │
│ আংশিক পেমেন্ট? [☐]                         │
│  └─ কিস্তি নং: [1 ▼]  (shown if checked)   │
│                                             │
│ [bKash/Nagad selected → show:]              │
│ লেনদেন আইডি (TrxID): [__________] *required│
│                                             │
│ নোট: [optional textarea]                    │
│                                             │
│ [পেমেন্ট সংরক্ষণ করুন]                       │
└─────────────────────────────────────────────┘
```

### Student selection behavior

When a student is selected:
1. Fetch their active enrollment → auto-fill `batch_id`
2. Query `payment_due` for that student → show outstanding amount
3. Pre-fill `amount` with `outstanding` value
4. Show current month's status: "June 2026: ৳400 পরিশোধিত, ৳400 বাকি"

```ts
const handleStudentChange = async (studentId: string) => {
  const { data: enrollment } = await supabase
    .from('enrollments').select('batch_id').eq('student_id', studentId).eq('status', 'active').single()
  setBatchId(enrollment?.batch_id)

  const { data: due } = await supabase
    .from('payment_due').select('*').eq('student_id', studentId).single()
  setDueInfo(due)
  setAmount(due?.outstanding ?? '')
}
```

### Validation rules

- If `method = 'bKash'` or `'Nagad'`: `transaction_id` is required. Show red error "TrxID প্রয়োজন" if empty.
- If `is_installment = true`: `installment_number` is required.
- `amount` must be > 0.
- `student_id`, `batch_id`, `month`, `method` are all required.

### Submission

```ts
const payload = {
  student_id,
  batch_id,
  amount: Number(amount),
  month,
  paid_on: new Date().toISOString().split('T')[0],
  method,
  is_installment,
  installment_number: is_installment ? installment_number : null,
  transaction_id: ['bKash', 'Nagad'].includes(method) ? transaction_id : null,
  reconciled: method === 'cash' || method === 'bank', // auto-reconcile cash and bank
  recorded_by: currentAdminId,
  note,
}

const { data: newPayment, error } = await supabase.from('payments').insert(payload).select().single()
```

On success: redirect to `/admin/payments/{newPayment.id}/receipt`

On error: show "পেমেন্ট সংরক্ষণ হয়নি: {error.message}"

---

## Page 3: `src/app/admin/payments/[id]/receipt/page.tsx` — Payment Receipt

**Server Component** — fetches data server-side then renders a printable page. Both admin and student can access their own receipts.

### Data query

```ts
const { data: payment } = await supabase
  .from('payments')
  .select('*, profiles!student_id(full_name, phone), batches(name, fee), profiles!recorded_by(full_name)')
  .eq('id', params.id)
  .single()
```

### Receipt layout

Styled with `@media print` CSS to hide the sidebar and navbar when printing.

```
┌─────────────────────────────────────────────────┐
│          BiologywithSantosir.com                │
│         শিক্ষার্থী পেমেন্ট রশিদ                 │
│─────────────────────────────────────────────────│
│ রশিদ নং: RCP-2026-0042          তারিখ: ১০/০৬/২৬│
│─────────────────────────────────────────────────│
│ শিক্ষার্থীর নাম: Rafi Ahmed                     │
│ ফোন: 01711XXXXXX                                │
│ ব্যাচ: HSC 2026 Batch A                         │
│─────────────────────────────────────────────────│
│ মাস: June 2026                                  │
│ পরিমাণ: ৳ 400                                   │
│ কথায়: চারশত টাকা মাত্র                         │
│ পদ্ধতি: bKash                                   │
│ TrxID: BK20260610ABCD                           │
│ কিস্তি: ১ম কিস্তি                               │
│─────────────────────────────────────────────────│
│ যাচাই অবস্থা: ⏳ যাচাই বাকি                     │
│ রেকর্ড করেছেন: Admin Santosir                   │
│─────────────────────────────────────────────────│
│                    [🖨️ প্রিন্ট করুন]             │
└─────────────────────────────────────────────────┘
```

**Amount in Bengali words** — implement a simple number-to-Bengali-words function:
```ts
function toBengaliWords(amount: number): string {
  // Handle common coaching fee amounts (0–5000)
  // E.g. 800 → "আটশত টাকা মাত্র"
  // 400 → "চারশত টাকা মাত্র"
  // Full implementation: use hundreds/thousands mapping
}
```

**Print button:**
```tsx
<button onClick={() => window.print()} className="print:hidden">
  🖨️ প্রিন্ট করুন
</button>
```

**Print CSS** (in a `<style>` tag or global CSS):
```css
@media print {
  nav, aside, .print\:hidden { display: none !important; }
  body { background: white; }
  .receipt-card { box-shadow: none; border: 1px solid #ccc; }
}
```

**Reconciliation badge:**
- `reconciled = true` → green "✓ যাচাই সম্পন্ন"
- `reconciled = false` → amber "⏳ যাচাই বাকি"
- Cash payments: always show "নগদ পেমেন্ট — স্বয়ংক্রিয়ভাবে যাচাই"

---

## Page 4: `src/app/admin/payments/reconcile/page.tsx` — bKash Reconciliation Queue

**Server Component** for data, **Client Component** for confirm/reject actions.

### Data

```ts
const { data: pending } = await supabase
  .from('payments')
  .select('*, profiles!student_id(full_name, phone), profiles!recorded_by(full_name)')
  .eq('reconciled', false)
  .in('method', ['bKash', 'Nagad'])
  .order('created_at', { ascending: true }) // oldest first
```

### UI

**Page title:** "bKash / Nagad যাচাই তালিকা"

Count badge: "{pending.length} টি পেমেন্ট যাচাই বাকি"

Table per pending payment:

```
┌───────────────────────────────────────────────────────┐
│ Rafi Ahmed (01711...)     June 2026     ৳400           │
│ পদ্ধতি: bKash    TrxID: BK20260610ABCD                │
│ রেকর্ড করা হয়েছে: ১০ জুন ২০২৬  by Admin              │
│                                                       │
│ [✓ নিশ্চিত করুন]   [✗ বাতিল হিসেবে চিহ্নিত করুন]     │
└───────────────────────────────────────────────────────┘
```

**"নিশ্চিত করুন" action:**
```ts
await supabase.from('payments').update({
  reconciled: true,
  reconciled_by: currentAdminId,
  reconciled_at: new Date().toISOString(),
}).eq('id', paymentId)
```
Row disappears from the list after confirmation. Show "✓ যাচাই সম্পন্ন" toast.

**"বাতিল হিসেবে চিহ্নিত করুন" action:**
- Opens a modal: "কারণ লিখুন (ঐচ্ছিক):" + confirm button
- On confirm: `supabase.from('payments').update({ note: 'REJECTED: ' + reason }).eq('id', paymentId)`
- Does NOT delete the record — just adds a note. Row stays in list with a red "বাতিল" label.
- Admin must then manually follow up with the student.

**Bulk confirm button:** "সকল যাচাই করুন" — loops through all pending and confirms each. Shows a confirmation dialog first: "আপনি কি সব {count}টি পেমেন্ট একসাথে যাচাই করতে চান?"

**Empty state:** "🎉 সকল bKash/Nagad পেমেন্ট যাচাই সম্পন্ন হয়েছে"

---

## Acceptance criteria

- `/admin/payments` — all payments tab shows full ledger; unreconciled rows have amber badge
- `/admin/payments` — due/overdue tab correctly shows students from `payment_due` view
- `/admin/payments/new` — cash payment saves with `reconciled = true`; redirects to receipt
- `/admin/payments/new` — bKash payment requires TrxID; saves with `reconciled = false`; redirects to receipt
- `/admin/payments/new` — pre-fills amount from `payment_due` when student is selected
- `/admin/payments/{id}/receipt` — shows correct data; amount in Bengali words; print button hides sidebar
- `/admin/payments/reconcile` — confirm updates `reconciled = true`; row disappears
- `/admin/payments/reconcile` — reject adds note but keeps record
- Both student and admin can access receipt URL for student's own payments
- `npm run build` passes

## Do NOT do in this phase

- Do not build exam/results/attendance admin pages yet (D4–D5)
