import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const StudentsClient = dynamic(() => import('@/components/admin/StudentsClient'), {
  loading: () => <div className="animate-pulse h-96 bg-surface-secondary rounded-xl" />,
});

export default async function AdminStudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all profiles with role 'student', join enrollments (with batch details)
  const { data: studentsRaw } = await supabase
    .from('profiles')
    .select(`
      id, 
      full_name, 
      phone, 
      role, 
      created_at,
      enrollments(status, batch_id, batches(name))
    `)
    .eq('role', 'student')
    .order('full_name');

  // Fetch payment due data directly from the view
  const { data: paymentDueRaw } = await supabase
    .from('payment_due')
    .select('student_id, status, outstanding, paid_this_month, monthly_fee');

  const paymentDueMap = new Map(
    paymentDueRaw?.map((item) => [item.student_id, item]) || []
  );

  // Fetch all batches for dropdown selections
  const { data: batches } = await supabase
    .from('batches')
    .select('id, name, is_active')
    .order('name');

  const students = (studentsRaw || []).map((student) => ({
    ...student,
    payment_due: paymentDueMap.get(student.id) || null,
  }));

  return (
    <div className="space-y-8 font-ui">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">শিক্ষার্থী তালিকা</h1>
        <p className="text-text-secondary text-sm mt-1">
          বায়োলজি উইথ সায়ন্ত স্যার প্ল্যাটফর্মের সব শিক্ষার্থীর তালিকা ও তাদের পেমেন্ট অবস্থা।
        </p>
      </div>

      <StudentsClient students={students} batches={batches || []} />
    </div>
  );
}
