# Tally.so MCQ Integration — Implementation Plan

This plan outlines how to integrate **Tally.so** into your Next.js and Supabase application to automate online MCQ exams. 

---

## Architecture Flow

```
1. Admin creates a Quiz on Tally.so
2. Admin adds the Tally Form URL when creating an Exam in the Admin Panel
3. Student logs in -> Clicks "পরীক্ষা দিন" (Take Exam)
4. Dashboard opens Tally inside a clean Iframe, passing Student ID & Exam ID invisibly
5. Student completes the MCQ quiz
6. Tally Webhook sends the score + student ID -> Next.js API Route -> Supabase "results" table
```

---

## Phase 1: Database Migration

Add a `tally_form_id` column to the existing `exams` table so we can associate Tally forms with specific exams.

```sql
ALTER TABLE exams ADD COLUMN tally_form_id text;
```

---

## Phase 2: Next.js Webhook Endpoint

Create a secure API route in Next.js to receive scores sent by Tally when a student completes a submission.

#### [NEW] `src/app/api/webhooks/tally/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client with Service Role Key (bypasses RLS to insert results)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verify webhook signature/token for security
    const webhookSecret = req.headers.get('x-tally-secret');
    if (webhookSecret !== process.env.TALLY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract submission details & hidden fields from Tally payload
    const { data } = payload;
    const fields = data.fields || [];

    // 1. Extract hidden fields passed in the iframe URL
    const studentIdField = fields.find((f: any) => f.label === 'student_id');
    const examIdField = fields.find((f: any) => f.label === 'exam_id');

    const student_id = studentIdField?.value;
    const exam_id = examIdField?.value;

    // 2. Extract Calculated Score (Tally returns quiz scores in metadata)
    const score = data.quiz?.score ?? 0; 
    
    if (!student_id || !exam_id) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // 3. Determine Grade based on score percentage
    const { data: exam } = await supabaseAdmin
      .from('exams')
      .select('total_marks')
      .eq('id', exam_id)
      .single();

    let grade = 'F';
    if (exam) {
      const percentage = (score / exam.total_marks) * 100;
      if (percentage >= 80) grade = 'A+';
      else if (percentage >= 70) grade = 'A';
      else if (percentage >= 60) grade = 'A-';
      else if (percentage >= 50) grade = 'B';
      else if (percentage >= 40) grade = 'C';
    }

    // 4. Record result in database
    const { error } = await supabaseAdmin
      .from('results')
      .upsert({
        exam_id,
        student_id,
        marks_obtained: score,
        grade,
      }, {
        onConflict: 'exam_id,student_id'
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tally webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Phase 3: Admin UI Changes

#### [MODIFY] `src/components/admin/ExamForm.tsx`
Add an input field for `Tally Form ID` to the exam form:

```tsx
// Inside state declarations:
const [tallyFormId, setTallyFormId] = useState('');

// Inside useEffect (when loading existing exam):
setTallyFormId(editExam.tally_form_id || '');

// Inside JSX inputs:
<div>
  <label className="block text-sm font-semibold text-text-primary mb-1.5">
    Tally Form ID (ঐচ্ছিক MCQ পরীক্ষার জন্য)
  </label>
  <input
    type="text"
    value={tallyFormId}
    onChange={(e) => setTallyFormId(e.target.value)}
    placeholder="যেমন: mOD123"
    className="..."
  />
</div>
```

---

## Phase 4: Student UI Integration

#### [MODIFY] `src/app/dashboard/exams/page.tsx`
If an exam has a `tally_form_id` and the student has **not** taken the exam yet (no entry in `results`), render a "Start MCQ Exam" button. Clicking this button opens a clean fullscreen overlay or modal containing the Tally Iframe.

#### Dynamic Iframe URL Structure:
```tsx
const tallyUrl = `https://tally.so/embed/${exam.tally_form_id}?student_id=${user.id}&exam_id=${exam.id}&transparentBackground=1`;

return (
  <iframe
    src={tallyUrl}
    width="100%"
    height="600"
    frameBorder="0"
    marginHeight={0}
    marginWidth={0}
    title={exam.title}
  />
);
```

---

## Phase 5: Tally.so Settings (Configuration Steps)

When you are ready to build forms in Tally.so, follow these steps:

1. **Add Hidden Fields:**
   * In your Tally Form Editor, press `/` and type **Hidden Fields**.
   * Add two hidden fields: `student_id` and `exam_id`. (Tally will now capture these from the iframe URL automatically).
2. **Configure Webhook:**
   * Go to your Tally form's **Settings** tab -> **Webhooks**.
   * Click **Connect webhook**.
   * Enter your endpoint: `https://your-domain.com/api/webhooks/tally`.
   * Under **Secret**, type a secure random key and add it to your `.env` as `TALLY_WEBHOOK_SECRET`.
3. **Turn on Quiz Mode:**
   * In Form Settings, enable **Quiz** to auto-assign points to MCQ questions. Tally will automatically calculate the score on submission.
