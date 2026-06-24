# Phase B5 — Database: Seed Data + Role Management Edge Function

## Context

You are working on **BiologywithSantosir.com** — Supabase Postgres. All tables, views, triggers, and RLS policies exist (Phases B1–B4). This phase:
1. Seeds realistic test data so the UI has something to show
2. Creates the Supabase Edge Function for role management

---

## Part 1: Seed Data

Run in **Supabase SQL Editor**. This creates a complete working dataset.

### Step 1: Create test batch

```sql
INSERT INTO batches (id, name, fee, capacity, is_active, start_date, end_date)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'HSC 2026 Batch A',
  800,   -- 800 BDT monthly fee
  40,
  true,
  '2026-01-01',
  '2026-12-31'
);
```

### Step 2: Create test admin user

Do this via **Supabase Dashboard → Authentication → Users → Add User**:
- Email: `admin@biologywithsantosir.com`
- Password: `Admin@1234`

Then run this SQL to set the admin role (replace UUID with the actual user id from the dashboard):

```sql
-- After creating the admin user, get their id from auth.users, then:
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com');

-- Also set app_metadata so middleware can read it
UPDATE auth.users
SET app_metadata = jsonb_set(
  COALESCE(app_metadata, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@biologywithsantosir.com';
```

### Step 3: Create 3 test student accounts

Via **Supabase Dashboard → Authentication → Users → Add User** (or via signup flow):
- `rafi@test.com` / `Test@1234`
- `mitu@test.com` / `Test@1234`
- `sadia@test.com` / `Test@1234`

Then enroll them:

```sql
-- Replace UUIDs with actual user IDs from auth.users
-- Enroll Rafi (active)
INSERT INTO enrollments (student_id, batch_id, status)
SELECT id, 'aaaaaaaa-0000-0000-0000-000000000001', 'active'
FROM auth.users WHERE email = 'rafi@test.com';

-- Enroll Mitu (active)
INSERT INTO enrollments (student_id, batch_id, status)
SELECT id, 'aaaaaaaa-0000-0000-0000-000000000001', 'active'
FROM auth.users WHERE email = 'mitu@test.com';

-- Enroll Sadia (active)
INSERT INTO enrollments (student_id, batch_id, status)
SELECT id, 'aaaaaaaa-0000-0000-0000-000000000001', 'active'
FROM auth.users WHERE email = 'sadia@test.com';
```

### Step 4: Seed payments (mix of full, installment, overdue)

```sql
-- Rafi: paid full for May, paid installment 1 of 2 for June (partial)
INSERT INTO payments (student_id, batch_id, amount, month, paid_on, method, is_installment, installment_number, reconciled, recorded_by)
SELECT u.id, 'aaaaaaaa-0000-0000-0000-000000000001', 800, 'May 2026', '2026-05-05', 'bKash', false, null, true,
  (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com')
FROM auth.users u WHERE u.email = 'rafi@test.com';

INSERT INTO payments (student_id, batch_id, amount, month, paid_on, method, is_installment, installment_number, transaction_id, reconciled, recorded_by)
SELECT u.id, 'aaaaaaaa-0000-0000-0000-000000000001', 400, 'June 2026', '2026-06-10', 'bKash', true, 1, 'BK20260610ABCD', false,
  (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com')
FROM auth.users u WHERE u.email = 'rafi@test.com';

-- Mitu: paid full for May and June (fully paid)
INSERT INTO payments (student_id, batch_id, amount, month, paid_on, method, reconciled, recorded_by)
SELECT u.id, 'aaaaaaaa-0000-0000-0000-000000000001', 800, 'May 2026', '2026-05-03', 'cash', true,
  (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com')
FROM auth.users u WHERE u.email = 'mitu@test.com';

INSERT INTO payments (student_id, batch_id, amount, month, paid_on, method, reconciled, recorded_by)
SELECT u.id, 'aaaaaaaa-0000-0000-0000-000000000001', 800, 'June 2026', '2026-06-02', 'cash', true,
  (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com')
FROM auth.users u WHERE u.email = 'mitu@test.com';

-- Sadia: no payment this month (overdue)
INSERT INTO payments (student_id, batch_id, amount, month, paid_on, method, reconciled, recorded_by)
SELECT u.id, 'aaaaaaaa-0000-0000-0000-000000000001', 800, 'May 2026', '2026-05-08', 'Nagad', true,
  (SELECT id FROM auth.users WHERE email = 'admin@biologywithsantosir.com')
FROM auth.users u WHERE u.email = 'sadia@test.com';
-- Sadia has NO June payment → shows as 'overdue' in payment_due view
```

### Step 5: Seed routine

```sql
INSERT INTO routines (batch_id, day_of_week, start_time, end_time, subject, platform)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Saturday',  '16:00', '17:30', 'জীববিজ্ঞান - প্রথম পত্র (কোষ)', 'Physical'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Monday',    '16:00', '17:30', 'জীববিজ্ঞান - দ্বিতীয় পত্র (প্রাণী)', 'Physical'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Wednesday', '16:00', '17:30', 'MCQ অনুশীলন', 'Physical');
```

### Step 6: Seed exam and results

```sql
INSERT INTO exams (id, batch_id, title, exam_date, total_marks, type)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'মাসিক পরীক্ষা — মে ২০২৬',
  '2026-05-25',
  100,
  'written'
);

-- Insert results (grade auto-computed by trigger)
INSERT INTO results (exam_id, student_id, marks_obtained, remarks)
SELECT 'bbbbbbbb-0000-0000-0000-000000000001', u.id, 85, 'চমৎকার পারফরম্যান্স'
FROM auth.users u WHERE u.email = 'rafi@test.com';

INSERT INTO results (exam_id, student_id, marks_obtained)
SELECT 'bbbbbbbb-0000-0000-0000-000000000001', u.id, 72
FROM auth.users u WHERE u.email = 'mitu@test.com';

INSERT INTO results (exam_id, student_id, marks_obtained)
SELECT 'bbbbbbbb-0000-0000-0000-000000000001', u.id, 58
FROM auth.users u WHERE u.email = 'sadia@test.com';
```

### Step 7: Seed announcement

```sql
INSERT INTO announcements (title, body, batch_id)
VALUES (
  'জুন মাসের পরীক্ষার সময়সূচি',
  'জুন মাসের মাসিক পরীক্ষা ২৮ জুন ২০২৬ তারিখে অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে উপস্থিত থাকতে বলা হচ্ছে।',
  'aaaaaaaa-0000-0000-0000-000000000001'
);
```

---

## Part 2: Role Management Edge Function

Create this file in your Next.js project at `supabase/functions/set-user-role/index.ts`.

This function is called by the `/admin/roles` page to promote or demote users. It uses the **service role key** (which can bypass RLS and update `auth.users.app_metadata`) — never expose this key client-side.

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller is admin using their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: callerUser }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !callerUser) throw new Error('Unauthorized')

    const { data: callerProfile } = await supabaseUser
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single()

    if (callerProfile?.role !== 'admin') throw new Error('Forbidden: caller is not admin')

    // 2. Parse request body
    const { target_user_id, new_role } = await req.json()
    if (!target_user_id || !new_role) throw new Error('Missing target_user_id or new_role')
    if (!['student', 'admin'].includes(new_role)) throw new Error('Invalid role')

    // 3. Block self-demotion
    if (target_user_id === callerUser.id && new_role === 'student') {
      throw new Error('Cannot demote your own account')
    }

    // 4. Use service role client to update auth.users.app_metadata
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get old role for audit log
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', target_user_id)
      .single()

    const old_role = targetProfile?.role ?? 'student'

    // Update app_metadata (controls middleware access)
    await supabaseAdmin.auth.admin.updateUserById(target_user_id, {
      app_metadata: { role: new_role }
    })

    // Update profiles.role (controls app UI)
    await supabaseAdmin
      .from('profiles')
      .update({ role: new_role })
      .eq('id', target_user_id)

    // Write audit log
    await supabaseAdmin
      .from('role_audit_log')
      .insert({
        changed_by: callerUser.id,
        target_user: target_user_id,
        old_role,
        new_role,
      })

    return new Response(
      JSON.stringify({ success: true, old_role, new_role }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

**Deploy the function:**
```bash
supabase functions deploy set-user-role
```

Set the secret in Supabase dashboard:
- `SUPABASE_SERVICE_ROLE_KEY` → your service role key (from Supabase → Settings → API)

---

## Acceptance criteria

- `SELECT * FROM payment_due;` returns Rafi as 'partial', Mitu as 'paid', Sadia as 'overdue'
- `SELECT * FROM results;` shows grades auto-computed (Rafi = A+, Mitu = A, Sadia = B)
- `SELECT * FROM batches_with_counts;` shows `enrolled_count = 3`, `seats_remaining = 37`
- Edge function deploys without errors
- Calling edge function with admin JWT for self-demotion returns error
- `npm run build` passes
