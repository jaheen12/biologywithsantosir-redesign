# Phase B3 — Database: Triggers

## Context

You are working on **BiologywithSantosir.com** — Supabase Postgres. All tables (Phase B1) and views (Phase B2) exist. Now create the three database triggers.

Run all SQL in **Supabase SQL Editor** in the order given.

---

## Trigger 1: `handle_new_user` — Auto-create profile on signup

Fires after every new row in `auth.users` (i.e. every new signup). Inserts a matching row into `profiles` using data from `raw_user_meta_data` (which the signup form populates via `supabase.auth.signUp({ options: { data: { full_name, phone } } })`).

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
    NEW.raw_user_meta_data->>'phone',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Why `SECURITY DEFINER`:** The trigger runs as the function owner (superuser), not the inserting user. This is required because `auth.users` is in the `auth` schema and the public `profiles` table has RLS enabled.

---

## Trigger 2: `generate_receipt_number` — Auto-assign receipt number on payment insert

Fires before every INSERT on `payments`. Assigns a sequential receipt number in format `RCP-YYYY-NNNN` (e.g. `RCP-2026-0042`).

```sql
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.receipt_number := 'RCP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('receipt_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_receipt_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_receipt_number();
```

**Behavior:** `receipt_number` is always populated automatically. The app never needs to compute or pass it. After a payment is inserted, read `receipt_number` back from the returned row.

---

## Trigger 3: `compute_grade` — Auto-set grade on result insert/update

Fires before every INSERT or UPDATE on `results`. Computes grade based on percentage of `marks_obtained / exam.total_marks`. Uses the BD HSC/SSC grading convention.

```sql
CREATE OR REPLACE FUNCTION compute_grade()
RETURNS TRIGGER AS $$
DECLARE
  total int2;
  pct   numeric;
BEGIN
  SELECT total_marks INTO total FROM exams WHERE id = NEW.exam_id;
  pct := (NEW.marks_obtained / total) * 100;

  NEW.grade := CASE
    WHEN pct >= 80 THEN 'A+'
    WHEN pct >= 70 THEN 'A'
    WHEN pct >= 60 THEN 'A-'
    WHEN pct >= 50 THEN 'B'
    WHEN pct >= 40 THEN 'C'
    WHEN pct >= 33 THEN 'D'
    ELSE 'F'
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_grade
  BEFORE INSERT OR UPDATE ON results
  FOR EACH ROW
  EXECUTE FUNCTION compute_grade();
```

---

## Acceptance criteria

- Inserting a row into `auth.users` via Supabase signup flow creates a matching `profiles` row
- Inserting a row into `payments` auto-populates `receipt_number` (e.g. `RCP-2026-0001`)
- Inserting a row into `results` auto-populates `grade` based on marks percentage
- All three triggers created with no errors in Supabase

## Do NOT do in this phase

- Do not enable RLS yet (Phase B4)
- Do not seed data yet (Phase B5)
