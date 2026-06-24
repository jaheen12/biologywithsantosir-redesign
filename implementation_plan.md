# Implementation Plan v2 — Coaching Center Management System
## BiologywithSantosir.com — Student Panel + Admin Panel

This plan transforms the existing content platform into a full coaching center management system. Students can enroll in courses (ভর্তি), track payments, view their exam results and leaderboard ranking, and follow their weekly class routine — all without leaving the website. Admins manage everything from a single dashboard.

> **v2 changes from v1:** Added due/overdue payment alert system, partial payment / installment support, printable payment receipts (cash + bKash), bKash manual reconciliation flow, seat/capacity management on batches, in-app role management UI, `payment_due` computed view, `transaction_id` on payments, `enrolled_count` computed on batches, and `attendance` table. Removed email verification requirement (no OTP/email API available). Leaderboard retains full marks visibility.

---

## Architecture Overview

```
Public Website  →  /  /topics /notes /mcq /about /contact /courses /search
                       (no login required)

Auth Gateway    →  /login  /signup  /auth/callback
                       (email + password, Supabase Auth, NO email verification)

Student Panel   →  /dashboard          (logged-in students only)
                   /dashboard/payments
                   /dashboard/routine
                   /dashboard/exams
                   /dashboard/results
                   /dashboard/leaderboard
                   /dashboard/profile

Admin Panel     →  /admin              (admin role only)
                   /admin/students
                   /admin/enrollments
                   /admin/payments
                   /admin/payments/new
                   /admin/payments/[id]/receipt
                   /admin/courses
                   /admin/exams
                   /admin/results
                   /admin/leaderboard
                   /admin/routine
                   /admin/announcements
                   /admin/roles
                   /admin/attendance
```

**Role Detection:** Roles are stored in Supabase `auth.users.app_metadata.role` (`student` | `admin`). Middleware checks this on every request and redirects unauthorized users. Regular students cannot access `/admin/*`. Only `role = 'admin'` accounts can. Role promotion is done via the in-app `/admin/roles` page — no Supabase dashboard access needed.

**Auth note:** Email verification is disabled. `supabase.auth.signUp()` auto-confirms users immediately. Students can log in right after registration. This is configured via `SUPABASE_AUTH_EMAIL_CONFIRM=false` in project settings.

---

## Database Schema — New Tables

### `profiles`
Extends `auth.users` with coaching-specific data.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | References `auth.users.id` |
| `full_name` | `text` | Student's full name |
| `phone` | `text` | Mobile number |
| `role` | `text` | `'student'` \| `'admin'` |
| `batch_id` | `uuid` FK → `batches.id` | Current active batch |
| `avatar_url` | `text` | Profile picture URL |
| `created_at` | `timestamptz` | |

### `batches`
A batch is a group of students enrolled in a specific course cohort.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `name` | `text` | e.g. "HSC 2025 Batch A" |
| `course_id` | `uuid` FK → `courses.id` | |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `fee` | `numeric` | Total monthly fee (BDT) |
| `capacity` | `int2` | Maximum seats in this batch (e.g. 40) |
| `is_active` | `bool` | |

**Computed view — `batches_with_counts`:**
```sql
CREATE VIEW batches_with_counts AS
SELECT
  b.*,
  COUNT(e.id) FILTER (WHERE e.status = 'active') AS enrolled_count,
  b.capacity - COUNT(e.id) FILTER (WHERE e.status = 'active') AS seats_remaining
FROM batches b
LEFT JOIN enrollments e ON e.batch_id = b.id
GROUP BY b.id;
```
Admins use this view everywhere instead of the raw `batches` table. Enrollment form checks `seats_remaining > 0` before allowing a new enrollment.

### `enrollments`
Tracks student ভর্তি (enrollment) records.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `student_id` | `uuid` FK → `profiles.id` | |
| `batch_id` | `uuid` FK → `batches.id` | |
| `enrolled_at` | `timestamptz` | |
| `status` | `text` | `'active'` \| `'dropped'` \| `'completed'` |

### `payments`
Monthly / installment payment ledger per student.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `student_id` | `uuid` FK → `profiles.id` | |
| `batch_id` | `uuid` FK → `batches.id` | |
| `amount` | `numeric` | Amount paid (BDT) |
| `month` | `text` | e.g. "June 2026" |
| `paid_on` | `date` | |
| `method` | `text` | `'bKash'` \| `'Nagad'` \| `'cash'` \| `'bank'` |
| `is_installment` | `bool` | `true` if partial payment of the month's fee |
| `installment_number` | `int2` | e.g. `1`, `2` — which installment for this month |
| `transaction_id` | `text` | bKash/Nagad TrxID (required when method ≠ 'cash') |
| `reconciled` | `bool` | Admin has verified the transaction ID (default `false` for bKash/Nagad, auto-`true` for cash) |
| `reconciled_by` | `uuid` FK → `profiles.id` | Admin who confirmed the transaction |
| `reconciled_at` | `timestamptz` | |
| `note` | `text` | Admin note |
| `recorded_by` | `uuid` FK → `profiles.id` | Admin who entered the record |
| `receipt_number` | `text` | Auto-generated, e.g. "RCP-2026-0042" |

**Receipt number generation trigger:**
```sql
CREATE SEQUENCE receipt_seq START 1;

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('receipt_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number
BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();
```

**Installment logic note:** For a month where `is_installment = true`, multiple rows exist with the same `student_id` + `month` combination (e.g. installment_number 1 and 2). Total paid for a month = `SUM(amount) WHERE student_id = X AND month = 'June 2026'`. Due = `batch.fee - total_paid`.

### `payment_due` — Computed View

Flags every active student who has not fully paid for the current month.

```sql
CREATE VIEW payment_due AS
SELECT
  p.id AS student_id,
  p.full_name,
  p.phone,
  e.batch_id,
  b.name AS batch_name,
  b.fee AS monthly_fee,
  TO_CHAR(NOW(), 'Month YYYY') AS due_month,
  COALESCE(SUM(pay.amount) FILTER (
    WHERE pay.month = TO_CHAR(NOW(), 'Month YYYY')
  ), 0) AS paid_this_month,
  b.fee - COALESCE(SUM(pay.amount) FILTER (
    WHERE pay.month = TO_CHAR(NOW(), 'Month YYYY')
  ), 0) AS outstanding,
  CASE
    WHEN COALESCE(SUM(pay.amount) FILTER (
      WHERE pay.month = TO_CHAR(NOW(), 'Month YYYY')
    ), 0) = 0 THEN 'overdue'
    WHEN COALESCE(SUM(pay.amount) FILTER (
      WHERE pay.month = TO_CHAR(NOW(), 'Month YYYY')
    ), 0) < b.fee THEN 'partial'
    ELSE 'paid'
  END AS status
FROM profiles p
JOIN enrollments e ON e.student_id = p.id AND e.status = 'active'
JOIN batches b ON b.id = e.batch_id
LEFT JOIN payments pay ON pay.student_id = p.id
GROUP BY p.id, p.full_name, p.phone, e.batch_id, b.name, b.fee;
```

Status values: `'paid'` | `'partial'` | `'overdue'`. Admin dashboard and student panel both query this view.

### `routines`
Weekly class schedule per batch.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `batch_id` | `uuid` FK → `batches.id` | |
| `day_of_week` | `text` | `'Saturday'` … `'Friday'` |
| `start_time` | `time` | |
| `end_time` | `time` | |
| `subject` | `text` | e.g. "Zoology Chapter 3" |
| `platform` | `text` | `'Zoom'` \| `'Google Meet'` \| `'Physical'` |
| `link` | `text` | Class join link (optional) |

### `attendance`
Tracks per-student class attendance.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `routine_id` | `uuid` FK → `routines.id` | Which class slot |
| `student_id` | `uuid` FK → `profiles.id` | |
| `date` | `date` | Actual class date (since routine repeats weekly) |
| `status` | `text` | `'present'` \| `'absent'` \| `'late'` |
| `marked_by` | `uuid` FK → `profiles.id` | Admin who marked |
| `marked_at` | `timestamptz` | |

### `exams`
Exam schedule and metadata.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `batch_id` | `uuid` FK → `batches.id` | |
| `title` | `text` | e.g. "মাসিক পরীক্ষা — জুন ২০২৬" |
| `exam_date` | `date` | |
| `total_marks` | `int2` | |
| `type` | `text` | `'mcq'` \| `'written'` \| `'mock'` |
| `topic_id` | `text` FK → `topics.id` | Optional topic link |

### `results`
Student marks per exam.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `exam_id` | `uuid` FK → `exams.id` | |
| `student_id` | `uuid` FK → `profiles.id` | |
| `marks_obtained` | `numeric` | |
| `grade` | `text` | Auto-computed by trigger |
| `remarks` | `text` | Teacher's note |

### `announcements`
Admin-to-student broadcast messages.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `title` | `text` | |
| `body` | `text` | |
| `batch_id` | `uuid` FK → `batches.id` | `null` = all students |
| `created_at` | `timestamptz` | |

---

## RLS Security Design

> Every new table has RLS enabled. Policies use `auth.uid()` — never the deprecated `auth.role()`.

| Table | Student (`authenticated`) | Admin |
|---|---|---|
| `profiles` | SELECT own row only | SELECT/UPDATE all |
| `enrollments` | SELECT own rows | Full access |
| `payments` | SELECT own rows | Full CRUD |
| `routines` | SELECT rows for own batch | Full CRUD |
| `attendance` | SELECT own rows | Full CRUD |
| `exams` | SELECT rows for own batch | Full CRUD |
| `results` | SELECT own rows | Full CRUD |
| `announcements` | SELECT (public or own batch) | Full CRUD |
| `batches` | SELECT active batches | Full CRUD |
| `batches_with_counts` | SELECT active batches | SELECT all |
| `payment_due` | SELECT own row | SELECT all |

---

## Proposed Changes

### Phase A — Authentication Foundation

#### [NEW] `src/middleware.ts`
- Intercept all requests, refresh Supabase session cookies via `getUser()`.
- Redirect unauthenticated users away from `/dashboard/*` → `/login`.
- Redirect non-admin users away from `/admin/*` → `/dashboard`.
- Redirect already-logged-in users away from `/login`, `/signup` → `/dashboard`.

#### [NEW] `src/app/login/page.tsx`
- Login form: Email + Password.
- Bangla error messages.
- Link to `/signup`.

#### [NEW] `src/app/signup/page.tsx`
- Registration form: Full Name, Phone, Email, Password, Confirm Password.
- Calls `supabase.auth.signUp()` with `emailRedirectTo` omitted and email confirmation disabled in Supabase project settings.
- On success: redirects directly to `/dashboard` — no email verification step.
- A `handle_new_user()` trigger auto-inserts a `profiles` row with `role = 'student'`.

#### [NEW] `src/app/auth/callback/route.ts`
- Kept for future use / password reset flows. No-op for signup in v2.

#### [MODIFY] `src/components/layout/Navbar.tsx`
- Auth state listener (`supabase.auth.onAuthStateChange`).
- Show avatar/initials + dropdown ("My Dashboard", "Log Out") when signed in.
- Show "লগ ইন" button when signed out.

---

### Phase B — Database Migration

Run via Supabase MCP `execute_sql` in order:

1. Create all tables: `profiles`, `batches`, `enrollments`, `payments`, `routines`, `attendance`, `exams`, `results`, `announcements`.
2. Add computed views: `batches_with_counts`, `payment_due`.
3. Create receipt number sequence and trigger.
4. Enable RLS on all tables and create all policies.
5. Create `handle_new_user()` trigger on `auth.users`.
6. Create grade auto-compute trigger on `results`.
7. Seed sample data: 1 batch (capacity 40), 3 enrollments, payment records including one installment pair, 1 exam with results, attendance records.

---

### Phase C — Student Panel (`/dashboard`)

Layout: persistent left sidebar. All pages server-rendered from Supabase data scoped to the logged-in student.

#### [NEW] `src/app/dashboard/layout.tsx`
- Fetches profile and enrollment.
- Renders sidebar with payment due badge (red dot) if `payment_due.status ≠ 'paid'`.
- Falls back to `/login` if no session.

#### [NEW] `src/app/dashboard/page.tsx` — **Dashboard**
- Welcome card with student name and batch.
- **Payment alert banner:** If `payment_due.status = 'overdue'` → red banner "এই মাসের বেতন বাকি আছে". If `'partial'` → amber banner "আংশিক পরিশোধ হয়েছে, বাকি ৳{outstanding}".
- Summary cards: Next class, Upcoming exam, Latest result rank.
- Latest announcements.

#### [NEW] `src/app/dashboard/payments/page.tsx` — **Payments / ফি**
- Current month status card at top: paid / partial / overdue with outstanding amount.
- Payment history table: Month, Installment#, Amount, Method, TrxID (last 4 chars only), Date.
- Installment rows grouped visually under the same month with a subtotal.
- Monthly totals vs batch fee — shows remaining due per month in amber if unpaid.

#### [NEW] `src/app/dashboard/routine/page.tsx` — **Routine / রুটিন**
- Weekly schedule table for student's batch.
- Today's class highlighted.
- Join link buttons for online classes.

#### [NEW] `src/app/dashboard/exams/page.tsx` — **Exams / পরীক্ষা**
- Upcoming exams (date, type, syllabus).
- Past exams with result status.

#### [NEW] `src/app/dashboard/results/page.tsx` — **Results / ফলাফল**
- Table per exam: Marks, Grade, Class Average, Rank, Remarks.
- Performance bar per exam.

#### [NEW] `src/app/dashboard/leaderboard/page.tsx` — **Leaderboard / র‍্যাংকিং**
- All students in batch ranked by total marks across all exams.
- Columns: Rank, Name, Total Marks, Exams Appeared.
- Current student's row highlighted.
- Trophy icon for top 3.

#### [NEW] `src/app/dashboard/attendance/page.tsx` — **Attendance / উপস্থিতি**
- Monthly attendance summary: Present / Absent / Late counts.
- Filterable by month.
- Per-class detail table.

#### [NEW] `src/app/dashboard/profile/page.tsx` — **Profile / প্রোফাইল**
- View/edit: Full Name, Phone, Avatar upload.

---

### Phase D — Admin Panel (`/admin`)

Layout: wider sidebar with section groups.

#### [NEW] `src/app/admin/layout.tsx`
- Validates `app_metadata.role === 'admin'`, else 403.
- Sidebar sections: Students, Enrollments, Payments, Batches, Exams, Results, Leaderboard, Routine, Attendance, Announcements, Roles.

#### [NEW] `src/app/admin/page.tsx` — **Admin Dashboard**
- KPI cards: Total active students, Revenue this month, Pending dues count, Unreconciled bKash payments count.
- **Due/Overdue alert table:** Top 10 students with `payment_due.status = 'overdue'` — Name, Batch, Phone, Outstanding amount. Quick-link to record payment.
- Unreconciled payments feed (bKash/Nagad entries awaiting TrxID verification).
- Upcoming exams widget.
- Batch capacity overview: each batch shows `enrolled_count / capacity` as a fill bar.

#### [NEW] `src/app/admin/students/page.tsx` — **Students**
- Searchable, filterable student table.
- Payment status badge (paid / partial / overdue) on each row from `payment_due` view.
- Columns: Name, Phone, Batch, Enrollment Status, Payment Status, Actions.
- View profile, attendance summary, payment summary per student.

#### [NEW] `src/app/admin/enrollments/page.tsx` — **Enrollments / ভর্তি**
- List all enrollments.
- **New enrollment form:** Select student + batch. Shows `seats_remaining` from `batches_with_counts`. Blocks submission if `seats_remaining = 0` with message "এই ব্যাচে আর সিট নেই".
- Approve / drop / complete status updates.

#### [NEW] `src/app/admin/payments/page.tsx` — **Payments / পেমেন্ট**

Full payment ledger with two sub-views:

**All Payments tab:**
- Filter by batch, month, method, reconciliation status.
- Unreconciled bKash/Nagad rows shown with amber "যাচাই করুন" badge.
- Each row: Student, Month, Installment#, Amount, Method, TrxID, Reconciled, Date, Receipt#.
- Export to CSV.

**Due/Overdue tab:**
- Pulled from `payment_due` view.
- Filter by batch, status.
- Columns: Student, Phone, Batch, Due Month, Paid So Far, Outstanding, Status.
- Quick "Record Payment" button per row.

#### [NEW] `src/app/admin/payments/new/page.tsx` — **Record Payment**

Single form for both cash and bKash/Nagad payments.

**Fields:**
- Student (searchable dropdown)
- Batch (auto-filled from student's enrollment)
- Month (dropdown: current month pre-selected)
- Payment Method: `bKash` | `Nagad` | `Cash` | `Bank`
- Amount (BDT) — pre-filled with outstanding due if partial
- Is Installment? (checkbox) → if checked, show Installment Number field
- Transaction ID (required and visible only when method = bKash or Nagad)
- Note (optional)

**Behavior on submit:**
- Cash: `reconciled = true` automatically (no TrxID needed). Redirects to receipt page.
- bKash/Nagad: `reconciled = false`, `transaction_id` saved. Admin shown a "payment recorded — reconciliation pending" notice. Redirects to receipt page regardless.
- Receipt is generated immediately for both methods.

#### [NEW] `src/app/admin/payments/[id]/receipt/page.tsx` — **Payment Receipt**

Printable receipt page. Print-optimized with `@media print` CSS — hides navbar and sidebar.

**Receipt contains:**
- Coaching center name and logo
- Receipt number (e.g. RCP-2026-0042)
- Date of payment
- Student name and phone
- Batch name
- Month
- Amount in BDT (numeric + Bengali words, e.g. "পাঁচশত টাকা মাত্র")
- Payment method
- Transaction ID (for bKash/Nagad) or "নগদ" (for cash)
- Installment info (if applicable: "কিস্তি ১ এর মধ্যে ১")
- Reconciliation status badge
- Admin name who recorded it
- "Print" button (triggers `window.print()`)

Both admin and student can access their own receipt via a direct URL. RLS ensures students can only view receipts for their own `student_id`.

#### [NEW] `src/app/admin/payments/reconcile/page.tsx` — **bKash Reconciliation**

Dedicated view for unreconciled bKash/Nagad payments.

- Lists all payments where `reconciled = false` and `method IN ('bKash', 'Nagad')`.
- Columns: Student, Phone, Month, Amount, Method, Transaction ID, Recorded On, Recorded By.
- Admin verifies TrxID (calls bKash/Nagad manually or checks their account) then clicks "Confirm" → sets `reconciled = true`, `reconciled_by = auth.uid()`, `reconciled_at = now()`.
- "Reject" button: marks payment for admin review (adds a note, does not delete the record).
- Bulk confirm option for batch verification.

#### [NEW] `src/app/admin/batches/page.tsx` — **Batches / ব্যাচ**
- List all batches from `batches_with_counts` view.
- Each row shows: Name, Course, Start/End, Fee, Capacity, Enrolled Count, Seats Remaining.
- Seats remaining shown as `enrolled_count / capacity` — turns red when ≤ 5 seats remain.
- Create/edit batch form: name, course, dates, monthly fee, **capacity** (required).

#### [NEW] `src/app/admin/routine/page.tsx` — **Routine Manager**
- Per-batch weekly schedule editor.
- Add/edit/delete class slots.

#### [NEW] `src/app/admin/attendance/page.tsx` — **Attendance**
- Select batch + date → see all enrolled students for that date's routine slot.
- Mark each student: Present / Absent / Late.
- Bulk "Mark All Present" button.
- View historical attendance by batch + month.

#### [NEW] `src/app/admin/exams/page.tsx` — **Exams**
- List and create exams per batch.
- Set date, marks, type, topic.

#### [NEW] `src/app/admin/results/page.tsx` — **Results Entry**
- Select exam → see all enrolled students → enter marks per student.
- Bulk marks entry form.

#### [NEW] `src/app/admin/leaderboard/page.tsx` — **Leaderboard View**
- Admin view of all-batch leaderboards. Full marks visible.

#### [NEW] `src/app/admin/announcements/page.tsx` — **Announcements**
- Create broadcast messages to all students or a specific batch.

#### [NEW] `src/app/admin/roles/page.tsx` — **Role Management**

In-app UI for promoting/demoting user roles without Supabase dashboard access.

- Table of all users: Name, Email, Phone, Current Role, Last Login.
- Filter by role (student / admin).
- Per-row "Promote to Admin" button (student → admin) and "Demote to Student" (admin → student).
- Confirmation modal before any role change: "আপনি কি {name}-কে Admin করতে চান?"
- Self-demotion blocked: an admin cannot demote their own account.
- Role changes call a Supabase Edge Function `set-user-role` that uses the service role key to update `auth.users.app_metadata.role` and `profiles.role` atomically.
- All role changes logged to a `role_audit_log` table: `changed_by`, `target_user`, `old_role`, `new_role`, `changed_at`.

**Edge Function: `supabase/functions/set-user-role/index.ts`**
```typescript
// Called by admin panel only. Validates caller is admin before updating.
// Updates both auth.users app_metadata AND profiles.role for consistency.
// Returns 403 if caller is not admin or attempts self-demotion.
```

---

## Verification Plan

### Automated
- `npm run build` — zero compile errors.

### Manual
- Register → log in immediately (no email verification) → reach `/dashboard`.
- Student: see payment due banner if current month unpaid. View installment history. Print receipt.
- Admin: access `/admin`, see due/overdue alerts on dashboard. Record cash payment → receipt generated. Record bKash payment → appears in reconciliation queue → confirm TrxID → reconciled.
- Admin: create batch with capacity 2 → enroll 2 students → third enrollment blocked with "আর সিট নেই".
- Admin: promote a student to admin via `/admin/roles`. New admin can access `/admin/*`.
- Admin: attempt to demote own account → blocked.
- Non-admin trying `/admin` → redirected to `/dashboard`.
- Unauthenticated trying `/dashboard` → redirected to `/login`.
- Student receipt URL accessible for own payments. 403 for other students' receipts.

---

## Execution Phases

| Phase | What | Est. Files |
|---|---|---|
| **A** | Auth: middleware, login, signup (no verification), callback, navbar | 5 |
| **B** | Database: all tables + views + triggers + RLS + seed | SQL only + 1 Edge Function |
| **C** | Student Panel: layout + 8 pages (added attendance) | 9 |
| **D** | Admin Panel: layout + 14 pages (added payments/new, receipt, reconcile, attendance, roles) | 15 |

> Execute Phase A → B → C → D in order. Build verification after each phase before proceeding.

---

## New Fields / Tables Summary (v2 additions only)

| Addition | Where | Purpose |
|---|---|---|
| `capacity` | `batches` | Seat limit per batch |
| `batches_with_counts` view | DB | `enrolled_count` + `seats_remaining` computed |
| `is_installment`, `installment_number` | `payments` | Partial payment / installment support |
| `transaction_id` | `payments` | bKash/Nagad TrxID for reconciliation |
| `reconciled`, `reconciled_by`, `reconciled_at` | `payments` | Manual verification flow |
| `receipt_number` | `payments` | Auto-generated, e.g. RCP-2026-0042 |
| `payment_due` view | DB | Flags overdue/partial students per month |
| `attendance` table | DB | Per-class student attendance tracking |
| `role_audit_log` table | DB | Tracks all role changes |
| `/admin/payments/new` | Admin Panel | Unified cash + bKash payment entry |
| `/admin/payments/[id]/receipt` | Admin Panel | Printable receipt per payment |
| `/admin/payments/reconcile` | Admin Panel | bKash/Nagad TrxID verification queue |
| `/admin/attendance` | Admin Panel | Mark and view attendance |
| `/admin/roles` | Admin Panel | Promote/demote users without Supabase dashboard |
| `/dashboard/attendance` | Student Panel | Student's own attendance record |
| `set-user-role` Edge Function | Supabase | Secure role update using service key |
