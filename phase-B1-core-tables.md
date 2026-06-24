# Phase B1 — Database: Core Tables

## Context

You are working on **BiologywithSantosir.com** — a Next.js 14 coaching center system using **Supabase Postgres**. Auth is set up. Now you create all database tables.

Run all SQL in this phase via the **Supabase SQL Editor** (or MCP `execute_sql` tool). Execute statements in the order given — foreign key references require the referenced table to exist first.

This is a **Bangladesh coaching center**. The domain specifics:
- Students enroll in **batches** (e.g. "HSC 2026 Batch A"), not individual courses
- Fees are paid **monthly** (মাসিক বেতন), sometimes in installments
- bKash and Nagad are the primary digital payment methods
- Attendance tracking is important for parental reporting

---

## SQL — Execute in order

### Step 1: `profiles` table

Extends Supabase `auth.users`. One row per user.

```sql
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  phone       text,
  role        text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  batch_id    uuid,  -- FK added after batches table is created
  avatar_url  text,
  created_at  timestamptz DEFAULT now()
);
```

### Step 2: `batches` table

```sql
CREATE TABLE batches (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  course_id   uuid,  -- FK to courses table if it exists; nullable
  start_date  date,
  end_date    date,
  fee         numeric NOT NULL DEFAULT 0,   -- monthly fee in BDT
  capacity    int2 NOT NULL DEFAULT 40,     -- max seats
  is_active   bool NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);
```

### Step 3: Add FK from `profiles` to `batches`

```sql
ALTER TABLE profiles
  ADD CONSTRAINT profiles_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;
```

### Step 4: `enrollments` table

```sql
CREATE TABLE enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id    uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(student_id, batch_id)
);
```

### Step 5: `payments` table

```sql
CREATE SEQUENCE receipt_seq START 1;

CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id            uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  amount              numeric NOT NULL CHECK (amount > 0),
  month               text NOT NULL,         -- e.g. "June 2026"
  paid_on             date NOT NULL DEFAULT CURRENT_DATE,
  method              text NOT NULL CHECK (method IN ('bKash', 'Nagad', 'cash', 'bank')),
  is_installment      bool NOT NULL DEFAULT false,
  installment_number  int2,                  -- 1, 2, 3... only set if is_installment = true
  transaction_id      text,                  -- bKash/Nagad TrxID; null for cash
  reconciled          bool NOT NULL DEFAULT false,
  reconciled_by       uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reconciled_at       timestamptz,
  note                text,
  recorded_by         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  receipt_number      text UNIQUE,           -- auto-set by trigger
  created_at          timestamptz DEFAULT now()
);
```

### Step 6: `routines` table

```sql
CREATE TABLE routines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  day_of_week  text NOT NULL CHECK (day_of_week IN ('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday')),
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  subject      text NOT NULL,
  platform     text NOT NULL DEFAULT 'Physical' CHECK (platform IN ('Zoom', 'Google Meet', 'Physical')),
  link         text,
  created_at   timestamptz DEFAULT now()
);
```

### Step 7: `attendance` table

```sql
CREATE TABLE attendance (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id  uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        date NOT NULL,
  status      text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at   timestamptz DEFAULT now(),
  UNIQUE(routine_id, student_id, date)
);
```

### Step 8: `exams` table

```sql
CREATE TABLE exams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id     uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  title        text NOT NULL,
  exam_date    date NOT NULL,
  total_marks  int2 NOT NULL DEFAULT 100,
  type         text NOT NULL CHECK (type IN ('mcq', 'written', 'mock')),
  topic_id     text,  -- optional reference to existing topics table
  created_at   timestamptz DEFAULT now()
);
```

### Step 9: `results` table

```sql
CREATE TABLE results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id         uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_obtained  numeric NOT NULL CHECK (marks_obtained >= 0),
  grade           text,   -- auto-set by trigger
  remarks         text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);
```

### Step 10: `announcements` table

```sql
CREATE TABLE announcements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  body       text NOT NULL,
  batch_id   uuid REFERENCES batches(id) ON DELETE CASCADE,  -- null = all students
  created_at timestamptz DEFAULT now()
);
```

### Step 11: `role_audit_log` table

```sql
CREATE TABLE role_audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_role     text NOT NULL,
  new_role     text NOT NULL,
  changed_at   timestamptz DEFAULT now()
);
```

---

## Acceptance criteria

- All 11 tables created with no errors
- All FK constraints in place
- `receipt_seq` sequence created
- `npm run build` still passes (no code change, just DB)

## Do NOT do in this phase

- Do not create views yet (Phase B2)
- Do not create triggers yet (Phase B3)
- Do not enable RLS yet (Phase B4)
- Do not seed data yet (Phase B5)
