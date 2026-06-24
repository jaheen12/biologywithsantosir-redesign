# Phase B2 — Database: Computed Views

## Context

You are working on **BiologywithSantosir.com** — Supabase Postgres. All core tables exist (Phase B1). Now create the two computed views that the app queries instead of raw tables.

Run all SQL in **Supabase SQL Editor** in the order given.

---

## What to create

### View 1: `batches_with_counts`

Used by the admin panel everywhere instead of the raw `batches` table. Adds live `enrolled_count` (active students only) and `seats_remaining` per batch.

```sql
CREATE VIEW batches_with_counts AS
SELECT
  b.*,
  COUNT(e.id) FILTER (WHERE e.status = 'active')                        AS enrolled_count,
  b.capacity - COUNT(e.id) FILTER (WHERE e.status = 'active')           AS seats_remaining
FROM batches b
LEFT JOIN enrollments e ON e.batch_id = b.id
GROUP BY b.id;
```

**How it is used:**
- Admin batch list page queries `batches_with_counts` to show fill bars
- Enrollment form checks `seats_remaining > 0` before allowing new enrollment
- If `seats_remaining = 0` the form must block with message "এই ব্যাচে আর সিট নেই"

### View 2: `payment_due`

Flags every active student with their payment status for the **current calendar month**. Both admin dashboard and student panel query this view.

```sql
CREATE VIEW payment_due AS
SELECT
  p.id                                                              AS student_id,
  p.full_name,
  p.phone,
  e.batch_id,
  b.name                                                            AS batch_name,
  b.fee                                                             AS monthly_fee,
  TO_CHAR(NOW(), 'FMMonth YYYY')                                    AS due_month,
  COALESCE(
    SUM(pay.amount) FILTER (
      WHERE pay.month = TO_CHAR(NOW(), 'FMMonth YYYY')
    ), 0
  )                                                                 AS paid_this_month,
  b.fee - COALESCE(
    SUM(pay.amount) FILTER (
      WHERE pay.month = TO_CHAR(NOW(), 'FMMonth YYYY')
    ), 0
  )                                                                 AS outstanding,
  CASE
    WHEN COALESCE(
      SUM(pay.amount) FILTER (
        WHERE pay.month = TO_CHAR(NOW(), 'FMMonth YYYY')
      ), 0
    ) <= 0           THEN 'overdue'
    WHEN COALESCE(
      SUM(pay.amount) FILTER (
        WHERE pay.month = TO_CHAR(NOW(), 'FMMonth YYYY')
      ), 0
    ) < b.fee        THEN 'partial'
    ELSE                  'paid'
  END                                                               AS status
FROM profiles p
JOIN enrollments e
  ON e.student_id = p.id
  AND e.status = 'active'
JOIN batches b
  ON b.id = e.batch_id
LEFT JOIN payments pay
  ON pay.student_id = p.id
GROUP BY p.id, p.full_name, p.phone, e.batch_id, b.name, b.fee;
```

**Status values:** `'paid'` | `'partial'` | `'overdue'`

**Important note on month matching:** The `payments.month` column stores values like `"June 2026"`. The view uses `TO_CHAR(NOW(), 'FMMonth YYYY')` (with `FM` prefix to strip leading spaces). When recording a payment in the app, always format the month string the same way: `format(new Date(), 'MMMM yyyy')` in JavaScript (e.g. using `date-fns`).

---

## Acceptance criteria

- `SELECT * FROM batches_with_counts;` returns rows with `enrolled_count` and `seats_remaining` columns
- `SELECT * FROM payment_due;` returns rows with `status` values of `'paid'`, `'partial'`, or `'overdue'`
- Both views exist in Supabase with no errors
- `npm run build` still passes

## Do NOT do in this phase

- Do not create triggers yet (Phase B3)
- Do not enable RLS yet (Phase B4)
