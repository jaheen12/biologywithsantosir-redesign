# Phase D6 — Admin Panel: Announcements + Role Management

## Context

You are working on **BiologywithSantosir.com** — Next.js 14 App Router, Supabase, Tailwind CSS. All prior phases (A through D5) are complete. This is the **final phase**.

**Now building:**
- `/admin/announcements` — create and manage broadcast messages to students
- `/admin/roles` — promote/demote user roles via the in-app UI (calls the `set-user-role` Edge Function built in Phase B5)

---

## Page 1: `src/app/admin/announcements/page.tsx` — নোটিশ ব্যবস্থাপনা

### Data queries

```ts
// All announcements, newest first
const { data: announcements } = await supabase
  .from('announcements')
  .select('*, batches(name)')
  .order('created_at', { ascending: false })

// Active batches for the batch selector in the form
const { data: batches } = await supabase
  .from('batches').select('id, name').eq('is_active', true)
```

### UI

**Page title:** "নোটিশ বোর্ড"

**Announcement list:**

Each announcement as a card:
```
┌──────────────────────────────────────────────────────┐
│ জুন মাসের পরীক্ষার সময়সূচি           ১৫ জুন ২০২৬  │
│ লক্ষ্য: HSC 2026 Batch A                             │
│                                                      │
│ জুন মাসের মাসিক পরীক্ষা ২৮ জুন ২০২৬ তারিখে         │
│ অনুষ্ঠিত হবে। সকল শিক্ষার্থীকে উপস্থিত থাকতে      │
│ বলা হচ্ছে।                                          │
│                                                      │
│ [✕ মুছে ফেলুন]                                      │
└──────────────────────────────────────────────────────┘
```

**Target badge:**
- `batch_id = null` → green "সকল শিক্ষার্থী"
- `batch_id = some id` → blue "HSC 2026 Batch A"

**Delete button:** Confirm "এই নোটিশ মুছে ফেলবেন?" → `supabase.from('announcements').delete().eq('id', id)` → `router.refresh()`

**Empty state:** "কোনো নোটিশ নেই"

---

### New Announcement Form (Client Component: `src/components/admin/AnnouncementForm.tsx`)

Show as a form above the list (always visible, not a modal).

Fields:

| Field | Input | Notes |
|---|---|---|
| শিরোনাম (Title) | text input | required |
| বার্তা (Body) | textarea, 4 rows | required |
| লক্ষ্য | radio: "সকল শিক্ষার্থী" / "নির্দিষ্ট ব্যাচ" | default: সকল |
| ব্যাচ | select (shown only if "নির্দিষ্ট ব্যাচ" selected) | |

On submit:
```ts
await supabase.from('announcements').insert({
  title,
  body,
  batch_id: target === 'batch' ? selectedBatchId : null,
})
```

Show "নোটিশ প্রকাশিত হয়েছে ✓" toast on success. Reset form and `router.refresh()`.

Validation: Both title and body are required. Show "শিরোনাম প্রয়োজন" / "বার্তা প্রয়োজন" if empty.

---

## Page 2: `src/app/admin/roles/page.tsx` — রোল ব্যবস্থাপনা

**⚠️ Security-sensitive page.** Calls the `set-user-role` Supabase Edge Function. Only admins can access this page (middleware + layout already enforce this).

### Data query

To list all users, you need the admin Supabase client (service role) — but this runs server-side in a Server Component, so it's safe:

```ts
// This is a Server Component
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Admin client for auth.users access (server-side only)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

// Also get profiles for role display
const { data: profiles } = await supabase.from('profiles').select('id, full_name, phone, role')

// Merge: map profiles by id, attach to users
const merged = users.map(u => ({
  ...u,
  profile: profiles?.find(p => p.id === u.id),
}))
```

Get the current admin's id to block self-demotion:
```ts
const { data: { user: currentAdmin } } = await supabase.auth.getUser()
```

Pass `merged` and `currentAdmin.id` to a Client Component for the interactive role buttons.

### UI (Client Component: `src/components/admin/RoleTable.tsx`)

**Page title:** "ব্যবহারকারী ও রোল ব্যবস্থাপনা"

**Filter tabs:** "সকল" | "শিক্ষার্থী" | "Admin"

**User table:**

| নাম | ইমেইল | ফোন | বর্তমান রোল | সর্বশেষ লগইন | অ্যাকশন |
|---|---|---|---|---|---|
| Rafi Ahmed | rafi@test.com | 01711... | Student | ২০ জুন | Admin করুন |
| Admin Santosir | admin@... | — | Admin | ২২ জুন | — (self, blocked) |

**Action buttons:**
- Student row → "Admin করুন" button (blue)
- Admin row (not self) → "Student করুন" button (red, destructive style)
- Own row → disabled, tooltip "নিজের অ্যাকাউন্ট পরিবর্তন করা যাবে না"

**Confirmation modal** (shown before any role change):

```
┌──────────────────────────────────────────┐
│ রোল পরিবর্তন নিশ্চিত করুন               │
│                                          │
│ আপনি কি Rafi Ahmed-কে Admin করতে চান?   │
│                                          │
│ [বাতিল]          [নিশ্চিত করুন]          │
└──────────────────────────────────────────┘
```

**On confirm — call the Edge Function:**

```ts
const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'student') => {
  setLoading(targetUserId)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/set-user-role`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`, // current admin's JWT
      },
      body: JSON.stringify({ target_user_id: targetUserId, new_role: newRole }),
    }
  )

  const result = await response.json()

  if (result.error) {
    showToast(`রোল পরিবর্তন ব্যর্থ: ${result.error}`, 'error')
  } else {
    showToast('রোল সফলভাবে পরিবর্তন হয়েছে ✓', 'success')
    router.refresh() // re-fetch updated user list
  }

  setLoading(null)
  setConfirmModal(null)
}
```

**Loading state:** Show spinner on the action button while the Edge Function is in-flight.

**Toast notifications:**
- Success → green "রোল সফলভাবে পরিবর্তন হয়েছে ✓"
- Error → red "রোল পরিবর্তন ব্যর্থ হয়েছে"
- Self-demotion attempt (should not reach this, but handle the edge function's 400 response) → "নিজের অ্যাকাউন্টের রোল পরিবর্তন করা যাবে না"

---

### Role Audit Log Section

Below the user table, show the last 20 role changes:

```ts
const { data: auditLog } = await supabase
  .from('role_audit_log')
  .select('*, profiles!changed_by(full_name), profiles!target_user(full_name)')
  .order('changed_at', { ascending: false })
  .limit(20)
```

Simple table:

| তারিখ | পরিবর্তনকারী | যার রোল পরিবর্তন | আগের রোল | নতুন রোল |
|---|---|---|---|---|
| ২২ জুন ২০২৬ | Admin Santosir | Rafi Ahmed | Student | Admin |

---

## Final build verification checklist

After completing D6, run through the full verification plan:

### Automated
```bash
npm run build   # must complete with 0 errors
```

### Manual checklist

**Auth:**
- [ ] `/signup` → fills form → lands on `/dashboard` immediately (no email verification)
- [ ] `/login` with wrong password → Bangla error shown
- [ ] Navbar shows avatar when logged in, "লগ ইন" when logged out

**Student panel:**
- [ ] Dashboard shows correct payment alert banner (red/amber/none)
- [ ] `/dashboard/payments` — installments grouped by month with subtotals
- [ ] `/dashboard/routine` — today's class highlighted
- [ ] `/dashboard/results` — marks, grade, progress bar, class average
- [ ] `/dashboard/leaderboard` — current student row highlighted
- [ ] `/dashboard/attendance` — month filter works
- [ ] Receipt URL `/admin/payments/{id}/receipt` accessible by student for own payment

**Admin panel:**
- [ ] `/admin` redirects non-admin to `/dashboard`
- [ ] Admin dashboard — KPI cards, overdue list, unreconciled feed
- [ ] `/admin/payments/new` — cash: auto-reconciled; bKash: requires TrxID, reconciled=false
- [ ] `/admin/payments/{id}/receipt` — print hides sidebar; Bengali amount words correct
- [ ] `/admin/payments/reconcile` — confirm sets reconciled=true; reject adds note
- [ ] `/admin/enrollments` — full batch blocks new enrollment with Bangla message
- [ ] `/admin/batches` — capacity bars turn red when ≤ 5 seats
- [ ] `/admin/attendance` — "সকলকে উপস্থিত করুন" works; upsert on re-mark
- [ ] `/admin/results` — marks entry auto-shows grade; upsert on re-entry
- [ ] `/admin/roles` — promote student to admin; new admin accesses `/admin`
- [ ] `/admin/roles` — self-demotion blocked (button disabled + edge function 400)
- [ ] Role audit log shows change history

---

## Acceptance criteria

- `/admin/announcements` — create with batch-specific or global target; delete works
- `/admin/roles` — user table shows all users with correct current roles
- Role change calls Edge Function; table updates after success
- Self-demotion button is disabled for the current admin's own row
- Audit log shows role change history
- Full build verification checklist passes
- `npm run build` passes with 0 errors

**This is the final phase. The system is complete.**
