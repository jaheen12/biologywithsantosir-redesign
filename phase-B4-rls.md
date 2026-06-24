# Phase B4 — Database: Row Level Security (RLS) Policies

## Context

You are working on **BiologywithSantosir.com** — Supabase Postgres. All tables, views, and triggers are created (Phases B1–B3). Now enable RLS and create all policies.

Run all SQL in **Supabase SQL Editor**.

**Critical rules:**
- Use `auth.uid()` everywhere — never the deprecated `auth.role()`
- Admin check: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`
- Never use `TO authenticated` in policy — use `USING` with `auth.uid() IS NOT NULL` for authenticated-only access

---

## Step 1: Enable RLS on all tables

```sql
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance     ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE results        ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;
```

---

## Step 2: `profiles` policies

```sql
-- Students: read own profile only
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins: read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Admins: update any profile (for role changes, etc.)
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Students: update own profile (name, phone, avatar)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger inserts (handle_new_user runs as SECURITY DEFINER — no policy needed for INSERT)
```

---

## Step 3: `batches` policies

```sql
-- Students: see active batches only
CREATE POLICY "batches_select_student"
  ON batches FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Admins: full access
CREATE POLICY "batches_all_admin"
  ON batches FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 4: `enrollments` policies

```sql
-- Students: see own enrollments only
CREATE POLICY "enrollments_select_own"
  ON enrollments FOR SELECT
  USING (auth.uid() = student_id);

-- Admins: full access
CREATE POLICY "enrollments_all_admin"
  ON enrollments FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 5: `payments` policies

```sql
-- Students: see own payments only
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (auth.uid() = student_id);

-- Students: submit pending bKash/Nagad payments
CREATE POLICY "payments_insert_own"
  ON payments FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND reconciled = false
    AND method IN ('bKash', 'Nagad')
  );

-- Admins: full access
CREATE POLICY "payments_all_admin"
  ON payments FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 6: `routines` policies

```sql
-- Students: see routines for their enrolled batch only
CREATE POLICY "routines_select_student"
  ON routines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = auth.uid()
        AND e.batch_id = routines.batch_id
        AND e.status = 'active'
    )
  );

-- Admins: full access
CREATE POLICY "routines_all_admin"
  ON routines FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 7: `attendance` policies

```sql
-- Students: see own attendance only
CREATE POLICY "attendance_select_own"
  ON attendance FOR SELECT
  USING (auth.uid() = student_id);

-- Admins: full access
CREATE POLICY "attendance_all_admin"
  ON attendance FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 8: `exams` policies

```sql
-- Students: see exams for their batch only
CREATE POLICY "exams_select_student"
  ON exams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = auth.uid()
        AND e.batch_id = exams.batch_id
        AND e.status = 'active'
    )
  );

-- Admins: full access
CREATE POLICY "exams_all_admin"
  ON exams FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 9: `results` policies

```sql
-- Students: see own results only
CREATE POLICY "results_select_own"
  ON results FOR SELECT
  USING (auth.uid() = student_id);

-- Admins: full access
CREATE POLICY "results_all_admin"
  ON results FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 10: `announcements` policies

```sql
-- Students: see announcements targeted to their batch OR global (batch_id IS NULL)
CREATE POLICY "announcements_select_student"
  ON announcements FOR SELECT
  USING (
    batch_id IS NULL
    OR EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = auth.uid()
        AND e.batch_id = announcements.batch_id
        AND e.status = 'active'
    )
  );

-- Admins: full access
CREATE POLICY "announcements_all_admin"
  ON announcements FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Step 11: `role_audit_log` policies

```sql
-- Admins only: read and insert
CREATE POLICY "role_audit_log_admin"
  ON role_audit_log FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

---

## Acceptance criteria

- RLS enabled on all 10 tables
- A student JWT can SELECT their own profile but not others
- A student JWT cannot SELECT `/admin` data (Supabase returns 0 rows, not error)
- An admin JWT can SELECT all rows on all tables
- `SELECT * FROM payments` as a student returns only that student's rows
- `npm run build` still passes

## Do NOT do in this phase

- Do not seed data yet (Phase B5)
- Do not build any UI yet
