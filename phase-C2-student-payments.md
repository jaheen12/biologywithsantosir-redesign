# Phase C2 — Student Panel: Payments Page

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. Auth (Phase A), database (Phase B), and dashboard layout + home (Phase C1) are complete.

**Now building:** `/dashboard/payments` — the student's fee and payment history page.

**Key domain facts:**
- Monthly fee (মাসিক বেতন) is fixed per batch (e.g. ৳800/month)
- A month can have multiple payment rows if `is_installment = true` (partial payments)
- `payment_due` view gives current month's status instantly
- `transaction_id` exists for bKash/Nagad payments — show only last 4 chars to students for privacy
- Receipt URL for each payment: `/admin/payments/{id}/receipt` — students can also access their own receipts (RLS allows it)

---

## What to build

### `src/app/dashboard/payments/page.tsx`

**Server Component.** Two data queries:

```ts
// 1. Current month status
const { data: dueStatus } = await supabase
  .from('payment_due')
  .select('*')
  .eq('student_id', user.id)
  .single()

// 2. Full payment history, newest first
const { data: payments } = await supabase
  .from('payments')
  .select('*, batches(name, fee)')
  .eq('student_id', user.id)
  .order('paid_on', { ascending: false })
```

---

## UI Sections

### Section 1: Current Month Status Card

A prominent card at the top of the page showing this month's payment situation.

**Layout:**
```
┌─────────────────────────────────────────────┐
│  জুন ২০২৬ এর বেতন                           │
│                                             │
│  মাসিক ফি: ৳800        পরিশোধিত: ৳400      │
│  বাকি: ৳400                                 │
│                                             │
│  [আংশিক পরিশোধ]  ← status badge           │
└─────────────────────────────────────────────┘
```

**Badge colors:**
- `'paid'` → green badge "সম্পূর্ণ পরিশোধিত ✓"
- `'partial'` → amber badge "আংশিক পরিশোধ"
- `'overdue'` → red badge "বাকি আছে"

If `dueStatus` is null (student not enrolled in any active batch): show "কোনো সক্রিয় ভর্তি নেই"

---

### Section 2: Payment History Table

Title: "পেমেন্টের ইতিহাস"

Group payments by `month`. For each month group:

```
━━━ June 2026 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  কিস্তি ১ | ৳400 | bKash | ****ABCD | ১০ জুন | রশিদ দেখুন ↗
  ─────────────────────────────────────────
  মাসিক মোট: ৳400 / ৳800  [বাকি: ৳400]

━━━ May 2026 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  পূর্ণ পেমেন্ট | ৳800 | bKash | ****XY99 | ০৫ মে | রশিদ দেখুন ↗
  ─────────────────────────────────────────
  মাসিক মোট: ৳800 / ৳800  [সম্পূর্ণ ✓]
```

**Table columns per payment row:**
| Field | Display |
|---|---|
| Installment | "কিস্তি {installment_number}" if `is_installment`, else "পূর্ণ পেমেন্ট" |
| Amount | ৳{amount} |
| Method | bKash / Nagad / নগদ (cash) / ব্যাংক |
| TrxID | Last 4 chars with `****` prefix — show "নগদ" for cash |
| Date | Bengali date format using `toLocaleDateString('bn-BD')` |
| Receipt | "রশিদ দেখুন ↗" link → `/admin/payments/{id}/receipt` (opens in new tab) |

**Month subtotal row:**
- Show `SUM(amount)` for that month vs `batch.fee`
- If fully paid: green "সম্পূর্ণ পরিশোধিত ✓"
- If partial: amber "বাকি: ৳{remaining}"
- If zero paid for that month: red "বাকি: ৳{batch.fee}"

**Empty state:** If no payment history: "এখনো কোনো পেমেন্ট রেকর্ড নেই"

---

### Section 3: Summary Footer

Simple two-column summary at the bottom:

```
মোট পরিশোধিত (সকল মাস): ৳{total_paid}
ব্যাচ: HSC 2026 Batch A
```

---

## Grouping logic (server-side)

Group the flat `payments` array by `month` in the Server Component before passing to UI:

```ts
// Group payments by month
const grouped = payments?.reduce((acc, payment) => {
  if (!acc[payment.month]) acc[payment.month] = []
  acc[payment.month].push(payment)
  return acc
}, {} as Record<string, typeof payments>)

// Sort months: most recent first
// Use a simple sort by parsing "June 2026" → Date
const sortedMonths = Object.keys(grouped ?? {}).sort((a, b) => {
  return new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime()
})
```

---

## Acceptance criteria

- Page loads and shows current month's status card
- Red/amber/green badge matches actual payment status from `payment_due` view
- Payments are grouped by month with subtotals
- Installment rows show "কিস্তি 1", "কিস্তি 2" etc.
- TrxID shows masked (last 4 chars only)
- "রশিদ দেখুন" link opens the correct receipt URL in a new tab
- Empty state renders when no payments exist
- `npm run build` passes

## Do NOT do in this phase

- Do not build the receipt page here (that is Phase D3)
- Do not allow students to submit payments — read-only view only
- Do not build other dashboard pages yet (C3–C5)
